import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Carrera {
  id: string;
  nombre: string;
  codigo: string;
}

interface CareerContextValue {
  carreraId: string | null;
  setCarreraId: (id: string) => void;
  carreras: Carrera[];
  loading: boolean;
}

const CareerContext = createContext<CareerContextValue | undefined>(undefined);

export const CareerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [carreraId, setCarreraId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => {
    // Wait until auth session is ready. For roles like docente,
    // the RLS policies on estudiantes depend on auth.uid().
    if (!usuario) return;

    async function fetchCarreras() {
      try {
        // Fetch careers ordered by name and student carrera_ids in parallel.
        // We auto-select the first career that has at least one student,
        // so the admin dashboard never lands on an empty career.
        const [{ data: carrerasData, error: carrerasError }, { data: conEstudiantes }] =
          await Promise.all([
            supabase
              .from('carreras')
              .select('id, nombre, codigo')
              .order('nombre'),
            supabase
              .from('estudiantes')
              .select('carrera_id')
              .not('carrera_id', 'is', null),
          ]);

        if (carrerasError) throw carrerasError;

        const list = (carrerasData ?? []) as Carrera[];
        setCarreras(list);

        const carrerasConDatos = new Set(
          (conEstudiantes ?? [])
            .map((e: { carrera_id: string | null }) => e.carrera_id)
            .filter((id): id is string => Boolean(id))
        );
        const firstWithData = list.find(c => carrerasConDatos.has(c.id));
        const fallback = firstWithData ?? list[0] ?? null;

        if (!carreraId && fallback) {
          setCarreraId(fallback.id);
        }
      } catch {
        // silently handle — selector will show empty
      } finally {
        setLoading(false);
      }
    }

    fetchCarreras();
  }, [usuario]);

  const handleSetCarreraId = useCallback((id: string) => {
    setCarreraId(id);
  }, []);

  return (
    <CareerContext.Provider value={{ carreraId, setCarreraId: handleSetCarreraId, carreras, loading }}>
      {children}
    </CareerContext.Provider>
  );
};

export const useCareer = (): CareerContextValue => {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error('useCareer must be used within a CareerProvider');
  }
  return context;
};
