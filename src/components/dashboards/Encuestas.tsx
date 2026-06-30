import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePerfil } from '../../hooks/usePerfil';
import { useEncuesta } from '../../hooks/useEncuesta';
import { usePlan } from '../../hooks/usePlan';
import { guardarRespuesta, guardarCursada, guardarFinal, completarEncuesta } from '../../services/encuestasService';
import { supabase } from '../../lib/supabase';
import { Send, AlertTriangle, ChevronLeft, ChevronRight, X, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CustomSelect } from '../ui/CustomSelect';

interface PreguntaItem {
  id: string;
  texto: string;
  tipo: string;
  opciones: string[] | null;
  seccion: string;
  orden: number;
}

export const Encuestas = () => {
  const { usuario } = useAuth();
  const { perfil } = usePerfil(usuario?.id);
  const { encuesta, sesion, requiereInicial, loading: encLoading } = useEncuesta(usuario?.id, 'cuatrimestral');
  const { materiasHabilitadas } = usePlan(perfil?.estudiantes?.carrera_id, usuario?.id);

  const [step, setStep] = useState(0); // 0 = preguntas, 1 = materias, 2 = confirm
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Dynamic answers + materias tracking
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [materiasAgregadas, setMateriasAgregadas] = useState<Record<string, { estado: string; nombre: string }>>({});

  // Materia search
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as HTMLElement)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  // Filter materias by search term, excluding already added ones
  const filteredMaterias = useMemo(() => {
    if (!materiasHabilitadas) return [];
    const q = searchTerm.toLowerCase().trim();
    return materiasHabilitadas
      .filter(m => !materiasAgregadas[m.materia_id])
      .filter(m => !q || m.nombre.toLowerCase().includes(q))
      .slice(0, 8);
  }, [materiasHabilitadas, searchTerm, materiasAgregadas]);

  const addMateria = (materiaId: string, nombre: string) => {
    setMateriasAgregadas(prev => ({ ...prev, [materiaId]: { estado: '', nombre } }));
    setSearchTerm('');
    setShowDropdown(false);
  };

  const removeMateria = (materiaId: string) => {
    setMateriasAgregadas(prev => {
      const next = { ...prev };
      delete next[materiaId];
      return next;
    });
  };

  const setMateriaEstado = (materiaId: string, estado: string) => {
    setMateriasAgregadas(prev => ({
      ...prev,
      [materiaId]: { ...prev[materiaId], estado }
    }));
  };

  // Flatten sections + questions from loaded survey
  const sections = useMemo(() => {
    if (!encuesta?.encuesta_secciones) return [];
    const items: { titulo: string; preguntas: PreguntaItem[] }[] = [];
    for (const sec of encuesta.encuesta_secciones as any[]) {
      const preguntas: PreguntaItem[] = (sec.preguntas ?? [])
        .map((p: any) => ({
          id: p.id,
          texto: p.texto,
          tipo: p.tipo,
          opciones: Array.isArray(p.opciones)
            ? p.opciones.map((o: any) => typeof o === 'string' ? o : (o?.valor ?? String(o)))
            : null,
          seccion: sec.titulo,
          orden: p.orden,
        }))
        .sort((a: PreguntaItem, b: PreguntaItem) => a.orden - b.orden);

      if (preguntas.length > 0) {
        items.push({ titulo: sec.titulo || `Sección ${items.length + 1}`, preguntas });
      }
    }
    return items;
  }, [encuesta]);

  const currentSection = sections[0] ?? null; // only 1 section step for cuatrimestral (2 sections → 1 step)
  const escalaOptions = Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

  const setAnswer = (preguntaId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [preguntaId]: value }));
  };

  const renderQuestion = (preg: PreguntaItem) => {
    const value = answers[preg.id] ?? '';
    switch (preg.tipo) {
      case 'unica': {
        const opts = (preg.opciones ?? []).map((o: string) => ({ value: o, label: o }));
        return (
          <CustomSelect
            value={value}
            onChange={(v) => setAnswer(preg.id, v)}
            options={[{ value: '', label: 'Seleccionar...' }, ...opts]}
          />
        );
      }
      case 'escala':
        return (
          <CustomSelect
            value={value}
            onChange={(v) => setAnswer(preg.id, v)}
            options={[{ value: '', label: 'Seleccionar...' }, ...escalaOptions]}
          />
        );
      case 'texto':
      default:
        return (
          <textarea
            value={value}
            onChange={(e) => setAnswer(preg.id, e.target.value)}
            placeholder="Escribí tu respuesta..."
            rows={3}
            className="block w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-slate-100 font-sans text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
          />
        );
    }
  };

  if (encLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <span className="text-sm text-slate-400 mt-3 block">Cargando encuesta...</span>
      </div>
    );
  }

  if (requiereInicial) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-8 backdrop-blur-md text-center">
          <h2 className="text-xl font-bold text-white mb-4 font-display">Aviso Importante</h2>
          <p className="text-slate-400 mb-6 font-sans">Debés completar la Encuesta Inicial antes de poder realizar la Encuesta Cuatrimestral.</p>
          <button
            onClick={() => navigate('/encuesta-inicial')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors font-sans"
          >
            Ir a Encuesta Inicial
          </button>
        </div>
      </div>
    );
  }

  if (sesion?.estado === 'completada' || submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center p-8 bg-white/[0.04] rounded-2xl border border-white/[0.07] backdrop-blur-md text-center">
          <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mb-4">
            <Send className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-display">¡Gracias por completar la encuesta!</h2>
          <p className="text-slate-400 mb-6 font-sans">Tus respuestas nos ayudan a acompañarte mejor.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-white/[0.08] border border-white/[0.1] text-slate-300 rounded-lg text-sm hover:bg-white/[0.12] transition-colors font-sans"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesion || !usuario) return;

    setIsSubmitting(true);
    try {
      // Save dynamic answers using REAL pregunta UUIDs
      for (const sec of sections) {
        for (const preg of sec.preguntas) {
          const valor = answers[preg.id] ?? '';
          await guardarRespuesta(sesion.id, preg.id, valor);
        }
      }

      // Save materias cursadas
      const currentYear = new Date().getFullYear();
      const cuatr = new Date().getMonth() < 6 ? 1 : 2;

      for (const [materiaId, data] of Object.entries(materiasAgregadas)) {
        const d = data as any;
        if (d.estado && d.estado !== 'no_cursada') {
          if (d.estado === 'aprobada' || d.estado === 'desaprobada') {
            const cData = {
              estudiante_id: usuario.id,
              materia_id: materiaId,
              cuatrimestre: cuatr,
              anio: currentYear,
              situacion: 'desaprobo' as const,
            };
            const { data: cResp } = await guardarCursada(cData);

            if (cResp) {
              await guardarFinal({
                cursada_id: cResp.id,
                estudiante_id: usuario.id,
                materia_id: materiaId,
                resultado: d.estado === 'aprobada' ? 'aprobado' : 'desaprobado'
              });
            }

            await supabase.from('progreso_estudiante').upsert({
              estudiante_id: usuario.id,
              materia_id: materiaId,
              estado: d.estado === 'aprobada' ? 'aprobada' : 'final_pendiente'
            }, { onConflict: 'estudiante_id,materia_id' });
          } else {
            await guardarCursada({
              estudiante_id: usuario.id,
              materia_id: materiaId,
              cuatrimestre: cuatr,
              anio: currentYear,
              situacion: d.estado,
            });
          }
        }
      }

      await completarEncuesta(sesion.id, usuario.id, false);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error saving survey:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 3; // preguntas, materias, confirm
  const stepLabels = ['Preguntas', 'Materias', 'Confirmar'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-white tracking-tight">
          {encuesta?.titulo || 'Encuesta Cuatrimestral'}
        </h1>
        <p className="text-sm text-slate-500 font-sans mt-2">
          {encuesta?.descripcion || ''}
        </p>
        <div className="flex gap-2 mt-6">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col gap-1">
              <div className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-blue-500' : 'bg-white/[0.08]'}`} />
              <span className={`text-[10px] font-sans ${i <= step ? 'text-blue-400' : 'text-slate-600'}`}>{label}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="bg-white/[0.04] rounded-2xl border border-white/[0.07] backdrop-blur-md p-6 md:p-8">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (step === 2) handleSubmit(e);
          else handleNext();
        }}>
          <AnimatePresence mode="wait">
            {/* Step 0: Dynamic survey questions */}
            {step === 0 && (
              <motion.div key="questions" initial={{opacity:0, x:24}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-24}} transition={{duration:0.2}} className="space-y-8">
                {sections.map((sec, si) => (
                  <div key={si}>
                    <h3 className="text-lg font-semibold text-white font-display mb-4">{sec.titulo}</h3>
                    <div className="space-y-5">
                      {sec.preguntas.map((preg) => (
                        <div key={preg.id} className="space-y-2">
                          <label className="block text-sm font-medium text-slate-300 font-sans">{preg.texto}</label>
                          {renderQuestion(preg)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Step 1: Materias — search & add */}
            {step === 1 && (
              <motion.div key="materias" initial={{opacity:0, x:24}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-24}} transition={{duration:0.2}} className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-amber-300 text-xs font-sans">
                    Buscá y agregá solo las materias que cursaste este cuatrimestre, luego indicá el resultado.
                  </span>
                </div>

                {/* Search input with dropdown */}
                <div ref={searchRef} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Buscar materia por nombre..."
                      className="block w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-slate-100 font-sans text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  {showDropdown && searchTerm.trim() && (
                    <div className="absolute z-50 mt-1 w-full bg-[#0F1B2D] border border-white/[0.1] rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {filteredMaterias.length > 0 ? (
                        filteredMaterias.map(m => (
                          <button
                            key={m.materia_id}
                            type="button"
                            onClick={() => addMateria(m.materia_id, m.nombre)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors font-sans flex items-center gap-2"
                          >
                            <Plus className="w-3.5 h-3.5 text-blue-400" />
                            {m.nombre}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-xs text-slate-600 font-sans">
                          {materiasHabilitadas?.length === 0 ? 'No hay materias disponibles para tu carrera.' : 'No se encontraron materias.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Added materias list */}
                {Object.keys(materiasAgregadas).length > 0 && (
                  <div className="space-y-3 mt-4">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">Materias agregadas ({Object.keys(materiasAgregadas).length})</span>
                    {Object.entries(materiasAgregadas).map(([id, data]) => (
                      <div key={id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => removeMateria(id)}
                          className="p-1 rounded-md hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <span className="flex-1 text-sm text-white font-sans truncate">{data.nombre}</span>
                        <CustomSelect
                          className="w-44 shrink-0"
                          value={data.estado}
                          onChange={(v) => setMateriaEstado(id, v)}
                          placeholder="Resultado..."
                          options={[
                            { value: 'habilito', label: 'Habilitó' },
                            { value: 'promovio', label: 'Promovió' },
                            { value: 'aprobada', label: 'Aprobada (Final)' },
                            { value: 'desaprobada', label: 'Desaprobada' },
                            { value: 'abandono', label: 'Abandonó' },
                          ]}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {Object.keys(materiasAgregadas).length === 0 && !searchTerm && (
                  <div className="text-slate-600 text-center py-6 font-sans text-sm">
                    Buscá una materia por nombre para agregarla.
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <motion.div key="confirm" initial={{opacity:0, x:24}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-24}} transition={{duration:0.2}} className="space-y-6 text-center py-8">
                <h3 className="text-xl text-white font-semibold font-display">¡Todo listo!</h3>
                <p className="text-slate-400 max-w-md mx-auto font-sans text-sm">
                  Tus respuestas serán enviadas de forma segura. Tu tutor podrá revisar esta información para apoyarte.
                </p>
                <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-lg max-w-sm mx-auto text-left">
                  <h4 className="font-semibold text-slate-300 mb-2 font-sans text-sm">Resumen</h4>
                  <ul className="text-sm text-slate-500 space-y-1 font-sans">
                    <li>• Preguntas respondidas: {Object.keys(answers).filter(k => answers[k]).length}</li>
                    <li>• Materias agregadas: {Object.keys(materiasAgregadas).length}</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="mt-8 pt-6 border-t border-white/[0.07] flex justify-between">
            {step > 0 ? (
              <button type="button" disabled={isSubmitting} onClick={handlePrev} className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors font-sans">
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
            ) : (
              <div />
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors font-sans ${
                step === 2 ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
              } disabled:opacity-50`}
            >
              {isSubmitting ? 'Enviando...' : step === 2 ? 'Finalizar Encuesta' : 'Siguiente'}
              {!isSubmitting && step !== 2 && <ChevronRight className="w-4 h-4" />}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
