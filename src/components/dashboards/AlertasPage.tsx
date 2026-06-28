import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAlertas, type FilterStatus } from '../../hooks/useAlertas';
import { useTutores } from '../../hooks/useTutores';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock, AlertTriangle, Filter, UserPlus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatAlertType, formatAlertStatus, daysSince, formatDate } from '../../lib/formatters';

export const AlertasPage = () => {
  const { usuario, rol } = useAuth();
  const isAdmin = rol === 'admin';
  const { alertas, loading, error, selectedStatus, setSelectedStatus, resolver, reasignar } =
    useAlertas(usuario?.id || '', rol || undefined);
  const { tutores } = useTutores();
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Close reassign dropdown on outside click
  useEffect(() => {
    if (!reassigningId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = btnRefs.current[reassigningId];
      if (btn && !btn.contains(target) && !target.closest('[data-reassign-dropdown]')) {
        setReassigningId(null);
        setDropdownPos(null);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReassigningId(null);
        setDropdownPos(null);
      }
    };
    document.addEventListener('click', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [reassigningId]);

  const filtered = useMemo(() => {
    if (selectedStatus === 'todas') return alertas;
    return alertas.filter((a) => a.estado === selectedStatus);
  }, [alertas, selectedStatus]);

  const pendientesCount = alertas.filter((a) => a.estado === 'pendiente').length;
  const resueltasCount = alertas.filter((a) => a.estado === 'resuelta').length;

  const handleResolver = async (alertaId: string) => {
    if (!usuario?.id) return;
    try {
      await resolver(alertaId, usuario.id);
    } catch {
      // error handled by optimistic update reverting
    }
  };

  const handleReasignar = async (alertaId: string, tutorId: string) => {
    try {
      await reasignar(alertaId, tutorId);
      setReassigningId(null);
    } catch {
      // error handled silently
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            Alertas
          </h1>
        </header>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 mt-3">Cargando alertas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            Alertas
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
            <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            Alertas
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-2">
            {isAdmin ? 'Vista general de todas las alertas' : `${pendientesCount} pendiente${pendientesCount !== 1 ? 's' : ''} · ${resueltasCount} resuelta${resueltasCount !== 1 ? 's' : ''}`}
          </p>
        </div>
      </header>

      {/* Filter tabs — glass pill pattern */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2"
      >
        {([
          { key: 'todas' as FilterStatus, label: 'Todas', count: alertas.length },
          { key: 'pendiente' as FilterStatus, label: 'Pendientes', count: pendientesCount },
          { key: 'resuelta' as FilterStatus, label: 'Resueltas', count: resueltasCount },
        ]).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setSelectedStatus(key)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-sans font-medium transition-all duration-200 backdrop-blur-md border',
              selectedStatus === key
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'bg-white/[0.04] text-slate-500 border-white/[0.07] hover:bg-white/[0.08] hover:text-slate-400'
            )}
          >
            {label}
            <span className={cn(
              'ml-1.5 px-1.5 py-0.5 rounded-md text-[10px]',
              selectedStatus === key ? 'bg-blue-500/20 text-blue-300' : 'bg-white/[0.06] text-slate-600'
            )}>
              {count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Empty state — no alerts at all */}
      {alertas.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-12 backdrop-blur-md text-center"
        >
          <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-sans text-sm">No hay alertas registradas.</p>
        </motion.div>
      )}

      {/* Empty state — filtered results */}
      {alertas.length > 0 && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-8 backdrop-blur-md text-center"
        >
          <Filter className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 text-sm font-sans">
            No hay alertas {selectedStatus === 'pendiente' ? 'pendientes' : 'resueltas'}.
          </p>
        </motion.div>
      )}

      {/* Alert list */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 && (
          <motion.div
            key={selectedStatus}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            {filtered.map((alerta, i) => {
              const usuarioData = alerta.usuarios as Record<string, unknown> | null;
              const studentName = usuarioData
                ? `${(usuarioData.nombre as string) || ''} ${(usuarioData.apellido as string) || ''}`.trim()
                : 'Estudiante';
              const tipo = (alerta.tipo as string) || '';
              const descripcion = (alerta.descripcion as string) || '';
              const created = (alerta.created_at as string) || '';
              const estado = (alerta.estado as string) || 'pendiente';
              const alertId = alerta.id as string;

              return (
                <motion.div
                  key={alertId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-md hover:border-white/[0.12] transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                        estado === 'pendiente' ? 'bg-amber-400/10' : 'bg-teal-400/10'
                      )}>
                        {estado === 'pendiente'
                          ? <AlertTriangle className="w-4 h-4 text-amber-400" />
                          : <CheckCircle className="w-4 h-4 text-teal-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white font-sans truncate">
                          {studentName}
                        </p>
                        <p className="text-xs text-slate-500 font-sans truncate">
                          {formatAlertType(tipo)} · {descripcion || 'Sin descripción'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600 font-sans">
                          <Clock className="w-3 h-3" />
                          <span>{created ? formatDate(created) : '—'}</span>
                          {created && (
                            <span className="text-slate-700">
                              · hace {daysSince(created)} día{daysSince(created) !== 1 ? 's' : ''}
                            </span>
                          )}
                          <span className={cn(
                            'px-1.5 py-0.5 rounded-md text-[10px] font-medium',
                            estado === 'pendiente'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          )}>
                            {formatAlertStatus(estado)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Reassign dropdown — admin only, on pending alerts */}
                      {isAdmin && estado === 'pendiente' && (
                        <>
                          <button
                            ref={(el) => { btnRefs.current[alertId] = el; }}
                            onClick={() => {
                              if (reassigningId === alertId) {
                                setReassigningId(null);
                                setDropdownPos(null);
                              } else {
                                const rect = btnRefs.current[alertId]?.getBoundingClientRect();
                                if (rect) {
                                  setDropdownPos({ top: rect.bottom + 4, left: rect.right - 200 });
                                }
                                setReassigningId(alertId);
                              }
                            }}
                            className="p-1.5 bg-white/[0.04] border border-white/[0.07] rounded-lg text-slate-500 hover:text-blue-400 hover:border-blue-500/20 transition-colors"
                            title="Reasignar tutor"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>
                          {reassigningId === alertId && dropdownPos && createPortal(
                            <AnimatePresence>
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                className="fixed z-[9999] bg-[#0F1B2D] border border-white/[0.1] rounded-xl p-2 shadow-xl shadow-black/40 min-w-[200px]"
                                data-reassign-dropdown
                                style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}
                              >
                                <p className="text-[10px] text-slate-600 uppercase tracking-wider px-2 mb-1 font-sans">
                                  Reasignar a
                                </p>
                                {tutores.map((t) => (
                                  <button
                                    key={t.id}
                                    onClick={() => handleReasignar(alertId, t.id)}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.06] rounded-lg transition-colors font-sans"
                                  >
                                    {t.nombre} {t.apellido}
                                  </button>
                                ))}
                              </motion.div>
                            </AnimatePresence>,
                            document.body
                          )}
                        </>
                      )}

                      {/* Resolve button — pending alerts only */}
                      {estado === 'pendiente' && (
                        <button
                          onClick={() => handleResolver(alertId)}
                          className="px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-lg text-xs font-semibold hover:bg-teal-500/20 transition-colors"
                        >
                          Resolver
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
