import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Entrevista {
  id: string;
  tipo: string;
  modalidad: string;
  fecha_realizada: string;
  estado: string;
  motivo: string;
  resumen: string;
  estudiante_id: string;
  estudiante_nombre?: string;
  estudiante_apellido?: string;
  entrevista_estado?: string;
  factores_riesgo?: string[];
  seguimiento_requerido?: boolean;
}

export const useEntrevistas = (userId: string, role: string) => {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntrevistas = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    try {
      let query;

      if (role === 'tutor' || role === 'asesor_par') {
        // Get tutor's student IDs
        const { data: asignaciones } = await supabase
          .from('asignaciones_tutor')
          .select('estudiante_id')
          .eq('tutor_id', userId)
          .eq('activa', true);

        const estudianteIds = asignaciones?.map(a => a.estudiante_id) ?? [];
        if (estudianteIds.length === 0) {
          setEntrevistas([]);
          setLoading(false);
          return;
        }

        query = supabase
          .from('intervenciones')
          .select(`
            id, tipo, modalidad, fecha_realizada, estado,
            motivo, resumen, estudiante_id,
            usuarios!estudiante_id (nombre, apellido),
            entrevistas (estado_alumno_percibido, factores_riesgo, seguimiento_requerido)
          `)
          .in('estudiante_id', estudianteIds)
          .order('fecha_realizada', { ascending: false });
      } else {
        // Admin: all interviews
        query = supabase
          .from('intervenciones')
          .select(`
            id, tipo, modalidad, fecha_realizada, estado,
            motivo, resumen, estudiante_id,
            usuarios!estudiante_id (nombre, apellido),
            entrevistas (estado_alumno_percibido, factores_riesgo, seguimiento_requerido)
          `)
          .order('fecha_realizada', { ascending: false });
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const mapped: Entrevista[] = (data ?? []).map((row: Record<string, unknown>) => {
        const u = row.usuarios as Record<string, unknown> | null;
        const ent = row.entrevistas as Record<string, unknown> | null;
        return {
          id: row.id as string,
          tipo: (row.tipo as string) || '',
          modalidad: (row.modalidad as string) || '',
          fecha_realizada: (row.fecha_realizada as string) || '',
          estado: (row.estado as string) || 'realizada',
          motivo: (row.motivo as string) || '',
          resumen: (row.resumen as string) || '',
          estudiante_id: (row.estudiante_id as string) || '',
          estudiante_nombre: (u?.nombre as string) || '',
          estudiante_apellido: (u?.apellido as string) || '',
          entrevista_estado: (ent?.estado_alumno_percibido as string) || undefined,
          factores_riesgo: (ent?.factores_riesgo as string[]) || undefined,
          seguimiento_requerido: (ent?.seguimiento_requerido as boolean) || undefined,
        };
      });

      setEntrevistas(mapped);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    fetchEntrevistas();
  }, [fetchEntrevistas]);

  const crearEntrevista = useCallback(async (payload: {
    estudiante_id: string;
    tutor_id: string;
    modalidad: 'presencial' | 'virtual' | 'telefonica';
    fecha_realizada: string;
    motivo: string;
    resumen: string;
    estado_alumno_percibido: 'bien' | 'regular' | 'en_riesgo' | 'critico';
    factores_riesgo: string[];
    seguimiento_requerido: boolean;
    notas_adicionales?: string;
  }) => {
    // Determine estado based on date
    const isFuture = new Date(payload.fecha_realizada) > new Date();
    const estado = isFuture ? 'planificada' : 'realizada';

    // Insert intervencion
    const { data: intervencion, error: interError } = await supabase
      .from('intervenciones')
      .insert({
        estudiante_id: payload.estudiante_id,
        tutor_id: payload.tutor_id,
        tipo: 'entrevista',
        modalidad: payload.modalidad,
        fecha_realizada: payload.fecha_realizada,
        motivo: payload.motivo,
        resumen: payload.resumen,
        estado,
      })
      .select('id')
      .single();

    if (interError) throw interError;

    // Insert entrevista
    const { error: entError } = await supabase
      .from('entrevistas')
      .insert({
        intervencion_id: intervencion.id,
        motivo_entrevista: payload.motivo,
        estado_alumno_percibido: payload.estado_alumno_percibido,
        factores_riesgo: payload.factores_riesgo,
        acciones_acordadas: payload.resumen,
        seguimiento_requerido: payload.seguimiento_requerido,
        notas_adicionales: payload.notas_adicionales,
      });

    if (entError) throw entError;

    // Refetch
    await fetchEntrevistas();
  }, [fetchEntrevistas]);

  return { entrevistas, loading, error, crearEntrevista, refetch: fetchEntrevistas };
};
