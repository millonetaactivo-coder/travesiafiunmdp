import { supabase } from '../lib/supabase';

/* ─── Types ─── */

export type RolTutor = 'tutor' | 'asesor_par';

export interface TutorInfo {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolTutor;
}

export interface AsignacionTutor {
  id: string;
  estudiante_id: string;
  tutor_id: string;
  rol_tutor: RolTutor;
  activa: boolean;
  asignado_at: string;
}

export interface AsignacionConEstudiante {
  id: string;
  estudiante_id: string;
  tutor_id: string;
  activa: boolean;
  estudiante_nombre: string;
  estudiante_apellido: string;
  estudiante_legajo: string;
}

/* ─── Service functions ─── */

/**
 * Get all active tutors (users with role 'tutor' or 'asesor_par').
 */
export async function getTutores(): Promise<{ data: TutorInfo[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('usuario_roles')
      .select(`
        usuario_id,
        rol,
        usuarios!usuario_id (id, nombre, apellido, email)
      `)
      .in('rol', ['tutor', 'asesor_par']);

    if (error) throw error;

    const tutores: TutorInfo[] = (data ?? [])
      .map((row: Record<string, unknown>) => {
        const u = row.usuarios as Record<string, unknown> | null;
        if (!u) return null;
        const rol = row.rol as RolTutor;
        if (rol !== 'tutor' && rol !== 'asesor_par') return null;
        return {
          id: u.id as string,
          nombre: (u.nombre as string) ?? '',
          apellido: (u.apellido as string) ?? '',
          email: (u.email as string) ?? '',
          rol,
        };
      })
      .filter((t): t is TutorInfo => t !== null);

    return { data: tutores, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching tutors';
    return { data: [], error: message };
  }
}

/**
 * Get all active assignments.
 */
export async function getAsignaciones(): Promise<{ data: AsignacionConEstudiante[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('asignaciones_tutor')
      .select(`
        id, estudiante_id, tutor_id, activa,
        usuarios!estudiante_id (nombre, apellido, legajo)
      `)
      .eq('activa', true);

    if (error) throw error;

    const rows: AsignacionConEstudiante[] = (data ?? []).map((row: Record<string, unknown>) => {
      const u = row.usuarios as Record<string, unknown> | null;
      return {
        id: row.id as string,
        estudiante_id: row.estudiante_id as string,
        tutor_id: row.tutor_id as string,
        activa: row.activa as boolean,
        estudiante_nombre: (u?.nombre as string) ?? '',
        estudiante_apellido: (u?.apellido as string) ?? '',
        estudiante_legajo: (u?.legajo as string) ?? '',
      };
    });

    return { data: rows, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching assignments';
    return { data: [], error: message };
  }
}

/**
 * Assign a tutor to a student (upsert: deactivate old assignment, create new).
 */
export async function assignTutor(
  estudianteId: string,
  tutorId: string,
  rolTutor: RolTutor
): Promise<{ error: string | null }> {
  try {
    // Deactivate any existing active assignment for this student
    const { error: deactivateErr } = await supabase
      .from('asignaciones_tutor')
      .update({ activa: false })
      .eq('estudiante_id', estudianteId)
      .eq('activa', true);

    if (deactivateErr) throw deactivateErr;

    // Create new assignment — rol_tutor is NOT NULL with CHECK ('tutor' | 'asesor_par')
    const { error: insertErr } = await supabase
      .from('asignaciones_tutor')
      .insert({
        estudiante_id: estudianteId,
        tutor_id: tutorId,
        rol_tutor: rolTutor,
        activa: true,
      });

    if (insertErr) throw insertErr;

    return { error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error assigning tutor';
    return { error: message };
  }
}

/**
 * Batch assign multiple students to a single tutor.
 */
export async function batchAssignTutor(
  estudianteIds: string[],
  tutorId: string,
  rolTutor: RolTutor
): Promise<{ error: string | null }> {
  try {
    // Deactivate all existing assignments for these students
    const { error: deactivateErr } = await supabase
      .from('asignaciones_tutor')
      .update({ activa: false })
      .in('estudiante_id', estudianteIds)
      .eq('activa', true);

    if (deactivateErr) throw deactivateErr;

    // Insert new assignments — rol_tutor is NOT NULL with CHECK ('tutor' | 'asesor_par')
    const newAssignments = estudianteIds.map((eid) => ({
      estudiante_id: eid,
      tutor_id: tutorId,
      rol_tutor: rolTutor,
      activa: true,
    }));

    const { error: insertErr } = await supabase
      .from('asignaciones_tutor')
      .insert(newAssignments);

    if (insertErr) throw insertErr;

    return { error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error batch assigning tutors';
    return { error: message };
  }
}

/**
 * Unassign a student (set activa = false).
 */
export async function unassignTutor(
  estudianteId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('asignaciones_tutor')
      .update({ activa: false })
      .eq('estudiante_id', estudianteId)
      .eq('activa', true);

    if (error) throw error;

    return { error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error unassigning tutor';
    return { error: message };
  }
}
