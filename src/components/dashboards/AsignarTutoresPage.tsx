import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCareer } from '../../context/CareerContext';
import {
  getEstudiantesFiltrados,
  type EstudianteRow,
  type StudentFilters,
} from '../../services/estudiantesService';
import {
  getTutores,
  getAsignaciones,
  assignTutor,
  batchAssignTutor,
  unassignTutor,
  type TutorInfo,
  type AsignacionConEstudiante,
  type RolTutor,
} from '../../services/asignacionesService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  Filter,
  X,
} from 'lucide-react';
import { CustomSelect } from '../ui/CustomSelect';

/* ─── Constants ─── */

const RIESGO_OPTIONS = [
  { value: '', label: 'Todos los niveles' },
  { value: 'bajo', label: 'Bajo', color: '#34d399' },
  { value: 'medio', label: 'Medio', color: '#fbbf24' },
  { value: 'alto', label: 'Alto', color: '#fb923c' },
  { value: 'critico', label: 'Crítico', color: '#f87171' },
];

const TUTOR_FILTER_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'con', label: 'Con tutor' },
  { value: 'sin', label: 'Sin tutor' },
];

const ANIO_OPTIONS = [
  { value: '', label: 'Todos los años' },
  ...Array.from({ length: 7 }, (_, i) => 2020 + i).map((y) => ({
    value: String(y),
    label: String(y),
  })),
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

/* ─── Toast helper ─── */

function showToast(message: string, type: 'success' | 'error' = 'success') {
  const el = document.createElement('div');
  el.className = `fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl backdrop-blur-md border text-sm font-sans shadow-lg transition-all duration-300 ${
    type === 'success'
      ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-300'
      : 'bg-red-500/15 border-red-500/20 text-red-300'
  }`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/* ─── Main component ─── */

export const AsignarTutoresPage = () => {
  const { carreraId } = useCareer();

  // Data
  const [estudiantes, setEstudiantes] = useState<EstudianteRow[]>([]);
  const [tutores, setTutores] = useState<TutorInfo[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionConEstudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRiesgo, setFilterRiesgo] = useState('');
  const [filterAnio, setFilterAnio] = useState('');
  const [filterTutor, setFilterTutor] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchTutorId, setBatchTutorId] = useState('');

  // Individual assignment dropdown
  // Single open instance. Position is computed from the clicked button's rect
  // in the onClick handler (no refs), so multiple trigger buttons per student
  // (desktop + mobile) cannot collide. Outside-click dismissal uses data
  // attributes so no ref is needed there either.
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  const closeDropdown = () => { setDropdownOpen(null); setDropdownPos(null); };

  const toggleDropdown = (estId: string, btn: HTMLButtonElement) => {
    if (dropdownOpen === estId) { closeDropdown(); return; }
    const rect = btn.getBoundingClientRect();
    const left = Math.min(rect.left, window.innerWidth - 220);
    setDropdownPos({ top: rect.bottom + 4, left });
    setDropdownOpen(estId);
  };

  // Close on outside click / Escape — driven by data attributes:
  //   data-tutor-trigger  → any button that opens the dropdown
  //   data-tutor-dropdown → the portal list itself
  useEffect(() => {
    if (!dropdownOpen) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-tutor-dropdown]') && !t.closest('[data-tutor-trigger]')) {
        closeDropdown();
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDropdown(); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [dropdownOpen]);

  // Assignment map: estudiante_id -> tutor info
  const [asignacionMap, setAsignacionMap] = useState<Map<string, { tutor_id: string; tutor_nombre: string }>>(new Map());

  const fetchData = useCallback(async () => {
    if (!carreraId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch students
      const filters: StudentFilters = {
        sortBy: 'apellido',
        sortDir: 'asc',
        nivelRiesgo: (filterRiesgo as StudentFilters['nivelRiesgo']) || undefined,
        anioIngreso: filterAnio ? Number(filterAnio) : undefined,
        hasTutor: filterTutor === 'con' ? true : filterTutor === 'sin' ? false : undefined,
      };

      const [estResult, tutoresResult, asignResult] = await Promise.all([
        getEstudiantesFiltrados(carreraId, filters),
        getTutores(),
        getAsignaciones(),
      ]);

      if (estResult.error) throw new Error(estResult.error);
      if (tutoresResult.error) throw new Error(tutoresResult.error);
      if (asignResult.error) throw new Error(asignResult.error);

      setEstudiantes(estResult.data);
      setTutores(tutoresResult.data);
      setAsignaciones(asignResult.data);

      // Build assignment map
      const map = new Map<string, { tutor_id: string; tutor_nombre: string }>();
      for (const a of asignResult.data) {
        const tutor = tutoresResult.data.find((t) => t.id === a.tutor_id);
        map.set(a.estudiante_id, {
          tutor_id: a.tutor_id,
          tutor_nombre: tutor ? `${tutor.nombre} ${tutor.apellido}`.trim() : 'Desconocido',
        });
      }
      setAsignacionMap(map);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error loading data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [carreraId, filterRiesgo, filterAnio, filterTutor]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply search filter client-side
  const filteredEstudiantes = estudiantes.filter((e) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      e.nombre.toLowerCase().includes(q) ||
      e.apellido.toLowerCase().includes(q) ||
      e.legajo.toLowerCase().includes(q)
    );
  });

  const activeFilterCount = [filterAnio, filterRiesgo, filterTutor].filter(Boolean).length;

  const clearFilters = () => {
    setFilterAnio('');
    setFilterRiesgo('');
    setFilterTutor('');
    setSearchTerm('');
  };

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEstudiantes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEstudiantes.map((e) => e.id)));
    }
  };

  // Batch assign
  const handleBatchAssign = async () => {
    if (selectedIds.size === 0 || !batchTutorId) return;

    const tutor = tutores.find((t) => t.id === batchTutorId);
    if (!tutor) { showToast('Tutor no encontrado', 'error'); return; }
    const rolTutor: RolTutor = tutor.rol;

    const { error: assignError } = await batchAssignTutor(
      Array.from(selectedIds),
      batchTutorId,
      rolTutor
    );

    if (assignError) {
      showToast(assignError, 'error');
    } else {
      showToast(`${selectedIds.size} estudiante${selectedIds.size !== 1 ? 's' : ''} asignado${selectedIds.size !== 1 ? 's' : ''} correctamente`);
      setSelectedIds(new Set());
      setBatchTutorId('');
      fetchData();
    }
  };

  // Individual assign
  const handleIndividualAssign = async (estudianteId: string, tutorId: string, rolTutor: RolTutor) => {
    const { error: assignError } = await assignTutor(estudianteId, tutorId, rolTutor);

    if (assignError) {
      showToast(assignError, 'error');
    } else {
      showToast('Tutor asignado correctamente');
      closeDropdown();
      fetchData();
    }
  };

  // Unassign
  const handleUnassign = async (estudianteId: string) => {
    const { error: unassignError } = await unassignTutor(estudianteId);

    if (unassignError) {
      showToast(unassignError, 'error');
    } else {
      showToast('Tutor removido');
      closeDropdown();
      fetchData();
    }
  };

  const tutorOptions = tutores.map((t) => ({
    value: t.id,
    label: `${t.nombre} ${t.apellido}`.trim(),
    rol: t.rol,
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <UserCheck className="w-5 h-5 text-blue-400" />
            </div>
            Asignar Tutores
          </h1>
        </header>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 mt-3">Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <UserCheck className="w-5 h-5 text-blue-400" />
            </div>
            Asignar Tutores
          </h1>
        </header>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 backdrop-blur-md text-center">
          <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm font-sans">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <UserCheck className="w-5 h-5 text-blue-400" />
            </div>
            Asignar Tutores
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-2">
            {filteredEstudiantes.length} estudiante{filteredEstudiantes.length !== 1 ? 's' : ''} · {tutores.length} tutor{tutores.length !== 1 ? 'es' : ''}
          </p>
        </div>
      </header>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o legajo..."
          className="block w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-slate-100 font-sans text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all duration-200"
        />
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-xs font-sans text-slate-400 hover:text-white transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-[10px] text-slate-500 hover:text-slate-300 font-sans transition-colors">
              Limpiar filtros
            </button>
          )}
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.05]">
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Año ingreso</label>
                  <CustomSelect value={filterAnio} onChange={setFilterAnio} options={ANIO_OPTIONS} placeholder="Todos" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Nivel de riesgo</label>
                  <CustomSelect value={filterRiesgo} onChange={setFilterRiesgo} options={RIESGO_OPTIONS} placeholder="Todos" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Estado tutor</label>
                  <CustomSelect value={filterTutor} onChange={setFilterTutor} options={TUTOR_FILTER_OPTIONS} placeholder="Todos" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Batch action bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-md flex items-center gap-4"
        >
          <span className="text-xs font-sans text-blue-300">
            {selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}
          </span>
          <div className="flex-1 max-w-xs">
            <CustomSelect
              value={batchTutorId}
              onChange={setBatchTutorId}
              options={[{ value: '', label: 'Seleccionar tutor...' }, ...tutorOptions]}
              placeholder="Seleccionar tutor..."
            />
          </div>
          <button
            onClick={handleBatchAssign}
            disabled={!batchTutorId}
            className={`flex items-center gap-1.5 text-xs font-sans rounded-lg px-3 py-2 transition-colors ${
              batchTutorId
                ? 'bg-blue-500/20 border border-blue-500/30 text-white hover:bg-blue-500/30'
                : 'bg-white/[0.04] border border-white/[0.06] text-slate-600 cursor-not-allowed'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Asignar en lote
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Empty state */}
      {filteredEstudiantes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-12 backdrop-blur-md text-center"
        >
          <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-sans text-sm">
            {activeFilterCount > 0 || searchTerm
              ? 'No se encontraron estudiantes con los filtros aplicados.'
              : 'No hay estudiantes en esta carrera.'}
          </p>
        </motion.div>
      )}

      {/* Student list */}
      {filteredEstudiantes.length > 0 && (
        <>
          {/* Header row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden md:grid grid-cols-[36px_2fr_1fr_80px_100px_180px] gap-3 px-4 py-2 text-[10px] text-slate-500 font-sans uppercase tracking-wider"
          >
            <button
              onClick={toggleSelectAll}
              className="w-4 h-4 rounded border border-white/[0.12] flex items-center justify-center hover:border-blue-400 transition-colors"
            >
              {selectedIds.size === filteredEstudiantes.length && filteredEstudiantes.length > 0 && (
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
              )}
            </button>
            <span>Estudiante</span>
            <span>Legajo</span>
            <span>Riesgo</span>
            <span>Puntaje</span>
            <span>Tutor</span>
          </motion.div>

          <div className="space-y-2">
            {filteredEstudiantes.map((est, i) => {
              const asignacion = asignacionMap.get(est.id);
              const isSelected = selectedIds.has(est.id);
              const isDropdownOpen = dropdownOpen === est.id;

              return (
                <motion.div
                  key={est.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + Math.min(i * 0.02, 0.5) }}
                  className={`bg-white/[0.04] border rounded-2xl p-4 backdrop-blur-md transition-all duration-200 ${
                    isSelected ? 'border-blue-500/30 bg-blue-500/[0.06]' : 'border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.06]'
                  }`}
                >
                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-[36px_2fr_1fr_80px_100px_180px] gap-3 items-center">
                    <button
                      onClick={() => toggleSelect(est.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-blue-400 bg-blue-500/20' : 'border-white/[0.12] hover:border-blue-400'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                    </button>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-400/10 text-blue-400 font-display text-xs font-bold shrink-0">
                        {est.nombre?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white font-sans truncate">
                          {est.nombre || 'Sin nombre'} {est.apellido || ''}
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans">{est.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-sans">{est.legajo || '—'}</span>
                    <RiskBadge nivel={est.nivel_riesgo} />
                    <ScoreBadge score={undefined} />
                    <div>
                      {asignacion ? (
                        <div className="flex items-center gap-1.5">
<span className="text-xs text-slate-400 font-sans truncate">{asignacion.tutor_nombre}</span>
                           <button
                             data-tutor-trigger
                             onClick={(e) => toggleDropdown(est.id, e.currentTarget)}
                             className="text-[10px] text-slate-500 hover:text-slate-300 font-sans transition-colors shrink-0"
                           >
                             Cambiar
                           </button>
                         </div>
                        ) : (
                         <button
                           data-tutor-trigger
                           onClick={(e) => toggleDropdown(est.id, e.currentTarget)}
                           className="text-[10px] font-sans px-2 py-1 rounded-lg bg-blue-500/15 border border-blue-500/20 text-blue-300 hover:bg-blue-500/25 transition-colors"
                         >
                           Asignar tutor
                         </button>
                       )}
                     </div>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleSelect(est.id)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                            isSelected ? 'border-blue-400 bg-blue-500/20' : 'border-white/[0.12]'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                        </button>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-400/10 text-blue-400 font-display text-xs font-bold shrink-0">
                          {est.nombre?.[0] || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white font-sans truncate">
                            {est.nombre || 'Sin nombre'} {est.apellido || ''}
                          </p>
                          <p className="text-[10px] text-slate-500 font-sans">Legajo: {est.legajo || '—'}</p>
                        </div>
                      </div>
                      <RiskBadge nivel={est.nivel_riesgo} />
                    </div>
                    <div className="flex items-center justify-between pl-8">
                      <span className="text-xs text-slate-400 font-sans truncate">
                        {asignacion ? `Tutor: ${asignacion.tutor_nombre}` : 'Sin tutor'}
                      </span>
                      <div>
<button
                           data-tutor-trigger
                           onClick={(e) => toggleDropdown(est.id, e.currentTarget)}
                           className="text-[10px] font-sans px-2 py-1 rounded-lg bg-blue-500/15 border border-blue-500/20 text-blue-300 hover:bg-blue-500/25 transition-colors"
                         >
                           {asignacion ? 'Cambiar' : 'Asignar'}
                         </button>
                      </div>
                    </div>
                  </div>
                  {isDropdownOpen && dropdownPos && createPortal(
                    <div
                      className="fixed z-[9999] bg-[#0F1B2D] border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[200px]"
                      data-tutor-dropdown
                      style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}
                    >
                      <div className="max-h-[200px] overflow-y-auto py-1">
                        {tutorOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleIndividualAssign(est.id, opt.value, opt.rol)}
                            className={`w-full text-left px-3 py-2 text-xs font-sans transition-colors ${
                              asignacion?.tutor_id === opt.value
                                ? 'bg-blue-500/10 text-blue-300'
                                : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                            }`}
                          >
                            {opt.label}
                            {asignacion?.tutor_id === opt.value && ' ✓'}
                          </button>
                        ))}
                        {asignacion && (
                          <>
                            <div className="border-t border-white/[0.06] my-1" />
                            <button
                              onClick={() => handleUnassign(est.id)}
                              className="w-full text-left px-3 py-2 text-xs font-sans text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              Remover tutor
                            </button>
                          </>
                        )}
                      </div>
                    </div>,
                    document.body
                  )}
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
