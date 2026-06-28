import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Tutor {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

export const useTutores = () => {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutores = async () => {
      try {
        const { data, error } = await supabase
          .from('usuario_roles')
          .select(`
            usuario_id,
            usuarios!usuario_id (id, nombre, apellido, email)
          `)
          .in('rol', ['tutor', 'asesor_par']);

        if (error) throw error;

        const mapped: Tutor[] = (data ?? [])
          .map((row: Record<string, unknown>) => {
            const u = row.usuarios as Record<string, unknown> | null;
            if (!u) return null;
            return {
              id: u.id as string,
              nombre: (u.nombre as string) || '',
              apellido: (u.apellido as string) || '',
              email: (u.email as string) || '',
            };
          })
          .filter((t): t is Tutor => t !== null);

        setTutores(mapped);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTutores();
  }, []);

  return { tutores, loading, error };
};
