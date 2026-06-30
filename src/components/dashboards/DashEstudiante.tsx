import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePerfil } from '../../hooks/usePerfil';
import { useScore } from '../../hooks/useScore';
import { motion } from 'framer-motion';
import { HelpCircle, FileText, CheckCircle, AlertTriangle, AlertOctagon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { crearAlertaAyuda } from '../../services/alertasService';
import { supabase } from '../../lib/supabase';

export const DashEstudiante = () => {
  const { usuario } = useAuth();
  const { perfil, loading: perfilLoading } = usePerfil(usuario?.id);
  const { ultimoScore, loading: scoreLoading } = useScore(usuario?.id);
  const navigate = useNavigate();

  const [hasPendingHelp, setHasPendingHelp] = useState<boolean>(false);
  const [helpSubmitting, setHelpSubmitting] = useState(false);

  // Check for existing pending help alert
  useEffect(() => {
    const checkPending = async () => {
      if (!usuario?.id) return;
      const { count } = await supabase
        .from('alertas')
        .select('id', { count: 'exact', head: true })
        .eq('estudiante_id', usuario.id)
        .eq('tipo', 'solicitud_ayuda')
        .eq('estado', 'pendiente');
      setHasPendingHelp((count ?? 0) > 0);
    };
    checkPending();
  }, [usuario?.id]);

  const handleHelp = async () => {
    if (usuario && !hasPendingHelp) {
      setHelpSubmitting(true);
      try {
        await crearAlertaAyuda(usuario.id);
        setHasPendingHelp(true);
        alert("Se ha notificado a tu tutor asignado. Pronto se pondrán en contacto con vos.");
      } catch (err) {
        alert("Error al enviar solicitud. Intentá nuevamente.");
      } finally {
        setHelpSubmitting(false);
      }
    }
  };

  if (perfilLoading || scoreLoading) {
    return (
      <div className="text-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <span className="text-sm text-slate-400">Cargando tu información...</span>
        </div>
      </div>
    );
  }

  const scoreMap: Record<string, { label: string, color: string, badge: string, msg: string, accent?: string }> = {
    bajo: {
      label: 'Verde',
      color: '#14B8A6',
      badge: 'bg-green-500/10 text-green-400 border border-green-500/20',
      msg: 'Sin acción requerida por el momento.'
    },
    medio: {
      label: 'Amarillo',
      color: '#F59E0B',
      badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      msg: 'Estás en una etapa que requiere atención.'
    },
    alto: {
      label: 'Naranja',
      color: '#EF4444',
      badge: 'bg-red-500/10 text-red-400 border border-red-500/20',
      msg: 'Detectamos que podés estar atravesando dificultades, tu tutor se va a comunicar con vos pronto.',
      accent: 'ring-red-500/30'
    },
    critico: {
      label: 'Rojo',
      color: '#DC2626',
      badge: 'bg-red-600/20 text-red-300 border border-red-600/30',
      msg: 'Estamos acá para ayudarte, podés pedir asistencia ahora.',
      accent: 'ring-red-600/40'
    }
  };

  const riskLevel = ultimoScore?.nivel_riesgo || 'bajo';
  const levelInfo = scoreMap[riskLevel] ?? scoreMap.bajo;

  // scoreValue is kept for backward compatibility; the student view no longer renders the numeric score.
  const scoreValue = ultimoScore?.valor != null ? Math.round(Number(ultimoScore.valor)) : 0;
  void scoreValue;

  // Qualitative indicator — full ring, colored by level, no magnitude encoded
  const data = [{ name: 'Progress', value: 100, fill: levelInfo.color }];

  // Icon resolution by risk level (no numeric score shown to the student)
  const LevelIcon = riskLevel === 'critico' ? AlertOctagon : riskLevel === 'bajo' ? CheckCircle : AlertTriangle;

  const isAltoRiesgo = riskLevel === 'alto' || riskLevel === 'critico';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-white tracking-tight">
          Hola, {perfil?.nombre?.split(' ')[0] || 'Estudiante'} 👋
        </h1>
        <p className="text-sm text-slate-500 font-sans mt-2">Este es el resumen de tu proceso en Travesía.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score Card */}
        <div className="lg:col-span-2 bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle className="w-32 h-32 text-white" />
          </div>
          
          <div
            className="w-32 h-32 md:w-40 md:h-40 shrink-0 relative"
            role="img"
            aria-label={`Nivel de ritmo: ${levelInfo.label}`}
          >
             <ResponsiveContainer width="100%" height="100%" aria-hidden="true">
              <RadialBarChart
                cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                barSize={12} data={data} startAngle={90} endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: '#374151' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
              <LevelIcon className="w-10 h-10 md:w-12 md:h-12" style={{ color: levelInfo.color }} />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left z-10">
            <h2 className="text-xl font-semibold text-white mb-2">Tu Estado Actual</h2>
            <span className={cn("inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold mb-4 gap-2", levelInfo.badge)}>
              Nivel de Ritmo: {levelInfo.label}
            </span>
            <p className="text-slate-300 leading-relaxed text-sm font-sans">
              {levelInfo.msg}
            </p>
          </div>
        </div>

        {/* Encuestas y Ayuda */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 flex-1 flex flex-col backdrop-blur-md">
            <h3 className="text-sm font-semibold text-white flex items-center mb-4">
              <FileText className="w-4 h-4 text-blue-400 mr-2" />
              Tareas Pendientes
            </h3>
            
            {!perfil?.estudiantes?.encuesta_inicial_completada && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-300 text-sm">Encuesta Inicial</h4>
                  <div className="text-xs text-amber-400/70 font-sans">Requerida para iniciar.</div>
                </div>
                <button 
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-sans" 
                  onClick={() => navigate('/encuestas')}
                >
                  Completar
                </button>
              </div>
            )}
            
            {perfil?.estudiantes?.encuesta_inicial_completada && (
              <div className="flex flex-col items-center justify-center py-6 text-slate-600">
                <CheckCircle className="w-6 h-6 mb-2 text-green-500/50" />
                <span className="text-xs font-sans">No hay tareas pendientes</span>
              </div>
            )}
          </div>
          
          {/* Help button — prominent when alto/crítico */}
          <button 
            onClick={handleHelp}
            disabled={hasPendingHelp || helpSubmitting}
            className={cn(
              "h-auto py-4 rounded-xl border-none outline-none group relative overflow-hidden w-full transition-all text-left flex items-start gap-4 ring-1",
              hasPendingHelp
                ? "bg-slate-500/10 text-slate-500 ring-slate-500/20 cursor-not-allowed"
                : isAltoRiesgo
                  ? "bg-red-500/15 hover:bg-red-500/25 text-red-300 ring-2 ring-red-500/40 animate-pulse"
                  : "bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 ring-teal-500/30"
            )}
          >
            <div className={cn(
              "p-3 rounded-full shrink-0 transition-transform",
              hasPendingHelp ? "bg-slate-500/20" : isAltoRiesgo ? "bg-red-500/25 group-hover:scale-110" : "bg-teal-500/20 group-hover:scale-110"
            )}>
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg mb-1">
                {hasPendingHelp ? 'Solicitud Enviada' : isAltoRiesgo ? 'Pedir Ayuda Ahora' : 'Pedir Ayuda'}
              </div>
              <div className="text-sm font-normal font-sans" style={{ opacity: 0.8 }}>
                {hasPendingHelp
                  ? 'Ya tenés una solicitud pendiente. Tu tutor fue notificado.'
                  : isAltoRiesgo
                    ? 'Tu tutor fue notificado y se pondrá en contacto pronto.'
                    : 'Notificar a tu tutor que necesitás contactarte.'}
              </div>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
