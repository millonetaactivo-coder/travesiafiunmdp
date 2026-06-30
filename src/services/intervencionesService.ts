import { supabase } from '../lib/supabase';

export const getIntervencionesEstudiante = async (estudianteId: string) => {
  return await supabase
    .from('intervenciones')
    .select(`
      id, tipo, modalidad, fecha_realizada, estado,
      motivo, resumen, compromisos, proxima_accion,
      usuarios!tutor_id (nombre, apellido),
      entrevistas (estado_alumno_percibido, factores_riesgo)
    `)
    .eq('estudiante_id', estudianteId)
    .order('fecha_realizada', { ascending: false });
};

export const getIntervenciones = async (tutorId?: string) => {
  let query = supabase
    .from('intervenciones')
    .select(`
      id, tipo, modalidad, fecha_realizada, estado,
      motivo, resumen, estudiante_id, tutor_id,
      usuarios!estudiante_id (nombre, apellido),
      entrevistas (estado_alumno_percibido, factores_riesgo, seguimiento_requerido)
    `)
    .order('fecha_realizada', { ascending: false });

  if (tutorId) {
    query = query.eq('tutor_id', tutorId);
  }

  return await query;
};

export const getSinContacto = async (tutorId?: string) => {
  // Get students with alto/critico risk
  let scoreQuery = supabase
    .from('scores')
    .select('estudiante_id, nivel_riesgo, valor, calculado_at')
    .in('nivel_riesgo', ['alto', 'critico']);

  const { data: scores } = await scoreQuery;
  if (!scores || scores.length === 0) return { data: [], error: null };

  // Deduplicate: keep latest score per student
  const scoreMap = new Map<string, { nivel_riesgo: string; valor: number; calculado_at: string }>();
  for (const s of scores) {
    const existing = scoreMap.get(s.estudiante_id);
    if (!existing || new Date(s.calculado_at) > new Date(existing.calculado_at)) {
      scoreMap.set(s.estudiante_id, {
        nivel_riesgo: s.nivel_riesgo,
        valor: s.valor,
        calculado_at: s.calculado_at,
      });
    }
  }

  const atRiskIds = Array.from(scoreMap.keys());
  if (atRiskIds.length === 0) return { data: [], error: null };

  // Filter by tutor's students if tutor
  let studentIds = atRiskIds;
  if (tutorId) {
    const { data: asignaciones } = await supabase
      .from('asignaciones_tutor')
      .select('estudiante_id')
      .eq('tutor_id', tutorId)
      .eq('activa', true);

    const tutorStudentIds = new Set(asignaciones?.map(a => a.estudiante_id) ?? []);
    studentIds = atRiskIds.filter(id => tutorStudentIds.has(id));
  }

  if (studentIds.length === 0) return { data: [], error: null };

  // Get students with 0 interventions
  const { data: intervenciones } = await supabase
    .from('intervenciones')
    .select('estudiante_id')
    .in('estudiante_id', studentIds);

  const studentsWithInterventions = new Set(intervenciones?.map(i => i.estudiante_id) ?? []);
  const neverContacted = studentIds.filter(id => !studentsWithInterventions.has(id));

  if (neverContacted.length === 0) return { data: [], error: null };

  // Get student details
  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('id, nombre, apellido, email, legajo')
    .in('id', neverContacted);

  const result = (usuarios ?? []).map(u => ({
    ...u,
    nivel_riesgo: scoreMap.get(u.id)?.nivel_riesgo ?? 'desconocido',
    score_valor: scoreMap.get(u.id)?.valor ?? 0,
  }));

  return { data: result, error: null };
};

export const crearIntervencion = async (intervencion: {
  estudiante_id: string;
  tutor_id: string;
  tipo: 'entrevista' | 'contacto_email' | 'contacto_telefono' | 'reunion_grupal';
  modalidad: 'presencial' | 'virtual' | 'telefonica';
  fecha_realizada: string;
  motivo: string;
  resumen: string;
  compromisos: string;
  proxima_accion: string;
}) => {
  return await supabase
    .from('intervenciones')
    .insert({ ...intervencion, estado: 'realizada' })
    .select()
    .single();
};

export const crearEntrevista = async (entrevista: {
  intervencion_id: string;
  motivo_entrevista: string;
  estado_alumno_percibido: 'bien' | 'regular' | 'en_riesgo' | 'critico';
  factores_riesgo: string[];
  acciones_acordadas: string;
  derivaciones?: string;
  seguimiento_requerido: boolean;
  notas_adicionales?: string;
}) => {
  return await supabase
    .from('entrevistas')
    .insert(entrevista);
};

export const crearEntrevistaCompleta = async (payload: {
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
  const isFuture = new Date(payload.fecha_realizada) > new Date();
  const estado = isFuture ? 'planificada' : 'realizada';

  // Step 1: Insert intervencion
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

  // Step 2: Insert entrevista
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

  return { success: true };
};
