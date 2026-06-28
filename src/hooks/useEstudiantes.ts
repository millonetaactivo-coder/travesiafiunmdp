import { useEffect, useState, useCallback } from 'react';
import { getEstudiantesFiltrados, type EstudianteRow, type StudentFilters } from '../services/estudiantesService';
import { supabase } from '../lib/supabase';

export type { EstudianteRow, StudentFilters };

const DEFAULT_FILTERS: StudentFilters = {
  sortBy: 'apellido',
  sortDir: 'asc',
};

export const useEstudiantes = (userId: string, role: string, carreraId?: string, filters?: Partial<StudentFilters>) => {
  const [estudiantes, setEstudiantes] = useState<EstudianteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mergedFilters: StudentFilters = { ...DEFAULT_FILTERS, ...filters };

  const fetchEstudiantes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (role === 'tutor' || role === 'asesor_par') {
        // Tutor: fetch assigned students + carrera/anio data.
        // Two-query approach because there is no direct FK from
        // asignaciones_tutor to estudiantes (estudiante_id → usuarios.id,
        // not estudiantes.id). PostgREST cannot resolve a reverse embed
        // estudiantes(...) nested inside usuarios — it has no FK going
        // that direction. So we fetch students via usuarios first, then
        // batch-query estudiantes by usuario_id.
        const { data: asignaciones, error: asigError } = await supabase
          .from('asignaciones_tutor')
          .select(`
            estudiante_id,
            usuarios!estudiante_id (nombre, apellido, legajo)
          `)
          .eq('tutor_id', userId)
          .eq('activa', true);

        if (asigError) throw asigError;

        const rows: EstudianteRow[] = (asignaciones ?? []).map((row: Record<string, unknown>) => {
          const u = row.usuarios as Record<string, unknown> | null;
          return {
            id: row.estudiante_id as string,
            nombre: (u?.nombre as string) ?? '',
            apellido: (u?.apellido as string) ?? '',
            email: (u?.email as string) ?? '',
            legajo: (u?.legajo as string) ?? '',
            carrera_id: '',
            anio_ingreso: 0,
            nivel_riesgo: undefined,
            tiene_tutor: true,
            tutor_nombre: undefined,
          };
        });

        // Batch-query estudiantes for carrera_id / anio_ingreso
        const userIds = rows.map(r => r.id).filter(Boolean);
        if (userIds.length > 0) {
          const { data: estData } = await supabase
            .from('estudiantes')
            .select('usuario_id, carrera_id, anio_ingreso')
            .in('usuario_id', userIds);

          if (estData) {
            for (const row of rows) {
              const match = estData.find(e => e.usuario_id === row.id);
              if (match) {
                row.carrera_id = match.carrera_id as string;
                row.anio_ingreso = match.anio_ingreso as number;
              }
            }
          }
        }

        // Fetch scores for risk levels
        const ids = rows.map(r => r.id);
        if (ids.length > 0) {
          const { data: scores } = await supabase
            .from('scores')
            .select('estudiante_id, nivel_riesgo')
            .in('estudiante_id', ids)
            .order('calculado_at', { ascending: false });

          if (scores) {
            const seen = new Set<string>();
            for (const s of scores) {
              if (!seen.has(s.estudiante_id)) {
                const row = rows.find(r => r.id === s.estudiante_id);
                if (row) row.nivel_riesgo = s.nivel_riesgo as string;
                seen.add(s.estudiante_id);
              }
            }
          }
        }

        setEstudiantes(rows);
      } else if ((role === 'admin' || role === 'docente') && carreraId) {
        const { data, error: fetchError } = await getEstudiantesFiltrados(carreraId, mergedFilters);
        if (fetchError) throw new Error(fetchError);
        setEstudiantes(data ?? []);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching students';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, role, carreraId, mergedFilters.search, mergedFilters.anioIngreso, mergedFilters.nivelRiesgo, mergedFilters.hasTutor, mergedFilters.sortBy, mergedFilters.sortDir]);

  useEffect(() => {
    if (userId && role) {
      fetchEstudiantes();
    }
  }, [fetchEstudiantes]);

  return { estudiantes, loading, error, refetch: fetchEstudiantes };
};
