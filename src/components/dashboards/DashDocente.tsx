import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import { useCareer } from '../../context/CareerContext';
import { Users, BarChart2, AlertTriangle, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { CustomSelect } from '../ui/CustomSelect';

interface EstudianteConScore {
  usuario_id: string;
  nombre: string;
  apellido: string;
  legajo: string | null;
  carrera_id: string;
  anio_ingreso: number;
  valor: number | null;
  nivel_riesgo: string | null;
  calculado_at: string | null;
}

export const DashDocente = () => {
  const { usuario, rol } = useAuth();
  const { carreraId: contextCarreraId } = useCareer();

  // Use CareerContext's resolved carreraId (auto-selects first carrera with data).
  // For docentes without an explicit carrera_id in usuario_roles, this fallback
  // ensures they still see students instead of an empty dashboard.
  const carreraId = contextCarreraId ?? undefined;

  const { estudiantes: rawEstudiantes, loading: estLoading, error: estError } = useEstudiantes(
    usuario?.id || '',
    rol || '',
    carreraId
  );

  const [estudiantesConScore, setEstudiantesConScore] = useState<EstudianteConScore[]>([]);
  const [intervActivas, setIntervActivas] = useState<number>(0);
  const [sinTutorCount, setSinTutorCount] = useState<number>(0);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch scores for all students and tutor assignment counts
  useEffect(() => {
    const fetchData = async () => {
      if (!rawEstudiantes.length) {
        setDataLoading(false);
        return;
      }
      setDataLoading(true);
      try {
        const ids = rawEstudiantes.map((e) => e.id).filter(Boolean);

        if (ids.length === 0) {
          setDataLoading(false);
          return;
        }

        // Batch fetch latest scores
        const { data: scoresData } = await supabase
          .from('scores')
          .select('estudiante_id, valor, nivel_riesgo, calculado_at')
          .in('estudiante_id', ids);

        // Build score map per student (latest only)
        const scoreMap: Record<string, { valor: number; nivel_riesgo: string; calculado_at: string }> = {};
        for (const s of scoresData ?? []) {
          const existing = scoreMap[s.estudiante_id];
          if (!existing || (s.calculado_at && s.calculado_at > existing.calculado_at)) {
            scoreMap[s.estudiante_id] = { valor: s.valor, nivel_riesgo: s.nivel_riesgo, calculado_at: s.calculado_at };
          }
        }

        // Tutor assignment check for risk students
        const highRiskIds = ids.filter(id => {
          const score = scoreMap[id];
          return score && (score.nivel_riesgo === 'alto' || score.nivel_riesgo === 'critico');
        });

        let sinTutor = 0;
        if (highRiskIds.length > 0) {
          const { data: asignaciones } = await supabase
            .from('asignaciones_tutor')
            .select('estudiante_id')
            .eq('activa', true)
            .in('estudiante_id', highRiskIds);

          const asignados = new Set(asignaciones?.map(a => a.estudiante_id) ?? []);
          sinTutor = highRiskIds.filter(id => !asignados.has(id)).length;
        }
        setSinTutorCount(sinTutor);

        // Active interventions this month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { count: intervCount } = await supabase
          .from('intervenciones')
          .select('id', { count: 'exact', head: true })
          .eq('tutor_id', usuario?.id || '')
          .gte('created_at', firstDay);
        setIntervActivas(intervCount ?? 0);

        // Merge raw estudiantes with scores
        const merged: EstudianteConScore[] = rawEstudiantes.map((e) => {
          const id = e.id;
          const score = scoreMap[id];
          return {
            usuario_id: id,
            nombre: e.nombre,
            apellido: e.apellido,
            legajo: e.legajo || null,
            carrera_id: e.carrera_id,
            anio_ingreso: e.anio_ingreso,
            valor: score?.valor ?? null,
            nivel_riesgo: score?.nivel_riesgo ?? null,
            calculado_at: score?.calculado_at ?? null,
          };
        });

        setEstudiantesConScore(merged);
      } catch (err) {
        console.error('Error fetching docente data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [rawEstudiantes, usuario?.id]);

  // Filters
  const [filterAnio, setFilterAnio] = useState<string>('');
  const [filterNivel, setFilterNivel] = useState<string>('');

  const aniosUnicos = useMemo(() => {
    const set = new Set(estudiantesConScore.map(e => e.anio_ingreso).filter(Boolean));
    return Array.from(set).sort((a, b) => a - b);
  }, [estudiantesConScore]);

  const ANIO_OPCIONES = useMemo(
    () => aniosUnicos.map(a => ({ value: String(a), label: String(a) })),
    [aniosUnicos]
  );

  const filtered = useMemo(() => {
    return estudiantesConScore.filter(e => {
      if (filterAnio && e.anio_ingreso !== Number(filterAnio)) return false;
      if (filterNivel && e.nivel_riesgo !== filterNivel) return false;
      return true;
    });
  }, [estudiantesConScore, filterAnio, filterNivel]);

  const formatRiskBadge = (nivel: string | null) => {
    switch (nivel) {
      case 'bajo': return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Bajo</span>;
      case 'medio': return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Medio</span>;
      case 'alto': return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">Alto</span>;
      case 'critico': return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Crítico</span>;
      default: return <span className="text-slate-600 text-xs">Sin score</span>;
    }
  };

  if (estLoading || dataLoading) {
    return (
      <div className="text-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <span className="text-sm text-slate-400">Cargando datos de cohorte...</span>
        </div>
      </div>
    );
  }

  if (estError) {
    return (
      <div className="text-white min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">Error al cargar datos: {estError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          Dashboard Docente
        </h1>
        <p className="text-sm text-slate-500 font-sans mt-2">
          Vista global del comportamiento de tus alumnos en cursada.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-sans">Alumnos Activos</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-400/10">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-white">{estudiantesConScore.length}</div>
          <div className="text-xs text-slate-600 mt-2 font-sans">Total en tu materia</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-sans">En Riesgo sin Tutor</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-400/10">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-white">{sinTutorCount}</div>
          <div className="text-xs mt-2 font-sans">
            {sinTutorCount > 0
              ? <span className="text-amber-400 font-medium">Requieren asignación</span>
              : <span className="text-slate-600">Todos asignados</span>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-md">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-sans">Intervenciones Activas</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-teal-400/10">
              <BarChart2 className="w-4 h-4 text-teal-400" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-white">{intervActivas}</div>
          <div className="text-xs text-slate-600 mt-2 font-sans">Este mes</div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="bg-white/[0.04] rounded-2xl border border-white/[0.07] p-4 backdrop-blur-md flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-xs text-slate-500 font-sans font-medium uppercase tracking-wider">Filtros:</span>
        
        <CustomSelect
          value={filterAnio}
          onChange={setFilterAnio}
          options={[{ value: '', label: 'Todos los años' }, ...ANIO_OPCIONES]}
          placeholder="Todos los años"
        />

        <CustomSelect
          value={filterNivel}
          onChange={setFilterNivel}
          options={[
            { value: '', label: 'Todos los niveles' },
            { value: 'bajo', label: 'Bajo' },
            { value: 'medio', label: 'Medio' },
            { value: 'alto', label: 'Alto' },
            { value: 'critico', label: 'Crítico' },
          ]}
          placeholder="Todos los niveles"
        />

        {(filterAnio || filterNivel) && (
          <button
            onClick={() => { setFilterAnio(''); setFilterNivel(''); }}
            className="text-xs text-slate-500 hover:text-teal-400 transition-colors font-sans ml-auto"
          >
            Limpiar filtros
          </button>
        )}
      </motion.div>

      {/* Students table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        className="bg-white/[0.04] rounded-2xl border border-white/[0.07] backdrop-blur-md overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Alumno</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Legajo</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Año Ingreso</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((est, i) => (
                  <tr key={est.usuario_id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-slate-200 font-medium">{est.apellido}, {est.nombre}</td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-xs">{est.legajo || '—'}</td>
                    <td className="px-5 py-3 text-slate-400">{est.anio_ingreso || '—'}</td>
                    <td className="px-5 py-3">
                      {est.valor !== null ? (
                        <span className="font-mono text-xs bg-white/[0.04] px-2 py-1 rounded">{Math.round(est.valor)}/100</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">{formatRiskBadge(est.nivel_riesgo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600">
            <Users className="w-8 h-8 mb-2" />
            <span className="text-sm font-sans">
              {estudiantesConScore.length === 0
                ? 'No hay alumnos registrados para esta cohorte.'
                : 'No se encontraron alumnos con los filtros seleccionados.'}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
