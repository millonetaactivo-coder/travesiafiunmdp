import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePlan } from '../../hooks/usePlan';
import { useCareer } from '../../context/CareerContext';
import { getRolUsuario } from '../../services/authService';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap } from 'lucide-react';

export const MateriasPage = () => {
  const { usuario, rol } = useAuth();
  const { carreraId: contextCarreraId } = useCareer();
  const [explicitCarreraId, setExplicitCarreraId] = useState<string | undefined>();

  useEffect(() => {
    if (!usuario?.id) return;
    getRolUsuario(usuario.id).then(({ data }) => {
      if (data?.carrera_id) setExplicitCarreraId(data.carrera_id);
    });
  }, [usuario?.id]);

  // Prefer explicit carrera from roles, fall back to CareerContext auto-selection
  const carreraId = useMemo(
    () => explicitCarreraId ?? contextCarreraId ?? undefined,
    [explicitCarreraId, contextCarreraId]
  );

  const { plan, loading } = usePlan(carreraId);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            Materias
          </h1>
        </header>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 mt-3">Cargando plan de estudios...</span>
        </div>
      </div>
    );
  }

  // Flatten plan into materia list
  const materias = plan.flatMap((entry: any) => {
    const mats = Array.isArray(entry.materias) ? entry.materias : [entry.materias];
    return (mats || []).map((m: any) => ({
      ...m,
      anio: entry.anio_teorico,
      cuatrimestre: entry.cuatrimestre,
      tipo: entry.tipo,
      es_critica: entry.es_critica,
    }));
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            Materias
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-2">
            {materias.length} materia{materias.length !== 1 ? 's' : ''} en el plan de estudios
          </p>
        </div>
      </header>

      {materias.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-12 backdrop-blur-md text-center"
        >
          <GraduationCap className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-sans text-sm">
            {carreraId
              ? 'No hay materias cargadas en el plan de estudios.'
              : 'No se encontró carrera asignada.'}
          </p>
        </motion.div>
      )}

      {materias.length > 0 && (
        <div className="space-y-2">
          {materias.map((materia: any, i: number) => (
            <motion.div
              key={materia.id || i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-md hover:border-white/[0.12] transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-400/10 shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white font-sans truncate">
                      {materia.nombre || 'Sin nombre'}
                    </p>
                    <p className="text-xs text-slate-500 font-sans">
                      {materia.codigo || '—'} · Año {materia.anio}° · Cuat. {materia.cuatrimestre}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {materia.es_critica && (
                    <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-red-400/10 text-red-400">
                      Crítica
                    </span>
                  )}
                  {materia.tipo && (
                    <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 capitalize">
                      {materia.tipo}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
