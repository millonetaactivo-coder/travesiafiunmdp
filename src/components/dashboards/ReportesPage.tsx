import { useState, useEffect, useCallback } from 'react';
import { useCareer } from '../../context/CareerContext';
import { useAuth } from '../../hooks/useAuth';
import { getRolUsuario } from '../../services/authService';
import {
  getReporteCohorte,
  getReporteMateria,
  getReportePeriodo,
  getReporteRiesgo,
  getRankingMaterias,
  type ReportType,
  type ReporteRow,
  type ReporteMateria,
} from '../../services/reportesService';
import { exportToCsv } from '../../lib/exportCsv';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown,
  BarChart2,
  Download,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Filter,
  BookOpen,
  Calendar,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { CustomSelect } from '../ui/CustomSelect';

/* ─── Constants ─── */

const REPORT_TYPES: { value: ReportType; label: string; icon: React.ReactNode }[] = [
  { value: 'cohorte', label: 'Por cohorte', icon: <Users className="w-4 h-4" /> },
  { value: 'materia', label: 'Por materia', icon: <BookOpen className="w-4 h-4" /> },
  { value: 'periodo', label: 'Por período', icon: <Calendar className="w-4 h-4" /> },
  { value: 'nivel_riesgo', label: 'Nivel de riesgo', icon: <ShieldAlert className="w-4 h-4" /> },
];

const COHORTE_OPTIONS = [
  { value: '', label: 'Todas las cohortes' },
  ...Array.from({ length: 7 }, (_, i) => 2020 + i).map((y) => ({
    value: String(y),
    label: String(y),
  })),
];

const PERIODO_ANIO_OPTIONS = [
  { value: '', label: 'Todos los años' },
  ...Array.from({ length: 7 }, (_, i) => 2020 + i).map((y) => ({
    value: String(y),
    label: String(y),
  })),
];

const CUATRIMESTRE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: '1', label: '1° Cuatrimestre' },
  { value: '2', label: '2° Cuatrimestre' },
];

const RIESGO_OPTIONS = [
  { value: '', label: 'Todos los niveles' },
  { value: 'bajo', label: 'Bajo', color: '#34d399' },
  { value: 'medio', label: 'Medio', color: '#fbbf24' },
  { value: 'alto', label: 'Alto', color: '#fb923c' },
  { value: 'critico', label: 'Crítico', color: '#f87171' },
];

/* ─── Sub-components ─── */

const RiskBadge: React.FC<{ nivel?: string | null }> = ({ nivel }) => {
  if (!nivel) return <span className="text-xs text-slate-600 font-sans">—</span>;
  const colors: Record<string, string> = {
    bajo: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    medio: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    alto: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    critico: 'bg-red-500/15 text-red-400 border-red-500/20',
  };
  return (
    <span className={`text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border capitalize ${colors[nivel] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/20'}`}>
      {nivel}
    </span>
  );
};

const ScoreBadge: React.FC<{ score?: number | null }> = ({ score }) => {
  if (score === null || score === undefined) return <span className="text-xs text-slate-600 font-sans">—</span>;
  return (
    <span className="text-xs font-sans font-medium tabular-nums text-slate-300">
      {score.toFixed(1)}
    </span>
  );
};

/* ─── Main component ─── */

export const ReportesPage = () => {
  const { carreraId: careerCarreraId } = useCareer();
  const { usuario, rol } = useAuth();

  // Docentes: resolve carreraId from usuario_roles instead of CareerContext,
  // which auto-selects the first alphabetical career (wrong for docentes).
  const [docenteCarreraId, setDocenteCarreraId] = useState<string | null>(null);
  useEffect(() => {
    if (usuario?.id && rol === 'docente') {
      getRolUsuario(usuario.id).then(({ data }) => {
        if (data?.carrera_id) setDocenteCarreraId(data.carrera_id);
      });
    }
  }, [usuario?.id, rol]);

  // Fall back to CareerContext when the docente has no explicit carrera_id in usuario_roles
  const carreraId = rol === 'docente' ? (docenteCarreraId ?? careerCarreraId) : careerCarreraId;

  const [reportType, setReportType] = useState<ReportType>('cohorte');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anonymize, setAnonymize] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [cohorte, setCohorte] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [anio, setAnio] = useState('');
  const [cuatrimestre, setCuatrimestre] = useState('');
  const [nivelRiesgo, setNivelRiesgo] = useState('');

  // Data
  const [rows, setRows] = useState<ReporteRow[]>([]);
  const [materiaRows, setMateriaRows] = useState<ReporteMateria[]>([]);

  // Materia options for filter (fetched on demand)
  const [materiaOptions, setMateriaOptions] = useState<{ value: string; label: string }[]>([]);

  const fetchMaterias = useCallback(async () => {
    if (!carreraId) return;
    const { supabase } = await import('../../lib/supabase');
    // Fetch materias through cursadas that belong to students in this career
    const { data: estudiantes } = await supabase
      .from('estudiantes')
      .select('usuario_id')
      .eq('carrera_id', carreraId);

    const ids = (estudiantes ?? []).map((e: Record<string, unknown>) => e.usuario_id as string);
    if (ids.length === 0) return;

    const { data: cursadas } = await supabase
      .from('cursadas')
      .select('materia_id, materias (id, nombre, codigo)')
      .in('estudiante_id', ids);

    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    for (const c of (cursadas ?? []) as Record<string, unknown>[]) {
      const mat = c.materias as Record<string, unknown> | null;
      const id = c.materia_id as string;
      if (id && !seen.has(id)) {
        seen.add(id);
        options.push({ value: id, label: (mat?.nombre as string) ?? id });
      }
    }
    setMateriaOptions(options);
  }, [carreraId]);

  useEffect(() => {
    if (reportType === 'materia') {
      fetchMaterias();
    }
  }, [reportType, fetchMaterias]);

  const fetchReport = useCallback(async () => {
    if (!carreraId) return;

    setLoading(true);
    setError(null);
    setRows([]);
    setMateriaRows([]);

    try {
      const filtros = {
        carreraId,
        cohorte: cohorte ? Number(cohorte) : undefined,
        materiaId: materiaId || undefined,
        anio: anio ? Number(anio) : undefined,
        cuatrimestre: cuatrimestre ? Number(cuatrimestre) : undefined,
        nivelRiesgo: nivelRiesgo || undefined,
      };

      switch (reportType) {
        case 'cohorte': {
          const result = await getReporteCohorte(filtros);
          if (result.error) throw new Error(result.error);
          setRows(result.data);
          break;
        }
        case 'materia': {
          const result = await getReporteMateria(filtros);
          if (result.error) throw new Error(result.error);
          setMateriaRows(result.data);
          break;
        }
        case 'periodo': {
          const result = await getReportePeriodo(filtros);
          if (result.error) throw new Error(result.error);
          setRows(result.data);
          break;
        }
        case 'nivel_riesgo': {
          const result = await getReporteRiesgo(filtros);
          if (result.error) throw new Error(result.error);
          setRows(result.data);
          break;
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error generando reporte';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [carreraId, reportType, cohorte, materiaId, anio, cuatrimestre, nivelRiesgo]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCsv = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `reporte_${reportType}_${timestamp}`;

    if (reportType === 'materia') {
      // Convert ReporteMateria to flat rows for CSV
      const flatRows = materiaRows.map((m) => ({
        materia: m.materia_nombre,
        codigo: m.materia_codigo,
        total_estudiantes: m.total_estudiantes,
        promedio_nota: m.promedio_nota?.toFixed(1) ?? '',
        aprobados: m.aprobados,
        desaprobados: m.desaprobados,
        pendientes: m.pendientes,
      }));
      exportToCsv(flatRows as object[], filename, { anonymize });
    } else {
      exportToCsv(rows as object[], filename, { anonymize });
    }
  };

  const renderFilters = () => {
    switch (reportType) {
      case 'cohorte':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Cohorte (año ingreso)</label>
              <CustomSelect value={cohorte} onChange={setCohorte} options={COHORTE_OPTIONS} placeholder="Todas" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Nivel de riesgo</label>
              <CustomSelect value={nivelRiesgo} onChange={setNivelRiesgo} options={RIESGO_OPTIONS} placeholder="Todos" />
            </div>
          </div>
        );
      case 'materia':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Materia</label>
              <CustomSelect
                value={materiaId}
                onChange={setMateriaId}
                options={[{ value: '', label: 'Todas las materias' }, ...materiaOptions]}
                placeholder="Todas"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Año</label>
              <CustomSelect value={anio} onChange={setAnio} options={PERIODO_ANIO_OPTIONS} placeholder="Todos" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Cuatrimestre</label>
              <CustomSelect value={cuatrimestre} onChange={setCuatrimestre} options={CUATRIMESTRE_OPTIONS} placeholder="Todos" />
            </div>
          </div>
        );
      case 'periodo':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Año</label>
              <CustomSelect value={anio} onChange={setAnio} options={PERIODO_ANIO_OPTIONS} placeholder="Todos" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Cuatrimestre</label>
              <CustomSelect value={cuatrimestre} onChange={setCuatrimestre} options={CUATRIMESTRE_OPTIONS} placeholder="Todos" />
            </div>
          </div>
        );
      case 'nivel_riesgo':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Nivel de riesgo</label>
              <CustomSelect value={nivelRiesgo} onChange={setNivelRiesgo} options={RIESGO_OPTIONS} placeholder="Todos" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Cohorte</label>
              <CustomSelect value={cohorte} onChange={setCohorte} options={COHORTE_OPTIONS} placeholder="Todas" />
            </div>
          </div>
        );
    }
  };

  const renderTable = () => {
    if (reportType === 'materia') {
      if (materiaRows.length === 0) {
        return (
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-12 backdrop-blur-md text-center">
            <BarChart2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-sans text-sm">No hay datos de materias para esta carrera.</p>
          </div>
        );
      }

      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Materia</th>
                <th className="text-left py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Código</th>
                <th className="text-right py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Estudiantes</th>
                <th className="text-right py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Promedio</th>
                <th className="text-right py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Aprobados</th>
                <th className="text-right py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Desaprobados</th>
                <th className="text-right py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Pendientes</th>
              </tr>
            </thead>
            <tbody>
              {materiaRows.map((m) => (
                <tr key={m.materia_id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-slate-200">{m.materia_nombre}</td>
                  <td className="py-3 px-4 text-slate-400 text-xs">{m.materia_codigo}</td>
                  <td className="py-3 px-4 text-right text-slate-300 tabular-nums">{m.total_estudiantes}</td>
                  <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                    {m.promedio_nota !== null ? m.promedio_nota.toFixed(1) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 tabular-nums">{m.aprobados}</td>
                  <td className="py-3 px-4 text-right text-red-400 tabular-nums">{m.desaprobados}</td>
                  <td className="py-3 px-4 text-right text-amber-400 tabular-nums">{m.pendientes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Student-based report table
    if (rows.length === 0) {
      return (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-12 backdrop-blur-md text-center">
          <BarChart2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-sans text-sm">No hay datos para los filtros seleccionados.</p>
        </div>
      );
    }

    const showStudentCols = reportType !== 'periodo';

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {showStudentCols && !anonymize && (
                <>
                  <th className="text-left py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Nombre</th>
                  <th className="text-left py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Legajo</th>
                </>
              )}
              <th className="text-left py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Riesgo</th>
              <th className="text-right py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Puntaje</th>
              {reportType === 'periodo' && (
                <>
                  <th className="text-left py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Materia</th>
                  <th className="text-right py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Nota</th>
                  <th className="text-left py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Situación</th>
                  <th className="text-left py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Período</th>
                </>
              )}
              {reportType !== 'periodo' && (
                <th className="text-left py-3 px-4 text-[10px] text-slate-500 uppercase tracking-wider font-medium">Tutor</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={`${row.estudiante_id}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
              >
                {showStudentCols && !anonymize && (
                  <>
                    <td className="py-3 px-4 text-slate-200">{row.apellido}, {row.nombre}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{row.legajo}</td>
                  </>
                )}
                <td className="py-3 px-4"><RiskBadge nivel={row.nivel_riesgo} /></td>
                <td className="py-3 px-4 text-right"><ScoreBadge score={row.puntaje} /></td>
                {reportType === 'periodo' && (
                  <>
                    <td className="py-3 px-4 text-slate-300">{row.materia}</td>
                    <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                      {row.nota !== null && row.nota !== undefined ? row.nota : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs capitalize">{row.situacion ?? '—'}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {row.cuatrimestre && row.anio ? `${row.cuatrimestre}° ${row.anio}` : '—'}
                    </td>
                  </>
                )}
                {reportType !== 'periodo' && (
                  <td className="py-3 px-4 text-slate-400 text-xs">{row.tutor ?? '—'}</td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <TrendingDown className="w-5 h-5 text-blue-400" />
            </div>
            Reportes
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-2">
            Análisis y reportes de rendimiento académico.
          </p>
        </div>
        {rows.length > 0 || materiaRows.length > 0 ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAnonymize(!anonymize)}
              className="flex items-center gap-1.5 text-xs font-sans text-slate-400 hover:text-white transition-colors bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2"
              title={anonymize ? 'Mostrar nombre y legajo' : 'Ocultar nombre y legajo'}
            >
              {anonymize ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {anonymize ? 'Anonimizado' : 'Anonimizar'}
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 text-xs font-sans text-white bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 rounded-lg px-3 py-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          </div>
        ) : null}
      </header>

      {/* Report type selector */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-md"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {REPORT_TYPES.map((rt) => (
            <button
              key={rt.value}
              onClick={() => setReportType(rt.value)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-sans font-medium transition-all duration-200 ${
                reportType === rt.value
                  ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                  : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              {rt.icon}
              {rt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-md"
      >
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-xs font-sans text-slate-400 hover:text-white transition-colors mb-3"
        >
          <Filter className="w-3.5 h-3.5" />
          Filtros del reporte
        </button>
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-white/[0.05]">
                {renderFilters()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 mt-3">Generando reporte...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 backdrop-blur-md text-center"
        >
          <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm font-sans">{error}</p>
        </motion.div>
      )}

      {/* Results table */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl backdrop-blur-md overflow-hidden"
        >
          {renderTable()}
        </motion.div>
      )}

      {/* Result count */}
      {!loading && !error && (rows.length > 0 || materiaRows.length > 0) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-slate-600 font-sans text-center"
        >
          {reportType === 'materia'
            ? `${materiaRows.length} materia${materiaRows.length !== 1 ? 's' : ''}`
            : `${rows.length} resultado${rows.length !== 1 ? 's' : ''}`}
          {anonymize ? ' · Anonimizado' : ''}
        </motion.p>
      )}
    </div>
  );
};
