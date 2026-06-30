-- Tabla de configuración general del sistema.
-- Almacena pares clave-valor para umbrales de score, parámetros, etc.

CREATE TABLE public.configuracion (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clave text UNIQUE NOT NULL,
  valor text NOT NULL,
  descripcion text
);

ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- Permisos base
GRANT SELECT ON public.configuracion TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracion TO service_role;

-- RLS: todos los autenticados pueden leer
CREATE POLICY "Authenticated can read configuracion"
  ON public.configuracion FOR SELECT
  TO authenticated
  USING (true);

-- RLS: solo admin puede escribir
CREATE POLICY "Admin can insert configuracion"
  ON public.configuracion FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update configuracion"
  ON public.configuracion FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete configuracion"
  ON public.configuracion FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Seed: umbrales de score por defecto
INSERT INTO public.configuracion (clave, valor, descripcion) VALUES
  ('umbral_verde', '30', 'Score máximo para nivel bajo (verde)'),
  ('umbral_amarillo', '55', 'Score máximo para nivel medio (amarillo)'),
  ('umbral_naranja', '80', 'Score máximo para nivel alto (naranja)');
