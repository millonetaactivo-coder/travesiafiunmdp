import { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import { useSinContacto } from '../../hooks/useSinContacto';
import { InterviewForm } from '../ui/InterviewForm';
import { motion } from 'framer-motion';
import { AlertTriangle, UserX, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatRiskLevel, daysSince } from '../../lib/formatters';

export const SinContactoPage = () => {
  const { usuario, rol } = useAuth();
  const { estudiantes, loading, error, refetch } = useSinContacto(usuario?.id || '', rol || '');
  const { estudiantes: allStudents } = useEstudiantes(usuario?.id || '', rol || '');
  const [formOpen, setFormOpen] = useState(false);
  const [preselectedStudent, setPreselectedStudent] = useState<string | undefined>();

  const studentOptions = useMemo(() =>
    allStudents.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      apellido: s.apellido,
      nivel_riesgo: s.nivel_riesgo,
    })),
    [allStudents]
  );

  const handleNewContact = (studentId?: string) => {
    setPreselectedStudent(studentId);
    setFormOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl">
              <UserX className="w-5 h-5 text-red-400" />
            </div>
            Sin Contacto
          </h1>
        </header>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 mt-3">Cargando estudiantes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl">
              <UserX className="w-5 h-5 text-red-400" />
            </div>
            Sin Contacto
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
            <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl">
              <UserX className="w-5 h-5 text-red-400" />
            </div>
            Sin Contacto
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-2">
            Estudiantes en riesgo sin intervenciones registradas
          </p>
        </div>
      </header>

      {/* Empty state */}
      {estudiantes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-12 backdrop-blur-md text-center"
        >
          <AlertTriangle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-sans text-sm mb-1">
            No hay estudiantes en riesgo sin contacto.
          </p>
          <p className="text-slate-600 font-sans text-xs">
            Todos los estudiantes de riesgo tienen al menos una intervención registrada.
          </p>
        </motion.div>
      )}

      {/* Student list */}
      {estudiantes.length > 0 && (
        <div className="space-y-2">
          {estudiantes.map((est, i) => (
            <motion.div
              key={est.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-md hover:border-white/[0.12] transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    est.nivel_riesgo === 'critico' ? 'bg-red-400/10' : 'bg-orange-400/10'
                  )}>
                    <AlertTriangle className={cn(
                      'w-4 h-4',
                      est.nivel_riesgo === 'critico' ? 'text-red-400' : 'text-orange-400'
                    )} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white font-sans truncate">
                      {est.nombre} {est.apellido}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-sans">
                      <span className={cn(
                        'px-1.5 py-0.5 rounded-md text-[10px] font-medium',
                        est.nivel_riesgo === 'critico'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      )}>
                        {formatRiskLevel(est.nivel_riesgo)}
                      </span>
                      <span className="text-slate-700">
                        Score: {Math.round(est.score_valor)}/100
                      </span>
                      <span className="text-slate-700">· Nunca contactado — {est.created_at ? `${daysSince(est.created_at)} días` : 'sin fecha'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleNewContact(est.id)}
                  className="shrink-0 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-500/20 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  Registrar contacto
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* InterviewForm modal */}
      <InterviewForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setPreselectedStudent(undefined); }}
        onSuccess={() => refetch()}
        estudiantes={studentOptions}
        estudianteIdPreseleccionado={preselectedStudent}
        tutorId={usuario?.id || ''}
        onSubmit={async (payload) => {
          const { crearEntrevistaCompleta } = await import('../../services/intervencionesService');
          await crearEntrevistaCompleta(payload);
        }}
      />
    </div>
  );
};
