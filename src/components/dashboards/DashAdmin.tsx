import React, { useEffect, useRef, useState } from 'react';
import { useScore } from '../../hooks/useScore';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertTriangle, LayoutDashboard, Upload, GraduationCap, VolumeX, MessageSquare, PieChart as PieChartIcon, ArrowUp, Users, Link as LinkIcon, Globe, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, animate } from 'framer-motion';
import { Button } from '../ui/moving-border';
import { supabase } from '../../lib/supabase';
import { useCareer } from '../../context/CareerContext';

function AnimatedNumber({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(0, value, {
        duration: 1,
        ease: "easeOut",
        onUpdate(v) {
          node.textContent = Math.round(v).toString();
        },
      });
      return () => controls.stop();
    }
  }, [value]);

  return <span ref={nodeRef}>{value}</span>;
}

interface MateriaRanking {
  materia_id: string;
  nombre: string;
  total_cursadas: number;
  total_desaprobadas: number;
}

interface AbandonoItem {
  name: string;
  abandono: number;
}

export const DashAdmin = () => {
  const navigate = useNavigate();
  const { carreraId, carreras } = useCareer();
  const { distribucion, loading } = useScore(undefined, carreraId || undefined);

  // ── Global state (cross-carrera) ──────────────────────────────
  const [totalGlobal, setTotalGlobal] = useState<number>(0);
  const [enRiesgoGlobal, setEnRiesgoGlobal] = useState<number>(0);
  const [intervencionesMes, setIntervencionesMes] = useState<number>(0);
  const [alumnosSinTutor, setAlumnosSinTutor] = useState<number>(0);

  // ── Per-career state ──────────────────────────────────────────
  const [materiasCriticas, setMateriasCriticas] = useState<AbandonoItem[]>([]);

  const [adminLoading, setAdminLoading] = useState(true);
  const [careerLoading, setCareerLoading] = useState(false);

  // ── Global data (runs once, no carrera dependency) ────────────
  useEffect(() => {
    const fetchGlobalData = async () => {
      setAdminLoading(true);
      try {
        // Total students in the system
        const { count: totalStudents } = await supabase
          .from('estudiantes')
          .select('id', { count: 'exact', head: true });
        setTotalGlobal(totalStudents ?? 0);

        // High/critical risk students (cross-carrera)
        const { data: scoresData } = await supabase
          .from('scores')
          .select('estudiante_id')
          .in('nivel_riesgo', ['alto', 'critico']);

        const highRiskIds = new Set(scoresData?.map(s => s.estudiante_id) ?? []);
        setEnRiesgoGlobal(highRiskIds.size);

        // Interventions this month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { count: intervCount } = await supabase
          .from('intervenciones')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonth);
        setIntervencionesMes(intervCount ?? 0);

        // High-risk students without tutor assigned
        if (highRiskIds.size > 0) {
          const { data: asignaciones } = await supabase
            .from('asignaciones_tutor')
            .select('estudiante_id')
            .eq('activa', true)
            .in('estudiante_id', Array.from(highRiskIds));

          const asignados = new Set(asignaciones?.map(a => a.estudiante_id) ?? []);
          const sinTutor = Array.from(highRiskIds).filter(id => !asignados.has(id));
          setAlumnosSinTutor(sinTutor.length);
        }
      } catch (err) {
        console.error('Error fetching global admin data:', err);
      } finally {
        setAdminLoading(false);
      }
    };

    fetchGlobalData();
  }, []);

  // ── Per-career data (re-fetches when carreraId changes) ───────
  useEffect(() => {
    if (!carreraId) {
      setMateriasCriticas([]);
      return;
    }

    const fetchCareerData = async () => {
      setCareerLoading(true);
      try {
        // Critical subjects: top N by fail rate FOR THIS CAREER
        // Step 1: get student IDs for this career
        const { data: estudiantes } = await supabase
          .from('estudiantes')
          .select('usuario_id')
          .eq('carrera_id', carreraId);

        const ids = (estudiantes ?? []).map((e: Record<string, unknown>) => e.usuario_id as string);
        if (ids.length === 0) {
          setMateriasCriticas([]);
          return;
        }

        // Step 2: fetch cursadas for those students with materia join
        const { data: cursadasData } = await supabase
          .from('cursadas')
          .select('materia_id, situacion, materias (id, nombre)')
          .in('estudiante_id', ids);

        if (cursadasData) {
          const materiaStats: Record<string, { nombre: string; total: number; desaprobadas: number }> = {};
          for (const c of cursadasData) {
            const matRaw = Array.isArray(c.materias) ? c.materias[0] : c.materias;
            const mat = matRaw as Record<string, unknown> | null;
            if (!mat) continue;
            const key = c.materia_id as string;
            if (!materiaStats[key]) {
              materiaStats[key] = { nombre: mat.nombre as string, total: 0, desaprobadas: 0 };
            }
            materiaStats[key].total++;
            if (c.situacion === 'desaprobo' || c.situacion === 'abandono') {
              materiaStats[key].desaprobadas++;
            }
          }
          const ranking: AbandonoItem[] = Object.values(materiaStats)
            .filter(m => m.total > 0)
            .map(m => ({
              name: m.nombre,
              abandono: Math.round((m.desaprobadas / m.total) * 100),
            }))
            .sort((a, b) => b.abandono - a.abandono)
            .slice(0, 5);
          setMateriasCriticas(ranking);
        }
      } catch (err) {
        console.error('Error fetching career data:', err);
      } finally {
        setCareerLoading(false);
      }
    };

    fetchCareerData();
  }, [carreraId]);

  if (loading || adminLoading) {
    return (
      <div className="text-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Cargando panel de administración...</span>
        </div>
      </div>
    );
  }

  // ── Derived data from career distribution ─────────────────────
  let totalEstudiantesCarrera = 0;
  let riskDistribution: { name: string; value: number; color: string }[] = [];
  let numEnRiesgoCarrera = 0;

  if (distribucion) {
    const bajo = Number(distribucion.bajo) || 0;
    const medio = Number(distribucion.medio) || 0;
    const alto = Number(distribucion.alto) || 0;
    const critico = Number(distribucion.critico) || 0;

    totalEstudiantesCarrera = bajo + medio + alto + critico;
    numEnRiesgoCarrera = alto + critico;

    riskDistribution = [
      { name: 'Verde (Bajo)', value: bajo, color: '#22C55E' },
      { name: 'Amarillo (Medio)', value: medio, color: '#FBBF24' },
      { name: 'Naranja (Alto)', value: alto, color: '#F97316' },
      { name: 'Rojo (Crítico)', value: critico, color: '#EF4444' },
    ].filter(d => d.value > 0);
  }

  const activeCarreraName = carreras.find(c => c.id === carreraId)?.nombre ?? null;

  // ── Global KPI cards ──────────────────────────────────────────
  const globalCards = [
    { label: 'Total en el Sistema', value: totalGlobal, icon: GraduationCap, color: 'text-blue-400', bgIcon: 'bg-blue-400/10', subtitle: 'Todos los alumnos' },
    { label: 'En Riesgo (Global)', value: enRiesgoGlobal, icon: AlertTriangle, color: 'text-red-400', bgIcon: 'bg-red-400/10', isRisk: true },
    { label: 'Intervenciones', value: intervencionesMes, icon: MessageSquare, color: 'text-teal-400', bgIcon: 'bg-teal-400/10', subtitle: 'Este mes' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Page header ──────────────────────────────────── */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <LayoutDashboard className="w-5 h-5 text-blue-400" />
            </div>
            Panel de Administración
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-2">
            Visión global de la cohorte e indicadores clave.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            onClick={() => navigate('/importar-alumnos')}
            borderRadius="0.5rem"
            duration={2500}
            containerClassName="h-10 w-auto text-white flex items-center"
            className="px-4 py-2 text-sm font-semibold text-white bg-[#0F1B2D]/90 flex items-center gap-2 whitespace-nowrap"
          >
            <Upload className="w-4 h-4 text-teal-400" /> Importar Alumnos
          </Button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          SECCIÓN 1 — VISTA GLOBAL
          ══════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-blue-400" />
          <h2 className="font-display text-sm font-semibold text-blue-400 uppercase tracking-wider">
            Vista Global
          </h2>
          <div className="flex-1 h-px bg-blue-400/20 ml-2" />
        </div>

        {/* Global KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {globalCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}
              className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-md hover:border-white/[0.12] transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-sans">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${card.bgIcon}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>

              <div className="font-display text-3xl font-bold text-white mb-2">
                <AnimatedNumber value={card.value} />
              </div>

              <div className="text-xs font-sans">
                {card.isRisk ? (
                  card.value > 0 ? (
                    <span className="text-red-400 flex items-center gap-1 font-medium"><ArrowUp className="w-3 h-3" /> Requieren intervención urgente</span>
                  ) : (
                    <span className="text-slate-600">Ninguno en riesgo alto</span>
                  )
                ) : (
                  <span className="text-slate-600">{card.subtitle}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Widget: Alumnos sin tutor asignado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.04] rounded-2xl border border-white/[0.07] p-6 backdrop-blur-md mt-4"
        >
          <h3 className="font-display text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Alumnos en Riesgo sin Tutor Asignado
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-4xl font-bold text-white mb-1">
                <AnimatedNumber value={alumnosSinTutor} />
              </div>
              <p className="text-xs text-slate-500 font-sans">
                {alumnosSinTutor > 0
                  ? 'Estudiantes en nivel alto o crítico sin seguimiento asignado'
                  : 'Todos los estudiantes en riesgo tienen tutor asignado'}
              </p>
            </div>
            {alumnosSinTutor > 0 && (
              <button
                onClick={() => navigate('/usuarios')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm font-semibold hover:bg-amber-500/20 transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                Asignar tutores
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEPARATOR
          ══════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ══════════════════════════════════════════════════════
          SECCIÓN 2 — POR CARRERA
          ══════════════════════════════════════════════════════ */}
      <section className="pb-28">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-teal-400" />
          <h2 className="font-display text-sm font-semibold text-teal-400 uppercase tracking-wider">
            Por Carrera{activeCarreraName ? `: ${activeCarreraName}` : ''}
          </h2>
          <div className="flex-1 h-px bg-teal-400/20 ml-2" />
        </div>

        {carreraId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ── Pie chart: Risk distribution ──────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="bg-white/[0.04] rounded-2xl border border-white/[0.07] p-6 backdrop-blur-md"
            >
              <h3 className="font-display text-base font-semibold text-white mb-1">Distribución de Riesgo</h3>
              <p className="text-xs text-slate-500 font-sans mb-4 hidden md:block">
                {totalEstudiantesCarrera} estudiantes en <span className="text-teal-400 font-medium">{activeCarreraName}</span>
              </p>
              <div className="h-48 md:h-64">
                {riskDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15,27,45,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px' }}
                        itemStyle={{ color: '#2dd4bf', fontWeight: 600, fontFamily: 'IBM Plex Sans', fontSize: '12px' }}
                        labelStyle={{ display: 'none' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <PieChartIcon className="w-8 h-8 text-slate-700 mb-2" />
                    <span className="text-slate-600 text-sm font-sans">Sin datos suficientes</span>
                  </div>
                )}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {riskDistribution.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name} <span className="text-slate-300 font-medium ml-0.5">{d.value}</span>
                    <span className="opacity-50">({Math.round((d.value / totalEstudiantesCarrera) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Bar chart: Critical subjects ───────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/[0.04] rounded-2xl border border-white/[0.07] p-6 backdrop-blur-md"
            >
              <h3 className="font-display text-base font-semibold text-white mb-4">
                Materias Críticas <span className="text-xs font-normal text-slate-500">(Tasa de Desaprobación %)</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans mb-4 hidden md:block">
                Top materias con mayor proporción de desaprobación y abandono.
              </p>
              <div className="mt-2 overflow-y-auto" style={{ maxHeight: materiasCriticas.length > 5 ? '320px' : '220px', minHeight: '180px' }}>
                {careerLoading ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-500 mt-2 font-sans">Cargando datos de carrera...</span>
                  </div>
                ) : materiasCriticas.length > 0 ? (
                  <ResponsiveContainer width="100%" height={Math.max(materiasCriticas.length * 40, 160)}>
                    <BarChart data={materiasCriticas} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" horizontal={false} vertical={true} />
                      <XAxis type="number" stroke="#475569" tick={{ fill: '#475569', fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: '#1E293B' }} tickLine={{ stroke: '#1E293B' }} />
                      <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#475569', fontSize: 10, fontFamily: "IBM Plex Sans", width: 120 }} axisLine={{ stroke: '#1E293B' }} tickLine={{ stroke: '#1E293B' }} tickFormatter={(name: string) => name.length > 30 ? name.slice(0, 28) + '…' : name} width={140} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        contentStyle={{ backgroundColor: 'rgba(15,27,45,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px' }}
                        labelStyle={{ color: '#e2e8f0', fontFamily: 'IBM Plex Sans', fontSize: '12px', marginBottom: '4px' }}
                        itemStyle={{ color: '#2dd4bf', fontWeight: 600, fontFamily: 'IBM Plex Sans', fontSize: '12px' }}
                        formatter={(value: number) => [`${value}%`, 'Desaprobación']}
                      />
                      <Bar dataKey="abandono" fill="url(#barGradient)" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <PieChartIcon className="w-8 h-8 text-slate-700 mb-2" />
                    <span className="text-slate-600 text-sm font-sans">Sin datos de cursadas disponibles</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          /* ── No career selected ──────────────────────────── */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/[0.03] rounded-2xl border border-dashed border-white/10 p-12 text-center"
          >
            <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 font-sans text-sm">
              Seleccioná una carrera para ver sus indicadores
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
};
