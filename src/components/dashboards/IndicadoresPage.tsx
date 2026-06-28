import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Save, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/moving-border';
import {
  getIndicadores,
  updateIndicador,
  updateComponente,
  type Indicador,
  type IndicadorComponente,
} from '../../services/indicadoresService';

export const IndicadoresPage = () => {
  const { rol, loading: authLoading } = useAuth();
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Local edit state
  const [editPesos, setEditPesos] = useState<Record<string, number>>({});
  const [editDescripciones, setEditDescripciones] = useState<Record<string, string>>({});
  const [editCompPesos, setEditCompPesos] = useState<Record<string, number>>({});
  const [editCompFormulas, setEditCompFormulas] = useState<Record<string, string>>({});

  const isAdmin = rol === 'admin';

  useEffect(() => {
    if (authLoading) return;
    fetchIndicadores();
  }, [authLoading]);

  const fetchIndicadores = async () => {
    setLoading(true);
    const { data, error } = await getIndicadores();
    if (error) {
      toast.error('Error al cargar indicadores');
    } else {
      setIndicadores(data);
      // Initialize edit state
      const pesos: Record<string, number> = {};
      const descs: Record<string, string> = {};
      const compPesos: Record<string, number> = {};
      const compFormulas: Record<string, string> = {};
      for (const ind of data) {
        pesos[ind.id] = ind.peso;
        descs[ind.id] = ind.descripcion ?? '';
        for (const comp of ind.componentes) {
          compPesos[comp.id] = comp.peso;
          compFormulas[comp.id] = comp.formula ?? '';
        }
      }
      setEditPesos(pesos);
      setEditDescripciones(descs);
      setEditCompPesos(compPesos);
      setEditCompFormulas(compFormulas);
    }
    setLoading(false);
  };

  const activeSum = indicadores.reduce(
    (acc, ind) => acc + (ind.activo ? (editPesos[ind.id] ?? ind.peso) : 0),
    0
  );
  const isValidSum = activeSum === 100;

  const handleSave = async () => {
    if (!isValidSum) {
      toast.error('La suma de pesos activos debe ser 100%');
      return;
    }

    setSaving(true);
    try {
      // Update indicadores
      for (const ind of indicadores) {
        const peso = editPesos[ind.id] ?? ind.peso;
        const descripcion = editDescripciones[ind.id] ?? ind.descripcion ?? '';
        if (peso !== ind.peso || descripcion !== (ind.descripcion ?? '')) {
          const { error } = await updateIndicador(ind.id, { peso, descripcion });
          if (error) throw error;
        }
      }

      // Update componentes
      for (const ind of indicadores) {
        for (const comp of ind.componentes) {
          const peso = editCompPesos[comp.id] ?? comp.peso;
          const formula = editCompFormulas[comp.id] ?? comp.formula ?? '';
          if (peso !== comp.peso || formula !== (comp.formula ?? '')) {
            const { error } = await updateComponente(comp.id, { peso, formula });
            if (error) throw error;
          }
        }
      }

      toast.success('Configuración guardada correctamente');
      fetchIndicadores(); // Refresh
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <BarChart2 className="w-5 h-5 text-blue-400" />
            </div>
            Indicadores
          </h1>
        </header>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 mt-3">Cargando indicadores...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <BarChart2 className="w-5 h-5 text-blue-400" />
            </div>
            Indicadores
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-2">
            Configurar pesos del motor de scoring de riesgo.
          </p>
        </div>
        {isAdmin && (
          <div className="shrink-0 flex flex-col items-end gap-2">
            <Button
              onClick={handleSave}
              disabled={saving || !isValidSum}
              borderRadius="0.5rem"
              duration={2500}
              containerClassName="h-10 w-auto text-white flex items-center"
              className="px-4 py-2 text-sm font-medium text-white bg-[#0F1B2D]/90 flex items-center gap-2 whitespace-nowrap"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
              ) : (
                <Save className="w-4 h-4 text-teal-400" />
              )}{' '}
              Guardar Cambios
            </Button>
            {!isValidSum && (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Los pesos activos suman {activeSum}%, deben ser 100%.
              </span>
            )}
          </div>
        )}
      </header>

      {indicadores.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-12 backdrop-blur-md text-center"
        >
          <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-sans text-sm">
            No se encontraron indicadores en la base de datos.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {indicadores.map((ind, i) => {
            const isExpanded = expandedId === ind.id;
            const indPeso = editPesos[ind.id] ?? ind.peso;

            return (
              <motion.div
                key={ind.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white/[0.04] border border-white/[0.07] rounded-2xl backdrop-blur-md overflow-hidden"
              >
                {/* Indicador header */}
                <div
                  className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : ind.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-slate-200 font-display font-medium">{ind.nombre}</h3>
                        {ind.activo ? (
                          <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 rounded-md text-[10px] uppercase font-bold tracking-wider border border-teal-500/20">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-500/10 text-slate-400 rounded-md text-[10px] uppercase font-bold tracking-wider border border-slate-500/20">
                            Inactivo
                          </span>
                        )}
                      </div>
                      {isAdmin ? (
                        <input
                          type="text"
                          value={editDescripciones[ind.id] ?? ''}
                          onChange={(e) =>
                            setEditDescripciones((prev) => ({ ...prev, [ind.id]: e.target.value }))
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-transparent border-none text-xs text-slate-500 font-sans focus:outline-none placeholder-slate-600"
                          placeholder="Descripción del indicador..."
                        />
                      ) : (
                        <p className="text-xs text-slate-500 font-sans leading-relaxed">
                          {ind.descripcion || 'Sin descripción'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isAdmin ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={indPeso === 0 ? '' : indPeso}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setEditPesos((prev) => ({
                                ...prev,
                                [ind.id]: isNaN(val) ? 0 : val,
                              }));
                            }}
                            className="w-14 bg-white/[0.03] border border-white/[0.1] rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500/50 text-right font-mono text-sm"
                          />
                          <span className="text-slate-500 font-mono text-sm">%</span>
                        </div>
                      ) : (
                        <span className="font-mono text-sm text-slate-300">{indPeso}%</span>
                      )}

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Componentes (expandable) */}
                <AnimatePresence>
                  {isExpanded && ind.componentes.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/[0.05]"
                    >
                      <div className="p-4 space-y-2">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 mb-2">
                          Componentes
                        </p>
                        {ind.componentes.map((comp) => (
                          <div
                            key={comp.id}
                            className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-300 font-sans">
                                {comp.nombre}
                              </p>
                              {isAdmin ? (
                                <input
                                  type="text"
                                  value={editCompFormulas[comp.id] ?? ''}
                                  onChange={(e) =>
                                    setEditCompFormulas((prev) => ({
                                      ...prev,
                                      [comp.id]: e.target.value,
                                    }))
                                  }
                                  className="w-full bg-transparent border-none text-[11px] text-slate-500 font-mono focus:outline-none placeholder-slate-600 mt-1"
                                  placeholder="Fórmula..."
                                />
                              ) : (
                                <p className="text-[11px] text-slate-500 font-mono mt-1">
                                  {comp.formula || '—'}
                                </p>
                              )}
                            </div>
                            {isAdmin ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={editCompPesos[comp.id] ?? comp.peso}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setEditCompPesos((prev) => ({
                                      ...prev,
                                      [comp.id]: isNaN(val) ? 0 : val,
                                    }));
                                  }}
                                  className="w-12 bg-white/[0.03] border border-white/[0.1] rounded px-1.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500/50 text-right font-mono text-[11px]"
                                />
                                <span className="text-slate-600 font-mono text-[11px]">%</span>
                              </div>
                            ) : (
                              <span className="font-mono text-[11px] text-slate-400 shrink-0">
                                {comp.peso}%
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Sum footer */}
      {indicadores.length > 0 && (
        <div className="flex justify-end">
          <div className="flex items-center gap-4 text-sm bg-white/[0.04] border border-white/[0.07] px-6 py-3 rounded-xl">
            <span className="text-slate-400 font-sans">Suma Total:</span>
            <span
              className={`font-mono font-bold text-lg ${isValidSum ? 'text-teal-400' : 'text-amber-400'}`}
            >
              {activeSum}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
