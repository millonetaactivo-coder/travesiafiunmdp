import { supabase } from '../lib/supabase';

export type CursadaEstado = 'promovio' | 'habilito' | 'desaprobo' | 'abandono';
export type FinalResultado = 'aprobado' | 'desaprobado' | 'ausente';
export type GradeTipo = 'cursada' | 'final';

export interface CreateCursadaInput {
  estudianteId: string;
  materiaId: string;
  notaCursada: number;
  estado: CursadaEstado;
  cuatrimestre: number;
  anio: number;
}

export interface CreateFinalInput {
  estudianteId: string;
  materiaId: string;
  cursadaId: string;
  nota: number;
  resultado: FinalResultado;
  fechaIntento: string;
}

export const createCursada = async (input: CreateCursadaInput) => {
  // Check for existing cursada to determine numero_cursada
  const { data: existing } = await supabase
    .from('cursadas')
    .select('id, numero_cursada')
    .eq('estudiante_id', input.estudianteId)
    .eq('materia_id', input.materiaId)
    .order('numero_cursada', { ascending: false })
    .limit(1);

  const numeroCursada = existing && existing.length > 0
    ? (existing[0].numero_cursada ?? 1) + 1
    : 1;

  const { data, error } = await supabase
    .from('cursadas')
    .insert({
      estudiante_id: input.estudianteId,
      materia_id: input.materiaId,
      nota_cursada: input.notaCursada,
      situacion: input.estado,
      cuatrimestre: input.cuatrimestre,
      anio: input.anio,
      numero_cursada: numeroCursada,
    })
    .select('id')
    .single();

  return { data, error };
};

export const createFinal = async (input: CreateFinalInput) => {
  // Determine numero_intento
  const { data: existing } = await supabase
    .from('finales')
    .select('id, numero_intento')
    .eq('estudiante_id', input.estudianteId)
    .eq('materia_id', input.materiaId)
    .order('numero_intento', { ascending: false })
    .limit(1);

  const numeroIntento = existing && existing.length > 0
    ? (existing[0].numero_intento ?? 1) + 1
    : 1;

  const { data, error } = await supabase
    .from('finales')
    .insert({
      estudiante_id: input.estudianteId,
      materia_id: input.materiaId,
      cursada_id: input.cursadaId || null,
      nota: input.nota,
      resultado: input.resultado,
      fecha_intento: input.fechaIntento,
      numero_intento: numeroIntento,
    })
    .select('id')
    .single();

  return { data, error };
};

export const getMateriasPorCarrera = async (carreraId: string) => {
  return await supabase
    .from('materias')
    .select('id, nombre, codigo')
    .eq('carrera_id', carreraId)
    .order('nombre');
};

export const getEstudiantesPorCarreraList = async (carreraId: string) => {
  return await supabase
    .from('estudiantes')
    .select(`
      usuario_id,
      usuarios!usuario_id (id, nombre, apellido, email, legajo)
    `)
    .eq('carrera_id', carreraId);
};

export const getCursadasEstudiante = async (estudianteId: string, materiaId?: string) => {
  let query = supabase
    .from('cursadas')
    .select('id, materia_id, numero_cursada, situacion, nota_cursada')
    .eq('estudiante_id', estudianteId)
    .order('numero_cursada', { ascending: false });

  if (materiaId) {
    query = query.eq('materia_id', materiaId);
  }

  return await query;
};
