import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import { useAlertas } from '../../hooks/useAlertas';
import { useEntrevistas } from '../../hooks/useEntrevistas';
import { Users, AlertTriangle, MessageCircle, FileText, Loader2, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { InterviewForm } from '../ui/InterviewForm';

interface StudentScore {
  valor: number;
  nivel_riesgo: string;
}

export const DashTutor = () => {
  const { usuario, rol } = useAuth();
  const { estudiantes: myStudents, loading: estLoading } = useEstudiantes(usuario?.id || '', rol || '');
  const { alertas } = useAlertas(usuario?.id || '', rol);
  const { entrevistas, crearEntrevista } = useEntrevistas(usuario?.id || '', rol || '');

  const [selectedStudent, setSelectedStudent] = useState<import('../../hooks/useEstudiantes').EstudianteRow | null>(null);
  const [studentScores, setStudentScores] = useState<Record<string, StudentScore>>({});
  const [scoresLoading, setScoresLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [preselectedStudent, setPreselectedStudent] = useState<string | undefined>();

  // Count pending entrevistas
  const entrevistasPendientes = useMemo(
    () => entrevistas.filter(e => e.seguimiento_requerido).length,
    [entrevistas]
  );

  // Batch fetch scores for all tutor's students
  useEffect(() => {
    const fetchScores = async () => {
      if (!myStudents.length) {
        setScoresLoading(false);
        return;
      }
      setScoresLoading(true);
      try {
        const ids = myStudents.map((s) => s.id).filter(Boolean);
        if (ids.length === 0) {
          setScoresLoading(false);
          return;
        }

        const { data: scoresData } = await supabase
          .from('scores')
          .select('estudiante_id, valor, nivel_riesgo, calculado_at')
          .in('estudiante_id', ids)
          .order('calculado_at', { ascending: false });

        const scoreMap: Record<string, StudentScore> = {};
        for (const s of scoresData ?? []) {
          if (!scoreMap[s.estudiante_id]) {
            scoreMap[s.estudiante_id] = { valor: s.valor, nivel_riesgo: s.nivel_riesgo };
          }
        }
        setStudentScores(scoreMap);
      } catch (err) {
        console.error('Error fetching tutor scores:', err);
      } finally {
        setScoresLoading(false);
      }
    };

    fetchScores();
  }, [myStudents]);

  const formatScore = (nivelRiesgo: string | undefined) => {
    switch(nivelRiesgo) {
      case 'bajo': return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Vigoroso</span>;
      case 'medio': return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Moderado</span>;
      case 'alto': return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">Alto Riesgo</span>;
      case 'critico': return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Crítico</span>;
      default: return <span className="text-slate-600 text-xs">Sin score</span>;
    }
  };

  const studentOptions = useMemo(() =>
    myStudents.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      apellido: s.apellido,
      nivel_riesgo: s.nivel_riesgo,
    })),
    [myStudents]
  );

  const handleOpenForm = (student?: import('../../hooks/useEstudiantes').EstudianteRow) => {
    if (student) {
      setSelectedStudent(student);
      setPreselectedStudent(student.id);
    }
    setFormOpen(true);
  };

  if (estLoading || scoresLoading) {
    return (
      <div className="text-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <span className="text-sm text-slate-400">Cargando alumnos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            Mis Alumnos a Cargo
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-2">
            Monitoreo y seguimiento de cohortes asignadas.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl px-5 py-3 backdrop-blur-md text-center">
            <div className="text-xs text-slate-500 font-sans">Total Alumnos</div>
            <div className="font-display text-2xl font-bold text-blue-400">{myStudents.length}</div>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl px-5 py-3 backdrop-blur-md text-center">
            <div className="text-xs text-slate-500 font-sans flex items-center gap-1"><Calendar className="w-3 h-3" /> Entrevistas Pendientes</div>
            <div className={cn("font-display text-2xl font-bold", entrevistasPendientes > 0 ? "text-amber-400" : "text-slate-600")}>
              {entrevistasPendientes}
            </div>
          </div>
        </div>
      </header>

      {/* Tabla de Alumnos */}
      <div className="bg-white/[0.04] rounded-2xl border border-white/[0.07] backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Alumno</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Score (Riesgo)</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Perfil Silencioso</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Ayuda</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {myStudents.map(student => {
                const scoreData = studentScores[student.id];
                const score = scoreData?.valor ?? null;
                const riskLevel = scoreData?.nivel_riesgo ?? null;
                const needsHelp = alertas.some((a: Record<string, unknown>) => a.estudiante_id === student.id && a.tipo === 'solicitud_ayuda');
                const isSilentProfile = riskLevel === 'alto' || riskLevel === 'critico';

                return (
                <tr key={student.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-200">{student.nombre} {student.apellido}</div>
                    <div className="text-xs text-slate-500 font-mono">{student.legajo || 'Sin Legajo'}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {formatScore(riskLevel ?? undefined)}
                      {score !== null && (
                        <span className="text-xs font-mono bg-white/[0.04] px-2 py-1 rounded text-slate-400">{Math.round(score)}/100</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {isSilentProfile ? (
                      <span className="flex items-center text-amber-400 gap-1 text-xs">
                        <AlertTriangle className="w-4 h-4" /> Sí
                      </span>
                    ) : <span className="text-slate-600 text-xs">No</span>}
                  </td>
                  <td className="px-5 py-3">
                    {needsHelp ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                        <MessageCircle className="w-3 h-3" /> Solicitó
                      </span>
                    ) : <span className="text-slate-600 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      onClick={() => handleOpenForm(student)}
                    >
                      Detalles / Intervención
                    </button>
                  </td>
                </tr>
              )})}
              {myStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-600">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-sans">No tienes alumnos asignados.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared InterviewForm modal */}
      <InterviewForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setSelectedStudent(null); setPreselectedStudent(undefined); }}
        onSuccess={() => {}}
        estudiantes={studentOptions}
        estudianteIdPreseleccionado={preselectedStudent}
        tutorId={usuario?.id || ''}
        onSubmit={crearEntrevista}
      />
    </div>
  );
};
