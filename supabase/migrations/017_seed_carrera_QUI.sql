-- =========================================================================
-- Migration 017: Seed Carrera — Ingeniería Química (QUI) Plan 2024
-- =========================================================================
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Source: docs/planesdeestudio.md
-- =========================================================================

-- 1. MATERIAS — Ingeniería Química Plan 2024 (~47 subjects)
-- -------------------------------------------------------------------------
INSERT INTO public.materias (carrera_id, nombre, codigo, creditos) VALUES

  -- Primer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Análisis Matemático I', 'INGM101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Álgebra I-B', 'INGM105', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Química General e Inorgánica', 'ING1101', 6),

  -- Primer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Análisis Matemático II', 'INGM102', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Álgebra II', 'INGM106', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Física A', 'INGF101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Fisicoquímica I', 'ING1201', 5),

  -- Primer año, anual (cuat=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Taller de Ingeniería I', 'ING1502', 6),

  -- Segundo año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Análisis Matemático III', 'INGM103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Balances de Masa', 'ING1307', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Fundamentos de Programación', 'ING6101', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Física B-II', 'INGF103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Sistemas de Representación', 'ING1102', 2),

  -- Segundo año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Química del Carbono', 'ING1206', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Termodinámica I', 'ING1211', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Fisicoquímica II', 'ING1202', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Física C-II', 'INGF105', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Inglés I', 'ING8408', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Operación de Plantas', 'ING1501', 2),

  -- Segundo año, anual (cuat=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Taller de Ingeniería II', 'ING1503', 6),

  -- Tercer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Métodos Numéricos', 'INGM109', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Operaciones Unitarias I', 'ING1301', 8),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Organización Empresarial', 'ING8411', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Termodinámica II', 'ING1212', 4),

  -- Tercer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Operaciones Unitarias II', 'ING1302', 8),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Probabilidad y Estadística', 'INGM108', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Inglés II', 'ING8409', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Ingeniería de Sistemas', 'ING1315', 3),

  -- Tercer año, anual (cuat=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Taller de Ingeniería III', 'ING1504', 8),

  -- Cuarto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Reacciones Químicas I', 'ING1313', 7),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Operaciones Unitarias III', 'ING1303', 8),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Formulación de Proyectos', 'ING8406', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Ética', 'ING8405', 4),

  -- Cuarto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Reacciones Químicas II', 'ING1314', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Química Biológica', 'ING1210', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Técnicas de Análisis', 'ING1204', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Sistemas de Gestión', 'ING8413', 4),

  -- Cuarto año, anual (cuat=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Taller de Proyectos IQ', 'ING1505', 6),

  -- Quinto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Tecnología de Materiales', 'ING1209', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Procesos Biotecnológicos', 'ING1306', 4),

  -- Quinto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Seguridad', 'ING8412', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Dinámica y Control', 'ING1312', 7),

  -- Quinto año, anual (cuat=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'QUI'), 'Proyecto Integrador IQ', 'ING1506', 10)

ON CONFLICT (carrera_id, codigo) DO NOTHING;

-- -------------------------------------------------------------------------
-- 2. PLAN DE ESTUDIOS — link materias to carrera with year/semester
-- -------------------------------------------------------------------------
INSERT INTO public.plan_estudios (carrera_id, materia_id, anio_teorico, cuatrimestre, tipo, es_critica)
SELECT c.id, m.id, v.anio, v.cuat, 'obligatoria', false
FROM public.carreras c
CROSS JOIN (VALUES
  -- 1er año, 1er cuat
  ('INGM101', 1, 1),
  ('INGM105', 1, 1),
  ('ING1101', 1, 1),
  -- 1er año, 2do cuat
  ('INGM102', 1, 2),
  ('INGM106', 1, 2),
  ('INGF101', 1, 2),
  ('ING1201', 1, 2),
  -- 1er año, anual (cuat=1)
  ('ING1502', 1, 1),
  -- 2do año, 1er cuat
  ('INGM103', 2, 1),
  ('ING1307', 2, 1),
  ('ING6101', 2, 1),
  ('INGF103', 2, 1),
  ('ING1102', 2, 1),
  -- 2do año, 2do cuat
  ('ING1206', 2, 2),
  ('ING1211', 2, 2),
  ('ING1202', 2, 2),
  ('INGF105', 2, 2),
  ('ING8408', 2, 2),
  ('ING1501', 2, 2),
  -- 2do año, anual (cuat=1)
  ('ING1503', 2, 1),
  -- 3er año, 1er cuat
  ('INGM109', 3, 1),
  ('ING1301', 3, 1),
  ('ING8411', 3, 1),
  ('ING1212', 3, 1),
  -- 3er año, 2do cuat
  ('ING1302', 3, 2),
  ('INGM108', 3, 2),
  ('ING8409', 3, 2),
  ('ING1315', 3, 2),
  -- 3er año, anual (cuat=1)
  ('ING1504', 3, 1),
  -- 4to año, 1er cuat
  ('ING1313', 4, 1),
  ('ING1303', 4, 1),
  ('ING8406', 4, 1),
  ('ING8405', 4, 1),
  -- 4to año, 2do cuat
  ('ING1314', 4, 2),
  ('ING1210', 4, 2),
  ('ING1204', 4, 2),
  ('ING8413', 4, 2),
  -- 4to año, anual (cuat=1)
  ('ING1505', 4, 1),
  -- 5to año, 1er cuat
  ('ING1209', 5, 1),
  ('ING1306', 5, 1),
  -- 5to año, 2do cuat
  ('ING8412', 5, 2),
  ('ING1312', 5, 2),
  -- 5to año, anual (cuat=1)
  ('ING1506', 5, 1)
) AS v(codigo, anio, cuat)
JOIN public.materias m ON m.codigo = v.codigo AND m.carrera_id = c.id
WHERE c.codigo = 'QUI'
ON CONFLICT (carrera_id, materia_id) DO NOTHING;
