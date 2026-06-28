import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCareer } from '../../context/CareerContext';
import { useEstudiantes, type EstudianteRow, type StudentFilters } from '../../hooks/useEstudiantes';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, GraduationCap, ArrowUpDown, ArrowUp, ArrowDown, Filter, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../ui/CustomSelect';

const RIESGO_OPTIONS = [
  { value: '', label: 'Todos los niveles' },
  { value: 'bajo', label: 'Bajo', color: '#34d399' },
  { value: 'medio', label: 'Medio', color: '#fbbf24' },
  { value: 'alto', label: 'Alto', color: '#fb923c' },
  { value: 'critico', label: 'Crítico', color: '#f87171' },
];

const TUTOR_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'con', label: 'Con tutor' },
  { value: 'sin', label: 'Sin tutor' },
];

const ANIO_OPTIONS = [
  { value: '', label: 'Todos los años' },
  { value: '2020', label: '2020' },
  { value: '2021', label: '2021' },
  { value: '2022', label: '2022' },
  { value: '2023', label: '2023' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
];

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

type SortKey = StudentFilters['sortBy'];

export const AlumnosPage = () => {
  const { usuario, rol } = useAuth();
  const { carreraId } = useCareer();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('apellido');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterAnio, setFilterAnio] = useState('');
  const [filterRiesgo, setFilterRiesgo] = useState('');
  const [filterTutor, setFilterTutor] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filters: Partial<StudentFilters> = useMemo(() => ({
    search: searchTerm || undefined,
    anioIngreso: filterAnio ? Number(filterAnio) : undefined,
    nivelRiesgo: (filterRiesgo as StudentFilters['nivelRiesgo']) || undefined,
    hasTutor: filterTutor === 'con' ? true : filterTutor === 'sin' ? false : undefined,
    sortBy,
    sortDir,
  }), [searchTerm, filterAnio, filterRiesgo, filterTutor, sortBy, sortDir]);

  const { estudiantes, loading, error } = useEstudiantes(
    usuario?.id || '',
    rol || '',
    carreraId ?? undefined,
    filters
  );

  const activeFilterCount = [filterAnio, filterRiesgo, filterTutor].filter(Boolean).length;

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const clearFilters = () => {
    setFilterAnio('');
    setFilterRiesgo('');
    setFilterTutor('');
    setSearchTerm('');
  };

  const SortIcon: React.FC<{ column: SortKey }> = ({ column }) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 text-slate-600" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3 text-blue-400" />
      : <ArrowDown className="w-3 h-3 text-blue-400" />;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            Alumnos
          </h1>
        </header>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 mt-3">Cargando alumnos...</span>
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
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            Alumnos
          </h1>
        </header>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 backdrop-blur-md text-center">
          <p className="text-red-400 text-sm font-sans">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            Alumnos
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-2">
            {estudiantes.length} alumno{estudiantes.length !== 1 ? 's' : ''}
          </p>
        </div>
      </header>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o legajo..."
            className="block w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-3 text-slate-100 font-sans text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs font-sans text-slate-400 hover:text-white transition-colors"
            >
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
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.05]">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Año ingreso</label>
                    <CustomSelect
                      value={filterAnio}
                      onChange={setFilterAnio}
                      options={ANIO_OPTIONS}
                      placeholder="Todos los años"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Nivel de riesgo</label>
                    <CustomSelect
                      value={filterRiesgo}
                      onChange={setFilterRiesgo}
                      options={RIESGO_OPTIONS}
                      placeholder="Todos los niveles"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">Tutor</label>
                    <CustomSelect
                      value={filterTutor}
                      onChange={setFilterTutor}
                      options={TUTOR_OPTIONS}
                      placeholder="Todos"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Empty state */}
      {estudiantes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-12 backdrop-blur-md text-center"
        >
          <GraduationCap className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-sans text-sm">
            {activeFilterCount > 0 || searchTerm
              ? 'No se encontraron resultados con los filtros aplicados.'
              : 'No hay alumnos registrados en esta carrera.'}
          </p>
        </motion.div>
      )}

      {/* Sort headers */}
      {estudiantes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_100px] gap-4 px-4 py-2 text-[10px] text-slate-500 font-sans uppercase tracking-wider"
        >
          <button onClick={() => handleSort('apellido')} className="flex items-center gap-1 hover:text-slate-300 transition-colors text-left">
            Nombre <SortIcon column="apellido" />
          </button>
          <button onClick={() => handleSort('legajo')} className="flex items-center gap-1 hover:text-slate-300 transition-colors">
            Legajo <SortIcon column="legajo" />
          </button>
          <span>Carrera</span>
          <button onClick={() => handleSort('nivel_riesgo')} className="flex items-center gap-1 hover:text-slate-300 transition-colors">
            Riesgo <SortIcon column="nivel_riesgo" />
          </button>
          <span>Tutor</span>
        </motion.div>
      )}

      {/* Student list */}
      {estudiantes.length > 0 && (
        <div className="space-y-2">
          {estudiantes.map((alumno, i) => (
            <motion.div
              key={alumno.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.03 }}
              onClick={() => navigate(`/alumnos/${alumno.id}`)}
              className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-md hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
            >
              {/* Desktop */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_100px] gap-4 items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-400/10 text-blue-400 font-display text-sm font-bold shrink-0">
                    {alumno.nombre?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white font-sans truncate">
                      {alumno.nombre || 'Sin nombre'} {alumno.apellido || ''}
                    </p>
                    <p className="text-xs text-slate-500 font-sans truncate">{alumno.email || ''}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-sans">{alumno.legajo || '—'}</span>
                <span className="text-xs text-slate-400 font-sans truncate">{alumno.carrera_nombre || '—'}</span>
                <RiesgoBadge nivel={alumno.nivel_riesgo} />
                <span className={cn('text-xs font-sans', alumno.tutor_nombre ? 'text-slate-400' : 'text-red-400')}>
                  {alumno.tutor_nombre || 'Sin tutor'}
                </span>
              </div>

              {/* Mobile */}
              <div className="md:hidden flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-400/10 text-blue-400 font-display text-sm font-bold shrink-0">
                    {alumno.nombre?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white font-sans truncate">
                      {alumno.nombre || 'Sin nombre'} {alumno.apellido || ''}
                    </p>
                    <p className="text-xs text-slate-500 font-sans">Legajo: {alumno.legajo || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <RiesgoBadge nivel={alumno.nivel_riesgo} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* No search results */}
      {estudiantes.length > 0 && (searchTerm || activeFilterCount > 0) && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-8 backdrop-blur-md text-center">
          <Search className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 text-sm font-sans">
            No se encontraron resultados con los filtros aplicados.
          </p>
        </div>
      )}
    </div>
  );
};
