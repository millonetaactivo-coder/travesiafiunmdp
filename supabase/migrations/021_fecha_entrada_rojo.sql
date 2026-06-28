-- Agregar columna fecha_entrada_rojo a la tabla scores.
-- Registra el primer momento en que un estudiante alcanza nivel alto/crítico (score >= 81).
-- Nullable: solo se setea una vez, nunca se sobreescribe.

ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS fecha_entrada_rojo timestamptz;

-- Permisos para authenticated (INSERT ya cubierto por policy existente)
GRANT SELECT ON public.scores TO authenticated;
