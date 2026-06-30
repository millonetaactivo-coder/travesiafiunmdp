import { supabase } from '../lib/supabase';

export interface ConfiguracionUmbral {
  clave: string;
  valor: string;
  descripcion: string | null;
}

export interface ScoreThresholds {
  verde: number;
  amarillo: number;
  naranja: number;
}

const FALLBACK_THRESHOLDS: ScoreThresholds = {
  verde: 30,
  amarillo: 55,
  naranja: 80,
};

export const getThresholds = async (): Promise<ScoreThresholds> => {
  const { data, error } = await supabase
    .from('configuracion')
    .select('clave, valor')
    .in('clave', ['umbral_verde', 'umbral_amarillo', 'umbral_naranja']);

  if (error || !data || data.length === 0) {
    return FALLBACK_THRESHOLDS;
  }

  const map: Record<string, number> = {};
  for (const row of data) {
    const num = Number(row.valor);
    if (!isNaN(num)) {
      map[row.clave] = num;
    }
  }

  return {
    verde: map['umbral_verde'] ?? FALLBACK_THRESHOLDS.verde,
    amarillo: map['umbral_amarillo'] ?? FALLBACK_THRESHOLDS.amarillo,
    naranja: map['umbral_naranja'] ?? FALLBACK_THRESHOLDS.naranja,
  };
};
