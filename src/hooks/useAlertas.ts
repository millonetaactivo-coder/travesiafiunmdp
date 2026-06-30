import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getAlertasPendientes, getAlertas, resolverAlerta as resolverAlertaService, reassignAlerta } from '../services/alertasService';

export type FilterStatus = 'todas' | 'pendiente' | 'resuelta';

export const useAlertas = (tutorId: string, role?: string) => {
  const [alertas, setAlertas] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('todas');

  useEffect(() => {
    const fetchAlertas = async () => {
      setLoading(true);
      try {
        if (role === 'admin') {
          const { data, error: fetchError } = await getAlertas();
          if (fetchError) setError(fetchError.message);
          else setAlertas((data ?? []) as Record<string, unknown>[]);
        } else {
          const { data, error: fetchError } = await getAlertas(tutorId);
          if (fetchError) setError(fetchError.message);
          else setAlertas((data ?? []) as Record<string, unknown>[]);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (tutorId) fetchAlertas();
  }, [tutorId, role]);

  // Realtime subscription — only for tutors, not admin.
  // supabase.channel(name) internally caches channels; React StrictMode
  // double-mount may cause the second .channel() call to return an
  // already-subscribed instance, making .on() throw. We wrap in try-catch:
  // if the channel survives the cleanup, great; if not, we skip silently.
  useEffect(() => {
    if (!tutorId || role === 'admin') return;

    try {
      const channel = supabase
        .channel(`alertas-tutor-${tutorId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'alertas',
          filter: `tutor_id=eq.${tutorId}`
        }, (payload) => {
          setAlertas(prev => [payload.new as Record<string, unknown>, ...prev]);
        })
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('Realtime subscription error for alertas');
          }
        });

      return () => {
        supabase.removeChannel(channel).catch(() => {});
      };
    } catch {
      // StrictMode double-mount: channel already subscribed from previous
      // effect cycle. The first subscription is still active — no-op.
    }
  }, [tutorId, role]);

  const resolver = useCallback(async (alertaId: string, resueltaPor: string) => {
    const { error: resolveError } = await resolverAlertaService(alertaId, resueltaPor);
    if (resolveError) throw resolveError;
    setAlertas(prev =>
      prev.map(a => a.id === alertaId ? { ...a, estado: 'resuelta' } : a)
    );
  }, []);

  const reasignar = useCallback(async (alertaId: string, newTutorId: string) => {
    const { error: reassignError } = await reassignAlerta(alertaId, newTutorId);
    if (reassignError) throw reassignError;
    setAlertas(prev =>
      prev.map(a => a.id === alertaId ? { ...a, tutor_id: newTutorId } : a)
    );
  }, []);

  return {
    alertas,
    loading,
    error,
    selectedStatus,
    setSelectedStatus,
    resolver,
    reasignar,
  };
};
