-- =========================================================================
-- Migration 016: Seed Carrera — Ingeniería Mecánica (MEC) Plan 2024
-- =========================================================================
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Source: docs/planesdeestudio.md
-- =========================================================================

-- 1. MATERIAS — Ingeniería Mecánica Plan 2024 (~55 subjects)
-- -------------------------------------------------------------------------
INSERT INTO public.materias (carrera_id, nombre, codigo, creditos) VALUES

  -- Primer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Dibujo A', 'ING2101', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Análisis Matemático I', 'INGM101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Álgebra I-A', 'INGM104', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Fundamentos de Química', 'ING1103', 4),

  -- Primer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Dibujo B', 'ING2102', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Análisis Matemático II', 'INGM102', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Álgebra II', 'INGM106', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Física A', 'INGF101', 6),

  -- Primer año, anual (cuat=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Introducción a la Ingeniería Mecánica', 'ING2401', 4),

  -- Segundo año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Mecanismos', 'ING2201', 2),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Estática I', 'ING2207', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Análisis Matemático III', 'INGM103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Física B-II', 'INGF103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Inglés I', 'ING8408', 3),

  -- Segundo año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Aplicaciones Hidráulica', 'ING2214', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Estática II', 'ING2208', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Fundamentos de Programación', 'ING6101', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Física C-II', 'INGF105', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Electrotecnia D', 'ING3204', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Inglés II', 'ING8409', 3),

  -- Tercer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Termodinámica', 'ING2203', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Física Experimental A', 'INGF106', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Organización Empresarial', 'ING8411', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Mecánica del Continuo', 'ING2209', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Mecánica de Partícula', 'ING2202', 7),

  -- Tercer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Modelado Computacional', 'ING2103', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Energías Renovables', 'ING2306', 2),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Fluidos', 'ING2213', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Materiales I', 'ING2205', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Conversión Electromecánica', 'ING2212', 4),

  -- Cuarto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Metrología', 'ING2204', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Transferencia de Calor', 'ING2304', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Vibraciones', 'ING2210', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Materiales II', 'ING2206', 5),

  -- Cuarto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Ética', 'ING8405', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Tribología', 'ING2310', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Sistemas Propulsivos I', 'ING2303', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Procesos de Fabricación I', 'ING2305', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Proyecto Integrador I', 'ING2307', 3),

  -- Cuarto año, anual (cuat=1)
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Elementos de Máquinas', 'ING2301', 6),

  -- Quinto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Economía', 'ING8403', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Mantenimiento Industrial', 'ING2302', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Electiva I', 'ING2314', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Electiva II', 'ING2315', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Electiva III', 'ING2316', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Proyecto Integrador II', 'ING2308', 4),

  -- Quinto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Seguridad', 'ING8412', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Electrónica de Control', 'ING2215', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Electiva IV', 'ING2317', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Electiva V', 'ING2318', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Optativa Mecánica', 'ING2325', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'MEC'), 'Proyecto Integrador III', 'ING2309', 3)

ON CONFLICT (carrera_id, codigo) DO NOTHING;

-- -------------------------------------------------------------------------
-- 2. PLAN DE ESTUDIOS — link materias to carrera with year/semester
-- -------------------------------------------------------------------------
INSERT INTO public.plan_estudios (carrera_id, materia_id, anio_teorico, cuatrimestre, tipo, es_critica)
SELECT c.id, m.id, v.anio, v.cuat, 'obligatoria', false
FROM public.carreras c
CROSS JOIN (VALUES
  -- 1er año, 1er cuat
  ('ING2101', 1, 1),
  ('INGM101', 1, 1),
  ('INGM104', 1, 1),
  ('ING1103', 1, 1),
  -- 1er año, 2do cuat
  ('ING2102', 1, 2),
  ('INGM102', 1, 2),
  ('INGM106', 1, 2),
  ('INGF101', 1, 2),
  -- 1er año, anual (cuat=1)
  ('ING2401', 1, 1),
  -- 2do año, 1er cuat
  ('ING2201', 2, 1),
  ('ING2207', 2, 1),
  ('INGM103', 2, 1),
  ('INGF103', 2, 1),
  ('ING8408', 2, 1),
  -- 2do año, 2do cuat
  ('ING2214', 2, 2),
  ('ING2208', 2, 2),
  ('ING6101', 2, 2),
  ('INGF105', 2, 2),
  ('ING3204', 2, 2),
  ('ING8409', 2, 2),
  -- 3er año, 1er cuat
  ('ING2203', 3, 1),
  ('INGF106', 3, 1),
  ('ING8411', 3, 1),
  ('ING2209', 3, 1),
  ('ING2202', 3, 1),
  -- 3er año, 2do cuat
  ('ING2103', 3, 2),
  ('ING2306', 3, 2),
  ('ING2213', 3, 2),
  ('ING2205', 3, 2),
  ('ING2212', 3, 2),
  -- 4to año, 1er cuat
  ('ING2204', 4, 1),
  ('ING2304', 4, 1),
  ('ING2210', 4, 1),
  ('ING2206', 4, 1),
  -- 4to año, 2do cuat
  ('ING8405', 4, 2),
  ('ING2310', 4, 2),
  ('ING2303', 4, 2),
  ('ING2305', 4, 2),
  ('ING2307', 4, 2),
  -- 4to año, anual (cuat=1)
  ('ING2301', 4, 1),
  -- 5to año, 1er cuat
  ('ING8403', 5, 1),
  ('ING2302', 5, 1),
  ('ING2314', 5, 1),
  ('ING2315', 5, 1),
  ('ING2316', 5, 1),
  ('ING2308', 5, 1),
  -- 5to año, 2do cuat
  ('ING8412', 5, 2),
  ('ING2215', 5, 2),
  ('ING2317', 5, 2),
  ('ING2318', 5, 2),
  ('ING2325', 5, 2),
  ('ING2309', 5, 2)
) AS v(codigo, anio, cuat)
JOIN public.materias m ON m.codigo = v.codigo AND m.carrera_id = c.id
WHERE c.codigo = 'MEC'
ON CONFLICT (carrera_id, materia_id) DO NOTHING;
