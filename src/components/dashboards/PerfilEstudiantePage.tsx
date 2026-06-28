import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BookOpen, ClipboardList, MessageSquare, ArrowLeft, Loader2, AlertCircle, Calendar, Award, TrendingDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePerfil } from '../../hooks/usePerfil';
import { useScore } from '../../hooks/useScore';
import { getPerfilEstudiante, getEntrevistasEstudiante, getSesionesEncuestaEstudiante, getCursadasEstudiante, getFinalesEstudiante, getCarrerasMap } from '../../services/estudiantesService';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { InterviewForm } from '../ui/InterviewForm';
import type { Entrevista } from '../../hooks/useEntrevistas';

// ─── Types ──────────────────────────────────────────────────────────────

interface PerfilData {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  legajo: string;
  carrera_id: string;
  carrera_nombre?: string;
  anio_ingreso: number;
  nivel_riesgo?: string;
  score_valor?: number;
}

interface CursadaRow {
  id: string;
  cuatrimestre: number;
  anio: number;
  situacion: string;
  nota_cursada: number | null;
  numero_cursada: number;
  materia_nombre: string;
  materia_codigo: string;
}

interface FinalRow {
  id: string;
  nota: number | null;
  resultado: string;
  fecha_intento: string | null;
  numero_intento: number;
  materia_nombre: string;
  materia_codigo: string;
}

interface SesionEncuestaRow {
  id: string;
  estado: string;
  cuatrimestre: number;
  anio: number;
  iniciada_at: string | null;
  completada_at: string | null;
  encuesta_titulo: string;
  encuesta_tipo: string;
}

// ─── Tab Components ─────────────────────────────────────────────────────

const ProfileDatosTab: React.FC<{ perfil: PerfilData | null; loading: boolean }> = ({ perfil, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-8 backdrop-blur-md text-center">
        <AlertCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
        <p className="text-slate-500 text-sm font-sans">No se pudieron cargar los datos personales.</p>
      </div>
    );
  }

  const fields = [
    { label: 'Nombre', value: `${perfil.nombre} ${perfil.apellido}` },
    { label: 'Legajo', value: perfil.legajo || '—' },
    { label: 'Email', value: perfil.email || '—' },
    { label: 'Carrera', value: perfil.carrera_nombre || '—' },
    { label: 'Año de ingreso', value: perfil.anio_ingreso || '—' },
  ];

  return (
    <div className="space-y-3">
      {fields.map((f) => (
        <div key={f.label} className="flex items-center justify-between py-3 px-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
          <span className="text-xs text-slate-500 font-sans uppercase tracking-wider">{f.label}</span>
          <span className="text-sm text-slate-200 font-sans font-medium">{f.value}</span>
        </div>
      ))}
    </div>
  );
};

const ProfileNotasTab: React.FC<{ estudianteId: string }> = ({ estudianteId }) => {
  const [cursadas, setCursadas] = useState<CursadaRow[]>([]);
  const [finales, setFinales] = useState<FinalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [curRes, finRes] = await Promise.all([
        getCursadasEstudiante(estudianteId),
        getFinalesEstudiante(estudianteId),
      ]);
      if (cancelled) return;
      setCursadas(
        (curRes.data ?? []).map((r: Record<string, unknown>) => {
          const m = r.materias as Record<string, unknown> | null;
          return {
            id: r.id as string,
            cuatrimestre: r.cuatrimestre as number,
            anio: r.anio as number,
            situacion: r.situacion as string,
            nota_cursada: r.nota_cursada as number | null,
            numero_cursada: r.numero_cursada as number,
            materia_nombre: (m?.nombre as string) ?? '',
            materia_codigo: (m?.codigo as string) ?? '',
          };
        })
      );
      setFinales(
        (finRes.data ?? []).map((r: Record<string, unknown>) => {
          const m = r.materias as Record<string, unknown> | null;
          return {
            id: r.id as string,
            nota: r.nota as number | null,
            resultado: r.resultado as string,
            fecha_intento: r.fecha_intento as string | null,
            numero_intento: r.numero_intento as number,
            materia_nombre: (m?.nombre as string) ?? '',
            materia_codigo: (m?.codigo as string) ?? '',
          };
        })
      );
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [estudianteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
      </div>
    );
  }

  const situacionColor: Record<string, string> = {
    promovio: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    habilito: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    desaprobo: 'bg-red-500/15 text-red-400 border-red-500/20',
    abandono: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  };

  const resultadoColor: Record<string, string> = {
    aprobado: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    desaprobado: 'bg-red-500/15 text-red-400 border-red-500/20',
    ausente: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Cursadas */}
      <div>
        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 font-sans flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5" />
          Cursadas ({cursadas.length})
        </h4>
        {cursadas.length === 0 ? (
          <EmptyState message="Sin notas registradas" />
        ) : (
          <div className="space-y-1.5">
            {cursadas.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2.5 px-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-sans truncate">{c.materia_nombre}</p>
                  <p className="text-[11px] text-slate-500 font-sans">{c.materia_codigo} · {c.cuatrimestre}°C {c.anio} · Intento {c.numero_cursada}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {c.nota_cursada != null && (
                    <span className="text-sm font-mono font-semibold text-slate-300">{c.nota_cursada}</span>
                  )}
                  <span className={cn('text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border', situacionColor[c.situacion] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/20')}>
                    {c.situacion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Finales */}
      <div>
        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 font-sans flex items-center gap-2">
          <Award className="w-3.5 h-3.5" />
          Finales ({finales.length})
        </h4>
        {finales.length === 0 ? (
          <EmptyState message="Sin finales rendidos" />
        ) : (
          <div className="space-y-1.5">
            {finales.map((f) => (
              <div key={f.id} className="flex items-center justify-between py-2.5 px-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-sans truncate">{f.materia_nombre}</p>
                  <p className="text-[11px] text-slate-500 font-sans">{f.materia_codigo} · Intento {f.numero_intento}{f.fecha_intento ? ` · ${f.fecha_intento}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {f.nota != null && (
                    <span className="text-sm font-mono font-semibold text-slate-300">{f.nota}</span>
                  )}
                  <span className={cn('text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border', resultadoColor[f.resultado] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/20')}>
                    {f.resultado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileEncuestasTab: React.FC<{ estudianteId: string }> = ({ estudianteId }) => {
  const [sesiones, setSesiones] = useState<SesionEncuestaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data } = await getSesionesEncuestaEstudiante(estudianteId);
      if (cancelled) return;
      setSesiones(
        (data ?? []).map((r: Record<string, unknown>) => {
          const enc = r.encuestas as Record<string, unknown> | null;
          return {
            id: r.id as string,
            estado: r.estado as string,
            cuatrimestre: r.cuatrimestre as number,
            anio: r.anio as number,
            iniciada_at: r.iniciada_at as string | null,
            completada_at: r.completada_at as string | null,
            encuesta_titulo: (enc?.titulo as string) ?? '',
            encuesta_tipo: (enc?.tipo as string) ?? '',
          };
        })
      );
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [estudianteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
      </div>
    );
  }

  if (sesiones.length === 0) {
    return <EmptyState message="No completó encuestas" />;
  }

  const estadoColor: Record<string, string> = {
    completada: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    en_progreso: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="space-y-1.5">
      {sesiones.map((s) => (
        <div key={s.id} className="flex items-center justify-between py-2.5 px-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 font-sans truncate">{s.encuesta_titulo || s.encuesta_tipo}</p>
            <p className="text-[11px] text-slate-500 font-sans">{s.cuatrimestre}°C {s.anio}{s.completada_at ? ` · Completada ${s.completada_at.slice(0, 10)}` : ''}</p>
          </div>
          <span className={cn('text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border shrink-0 ml-3', estadoColor[s.estado] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/20')}>
            {s.estado}
          </span>
        </div>
      ))}
    </div>
  );
};

const ProfileEntrevistasTab: React.FC<{
  estudianteId: string;
  userId: string;
  userRole: string;
  onRefresh: () => void;
}> = ({ estudianteId, userId, userRole, onRefresh }) => {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchEntrevistas = useCallback(async () => {
    setLoading(true);
    const { data } = await getEntrevistasEstudiante(estudianteId);
    const mapped: Entrevista[] = (data ?? []).map((row: Record<string, unknown>) => {
      const u = row.usuarios as Record<string, unknown> | null;
      const ent = row.entrevistas as Record<string, unknown> | null;
      return {
        id: row.id as string,
        tipo: (row.tipo as string) || '',
        modalidad: (row.modalidad as string) || '',
        fecha_realizada: (row.fecha_realizada as string) || '',
        estado: (row.estado as string) || 'realizada',
        motivo: (row.motivo as string) || '',
        resumen: (row.resumen as string) || '',
        estudiante_id: (row.estudiante_id as string) || '',
        estudiante_nombre: (u?.nombre as string) || '',
        estudiante_apellido: (u?.apellido as string) || '',
        entrevista_estado: (ent?.estado_alumno_percibido as string) || undefined,
        factores_riesgo: (ent?.factores_riesgo as string[]) || undefined,
        seguimiento_requerido: (ent?.seguimiento_requerido as boolean) || undefined,
      };
    });
    setEntrevistas(mapped);
    setLoading(false);
  }, [estudianteId]);

  useEffect(() => {
    fetchEntrevistas();
  }, [fetchEntrevistas]);

  const handleCreateInterview = async (payload: Parameters<typeof useAuth extends () => { rol: string | null } ? never : never>[0] & Record<string, unknown>) => {
    const { modalidad, fecha_realizada, motivo, resumen, estado_alumno_percibido, factores_riesgo, seguimiento_requerido, notas_adicionales } = payload as {
      modalidad: 'presencial' | 'virtual' | 'telefonica';
      fecha_realizada: string;
      motivo: string;
      resumen: string;
      estado_alumno_percibido: 'bien' | 'regular' | 'en_riesgo' | 'critico';
      factores_riesgo: string[];
      seguimiento_requerido: boolean;
      notas_adicionales?: string;
    };

    const isFuture = new Date(fecha_realizada) > new Date();
    const estado = isFuture ? 'planificada' : 'realizada';

    const { data: intervencion, error: interError } = await supabase
      .from('intervenciones')
      .insert({
        estudiante_id: estudianteId,
        tutor_id: userId,
        tipo: 'entrevista',
        modalidad,
        fecha_realizada,
        motivo,
        resumen,
        estado,
      })
      .select('id')
      .single();

    if (interError) throw interError;

    const { error: entError } = await supabase
      .from('entrevistas')
      .insert({
        intervencion_id: intervencion.id,
        motivo_entrevista: motivo,
        estado_alumno_percibido,
        factores_riesgo,
        acciones_acordadas: resumen,
        seguimiento_requerido,
        notas_adicionales,
      });

    if (entError) throw entError;

    await fetchEntrevistas();
    onRefresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
      </div>
    );
  }

  const canCreate = userRole === 'admin' || userRole === 'tutor' || userRole === 'asesor_par';

  return (
    <>
      <div className="space-y-1.5">
        {canCreate && (
          <div className="flex justify-end mb-3">
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1.5 text-xs font-sans font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              + Nueva Entrevista
            </button>
          </div>
        )}

        {entrevistas.length === 0 ? (
          <EmptyState message="Sin entrevistas" />
        ) : (
          entrevistas.map((e) => (
            <div key={e.id} className="py-2.5 px-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-slate-200 font-sans">{e.motivo || e.tipo}</p>
                <span className="text-[10px] text-slate-500 font-sans">{e.fecha_realizada?.slice(0, 10)}</span>
              </div>
              {e.resumen && <p className="text-xs text-slate-400 font-sans line-clamp-2">{e.resumen}</p>}
              <div className="flex items-center gap-2 mt-1.5">
                {e.entrevista_estado && (
                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400">{e.entrevista_estado}</span>
                )}
                {e.factores_riesgo && e.factores_riesgo.length > 0 && (
                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{e.factores_riesgo.length} factores</span>
                )}
                {e.seguimiento_requerido && (
                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">Seguimiento</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {canCreate && (
        <InterviewForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={fetchEntrevistas}
          estudiantes={[{ id: estudianteId, nombre: '', apellido: '' }]}
          estudianteIdPreseleccionado={estudianteId}
          tutorId={userId}
          onSubmit={handleCreateInterview as never}
        />
      )}
    </>
  );
};

// ─── Shared Components ──────────────────────────────────────────────────

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-8 backdrop-blur-md text-center">
    <p className="text-slate-500 text-sm font-sans">{message}</p>
  </div>
);

const RiesgoBadge: React.FC<{ nivel?: string }> = ({ nivel }) => {
  if (!nivel) return <span className="text-xs text-slate-600 font-sans">—</span>;

  const colors: Record<string, string> = {
    bajo: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    medio: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    alto: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    critico: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  return (
    <span className={cn('text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border capitalize', colors[nivel] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/20')}>
      {nivel}
    </span>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────

const TABS = [
  { key: 'datos', label: 'Datos', icon: User },
  { key: 'notas', label: 'Notas', icon: BookOpen },
  { key: 'encuestas', label: 'Encuestas', icon: ClipboardList },
  { key: 'entrevistas', label: 'Entrevistas', icon: MessageSquare },
] as const;

type TabKey = typeof TABS[number]['key'];

export const PerfilEstudiantePage: React.FC = () => {
  const { estudianteId } = useParams<{ estudianteId: string }>();
  const navigate = useNavigate();
  const { usuario, rol } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('datos');
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [perfilLoading, setPerfilLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetId = estudianteId ?? usuario?.id ?? '';
  const isSelf = usuario?.id === targetId;

  // Role gate
  useEffect(() => {
    if (!targetId || !rol) return;
    if (rol === 'estudiante' && !isSelf) {
      navigate('/dashboard', { replace: true });
      return;
    }
    // Tutor/asesor_par can only view assigned students
    if ((rol === 'tutor' || rol === 'asesor_par') && !isSelf && usuario?.id) {
      let cancelled = false;
      supabase
        .from('asignaciones_tutor')
        .select('id')
        .eq('tutor_id', usuario.id)
        .eq('estudiante_id', targetId)
        .eq('activa', true)
        .limit(1)
        .then(({ data }) => {
          if (!cancelled && (!data || data.length === 0)) {
            navigate('/dashboard', { replace: true });
          }
        });
      return () => { cancelled = true; };
    }
  }, [rol, isSelf, targetId, navigate, usuario?.id]);

  // Fetch perfil
  useEffect(() => {
    if (!targetId) return;
    let cancelled = false;

    async function load() {
      setPerfilLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await getPerfilEstudiante(targetId);
        if (cancelled) return;
        if (fetchError) throw fetchError;

        const rawEstudiantes = data?.estudiantes as unknown;
        const e = (Array.isArray(rawEstudiantes) ? rawEstudiantes[0] : rawEstudiantes) as Record<string, unknown> | null;
        const carreraId = (e?.carrera_id as string) ?? '';

        let carreraNombre = '';
        if (carreraId) {
          const map = await getCarrerasMap();
          carreraNombre = map.get(carreraId) ?? '';
        }

        // Get latest score
        const { data: scoreData } = await supabase
          .from('scores')
          .select('valor, nivel_riesgo')
          .eq('estudiante_id', targetId)
          .order('calculado_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setPerfil({
          id: data.id,
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          legajo: data.legajo,
          carrera_id: carreraId,
          carrera_nombre: carreraNombre,
          anio_ingreso: (e?.anio_ingreso as number) ?? 0,
          nivel_riesgo: scoreData?.nivel_riesgo as string | undefined,
          score_valor: scoreData?.valor as number | undefined,
        });
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error loading profile');
        }
      } finally {
        if (!cancelled) setPerfilLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [targetId]);

  const refreshPerfil = useCallback(async () => {
    if (!targetId) return;
    try {
      const { data } = await getPerfilEstudiante(targetId);
      const rawEstudiantes = data?.estudiantes as unknown;
      const e = (Array.isArray(rawEstudiantes) ? rawEstudiantes[0] : rawEstudiantes) as Record<string, unknown> | null;
      const carreraId = (e?.carrera_id as string) ?? '';
      let carreraNombre = '';
      if (carreraId) {
        const map = await getCarrerasMap();
        carreraNombre = map.get(carreraId) ?? '';
      }
      const { data: scoreData } = await supabase
        .from('scores')
        .select('valor, nivel_riesgo')
        .eq('estudiante_id', targetId)
        .order('calculado_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setPerfil({
        id: data.id,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        legajo: data.legajo,
        carrera_id: carreraId,
        carrera_nombre: carreraNombre,
        anio_ingreso: (e?.anio_ingreso as number) ?? 0,
        nivel_riesgo: scoreData?.nivel_riesgo as string | undefined,
        score_valor: scoreData?.valor as number | undefined,
      });
    } catch {
      // silent
    }
  }, [targetId]);

  if (perfilLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 backdrop-blur-md text-center">
          <p className="text-red-400 text-sm font-sans">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 backdrop-blur-md"
      >
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-400/10 text-blue-400 font-display text-lg font-bold shrink-0">
            {perfil?.nombre?.[0] || '?'}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-semibold text-white tracking-tight">
              {perfil?.nombre} {perfil?.apellido}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-slate-500 font-sans">Legajo: {perfil?.legajo || '—'}</span>
              {perfil?.carrera_nombre && (
                <span className="text-xs text-slate-500 font-sans">{perfil.carrera_nombre}</span>
              )}
              <RiesgoBadge nivel={perfil?.nivel_riesgo} />
              {perfil?.score_valor != null && (
                <span className="text-xs font-mono text-slate-400">Score: {perfil.score_valor}</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white/[0.04] border border-white/[0.07] rounded-2xl backdrop-blur-md overflow-hidden"
      >
        <div className="flex border-b border-white/[0.06]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-sans font-medium transition-all duration-200 relative',
                  isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="profile-tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-400 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'datos' && <ProfileDatosTab perfil={perfil} loading={perfilLoading} />}
              {activeTab === 'notas' && <ProfileNotasTab estudianteId={targetId} />}
              {activeTab === 'encuestas' && <ProfileEncuestasTab estudianteId={targetId} />}
              {activeTab === 'entrevistas' && (
                <ProfileEntrevistasTab
                  estudianteId={targetId}
                  userId={usuario?.id ?? ''}
                  userRole={rol ?? ''}
                  onRefresh={refreshPerfil}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
