import { motion } from 'framer-motion';
import { HelpCircle, BookOpen, MessageCircle, ExternalLink } from 'lucide-react';

const faqItems = [
  {
    q: '¿Cómo funciona el seguimiento?',
    a: 'El sistema evalúa periódicamente tu progreso académico y te conecta con tu tutor cuando detecta señales de riesgo.',
  },
  {
    q: '¿Qué es un perfil silencioso?',
    a: 'Un perfil silencioso es un estudiante con bajo rendimiento que no está interactuando con el sistema. Si te reconoces en esto, ¡pedí ayuda!',
  },
  {
    q: '¿Cómo puedo contactar a mi tutor?',
    a: 'Usá el botón "Pedir Ayuda" en tu dashboard. Tu tutor será notificado automáticamente.',
  },
];

export const AyudaPage = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-teal-500/10 border border-teal-500/20 rounded-xl">
              <HelpCircle className="w-5 h-5 text-teal-400" />
            </div>
            Centro de Ayuda
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-2">
            Recursos y preguntas frecuentes para estudiantes.
          </p>
        </div>
      </header>

      {/* FAQ */}
      <div className="space-y-3">
        {faqItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-md hover:border-white/[0.12] transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-teal-400/10 shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-white mb-1">{item.q}</h3>
                <p className="text-sm text-slate-400 font-sans leading-relaxed">{item.a}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: faqItems.length * 0.08 }}
        className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 backdrop-blur-md"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-400/10">
            <MessageCircle className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="font-display text-sm font-semibold text-white">¿Necesitás más ayuda?</h3>
        </div>
        <p className="text-sm text-slate-400 font-sans mb-4">
          Si no encontrás lo que buscás, podés pedir asistencia directamente desde tu dashboard o contactar a tu tutor asignado.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
        >
          Volver al dashboard <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </motion.div>
    </div>
  );
};
