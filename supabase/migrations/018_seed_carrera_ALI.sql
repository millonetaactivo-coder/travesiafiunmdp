-- =========================================================================
-- Migration 018: Seed Carrera — Ingeniería en Alimentos (ALI) Plan 2024
-- =========================================================================
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Source: docs/planesdeestudio.md
-- =========================================================================

-- 1. MATERIAS — Ingeniería en Alimentos Plan 2024 (~50 subjects)
-- -------------------------------------------------------------------------
INSERT INTO public.materias (carrera_id, nombre, codigo, creditos) VALUES

  -- Primer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Análisis Matemático I', 'INGM101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Álgebra I-B', 'INGM105', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Química General', 'ING1101', 6),

  -- Primer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Análisis Matemático II', 'INGM102', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Álgebra II', 'INGM106', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Física A', 'INGF101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Fisicoquímica I', 'ING1201', 5),

  -- Primer año, anual (cuat=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Taller de Ingeniería I', 'ING1502', 6),

  -- Segundo año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Análisis Matemático III', 'INGM103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Balances de Masa', 'ING1307', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Fundamentos de Programación', 'ING6101', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Física B-II', 'INGF103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Sistemas de Representación', 'ING1102', 2),

  -- Segundo año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Termodinámica de Alimentos I', 'ING1207', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Química del Carbono', 'ING1206', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Fisicoquímica II', 'ING1202', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Física C-II', 'INGF105', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Inglés I', 'ING8408', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Operación de Plantas', 'ING1501', 2),

  -- Segundo año, anual (cuat=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Taller de Ingeniería II', 'ING1503', 6),

  -- Tercer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Métodos Numéricos', 'INGM109', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Operaciones Unitarias I', 'ING1301', 8),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Termodinámica de Alimentos II', 'ING1208', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Química Biológica', 'ING1205', 4),

  -- Tercer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Operaciones Unitarias II', 'ING1302', 8),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Probabilidad y Estadística', 'INGM108', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Técnicas de Análisis', 'ING1204', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Bioquímica de Alimentos', 'ING1305', 4),

  -- Tercer año, anual (cuat=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Taller de Ingeniería III', 'ING1504', 8),

  -- Cuarto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Bromatología', 'ING1304', 7),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Operaciones Unitarias III', 'ING1303', 8),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Microbiología', 'ING1203', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Organización Empresarial', 'ING8411', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Ética', 'ING8405', 4),

  -- Cuarto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Transformación y Preservación', 'ING1308', 7),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Industrialización de Alimentos I', 'ING1309', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Sistemas de Gestión', 'ING8413', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Inglés II', 'ING8409', 3),

  -- Quinto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Procesos Biotecnológicos', 'ING1306', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Industrialización de Alimentos II', 'ING1310', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Gestión Alimentaria', 'ING1401', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Formulación de Proyectos', 'ING8406', 4),

  -- Quinto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Control de Procesos', 'ING1311', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Seguridad', 'ING8412', 4),

  -- Quinto año, anual (cuat=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'ALI'), 'Proyecto Integrador', 'ING1507', 10)

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
  ('ING1207', 2, 2),
  ('ING1206', 2, 2),
  ('ING1202', 2, 2),
  ('INGF105', 2, 2),
  ('ING8408', 2, 2),
  ('ING1501', 2, 2),
  -- 2do año, anual (cuat=1)
  ('ING1503', 2, 1),
  -- 3er año, 1er cuat
  ('INGM109', 3, 1),
  ('ING1301', 3, 1),
  ('ING1208', 3, 1),
  ('ING1205', 3, 1),
  -- 3er año, 2do cuat
  ('ING1302', 3, 2),
  ('INGM108', 3, 2),
  ('ING1204', 3, 2),
  ('ING1305', 3, 2),
  -- 3er año, anual (cuat=1)
  ('ING1504', 3, 1),
  -- 4to año, 1er cuat
  ('ING1304', 4, 1),
  ('ING1303', 4, 1),
  ('ING1203', 4, 1),
  ('ING8411', 4, 1),
  ('ING8405', 4, 1),
  -- 4to año, 2do cuat
  ('ING1308', 4, 2),
  ('ING1309', 4, 2),
  ('ING8413', 4, 2),
  ('ING8409', 4, 2),
  -- 5to año, 1er cuat
  ('ING1306', 5, 1),
  ('ING1310', 5, 1),
  ('ING1401', 5, 1),
  ('ING8406', 5, 1),
  -- 5to año, 2do cuat
  ('ING1311', 5, 2),
  ('ING8412', 5, 2),
  -- 5to año, anual (cuat=1)
  ('ING1507', 5, 1)
) AS v(codigo, anio, cuat)
JOIN public.materias m ON m.codigo = v.codigo AND m.carrera_id = c.id
WHERE c.codigo = 'ALI'
ON CONFLICT (carrera_id, materia_id) DO NOTHING;
