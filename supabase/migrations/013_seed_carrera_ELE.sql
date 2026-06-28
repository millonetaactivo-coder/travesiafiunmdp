-- =========================================================================
-- Migration 013: Seed Carrera — Ingeniería Eléctrica (ELE) Plan 2024
-- =========================================================================
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Source: docs/planesdeestudio.md
-- Synthetic codes: INGELE01–INGELE28 (Eléctrica has no ING codes in source)
-- =========================================================================

-- 1. MATERIAS — Ingeniería Eléctrica Plan 2024 (~49 subjects)
-- -------------------------------------------------------------------------
INSERT INTO public.materias (carrera_id, nombre, codigo, creditos) VALUES

  -- Primer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Análisis Matemático I', 'INGM101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Álgebra I-A', 'INGM104', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Sistemas de Representación para Ingeniería', 'INGELE01', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Fundamentos de Química', 'ING1103', 4),

  -- Primer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Análisis Matemático II', 'INGM102', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Álgebra II', 'INGM106', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Física A', 'INGF101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Fundamentos de la Programación', 'ING6101', 4),

  -- Segundo año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Análisis Matemático III', 'INGM103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Física B-I', 'INGF102', 8),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Fundamentos de Estática y Resistencia de Materiales', 'INGELE02', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Inglés I', 'ING8408', 3),

  -- Segundo año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Física C-I', 'INGF104', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Electrotecnia A', 'INGELE03', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Introducción a la Termodinámica', 'INGELE04', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Probabilidad y Estadística', 'INGM108', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Inglés II', 'ING8409', 3),

  -- Tercer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Electrotecnia B', 'INGELE05', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Mediciones Eléctricas A', 'INGELE06', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Automatización A', 'INGELE07', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Introducción a la Mecánica de los Fluidos', 'INGELE08', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Economía para Ingeniería', 'ING8403', 4),

  -- Tercer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Máquinas Eléctricas A', 'INGELE09', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Mediciones Eléctricas B', 'INGELE10', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Tecnología CAD Aplicada', 'INGELE11', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Principios de Electrónica', 'INGELE12', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Electrotecnia C', 'INGELE13', 6),

  -- Cuarto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Máquinas Eléctricas B', 'INGELE14', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Materiales Electrotécnicos', 'INGELE15', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Formulación y Evaluación de Proyectos', 'ING8406', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Instalaciones Eléctricas A', 'INGELE16', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Organización Empresarial', 'ING8411', 4),

  -- Cuarto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Sistemas de Transmisión de Energía Eléctrica', 'INGELE17', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Instalaciones Eléctricas B', 'INGELE18', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Automatización B', 'INGELE19', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Seguridad y Salud Ocupacional', 'ING8412', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Electrónica de Potencia I', 'INGELE20', 4),

  -- Quinto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Generación de Energía Eléctrica A', 'INGELE21', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Sistemas de Distribución de Energía Eléctrica', 'INGELE22', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Accionamientos con Motor Eléctrico', 'INGELE23', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Ética y Legislación', 'ING8405', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Control I', 'INGELE24', 4),

  -- Quinto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Generación de Energía Eléctrica B', 'INGELE25', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Protección y Análisis de Sistemas de Potencia', 'INGELE26', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Redes Eléctricas Inteligentes', 'INGELE27', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Sistemas de Gestión Integrados', 'ING8413', 4),

  -- Proyecto Final
  ((SELECT id FROM public.carreras WHERE codigo = 'ELE'), 'Proyecto Final', 'INGELE28', 10)

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
  ('INGELE02', 2, 1, 'obligatoria'),
  ('ING8408', 2, 1, 'obligatoria'),
  -- 2do año, 2do cuat
  ('INGF104', 2, 2, 'obligatoria'),
  ('INGELE03', 2, 2, 'obligatoria'),
  ('INGELE04', 2, 2, 'obligatoria'),
  ('INGM108', 2, 2, 'obligatoria'),
  ('ING8409', 2, 2, 'obligatoria'),
  -- 3er año, 1er cuat
  ('INGELE05', 3, 1, 'obligatoria'),
  ('INGELE06', 3, 1, 'obligatoria'),
  ('INGELE07', 3, 1, 'obligatoria'),
  ('INGELE08', 3, 1, 'obligatoria'),
  ('ING8403', 3, 1, 'obligatoria'),
  -- 3er año, 2do cuat
  ('INGELE09', 3, 2, 'obligatoria'),
  ('INGELE10', 3, 2, 'obligatoria'),
  ('INGELE11', 3, 2, 'obligatoria'),
  ('INGELE12', 3, 2, 'obligatoria'),
  ('INGELE13', 3, 2, 'obligatoria'),
  -- 4to año, 1er cuat
  ('INGELE14', 4, 1, 'obligatoria'),
  ('INGELE15', 4, 1, 'obligatoria'),
  ('ING8406', 4, 1, 'obligatoria'),
  ('INGELE16', 4, 1, 'obligatoria'),
  ('ING8411', 4, 1, 'obligatoria'),
  -- 4to año, 2do cuat
  ('INGELE17', 4, 2, 'obligatoria'),
  ('INGELE18', 4, 2, 'obligatoria'),
  ('INGELE19', 4, 2, 'obligatoria'),
  ('ING8412', 4, 2, 'obligatoria'),
  ('INGELE20', 4, 2, 'obligatoria'),
  -- 5to año, 1er cuat
  ('INGELE21', 5, 1, 'obligatoria'),
  ('INGELE22', 5, 1, 'obligatoria'),
  ('INGELE23', 5, 1, 'obligatoria'),
  ('ING8405', 5, 1, 'obligatoria'),
  ('INGELE24', 5, 1, 'obligatoria'),
  ('INGELE28', 5, 1, 'obligatoria'),
  -- 5to año, 2do cuat
  ('INGELE25', 5, 2, 'obligatoria'),
  ('INGELE26', 5, 2, 'obligatoria'),
  ('INGELE27', 5, 2, 'obligatoria'),
  ('ING8413', 5, 2, 'obligatoria')
) AS v(codigo, anio, cuat, tipo)
JOIN public.materias m ON m.codigo = v.codigo AND m.carrera_id = c.id
WHERE c.codigo = 'ELE'
ON CONFLICT (carrera_id, materia_id) DO NOTHING;
