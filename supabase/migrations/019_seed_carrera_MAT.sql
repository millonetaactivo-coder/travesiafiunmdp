-- =========================================================================
-- Migration 019: Seed Carrera — Ingeniería en Materiales (MAT) Plan 2024
-- =========================================================================
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Source: docs/planesdeestudio.md
-- =========================================================================

-- 1. MATERIAS — Ingeniería en Materiales Plan 2024 (~51 subjects)
-- -------------------------------------------------------------------------
INSERT INTO public.materias (carrera_id, nombre, codigo, creditos) VALUES

  -- Primer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Álgebra I-A', 'INGM104', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Análisis Matemático I', 'INGM101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Fundamentos de Química', 'ING1103', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Inglés I', 'ING8408', 3),

  -- Primer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Álgebra II', 'INGM106', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Análisis Matemático II', 'INGM102', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Física A', 'INGF101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Fundamentos de Programación', 'ING6101', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Inglés II', 'ING8409', 3),

  -- Segundo año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Análisis Matemático III', 'INGM103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Física B-I', 'INGF102', 8),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Introducción a la Ciencia de los Materiales', 'ING5201', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Estática I', 'ING2207', 5),

  -- Segundo año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Física C-I', 'INGF104', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Métodos Numéricos', 'INGM109', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Introducción al Diseño 3D', 'ING5101', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Termodinámica de Materiales', 'ING5205', 7),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Estática II', 'ING2208', 5),

  -- Tercer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Física del Estado Sólido', 'INGF201', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Física Experimental A', 'INGF106', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Mecánica de Materiales', 'ING5203', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Química del Estado Sólido', 'ING5204', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Economía', 'ING8403', 4),

  -- Tercer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Fluidodinámica', 'ING5305', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Introducción a los Polímeros', 'ING5202', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Propiedades Funcionales', 'ING5313', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Metalurgia Física', 'ING5206', 6),

  -- Cuarto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Cerámica Industrial', 'ING5302', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Transporte de Calor', 'ING5315', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Ética', 'ING8405', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Modelado de Materiales I', 'ING5307', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Propiedades de Metales', 'ING5312', 3),

  -- Cuarto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Comportamiento de Polímeros', 'ING5303', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Modelado de Materiales II', 'ING5308', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Procesamiento de Plásticos', 'ING5311', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Corrosión', 'ING5304', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Procesamiento de Compuestos', 'ING5309', 6),

  -- Quinto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Procesamiento de Metales', 'ING5310', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Formulación de Proyectos', 'ING8406', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Organización Empresarial', 'ING8411', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Adquisición y Análisis de Datos', 'ING5301', 5),

  -- Quinto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Laboratorio de Transformación', 'ING5306', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Selección de Materiales', 'ING5314', 7),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Seguridad', 'ING8412', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Sistemas de Gestión', 'ING8413', 4),

  -- Quinto año, anual (cuat=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'MAT'), 'Trabajo Final', 'ING5316', 10)

ON CONFLICT (carrera_id, codigo) DO NOTHING;

-- -------------------------------------------------------------------------
-- 2. PLAN DE ESTUDIOS — link materias to carrera with year/semester
-- -------------------------------------------------------------------------
INSERT INTO public.plan_estudios (carrera_id, materia_id, anio_teorico, cuatrimestre, tipo, es_critica)
SELECT c.id, m.id, v.anio, v.cuat, 'obligatoria', false
FROM public.carreras c
CROSS JOIN (VALUES
  -- 1er año, 1er cuat
  ('INGM104', 1, 1),
  ('INGM101', 1, 1),
  ('ING1103', 1, 1),
  ('ING8408', 1, 1),
  -- 1er año, 2do cuat
  ('INGM106', 1, 2),
  ('INGM102', 1, 2),
  ('INGF101', 1, 2),
  ('ING6101', 1, 2),
  ('ING8409', 1, 2),
  -- 2do año, 1er cuat
  ('INGM103', 2, 1),
  ('INGF102', 2, 1),
  ('ING5201', 2, 1),
  ('ING2207', 2, 1),
  -- 2do año, 2do cuat
  ('INGF104', 2, 2),
  ('INGM109', 2, 2),
  ('ING5101', 2, 2),
  ('ING5205', 2, 2),
  ('ING2208', 2, 2),
  -- 3er año, 1er cuat
  ('INGF201', 3, 1),
  ('INGF106', 3, 1),
  ('ING5203', 3, 1),
  ('ING5204', 3, 1),
  ('ING8403', 3, 1),
  -- 3er año, 2do cuat
  ('ING5305', 3, 2),
  ('ING5202', 3, 2),
  ('ING5313', 3, 2),
  ('ING5206', 3, 2),
  -- 4to año, 1er cuat
  ('ING5302', 4, 1),
  ('ING5315', 4, 1),
  ('ING8405', 4, 1),
  ('ING5307', 4, 1),
  ('ING5312', 4, 1),
  -- 4to año, 2do cuat
  ('ING5303', 4, 2),
  ('ING5308', 4, 2),
  ('ING5311', 4, 2),
  ('ING5304', 4, 2),
  ('ING5309', 4, 2),
  -- 5to año, 1er cuat
  ('ING5310', 5, 1),
  ('ING8406', 5, 1),
  ('ING8411', 5, 1),
  ('ING5301', 5, 1),
  -- 5to año, 2do cuat
  ('ING5306', 5, 2),
  ('ING5314', 5, 2),
  ('ING8412', 5, 2),
  ('ING8413', 5, 2),
  -- 5to año, anual (cuat=1)
  ('ING5316', 5, 1)
) AS v(codigo, anio, cuat)
JOIN public.materias m ON m.codigo = v.codigo AND m.carrera_id = c.id
WHERE c.codigo = 'MAT'
ON CONFLICT (carrera_id, materia_id) DO NOTHING;
