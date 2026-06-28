import { supabase } from '../lib/supabase';

export interface EstudianteRow {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  legajo: string;
  carrera_id: string;
  carrera_nombre?: string;
  anio_ingreso: number;
  nivel_riesgo?: string;
  tiene_tutor: boolean;
  tutor_nombre?: string;
}

export interface StudentFilters {
  search?: string;
  anioIngreso?: number;
  nivelRiesgo?: 'bajo' | 'medio' | 'alto' | 'critico';
  hasTutor?: boolean;
  sortBy: 'apellido' | 'legajo' | 'anio_ingreso' | 'nivel_riesgo';
  sortDir: 'asc' | 'desc';
}

function flattenTutorRow(row: Record<string, unknown>): EstudianteRow {
  const u = row.usuarios as Record<string, unknown> | null;
  const e = row.estudiantes as Record<string, unknown> | null;
  return {
    id: (u?.id as string) ?? row.estudiante_id as string,
    nombre: (u?.nombre as string) ?? '',
    apellido: (u?.apellido as string) ?? '',
    email: (u?.email as string) ?? '',
    legajo: (u?.legajo as string) ?? '',
    carrera_id: (e?.carrera_id as string) ?? '',
    anio_ingreso: (e?.anio_ingreso as number) ?? 0,
    nivel_riesgo: undefined,
    tiene_tutor: true,
    tutor_nombre: undefined,
  };
}

function flattenCarreraRow(
  row: Record<string, unknown>,
  tutorMap: Map<string, string>,
  carrerasMap: Map<string, string>
): EstudianteRow {
  const u = row.usuarios as Record<string, unknown> | null;
  const uid = (row.usuario_id as string) ?? (u?.id as string) ?? '';
  const carreraId = (row.carrera_id as string) ?? '';
  return {
    id: uid,
    nombre: (u?.nombre as string) ?? '',
    apellido: (u?.apellido as string) ?? '',
    email: (u?.email as string) ?? '',
    legajo: (u?.legajo as string) ?? '',
    carrera_id: carreraId,
    carrera_nombre: carrerasMap.get(carreraId) ?? '',
    anio_ingreso: (row.anio_ingreso as number) ?? 0,
    nivel_riesgo: undefined,
    tiene_tutor: tutorMap.has(uid),
    tutor_nombre: tutorMap.get(uid),
  };
}

export const getEstudiantesDelTutor = async (tutorId: string) => {
  return await supabase
    .from('asignaciones_tutor')
    .select(`
      estudiante_id,
      usuarios!estudiante_id (
        id, nombre, apellido, email, legajo
      ),
      estudiantes!estudiante_id (
        carrera_id, anio_ingreso
      )
    `)
    .eq('tutor_id', tutorId)
    .eq('activa', true);
};

export const getEstudiantesPorCarrera = async (carreraId: string) => {
  return await supabase
    .from('estudiantes')
    .select(`
      usuario_id, anio_ingreso, carrera_id,
      usuarios!usuario_id (id, nombre, apellido, email, legajo)
    `)
    .eq('carrera_id', carreraId);
};

export const getEstudiantesFiltrados = async (
  carreraId: string,
  filters: StudentFilters
): Promise<{ data: EstudianteRow[]; error: string | null }> => {
  try {
    // Fetch students for the career
    const { data: estudiantes, error: estError } = await supabase
      .from('estudiantes')
      .select(`
        usuario_id, anio_ingreso, carrera_id,
        usuarios!usuario_id (id, nombre, apellido, email, legajo)
      `)
      .eq('carrera_id', carreraId);

    if (estError) throw estError;

    // Fetch latest scores for risk levels
    const usuarioIds = (estudiantes ?? []).map((e: Record<string, unknown>) => e.usuario_id as string);
    let scoreMap = new Map<string, string>();
    if (usuarioIds.length > 0) {
      const { data: scores } = await supabase
        .from('scores')
        .select('estudiante_id, nivel_riesgo')
        .in('estudiante_id', usuarioIds)
        .order('calculado_at', { ascending: false });

      if (scores) {
        const seen = new Set<string>();
        for (const s of scores) {
          const sid = s.estudiante_id as string;
          if (!seen.has(sid)) {
            scoreMap.set(sid, s.nivel_riesgo as string);
            seen.add(sid);
          }
        }
      }
    }

    // Fetch tutor assignments
    let tutorMap = new Map<string, string>();
    if (usuarioIds.length > 0) {
      const { data: asignaciones } = await supabase
        .from('asignaciones_tutor')
        .select(`
          estudiante_id,
          usuarios!tutor_id (nombre, apellido)
        `)
        .in('estudiante_id', usuarioIds)
        .eq('activa', true);

      if (asignaciones) {
        for (const a of asignaciones) {
          const rawU = a.usuarios as unknown;
          const u = Array.isArray(rawU) ? rawU[0] as Record<string, unknown> | undefined : rawU as Record<string, unknown> | null;
          if (u) {
            tutorMap.set(a.estudiante_id as string, `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim());
          }
        }
      }
    }

    // Fetch carreras map for nombre resolution
    const carrerasMap = await getCarrerasMap();

    // Flatten rows
    let rows: EstudianteRow[] = (estudiantes ?? []).map((row: Record<string, unknown>) => {
      const flat = flattenCarreraRow(row, tutorMap, carrerasMap);
      flat.nivel_riesgo = scoreMap.get(flat.id);
      return flat;
    });

    // Apply filters
    if (filters.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter((r) =>
        r.nombre.toLowerCase().includes(q) ||
        r.apellido.toLowerCase().includes(q) ||
        r.legajo.toLowerCase().includes(q)
      );
    }
    if (filters.anioIngreso) {
      rows = rows.filter((r) => r.anio_ingreso === filters.anioIngreso);
    }
    if (filters.nivelRiesgo) {
      rows = rows.filter((r) => r.nivel_riesgo === filters.nivelRiesgo);
    }
    if (filters.hasTutor !== undefined) {
      rows = rows.filter((r) => filters.hasTutor ? r.tiene_tutor : !r.tiene_tutor);
    }

    // Sort
    rows.sort((a, b) => {
      let cmp = 0;
      switch (filters.sortBy) {
        case 'apellido':
          cmp = a.apellido.localeCompare(b.apellido);
          break;
        case 'legajo':
          cmp = a.legajo.localeCompare(b.legajo);
          break;
        case 'anio_ingreso':
          cmp = a.anio_ingreso - b.anio_ingreso;
          break;
        case 'nivel_riesgo': {
          const order: Record<string, number> = { bajo: 0, medio: 1, alto: 2, critico: 3 };
          cmp = (order[a.nivel_riesgo ?? 'bajo'] ?? 0) - (order[b.nivel_riesgo ?? 'bajo'] ?? 0);
          break;
        }
      }
      return filters.sortDir === 'asc' ? cmp : -cmp;
    });

    return { data: rows, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching students';
    return { data: [], error: message };
  }
};

export const getPerfilEstudiante = async (estudianteId: string) => {
  return await supabase
    .from('usuarios')
    .select(`
      id, nombre, apellido, email, legajo,
      estudiantes (
        carrera_id, anio_ingreso,
        encuesta_inicial_completada
      )
    `)
    .eq('id', estudianteId)
    .single();
};

export const getMiPerfil = async (userId: string) => {
  return await supabase
    .from('usuarios')
    .select('id, nombre, apellido, email, legajo, estudiantes(*)')
    .eq('id', userId)
    .single();
};

export const getCarrerasMap = async (): Promise<Map<string, string>> => {
  const { data } = await supabase.from('carreras').select('id, nombre');
  const map = new Map<string, string>();
  if (data) {
    for (const c of data) {
      map.set(c.id, c.nombre);
    }
  }
  return map;
};

export const getEntrevistasEstudiante = async (estudianteId: string) => {
  return await supabase
    .from('intervenciones')
    .select(`
      id, tipo, modalidad, fecha_realizada, estado,
      motivo, resumen, estudiante_id,
      entrevistas (
        estado_alumno_percibido, factores_riesgo,
        seguimiento_requerido, notas_adicionales
      )
    `)
    .eq('estudiante_id', estudianteId)
    .order('fecha_realizada', { ascending: false });
};

export const getSesionesEncuestaEstudiante = async (estudianteId: string) => {
  return await supabase
    .from('sesiones_encuesta')
    .select(`
      id, estado, cuatrimestre, anio,
      iniciada_at, completada_at,
      encuestas (titulo, tipo)
    `)
    .eq('estudiante_id', estudianteId)
    .order('completada_at', { ascending: false });
};

export const getCursadasEstudiante = async (estudianteId: string) => {
  return await supabase
    .from('cursadas')
    .select(`
      id, cuatrimestre, anio, situacion, nota_cursada, numero_cursada,
      materias (id, nombre, codigo)
    `)
    .eq('estudiante_id', estudianteId)
    .order('anio', { ascending: false })
    .order('cuatrimestre', { ascending: false });
};

export const getFinalesEstudiante = async (estudianteId: string) => {
  return await supabase
    .from('finales')
    .select(`
      id, nota, resultado, fecha_intento, numero_intento,
      materias (id, nombre, codigo)
    `)
    .eq('estudiante_id', estudianteId)
    .order('fecha_intento', { ascending: false });
};
