import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Calendar, MapPin, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CustomSelect } from './CustomSelect';

interface StudentOption {
  id: string;
  nombre: string;
  apellido: string;
  nivel_riesgo?: string; // 'bajo' | 'medio' | 'alto' | 'critico' — auto-populates estado
}

interface InterviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  estudiantes: StudentOption[];
  estudianteIdPreseleccionado?: string;
  tutorId: string;
  onSubmit: (payload: {
    estudiante_id: string;
    tutor_id: string;
    modalidad: 'presencial' | 'virtual' | 'telefonica';
    fecha_realizada: string;
    motivo: string;
    resumen: string;
    estado_alumno_percibido: 'bien' | 'regular' | 'en_riesgo' | 'critico';
    factores_riesgo: string[];
    seguimiento_requerido: boolean;
    notas_adicionales?: string;
  }) => Promise<void>;
}

type Modalidad = 'presencial' | 'virtual' | 'telefonica';
type EstadoAlumno = 'bien' | 'regular' | 'en_riesgo' | 'critico';

export const InterviewForm = ({
  isOpen,
  onClose,
  onSuccess,
  estudiantes,
  estudianteIdPreseleccionado,
  tutorId,
  onSubmit,
}: InterviewFormProps) => {
  const [estudianteId, setEstudianteId] = useState(estudianteIdPreseleccionado || '');
  const [fecha, setFecha] = useState('');
  const [modalidad, setModalidad] = useState<Modalidad | ''>('');
  const [motivo, setMotivo] = useState('');
  const [resumen, setResumen] = useState('');
  const [estadoAlumno, setEstadoAlumno] = useState<EstadoAlumno>('bien');
  const [factoresRiesgo, setFactoresRiesgo] = useState<string[]>([]);
  const [seguimientoRequerido, setSeguimientoRequerido] = useState(false);
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const SCORE_TO_ESTADO: Record<string, EstadoAlumno> = {
    bajo: 'bien',
    medio: 'regular',
    alto: 'en_riesgo',
    critico: 'critico',
  };

  const estudiantesMap = useMemo(
    () => new Map(estudiantes.map((e) => [e.id, e])),
    [estudiantes]
  );

  // Auto-populate estadoAlumno from the selected student's score level
  useEffect(() => {
    if (!estudianteId) return;
    const student = estudiantesMap.get(estudianteId);
    if (student?.nivel_riesgo && SCORE_TO_ESTADO[student.nivel_riesgo]) {
      setEstadoAlumno(SCORE_TO_ESTADO[student.nivel_riesgo]);
    }
  }, [estudianteId, estudiantesMap]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!estudianteId) newErrors.estudiante = 'Seleccioná un estudiante';
    if (!fecha) newErrors.fecha = 'Ingresá una fecha';
    if (!modalidad) newErrors.modalidad = 'Seleccioná una modalidad';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        estudiante_id: estudianteId,
        tutor_id: tutorId,
        modalidad: modalidad as Modalidad,
        fecha_realizada: fecha,
        motivo: motivo || 'Entrevista de seguimiento',
        resumen: resumen || '',
        estado_alumno_percibido: estadoAlumno,
        factores_riesgo: factoresRiesgo,
        seguimiento_requerido: seguimientoRequerido,
        notas_adicionales: notas || undefined,
      });
      resetForm();
      onSuccess();
      onClose();
    } catch {
      // error propagated to parent
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEstudianteId(estudianteIdPreseleccionado || '');
    setFecha('');
    setModalidad('');
    setMotivo('');
    setResumen('');
    setEstadoAlumno('bien');
    setFactoresRiesgo([]);
    setSeguimientoRequerido(false);
    setNotas('');
    setErrors({});
  };

  const toggleFactor = (factor: string) => {
    setFactoresRiesgo(prev =>
      prev.includes(factor) ? prev.filter(f => f !== factor) : [...prev, factor]
    );
  };

  const FACTORES_RIESGO = [
    'Académico', 'Económico', 'Emocional', 'Familiar',
    'Social', 'Salud', 'Asistencia', 'Motivación',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#0F1B2D] rounded-2xl border border-white/[0.08] p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-white">Nueva Entrevista</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student selector */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                  Estudiante
                </label>
                <CustomSelect
                  value={estudianteId}
                  onChange={setEstudianteId}
                  options={estudiantes.map((e) => ({
                    value: e.id,
                    label: `${e.nombre} ${e.apellido}`,
                  }))}
                  placeholder="Seleccionar estudiante..."
                  disabled={!!estudianteIdPreseleccionado}
                  className={errors.estudiante ? 'border-red-500/50' : ''}
                />
                {errors.estudiante && (
                  <p className="text-red-400 text-xs mt-1 font-sans">{errors.estudiante}</p>
                )}
              </div>

              {/* Date picker */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className={cn(
                    'block w-full bg-white/[0.04] border rounded-lg px-4 py-3 text-slate-100 font-sans text-sm focus:outline-none focus:border-blue-500/50 transition-all',
                    errors.fecha ? 'border-red-500/50' : 'border-white/[0.08]'
                  )}
                />
                {errors.fecha && (
                  <p className="text-red-400 text-xs mt-1 font-sans">{errors.fecha}</p>
                )}
              </div>

              {/* Modality */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Modalidad
                </label>
                <div className="flex gap-2">
                  {(['presencial', 'virtual', 'telefonica'] as Modalidad[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModalidad(m)}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-xs font-sans font-medium transition-all border',
                        modalidad === m
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-white/[0.04] text-slate-500 border-white/[0.07] hover:bg-white/[0.08]'
                      )}
                    >
                      {m === 'presencial' ? 'Presencial' : m === 'virtual' ? 'Virtual' : 'Telefónica'}
                    </button>
                  ))}
                </div>
                {errors.modalidad && (
                  <p className="text-red-400 text-xs mt-1 font-sans">{errors.modalidad}</p>
                )}
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Motivo
                </label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Motivo de la entrevista..."
                  className="block w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-slate-100 font-sans text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>

              {/* Resumen */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                  Resumen
                </label>
                <textarea
                  value={resumen}
                  onChange={(e) => setResumen(e.target.value)}
                  placeholder="Resumen de la entrevista..."
                  rows={3}
                  className="block w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-slate-100 font-sans text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                />
              </div>

              {/* Estado del alumno */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                  Estado del alumno percibido
                </label>
                <div className="flex gap-2">
                  {(['bien', 'regular', 'en_riesgo', 'critico'] as EstadoAlumno[]).map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEstadoAlumno(e)}
                      className={cn(
                        'flex-1 px-2 py-2 rounded-lg text-[11px] font-sans font-medium transition-all border',
                        estadoAlumno === e
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-white/[0.04] text-slate-500 border-white/[0.07] hover:bg-white/[0.08]'
                      )}
                    >
                      {e === 'bien' ? 'Bien' : e === 'regular' ? 'Regular' : e === 'en_riesgo' ? 'En riesgo' : 'Crítico'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Factores de riesgo */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                  Factores de riesgo
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FACTORES_RIESGO.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFactor(f)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-sans font-medium transition-all border',
                        factoresRiesgo.includes(f)
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-white/[0.04] text-slate-500 border-white/[0.07] hover:bg-white/[0.08]'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seguimiento */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSeguimientoRequerido(!seguimientoRequerido)}
                  className={cn(
                    'w-5 h-5 rounded-md border flex items-center justify-center transition-all',
                    seguimientoRequerido
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                      : 'bg-white/[0.04] border-white/[0.08] text-transparent'
                  )}
                >
                  {seguimientoRequerido && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="text-xs text-slate-400 font-sans">Requiere seguimiento</span>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                  Notas adicionales
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Notas opcionales..."
                  rows={2}
                  className="block w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-slate-100 font-sans text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors font-sans"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 font-sans disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Guardando...' : 'Crear Entrevista'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
