-- =========================================================================
-- Migration 012: Seed Carrera — Ingeniería Electrónica (ELC) Plan 2024
-- =========================================================================
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Source: docs/planesdeestudio.md
-- =========================================================================

-- 1. MATERIAS — Ingeniería Electrónica Plan 2024 (~48 subjects)
-- -------------------------------------------------------------------------
INSERT INTO public.materias (carrera_id, nombre, codigo, creditos) VALUES

  -- Primer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Análisis Matemático I', 'INGM101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Álgebra I-A', 'INGM104', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Fundamentos de Química', 'ING1103', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Proyecto Transversal I', 'ING4201', 2),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Inglés I', 'ING8408', 3),

  -- Primer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Análisis Matemático II', 'INGM102', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Álgebra II', 'INGM106', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Física A', 'INGF101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Informática Básica', 'ING6102', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Proyecto Transversal II', 'ING4202', 2),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Inglés II', 'ING8409', 3),

  -- Segundo año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Análisis Matemático III', 'INGM103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Física B-I', 'INGF102', 8),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Métodos Numéricos para Ingeniería', 'INGM109', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Proyecto Transversal III', 'ING4203', 2),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Programación I', 'ING4218', 5),

  -- Segundo año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Proyecto Transversal IV', 'ING4204', 2),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Teoría de Señales y Sistemas', 'ING4205', 7),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Física C-I', 'INGF104', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Análisis de Circuitos', 'ING4206', 7),

  -- Tercer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Filtros Analógicos', 'ING4207', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Probabilidad, Estadística y Procesos Estocásticos', 'ING4208', 7),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Dispositivos Semiconductores', 'ING4209', 8),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Tecnología Electrónica', 'ING4210', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Proyecto Transversal V', 'ING4101', 2),

  -- Tercer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Proyecto Transversal VI', 'ING4401', 2),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Introducción al Tratamiento Digital de Señales', 'ING4211', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Líneas de Transmisión y Antenas', 'ING4212', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Electrónica Digital', 'ING4213', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Electrónica Aplicada', 'ING4214', 6),

  -- Cuarto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Técnicas y Dispositivos Digitales', 'ING4301', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Sistemas y Circuitos Electrónicos', 'ING4302', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Sistemas de Comunicaciones', 'ING4303', 7),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Organización Empresarial e Industrial', 'ING8411', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Instrumentación y Mediciones Electrónicas I', 'ING4215', 6),

  -- Cuarto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Instrumentación y Mediciones Electrónicas II', 'ING4304', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Redes de Datos', 'ING4305', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Introducción a la Arquitectura de Computadoras', 'ING4307', 7),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Control Automático', 'ING4306', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Seguridad y Salud Ocupacional', 'ING8412', 4),

  -- Quinto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Economía para Ingeniería', 'ING8403', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Optativa I', 'INGEOPT1', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Electiva I', 'INGELEL1', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Electiva II', 'INGELEL2', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Proyecto Final', 'ING4308', 10),

  -- Quinto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Ética, Legislación y Propiedad Intelectual en el Ejercicio Profesional', 'ING8405', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Optativa II', 'INGEOPT2', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'ELC'), 'Electiva III', 'INGELEL3', 5)

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
  ('ING1103', 1, 1, 'obligatoria'),
  ('ING4201', 1, 1, 'obligatoria'),
  ('ING8408', 1, 1, 'obligatoria'),
  -- 1er año, 2do cuat
  ('INGM102', 1, 2, 'obligatoria'),
  ('INGM106', 1, 2, 'obligatoria'),
  ('INGF101', 1, 2, 'obligatoria'),
  ('ING6102', 1, 2, 'obligatoria'),
  ('ING4202', 1, 2, 'obligatoria'),
  ('ING8409', 1, 2, 'obligatoria'),
  -- 2do año, 1er cuat
  ('INGM103', 2, 1, 'obligatoria'),
  ('INGF102', 2, 1, 'obligatoria'),
  ('INGM109', 2, 1, 'obligatoria'),
  ('ING4203', 2, 1, 'obligatoria'),
  ('ING4218', 2, 1, 'obligatoria'),
  -- 2do año, 2do cuat
  ('ING4204', 2, 2, 'obligatoria'),
  ('ING4205', 2, 2, 'obligatoria'),
  ('INGF104', 2, 2, 'obligatoria'),
  ('ING4206', 2, 2, 'obligatoria'),
  -- 3er año, 1er cuat
  ('ING4207', 3, 1, 'obligatoria'),
  ('ING4208', 3, 1, 'obligatoria'),
  ('ING4209', 3, 1, 'obligatoria'),
  ('ING4210', 3, 1, 'obligatoria'),
  ('ING4101', 3, 1, 'obligatoria'),
  -- 3er año, 2do cuat
  ('ING4401', 3, 2, 'obligatoria'),
  ('ING4211', 3, 2, 'obligatoria'),
  ('ING4212', 3, 2, 'obligatoria'),
  ('ING4213', 3, 2, 'obligatoria'),
  ('ING4214', 3, 2, 'obligatoria'),
  -- 4to año, 1er cuat
  ('ING4301', 4, 1, 'obligatoria'),
  ('ING4302', 4, 1, 'obligatoria'),
  ('ING4303', 4, 1, 'obligatoria'),
  ('ING8411', 4, 1, 'obligatoria'),
  ('ING4215', 4, 1, 'obligatoria'),
  -- 4to año, 2do cuat
  ('ING4304', 4, 2, 'obligatoria'),
  ('ING4305', 4, 2, 'obligatoria'),
  ('ING4307', 4, 2, 'obligatoria'),
  ('ING4306', 4, 2, 'obligatoria'),
  ('ING8412', 4, 2, 'obligatoria'),
  -- 5to año, 1er cuat
  ('ING8403', 5, 1, 'obligatoria'),
  ('INGEOPT1', 5, 1, 'obligatoria'),
  ('INGELEL1', 5, 1, 'obligatoria'),
  ('INGELEL2', 5, 1, 'obligatoria'),
  ('ING4308', 5, 1, 'obligatoria'),
  -- 5to año, 2do cuat
  ('ING8405', 5, 2, 'obligatoria'),
  ('INGEOPT2', 5, 2, 'obligatoria'),
  ('INGELEL3', 5, 2, 'obligatoria')
) AS v(codigo, anio, cuat, tipo)
JOIN public.materias m ON m.codigo = v.codigo AND m.carrera_id = c.id
WHERE c.codigo = 'ELC'
ON CONFLICT (carrera_id, materia_id) DO NOTHING;
