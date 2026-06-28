import { supabase } from '../lib/supabase';

export interface IndicadorComponente {
  id: string;
  indicador_id: string;
  nombre: string;
  formula: string | null;
  peso: number;
}

export interface Indicador {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  peso: number;
  componentes: IndicadorComponente[];
}

export const getIndicadores = async (): Promise<{ data: Indicador[]; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('indicadores')
      .select('*, indicador_componentes(*)')
      .order('id');

    if (error) throw error;

    const indicadores: Indicador[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      nombre: row.nombre as string,
      descripcion: row.descripcion as string | null,
      activo: row.activo as boolean,
      peso: row.peso as number,
      componentes: ((row.indicador_componentes as Record<string, unknown>[]) ?? []).map(
        (c) => ({
          id: c.id as string,
          indicador_id: c.indicador_id as string,
          nombre: c.nombre as string,
          formula: c.formula as string | null,
          peso: c.peso as number,
        })
      ),
    }));

    return { data: indicadores, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching indicadores';
    return { data: [], error: message };
  }
};

export const updateIndicador = async (
  id: string,
  data: { peso?: number; descripcion?: string }
) => {
  const { error } = await supabase
    .from('indicadores')
    .update(data)
    .eq('id', id);

  return { error };
};

export const updateComponente = async (
  id: string,
  data: { peso?: number; formula?: string }
) => {
  const { error } = await supabase
    .from('indicador_componentes')
    .update(data)
    .eq('id', id);

  return { error };
};
