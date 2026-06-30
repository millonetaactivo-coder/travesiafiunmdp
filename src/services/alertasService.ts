import { supabase } from '../lib/supabase';

export const getAlertasPendientes = async (tutorId: string) => {
  return await supabase
    .from('alertas')
    .select(`
      id, tipo, descripcion, created_at, origen, estado,
      tutor_id, estudiante_id,
      usuarios!estudiante_id (id, nombre, apellido, legajo)
    `)
    .eq('tutor_id', tutorId)
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false });
};

export const getAlertas = async (tutorId?: string) => {
  let query = supabase
    .from('alertas')
    .select(`
      id, tipo, descripcion, created_at, origen, estado,
      tutor_id, estudiante_id,
      usuarios!estudiante_id (id, nombre, apellido, legajo)
    `)
    .order('created_at', { ascending: false });

  if (tutorId) {
    query = query.eq('tutor_id', tutorId);
  }

  return await query;
};

export const crearAlertaAyuda = async (estudianteId: string) => {
  const { data: asignacion } = await supabase
    .from('asignaciones_tutor')
    .select('tutor_id')
    .eq('estudiante_id', estudianteId)
    .eq('activa', true)
    .single();

  return await supabase
    .from('alertas')
    .insert({
      estudiante_id: estudianteId,
      tutor_id: asignacion?.tutor_id ?? null,
      tipo: 'solicitud_ayuda',
      origen: 'solicitud_alumno',
      estado: 'pendiente'
    });
};

export const resolverAlerta = async (alertaId: string, resueltaPor: string) => {
  return await supabase
    .from('alertas')
    .update({
      estado: 'resuelta',
      resuelta_at: new Date().toISOString(),
      resuelta_por: resueltaPor
    })
    .eq('id', alertaId);
};

export const reassignAlerta = async (alertaId: string, newTutorId: string) => {
  return await supabase
    .from('alertas')
    .update({ tutor_id: newTutorId })
    .eq('id', alertaId);
};
