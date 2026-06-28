import { supabase } from '../lib/supabase';

/* ─── Types ─── */

export interface ReporteRow {
  estudiante_id: string;
  nombre: string;
  apellido: string;
  legajo: string;
  nivel_riesgo: string | null;
  puntaje: number | null;
  tutor: string | null;
  materia?: string;
  materia_id?: string;
  nota?: number | null;
  situacion?: string;
  cuatrimestre?: number;
  anio?: number;
  // Aggregated fields for cohort report
  total_estudiantes?: number;
  promedio_puntaje?: number;
  distribucion_riesgo?: Record<string, number>;
  fecha_calculo?: string;
}

export interface ReporteFiltros {
  carreraId: string;
  cohorte?: number;           // year of entry
  materiaId?: string;
  anio?: number;              // academic year
  cuatrimestre?: number;
  nivelRiesgo?: string;
}

export type ReportType = 'cohorte' | 'materia' | 'periodo' | 'nivel_riesgo';

export interface ReporteMateria {
  materia_id: string;
  materia_nombre: string;
  materia_codigo: string;
  total_estudiantes: number;
  promedio_nota: number | null;
  aprobados: number;
  desaprobados: number;
  pendientes: number;
}

export interface ReportePeriodo {
  cuatrimestre: number;
  anio: number;
  total_estudiantes: number;
  promedio_puntaje: number | null;
  nivel_riesgo_distribucion: Record<string, number>;
}

export interface ReporteNivelRiesgo {
  nivel: string;
  cantidad: number;
  porcentaje: number;
  estudiantes: { nombre: string; apellido: string; legajo: string; puntaje: number | null }[];
}

/* ─── Service functions ─── */

/**
 * Report by entry cohort: students grouped by año_ingreso with risk distribution.
 */
export async function getReporteCohorte(
  filtros: ReporteFiltros
): Promise<{ data: ReporteRow[]; error: string | null }> {
  try {
    // Fetch students in career
    const { data: estudiantes, error: estErr } = await supabase
      .from('estudiantes')
      .select(`
        usuario_id, anio_ingreso, carrera_id,
        usuarios!usuario_id (id, nombre, apellido, legajo)
      `)
      .eq('carrera_id', filtros.carreraId);

    if (estErr) throw estErr;

    const usuarioIds = (estudiantes ?? []).map((e: Record<string, unknown>) => e.usuario_id as string);

    // Fetch scores
    let scoreMap = new Map<string, { nivel_riesgo: string; puntaje: number | null }>();
    if (usuarioIds.length > 0) {
      const { data: scores } = await supabase
        .from('scores')
        .select('estudiante_id, nivel_riesgo, valor')
        .in('estudiante_id', usuarioIds)
        .order('calculado_at', { ascending: false });

      if (scores) {
        const seen = new Set<string>();
        for (const s of scores) {
          if (!seen.has(s.estudiante_id)) {
            scoreMap.set(s.estudiante_id, {
              nivel_riesgo: s.nivel_riesgo as string,
              puntaje: s.valor as number | null,
            });
            seen.add(s.estudiante_id);
          }
        }
      }
    }

    // Fetch tutor assignments via SECURITY DEFINER function (avoids RLS cycle for docentes)
    let tutorMap = new Map<string, string>();
    if (usuarioIds.length > 0) {
      const { data: tutoresData } = await supabase
        .rpc('get_tutores_asignados', { student_ids: usuarioIds });

      if (tutoresData) {
        for (const t of tutoresData as { estudiante_id: string; tutor_nombre: string }[]) {
          tutorMap.set(t.estudiante_id, t.tutor_nombre);
        }
      }
    }

    let rows: ReporteRow[] = (estudiantes ?? []).map((row: Record<string, unknown>) => {
      const u = row.usuarios as Record<string, unknown> | null;
      const uid = (row.usuario_id as string) ?? (u?.id as string) ?? '';
      const score = scoreMap.get(uid);
      return {
        estudiante_id: uid,
        nombre: (u?.nombre as string) ?? '',
        apellido: (u?.apellido as string) ?? '',
        legajo: (u?.legajo as string) ?? '',
        nivel_riesgo: score?.nivel_riesgo ?? null,
        puntaje: score?.puntaje ?? null,
        tutor: tutorMap.get(uid) ?? null,
        anio: row.anio_ingreso as number,
      };
    });

    // Filter by cohort year if provided
    if (filtros.cohorte) {
      rows = rows.filter((r) => r.anio === filtros.cohorte);
    }

    // Filter by risk level if provided
    if (filtros.nivelRiesgo) {
      rows = rows.filter((r) => r.nivel_riesgo === filtros.nivelRiesgo);
    }

    return { data: rows, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating cohort report';
    return { data: [], error: message };
  }
}

/**
 * Report by subject: average grades, pass/fail counts per materia.
 */
export async function getReporteMateria(
  filtros: ReporteFiltros
): Promise<{ data: ReporteMateria[]; error: string | null }> {
  try {
    // Fetch students in career
    const { data: estudiantes, error: estErr } = await supabase
      .from('estudiantes')
      .select('usuario_id')
      .eq('carrera_id', filtros.carreraId);

    if (estErr) throw estErr;

    const usuarioIds = (estudiantes ?? []).map((e: Record<string, unknown>) => e.usuario_id as string);
    if (usuarioIds.length === 0) return { data: [], error: null };

    // Fetch cursadas with materias
    let cursadasQuery = supabase
      .from('cursadas')
      .select('estudiante_id, nota_cursada, situacion, materia_id, materias (id, nombre, codigo)')
      .in('estudiante_id', usuarioIds);

    if (filtros.materiaId) {
      cursadasQuery = cursadasQuery.eq('materia_id', filtros.materiaId);
    }
    if (filtros.anio) {
      cursadasQuery = cursadasQuery.eq('anio', filtros.anio);
    }
    if (filtros.cuatrimestre) {
      cursadasQuery = cursadasQuery.eq('cuatrimestre', filtros.cuatrimestre);
    }

    const { data: cursadas, error: curErr } = await cursadasQuery;
    if (curErr) throw curErr;

    // Group by materia
    const materiaMap = new Map<string, {
      materia_id: string;
      nombre: string;
      codigo: string;
      notas: number[];
      aprobados: number;
      desaprobados: number;
      pendientes: number;
    }>();

    for (const c of (cursadas ?? []) as Record<string, unknown>[]) {
      const materiaRaw = c.materias as Record<string, unknown> | null;
      const matId = c.materia_id as string;
      const matNombre = (materiaRaw?.nombre as string) ?? 'Desconocida';
      const matCodigo = (materiaRaw?.codigo as string) ?? '';

      if (!materiaMap.has(matId)) {
        materiaMap.set(matId, {
          materia_id: matId,
          nombre: matNombre,
          codigo: matCodigo,
          notas: [],
          aprobados: 0,
          desaprobados: 0,
          pendientes: 0,
        });
      }

      const entry = materiaMap.get(matId)!;
      const nota = c.nota_cursada as number | null;
      const situacion = c.situacion as string;

      if (nota !== null && nota !== undefined) {
        entry.notas.push(nota);
      }

      if (situacion === 'aprobada' || situacion === 'finalizado') {
        entry.aprobados++;
      } else if (situacion === 'desaprobada' || situacion === 'reprobada') {
        entry.desaprobados++;
      } else {
        entry.pendientes++;
      }
    }

    const result: ReporteMateria[] = Array.from(materiaMap.values()).map((m) => ({
      materia_id: m.materia_id,
      materia_nombre: m.nombre,
      materia_codigo: m.codigo,
      total_estudiantes: m.aprobados + m.desaprobados + m.pendientes,
      promedio_nota: m.notas.length > 0
        ? m.notas.reduce((a, b) => a + b, 0) / m.notas.length
        : null,
      aprobados: m.aprobados,
      desaprobados: m.desaprobados,
      pendientes: m.pendientes,
    }));

    return { data: result, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating materia report';
    return { data: [], error: message };
  }
}

/**
 * Report by academic period: aggregated stats per cuatrimestre+anio.
 */
export async function getReportePeriodo(
  filtros: ReporteFiltros
): Promise<{ data: ReporteRow[]; error: string | null }> {
  try {
    // Fetch students in career
    const { data: estudiantes, error: estErr } = await supabase
      .from('estudiantes')
      .select('usuario_id')
      .eq('carrera_id', filtros.carreraId);

    if (estErr) throw estErr;

    const usuarioIds = (estudiantes ?? []).map((e: Record<string, unknown>) => e.usuario_id as string);
    if (usuarioIds.length === 0) return { data: [], error: null };

    // Fetch cursadas
    let query = supabase
      .from('cursadas')
      .select('estudiante_id, nota_cursada, situacion, cuatrimestre, anio, materias (nombre)')
      .in('estudiante_id', usuarioIds)
      .order('anio', { ascending: false })
      .order('cuatrimestre', { ascending: false });

    if (filtros.anio) query = query.eq('anio', filtros.anio);
    if (filtros.cuatrimestre) query = query.eq('cuatrimestre', filtros.cuatrimestre);

    const { data: cursadas, error: curErr } = await query;
    if (curErr) throw curErr;

    // Fetch scores for students
    const { data: scores } = await supabase
      .from('scores')
      .select('estudiante_id, nivel_riesgo, valor')
      .in('estudiante_id', usuarioIds)
      .order('calculado_at', { ascending: false });

    const scoreMap = new Map<string, { nivel_riesgo: string; puntaje: number | null }>();
    if (scores) {
      const seen = new Set<string>();
      for (const s of scores) {
        if (!seen.has(s.estudiante_id)) {
          scoreMap.set(s.estudiante_id, {
            nivel_riesgo: s.nivel_riesgo as string,
            puntaje: s.valor as number | null,
          });
          seen.add(s.estudiante_id);
        }
      }
    }

    // Build rows: one per student per cursada period
    const rows: ReporteRow[] = (cursadas ?? []).map((c: Record<string, unknown>) => {
      const materiaRaw = c.materias as Record<string, unknown> | null;
      const sid = c.estudiante_id as string;
      const score = scoreMap.get(sid);
      return {
        estudiante_id: sid,
        nombre: '',
        apellido: '',
        legajo: '',
        nivel_riesgo: score?.nivel_riesgo ?? null,
        puntaje: score?.puntaje ?? null,
        tutor: null,
        materia: (materiaRaw?.nombre as string) ?? '',
        nota: c.nota_cursada as number | null,
        situacion: c.situacion as string,
        cuatrimestre: c.cuatrimestre as number,
        anio: c.anio as number,
      };
    });

    return { data: rows, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating period report';
    return { data: [], error: message };
  }
}

/**
 * Report by risk level: students grouped by nivel_riesgo.
 */
export async function getReporteRiesgo(
  filtros: ReporteFiltros
): Promise<{ data: ReporteRow[]; error: string | null }> {
  try {
    // Fetch students in career
    const { data: estudiantes, error: estErr } = await supabase
      .from('estudiantes')
      .select(`
        usuario_id, anio_ingreso,
        usuarios!usuario_id (id, nombre, apellido, legajo)
      `)
      .eq('carrera_id', filtros.carreraId);

    if (estErr) throw estErr;

    const usuarioIds = (estudiantes ?? []).map((e: Record<string, unknown>) => e.usuario_id as string);

    // Fetch scores
    let scoreMap = new Map<string, { nivel_riesgo: string; puntaje: number | null }>();
    if (usuarioIds.length > 0) {
      const { data: scores } = await supabase
        .from('scores')
        .select('estudiante_id, nivel_riesgo, valor')
        .in('estudiante_id', usuarioIds)
        .order('calculado_at', { ascending: false });

      if (scores) {
        const seen = new Set<string>();
        for (const s of scores) {
          if (!seen.has(s.estudiante_id)) {
            scoreMap.set(s.estudiante_id, {
              nivel_riesgo: s.nivel_riesgo as string,
              puntaje: s.valor as number | null,
            });
            seen.add(s.estudiante_id);
          }
        }
      }
    }

    // Fetch tutors via SECURITY DEFINER function (avoids RLS cycle)
    let tutorMap = new Map<string, string>();
    if (usuarioIds.length > 0) {
      const { data: tutoresData } = await supabase
        .rpc('get_tutores_asignados', { student_ids: usuarioIds });

      if (tutoresData) {
        for (const t of tutoresData as { estudiante_id: string; tutor_nombre: string }[]) {
          tutorMap.set(t.estudiante_id, t.tutor_nombre);
        }
      }
    }

    let rows: ReporteRow[] = (estudiantes ?? []).map((row: Record<string, unknown>) => {
      const u = row.usuarios as Record<string, unknown> | null;
      const uid = (row.usuario_id as string) ?? (u?.id as string) ?? '';
      const score = scoreMap.get(uid);
      return {
        estudiante_id: uid,
        nombre: (u?.nombre as string) ?? '',
        apellido: (u?.apellido as string) ?? '',
        legajo: (u?.legajo as string) ?? '',
        nivel_riesgo: score?.nivel_riesgo ?? null,
        puntaje: score?.puntaje ?? null,
        tutor: tutorMap.get(uid) ?? null,
      };
    });

    // Filter by risk level if provided
    if (filtros.nivelRiesgo) {
      rows = rows.filter((r) => r.nivel_riesgo === filtros.nivelRiesgo);
    }

    // Filter by cohort if provided
    if (filtros.cohorte) {
      const cohortIds = new Set(
        (estudiantes ?? [])
          .filter((e: Record<string, unknown>) => (e.anio_ingreso as number) === filtros.cohorte)
          .map((e: Record<string, unknown>) => e.usuario_id as string)
      );
      rows = rows.filter((r) => cohortIds.has(r.estudiante_id));
    }

    return { data: rows, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating risk report';
    return { data: [], error: message };
  }
}

/**
 * Ranking of materias by performance for a career.
 */
export async function getRankingMaterias(
  carreraId?: string
): Promise<{ data: ReporteMateria[]; error: string | null }> {
  try {
    if (!carreraId) return { data: [], error: null };

    // Get students in career
    const { data: estudiantes, error: estErr } = await supabase
      .from('estudiantes')
      .select('usuario_id')
      .eq('carrera_id', carreraId);

    if (estErr) throw estErr;

    const usuarioIds = (estudiantes ?? []).map((e: Record<string, unknown>) => e.usuario_id as string);
    if (usuarioIds.length === 0) return { data: [], error: null };

    // Get all cursadas
    const { data: cursadas, error: curErr } = await supabase
      .from('cursadas')
      .select('estudiante_id, nota_cursada, situacion, materia_id, materias (id, nombre, codigo)')
      .in('estudiante_id', usuarioIds);

    if (curErr) throw curErr;

    // Group by materia
    const materiaMap = new Map<string, {
      materia_id: string;
      nombre: string;
      codigo: string;
      notas: number[];
      aprobados: number;
      desaprobados: number;
      pendientes: number;
    }>();

    for (const c of (cursadas ?? []) as Record<string, unknown>[]) {
      const materiaRaw = c.materias as Record<string, unknown> | null;
      const matId = c.materia_id as string;
      if (!matId) continue;

      const matNombre = (materiaRaw?.nombre as string) ?? 'Desconocida';
      const matCodigo = (materiaRaw?.codigo as string) ?? '';

      if (!materiaMap.has(matId)) {
        materiaMap.set(matId, {
          materia_id: matId,
          nombre: matNombre,
          codigo: matCodigo,
          notas: [],
          aprobados: 0,
          desaprobados: 0,
          pendientes: 0,
        });
      }

      const entry = materiaMap.get(matId)!;
      const nota = c.nota_cursada as number | null;
      const situacion = c.situacion as string;

      if (nota !== null && nota !== undefined) entry.notas.push(nota);
      if (situacion === 'aprobada' || situacion === 'finalizado') entry.aprobados++;
      else if (situacion === 'desaprobada' || situacion === 'reprobada') entry.desaprobados++;
      else entry.pendientes++;
    }

    const result: ReporteMateria[] = Array.from(materiaMap.values())
      .map((m) => ({
        materia_id: m.materia_id,
        materia_nombre: m.nombre,
        materia_codigo: m.codigo,
        total_estudiantes: m.aprobados + m.desaprobados + m.pendientes,
        promedio_nota: m.notas.length > 0
          ? m.notas.reduce((a, b) => a + b, 0) / m.notas.length
          : null,
        aprobados: m.aprobados,
        desaprobados: m.desaprobados,
        pendientes: m.pendientes,
      }))
      .sort((a, b) => (b.promedio_nota ?? 0) - (a.promedio_nota ?? 0));

    return { data: result, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating ranking';
    return { data: [], error: message };
  }
}
