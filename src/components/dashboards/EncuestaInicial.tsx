import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useEncuesta } from '../../hooks/useEncuesta';
import { guardarRespuesta, completarEncuesta, crearSesionEncuesta } from '../../services/encuestasService';
import { Send, ChevronLeft, ChevronRight } from 'lucide-react';
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

export const EncuestaInicial = () => {
  const { usuario } = useAuth();
  const { encuesta, loading: encLoading } = useEncuesta(usuario?.id, 'inicial');
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // section index
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Flatten sections + questions from the loaded survey
  const sections = useMemo(() => {
    if (!encuesta?.encuesta_secciones) return [];
    const items: { titulo: string; preguntas: PreguntaItem[] }[] = [];
    for (const sec of encuesta.encuesta_secciones as any[]) {
      const preguntas: PreguntaItem[] = (sec.preguntas ?? []).map((p: any) => ({
        id: p.id,
        texto: p.texto,
        tipo: p.tipo,
        opciones: Array.isArray(p.opciones)
          ? p.opciones.map((o: any) => typeof o === 'string' ? o : (o?.valor ?? String(o)))
          : null,
        seccion: sec.titulo,
        orden: p.orden,
      })).sort((a: PreguntaItem, b: PreguntaItem) => a.orden - b.orden);

      if (preguntas.length > 0) {
        items.push({ titulo: sec.titulo || `Sección ${items.length + 1}`, preguntas });
      }
    }
    return items;
  }, [encuesta]);

  const currentSection = sections[step] ?? null;
  const totalSteps = sections.length;
  const isLastStep = step === totalSteps - 1;

  const setAnswer = (preguntaId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [preguntaId]: value }));
  };

  const handleNext = () => {
    if (!isLastStep) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encuesta || !usuario) return;

    setIsSubmitting(true);
    try {
      const { data: newSession, error: createErr } = await crearSesionEncuesta(
        encuesta.id,
        usuario.id,
        1,
        new Date().getFullYear()
      );
      if (createErr) throw createErr;
      const sessionId = (newSession as any).id;

      // Save each answer using the REAL pregunta UUID
      for (const sec of sections) {
        for (const preg of sec.preguntas) {
          const valor = answers[preg.id] ?? '';
          await guardarRespuesta(sessionId, preg.id, valor);
        }
      }

      await completarEncuesta(sessionId, usuario.id, true);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error saving survey:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options for escala (1-10)
  const escalaOptions = Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

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
      case 'numerica':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setAnswer(preg.id, e.target.value)}
            placeholder="Ingresá un número..."
            className="block w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-slate-100 font-sans text-sm focus:outline-none focus:border-blue-500/50 transition-all"
          />
        );
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
        <span className="text-sm text-slate-400 mt-3 block">Cargando encuesta inicial...</span>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center p-8 bg-white/[0.04] rounded-2xl border border-white/[0.07] backdrop-blur-md text-center">
          <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mb-4">
            <Send className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-display">¡Gracias por la información!</h2>
          <p className="text-slate-400 mb-6 font-sans">Hemos registrado tu perfil de ingreso.</p>
          <button
            onClick={() => navigate('/encuestas')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors font-sans"
          >
            Ir a Encuestas
          </button>
        </div>
      </div>
    );
  }

  if (!currentSection) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-slate-400 font-sans">No hay preguntas configuradas para la encuesta inicial.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-white tracking-tight">
          {encuesta?.titulo || 'Encuesta de Ingreso'}
        </h1>
        <p className="text-sm text-slate-500 font-sans mt-2">
          {encuesta?.descripcion || 'Conocerte mejor para acompañarte durante la carrera.'}
        </p>

        {/* Step indicators */}
        <div className="flex gap-2 mt-6">
          {sections.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i <= step ? 'bg-blue-500' : 'bg-white/[0.08]'
              }`}
            />
          ))}
        </div>
      </header>

      <div className="bg-white/[0.04] rounded-2xl border border-white/[0.07] backdrop-blur-md p-6 md:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isLastStep) handleSubmit(e);
            else handleNext();
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`section-${step}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-white font-display">
                {currentSection.titulo}
              </h3>

              {currentSection.preguntas.map((preg) => (
                <div key={preg.id} className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300 font-sans">
                    {preg.texto}
                  </label>
                  {renderQuestion(preg)}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-8 pt-6 border-t border-white/[0.07] flex justify-between">
            {step > 0 ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors font-sans"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors font-sans ${
                isLastStep
                  ? 'bg-teal-600 hover:bg-teal-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              } disabled:opacity-50`}
            >
              {isSubmitting ? 'Enviando...' : isLastStep ? 'Finalizar' : 'Siguiente'}
              {!isSubmitting && !isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
