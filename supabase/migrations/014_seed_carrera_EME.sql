-- =========================================================================
-- Migration 014: Seed Carrera — Ingeniería Electromecánica (EME) Plan 2024
-- =========================================================================
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Source: docs/planesdeestudio.md
-- Synthetic codes: INGEME01–INGEME05 (Electromecánica-specific subjects)
-- Shared codes reused: INGELE01–INGELE24 (from Eléctrica), ING22xx (Mecánica)
-- =========================================================================

-- 1. MATERIAS — Ingeniería Electromecánica Plan 2024 (~50 subjects)
-- -------------------------------------------------------------------------
INSERT INTO public.materias (carrera_id, nombre, codigo, creditos) VALUES

  -- Primer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Análisis Matemático I', 'INGM101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Álgebra I-A', 'INGM104', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Sistemas de Representación para Ingeniería', 'INGELE01', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Fundamentos de Química', 'ING1103', 4),

  -- Primer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Análisis Matemático II', 'INGM102', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Álgebra II', 'INGM106', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Física A', 'INGF101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Fundamentos de la Programación', 'ING6101', 4),

  -- Segundo año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Análisis Matemático III', 'INGM103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Física B-I', 'INGF102', 8),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Probabilidad y Estadística', 'INGM108', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Inglés I', 'ING8408', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Estática I', 'ING2207', 5),

  -- Segundo año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Física C-I', 'INGF104', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Electrotecnia A', 'INGELE03', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Introducción a la Termodinámica', 'INGELE04', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Estática II', 'ING2208', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Inglés II', 'ING8409', 3),

  -- Tercer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Electrotecnia B', 'INGELE05', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Mediciones Eléctricas A', 'INGELE06', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Automatización A', 'INGELE07', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Introducción a la Mecánica del Continuo', 'ING2209', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Materiales Estructurales', 'INGEME01', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Economía para Ingeniería', 'ING8403', 4),

  -- Tercer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Máquinas Eléctricas A', 'INGELE09', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Mediciones Eléctricas B', 'INGELE10', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Tecnología CAD Aplicada', 'INGELE11', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Principios de Electrónica', 'INGELE12', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Fluidos y Máquinas Fluidodinámicas', 'ING2213', 6),

  -- Cuarto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Máquinas Eléctricas B', 'INGELE14', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Materiales Electrotécnicos', 'INGELE15', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Mecánica de la Partícula y Cuerpo Rígido', 'ING2202', 7),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Instalaciones Eléctricas A', 'INGELE16', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Organización Empresarial', 'ING8411', 4),

  -- Cuarto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Instalaciones Eléctricas B', 'INGELE18', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Electrónica de Potencia I', 'INGELE20', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Seguridad y Salud Ocupacional', 'ING8412', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Sistemas de Gestión Integrados', 'ING8413', 4),

  -- Quinto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Ética y Legislación', 'ING8405', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Componentes de los Sistemas Eléctricos de Potencia', 'INGEME02', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Transferencia y Tecnología del Calor', 'ING2304', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Introducción a la Metrología y Fabricación', 'INGEME03', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Formulación y Evaluación de Proyectos', 'ING8406', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Mantenimiento Industrial', 'ING2302', 3),

  -- Quinto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Procesos de Fabricación', 'INGEME04', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Control I', 'INGELE24', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Elementos de Máquinas', 'ING2301', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'EME'), 'Proyecto Final', 'INGEME05', 10)

ON CONFLICT (carrera_id, codigo) DO NOTHING;

-- -------------------------------------------------------------------------
-- 2. PLAN DE ESTUDIOS — link materias to carrera with year/semester
-- -------------------------------------------------------------------------
INSERT INTO public.plan_estudios (carrera_id, materia_id, anio_teorico, cuatrimestre, tipo, es_critica)
SELECT c.id, m.id, v.anio, v.cuat, v.tipo, false
FROM public.carreras c
CROSS JOIN (VALUES
  -- 1er año, 1er cuat
  ('INGM101', 1, 1, 'obligatoria'),
  ('INGM104', 1, 1, 'obligatoria'),
  ('INGELE01', 1, 1, 'obligatoria'),
  ('ING1103', 1, 1, 'obligatoria'),
  -- 1er año, 2do cuat
  ('INGM102', 1, 2, 'obligatoria'),
  ('INGM106', 1, 2, 'obligatoria'),
  ('INGF101', 1, 2, 'obligatoria'),
  ('ING6101', 1, 2, 'obligatoria'),
  -- 2do año, 1er cuat
  ('INGM103', 2, 1, 'obligatoria'),
  ('INGF102', 2, 1, 'obligatoria'),
  ('INGM108', 2, 1, 'obligatoria'),
  ('ING8408', 2, 1, 'obligatoria'),
  ('ING2207', 2, 1, 'obligatoria'),
  -- 2do año, 2do cuat
  ('INGF104', 2, 2, 'obligatoria'),
  ('INGELE03', 2, 2, 'obligatoria'),
  ('INGELE04', 2, 2, 'obligatoria'),
  ('ING2208', 2, 2, 'obligatoria'),
  ('ING8409', 2, 2, 'obligatoria'),
  -- 3er año, 1er cuat
  ('INGELE05', 3, 1, 'obligatoria'),
  ('INGELE06', 3, 1, 'obligatoria'),
  ('INGELE07', 3, 1, 'obligatoria'),
  ('ING2209', 3, 1, 'obligatoria'),
  ('INGEME01', 3, 1, 'obligatoria'),
  ('ING8403', 3, 1, 'obligatoria'),
  -- 3er año, 2do cuat
  ('INGELE09', 3, 2, 'obligatoria'),
  ('INGELE10', 3, 2, 'obligatoria'),
  ('INGELE11', 3, 2, 'obligatoria'),
  ('INGELE12', 3, 2, 'obligatoria'),
  ('ING2213', 3, 2, 'obligatoria'),
  -- 4to año, 1er cuat
  ('INGELE14', 4, 1, 'obligatoria'),
  ('INGELE15', 4, 1, 'obligatoria'),
  ('ING2202', 4, 1, 'obligatoria'),
  ('INGELE16', 4, 1, 'obligatoria'),
  ('ING8411', 4, 1, 'obligatoria'),
  -- 4to año, 2do cuat
  ('INGELE18', 4, 2, 'obligatoria'),
  ('INGELE20', 4, 2, 'obligatoria'),
  ('ING8412', 4, 2, 'obligatoria'),
  ('ING8413', 4, 2, 'obligatoria'),
  -- 5to año, 1er cuat
  ('ING8405', 5, 1, 'obligatoria'),
  ('INGEME02', 5, 1, 'obligatoria'),
  ('ING2304', 5, 1, 'obligatoria'),
  ('INGEME03', 5, 1, 'obligatoria'),
  ('ING8406', 5, 1, 'obligatoria'),
  ('ING2302', 5, 1, 'obligatoria'),
  -- 5to año, 2do cuat
  ('INGEME04', 5, 2, 'obligatoria'),
  ('INGELE24', 5, 2, 'obligatoria'),
  ('ING2301', 5, 2, 'obligatoria'),
  ('INGEME05', 5, 2, 'obligatoria')
) AS v(codigo, anio, cuat, tipo)
JOIN public.materias m ON m.codigo = v.codigo AND m.carrera_id = c.id
WHERE c.codigo = 'EME'
ON CONFLICT (carrera_id, materia_id) DO NOTHING;
