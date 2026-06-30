import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface SinContactoItem {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  legajo: string;
  nivel_riesgo: string;
  score_valor: number;
  created_at: string;
}

export const useSinContacto = (userId: string, role: string) => {
  const [estudiantes, setEstudiantes] = useState<SinContactoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    try {
      // Get students with alto/critico risk scores
      const { data: scores } = await supabase
        .from('scores')
        .select('estudiante_id, nivel_riesgo, valor, calculado_at')
        .in('nivel_riesgo', ['alto', 'critico']);

      if (!scores || scores.length === 0) {
        setEstudiantes([]);
        setLoading(false);
        return;
      }

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
      if (atRiskIds.length === 0) {
        setEstudiantes([]);
        setLoading(false);
        return;
      }

      // Filter by tutor's students if tutor
      let studentIds = atRiskIds;
      if (role === 'tutor' || role === 'asesor_par') {
        const { data: asignaciones } = await supabase
          .from('asignaciones_tutor')
          .select('estudiante_id')
          .eq('tutor_id', userId)
          .eq('activa', true);

        const tutorStudentIds = new Set(asignaciones?.map(a => a.estudiante_id) ?? []);
        studentIds = atRiskIds.filter(id => tutorStudentIds.has(id));
      }

      if (studentIds.length === 0) {
        setEstudiantes([]);
        setLoading(false);
        return;
      }

      // Get students with 0 interventions
      const { data: intervenciones } = await supabase
        .from('intervenciones')
        .select('estudiante_id')
        .in('estudiante_id', studentIds);

      const studentsWithInterventions = new Set(intervenciones?.map(i => i.estudiante_id) ?? []);
      const neverContacted = studentIds.filter(id => !studentsWithInterventions.has(id));

      if (neverContacted.length === 0) {
        setEstudiantes([]);
        setLoading(false);
        return;
      }

      // Get student details
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, nombre, apellido, email, legajo, created_at')
        .in('id', neverContacted);

      const result: SinContactoItem[] = (usuarios ?? []).map(u => ({
        id: u.id,
        nombre: u.nombre || '',
        apellido: u.apellido || '',
        email: u.email || '',
        legajo: u.legajo || '',
        nivel_riesgo: scoreMap.get(u.id)?.nivel_riesgo ?? 'desconocido',
        score_valor: scoreMap.get(u.id)?.valor ?? 0,
        created_at: u.created_at || '',
      }));

      setEstudiantes(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { estudiantes, loading, error, refetch: fetchData };
};
