-- =========================================================================
-- Migration 015: Seed Carrera — Ingeniería Industrial (IND) Plan 2024
-- =========================================================================
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Source: docs/planesdeestudio.md
-- Synthetic codes: INGIND01–INGIND03 (electivas/optativas Industrial)
-- =========================================================================

-- 1. MATERIAS — Ingeniería Industrial Plan 2024 (~49 subjects)
-- -------------------------------------------------------------------------
INSERT INTO public.materias (carrera_id, nombre, codigo, creditos) VALUES

  -- Primer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Análisis Matemático I', 'INGM101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Álgebra I-B', 'INGM105', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Fundamentos de Química', 'ING1103', 4),

  -- Primer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Análisis Matemático II', 'INGM102', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Álgebra II', 'INGM106', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Física A', 'INGF101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Fundamentos de la Programación', 'ING6101', 4),

  -- Segundo año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Física B-II', 'INGF103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Análisis Matemático III', 'INGM103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Probabilidad y Estadística', 'INGM108', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Mecánica del Sólido', 'ING2218', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Inglés I', 'ING8408', 3),

  -- Segundo año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Administración Estratégica', 'ING8302', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Conceptos de Economía Industrial', 'ING8414', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Máquinas y Equipos Industriales I', 'ING3209', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Termodinámica Industrial', 'ING2221', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Inglés II', 'ING8409', 3),

  -- Segundo año, anual (cuatrimestre=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Proyecto de Ingeniería Industrial I', 'ING8501', 4),

  -- Tercer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Administración de Operaciones', 'ING8301', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Investigación Operativa A', 'ING8201', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Gestión de la Tecnología', 'ING8308', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Ética y Legislación', 'ING8405', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Sistemas de Representación', 'ING2104', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Tecnología de los Materiales', 'ING2219', 4),

  -- Tercer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Planificación y Control de la Producción', 'ING8310', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Investigación Operativa B', 'ING8202', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Mecánica de Fluidos', 'ING2217', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Física Experimental A', 'INGF106', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Gestión de Logística y Cadena de Suministros', 'ING8307', 4),

  -- Tercer año, anual (cuatrimestre=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Proyecto II', 'ING8502', 4),

  -- Cuarto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Diseño de Instalaciones', 'ING8303', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Sistemas de Gestión', 'ING8311', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Comportamiento Organizacional', 'ING8402', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Introducción a Procesos de Fabricación', 'ING2220', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Inglés Profesional A', 'ING8415', 4),

  -- Cuarto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Formulación y Evaluación Proyectos', 'ING8305', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Gestión Comercial', 'ING8306', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Tecnología de Control', 'ING2222', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Inglés Profesional B', 'ING8416', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Electiva 2', 'INGIND01', 4),

  -- Cuarto año, anual (cuatrimestre=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Proyecto III', 'ING8503', 4),

  -- Quinto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Sustentabilidad e Higiene', 'ING8312', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Desarrollo Económico', 'ING8418', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Sistemas Informáticos de Gestión', 'ING8417', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Electiva 3', 'INGIND02', 4),

  -- Quinto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Gestión Integral del Mantenimiento', 'ING8309', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Empresas y Servicios del Conocimiento', 'ING8304', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Optativa 1', 'INGIND03', 4),

  -- Quinto año, anual (cuatrimestre=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'IND'), 'Proyecto IV / Trabajo Final', 'ING8504', 10)

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
  ('INGM105', 1, 1, 'obligatoria'),
  ('ING1103', 1, 1, 'obligatoria'),
  -- 1er año, 2do cuat
  ('INGM102', 1, 2, 'obligatoria'),
  ('INGM106', 1, 2, 'obligatoria'),
  ('INGF101', 1, 2, 'obligatoria'),
  ('ING6101', 1, 2, 'obligatoria'),
  -- 2do año, 1er cuat
  ('INGF103', 2, 1, 'obligatoria'),
  ('INGM103', 2, 1, 'obligatoria'),
  ('INGM108', 2, 1, 'obligatoria'),
  ('ING2218', 2, 1, 'obligatoria'),
  ('ING8408', 2, 1, 'obligatoria'),
  -- 2do año, 2do cuat
  ('ING8302', 2, 2, 'obligatoria'),
  ('ING8414', 2, 2, 'obligatoria'),
  ('ING3209', 2, 2, 'obligatoria'),
  ('ING2221', 2, 2, 'obligatoria'),
  ('ING8409', 2, 2, 'obligatoria'),
  -- 2do año, anual (cuat=1)
  ('ING8501', 2, 1, 'obligatoria'),
  -- 3er año, 1er cuat
  ('ING8301', 3, 1, 'obligatoria'),
  ('ING8201', 3, 1, 'obligatoria'),
  ('ING8308', 3, 1, 'obligatoria'),
  ('ING8405', 3, 1, 'obligatoria'),
  ('ING2104', 3, 1, 'obligatoria'),
  ('ING2219', 3, 1, 'obligatoria'),
  -- 3er año, 2do cuat
  ('ING8310', 3, 2, 'obligatoria'),
  ('ING8202', 3, 2, 'obligatoria'),
  ('ING2217', 3, 2, 'obligatoria'),
  ('INGF106', 3, 2, 'obligatoria'),
  ('ING8307', 3, 2, 'obligatoria'),
  -- 3er año, anual (cuat=1)
  ('ING8502', 3, 1, 'obligatoria'),
  -- 4to año, 1er cuat
  ('ING8303', 4, 1, 'obligatoria'),
  ('ING8311', 4, 1, 'obligatoria'),
  ('ING8402', 4, 1, 'obligatoria'),
  ('ING2220', 4, 1, 'obligatoria'),
  ('ING8415', 4, 1, 'obligatoria'),
  -- 4to año, 2do cuat
  ('ING8305', 4, 2, 'obligatoria'),
  ('ING8306', 4, 2, 'obligatoria'),
  ('ING2222', 4, 2, 'obligatoria'),
  ('ING8416', 4, 2, 'obligatoria'),
  ('INGIND01', 4, 2, 'obligatoria'),
  -- 4to año, anual (cuat=1)
  ('ING8503', 4, 1, 'obligatoria'),
  -- 5to año, 1er cuat
  ('ING8312', 5, 1, 'obligatoria'),
  ('ING8418', 5, 1, 'obligatoria'),
  ('ING8417', 5, 1, 'obligatoria'),
  ('INGIND02', 5, 1, 'obligatoria'),
  -- 5to año, 2do cuat
  ('ING8309', 5, 2, 'obligatoria'),
  ('ING8304', 5, 2, 'obligatoria'),
  ('INGIND03', 5, 2, 'obligatoria'),
  -- 5to año, anual (cuat=1)
  ('ING8504', 5, 1, 'obligatoria')
) AS v(codigo, anio, cuat, tipo)
JOIN public.materias m ON m.codigo = v.codigo AND m.carrera_id = c.id
WHERE c.codigo = 'IND'
ON CONFLICT (carrera_id, materia_id) DO NOTHING;
