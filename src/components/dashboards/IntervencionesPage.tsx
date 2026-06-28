import { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useEntrevistas, type Entrevista } from '../../hooks/useEntrevistas';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import { InterviewForm } from '../ui/InterviewForm';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Calendar, Plus, User, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatModality, formatDate, daysSince } from '../../lib/formatters';

export const IntervencionesPage = () => {
  const { usuario, rol } = useAuth();
  const { entrevistas, loading, error, crearEntrevista } = useEntrevistas(usuario?.id || '', rol || '');
  const { estudiantes } = useEstudiantes(usuario?.id || '', rol || '');
  const [formOpen, setFormOpen] = useState(false);
  const [preselectedStudent, setPreselectedStudent] = useState<string | undefined>();

  const planificadas = useMemo(
    () => entrevistas.filter(e => e.estado === 'planificada'),
    [entrevistas]
  );
  const realizadas = useMemo(
    () => entrevistas.filter(e => e.estado === 'realizada'),
    [entrevistas]
  );

  const studentOptions = useMemo(() =>
    estudiantes.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      apellido: s.apellido,
      nivel_riesgo: s.nivel_riesgo,
    })),
    [estudiantes]
  );

  const handleNewInterview = (estudianteId?: string) => {
    setPreselectedStudent(estudianteId);
    setFormOpen(true);
  };

  const renderInterviewCard = (entrevista: Entrevista, index: number) => (
    <motion.div
      key={entrevista.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-md hover:border-white/[0.12] transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
            entrevista.estado === 'planificada' ? 'bg-amber-400/10' : 'bg-blue-400/10'
          )}>
            <MessageSquare className={cn(
              'w-4 h-4',
              entrevista.estado === 'planificada' ? 'text-amber-400' : 'text-blue-400'
            )} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white font-sans">
              {entrevista.estudiante_nombre || 'Estudiante'} {entrevista.estudiante_apellido || ''}
            </p>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              {entrevista.motivo || 'Sin motivo especificado'}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 font-sans">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {entrevista.fecha_realizada ? formatDate(entrevista.fecha_realizada) : '—'}
              </span>
              {entrevista.modalidad && (
                <span className="capitalize">{formatModality(entrevista.modalidad)}</span>
              )}
              {entrevista.fecha_realizada && (
                <span className="text-slate-700">
                  hace {daysSince(entrevista.fecha_realizada)} día{daysSince(entrevista.fecha_realizada) !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {entrevista.entrevista_estado && (
              <div className="mt-1.5">
                <span className={cn(
                  'text-[10px] font-sans font-medium px-2 py-0.5 rounded-md',
                  entrevista.entrevista_estado === 'bien' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  entrevista.entrevista_estado === 'regular' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                  entrevista.entrevista_estado === 'en_riesgo' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                )}>
                  Estado: {entrevista.entrevista_estado === 'en_riesgo' ? 'En riesgo' : entrevista.entrevista_estado}
                </span>
              </div>
            )}
          </div>
        </div>
        <span className={cn(
          'shrink-0 text-[10px] font-sans font-medium px-2 py-0.5 rounded-md',
          entrevista.estado === 'planificada'
            ? 'bg-amber-400/10 text-amber-400 border border-amber-500/20'
            : 'bg-teal-400/10 text-teal-400 border border-teal-500/20'
        )}>
          {entrevista.estado === 'planificada' ? 'Planificada' : 'Realizada'}
        </span>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <ClipboardList className="w-5 h-5 text-blue-400" />
            </div>
            Intervenciones
          </h1>
        </header>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 mt-3">Cargando intervenciones...</span>
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
              <ClipboardList className="w-5 h-5 text-blue-400" />
            </div>
            Intervenciones
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
              <ClipboardList className="w-5 h-5 text-blue-400" />
            </div>
            Intervenciones
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-2">
            {entrevistas.length} entrevista{entrevistas.length !== 1 ? 's' : ''} registrada{entrevistas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => handleNewInterview()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold font-sans transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Entrevista
        </button>
      </header>

      {/* Empty state */}
      {entrevistas.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-12 backdrop-blur-md text-center"
        >
          <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-sans text-sm mb-1">No hay entrevistas registradas.</p>
          <p className="text-slate-600 font-sans text-xs">
            Las entrevistas aparecerán aquí cuando se registren.
          </p>
        </motion.div>
      )}

      {/* Planificadas section */}
      {planificadas.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-sans font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Planificadas ({planificadas.length})
          </h2>
          <div className="space-y-2">
            {planificadas.map((e, i) => renderInterviewCard(e, i))}
          </div>
        </div>
      )}

      {/* Realizadas section */}
      {realizadas.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-sans font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            Realizadas ({realizadas.length})
          </h2>
          <div className="space-y-2">
            {realizadas.map((e, i) => renderInterviewCard(e, i + planificadas.length))}
          </div>
        </div>
      )}

      {/* InterviewForm modal */}
      <InterviewForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setPreselectedStudent(undefined); }}
        onSuccess={() => {}}
        estudiantes={studentOptions}
        estudianteIdPreseleccionado={preselectedStudent}
        tutorId={usuario?.id || ''}
        onSubmit={crearEntrevista}
      />
    </div>
  );
};
