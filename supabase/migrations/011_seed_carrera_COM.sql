-- =========================================================================
-- Migration 011: Seed Carrera — Ingeniería en Computación (COM) Plan 2024
-- =========================================================================
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Source: docs/planesdeestudio.md
-- =========================================================================

-- 1. MATERIAS — Ingeniería en Computación Plan 2024 (~47 subjects)
-- -------------------------------------------------------------------------
INSERT INTO public.materias (carrera_id, nombre, codigo, creditos) VALUES

  -- Primer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Análisis Matemático I', 'INGM101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Álgebra I-A', 'INGM104', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Inglés I', 'ING8408', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Informática Básica', 'ING6102', 4),

  -- Primer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Análisis Matemático II', 'INGM102', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Álgebra II', 'INGM106', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Física A', 'INGF101', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Introducción a la Matemática Discreta', 'INGM107', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Inglés II', 'ING8409', 3),

  -- Segundo año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Análisis Matemático III', 'INGM103', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Física B-I', 'INGF102', 8),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Probabilidad y Estadística', 'INGM108', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Programación I', 'ING4218', 5),

  -- Segundo año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Proyecto Transversal C I', 'ING4221', 2),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Teoría de Circuitos', 'ING4222', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Física C-II', 'INGF105', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Programación II', 'ING4219', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Señales y Sistemas de Tiempo Continuo', 'ING4223', 6),

  -- Tercer año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Proyecto Transversal C II', 'ING4227', 2),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Dispositivos y Circuitos Electrónicos', 'ING4225', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Señales y Sistemas de Tiempo Discreto', 'ING4224', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Programación III', 'ING4220', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Circuitos Digitales', 'ING4226', 6),

  -- Tercer año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Proyecto Transversal C III', 'ING4318', 2),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Arquitectura de Computadoras', 'ING4321', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Control Discreto', 'ING4319', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Principios de Seguridad Informática', 'ING4320', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Fundamentos de Comunicaciones Digitales', 'ING4228', 6),

  -- Cuarto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Sistemas Operativos', 'ING4322', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Sistemas Embebidos', 'ING4323', 7),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Ingeniería de Soluciones', 'ING4324', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Organización Empresarial e Industrial', 'ING8411', 4),

  -- Cuarto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Sistemas de Bases de Datos', 'ING6307', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Seguridad y Salud Ocupacional', 'ING8412', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Redes de Transmisión de Datos', 'ING4309', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Ética, Legislación y Ejercicio Profesional', 'ING8404', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Inteligencia Computacional', 'ING4311', 5),

  -- Quinto año, 1er cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Sistemas de Computación Distribuidos I', 'ING4310', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Mecanismos de Seguridad en Redes', 'ING4314', 3),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Economía para Ingeniería', 'ING8403', 4),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Diseño Digital Avanzado', 'ING4313', 5),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Optativa I Tecnológica', 'ING4326', 5),

  -- Quinto año, 2do cuatrimestre
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Proyecto Final de Computación', 'ING4315', 10),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Sistemas de Computación Distribuidos II', 'ING4312', 6),
  ((SELECT id FROM public.carreras WHERE codigo = 'COM'), 'Optativa II Complementaria', 'ING4327', 4)

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
  ('ING8408', 1, 1, 'obligatoria'),
  ('ING6102', 1, 1, 'obligatoria'),
  -- 1er año, 2do cuat
  ('INGM102', 1, 2, 'obligatoria'),
  ('INGM106', 1, 2, 'obligatoria'),
  ('INGF101', 1, 2, 'obligatoria'),
  ('INGM107', 1, 2, 'obligatoria'),
  ('ING8409', 1, 2, 'obligatoria'),
  -- 2do año, 1er cuat
  ('INGM103', 2, 1, 'obligatoria'),
  ('INGF102', 2, 1, 'obligatoria'),
  ('INGM108', 2, 1, 'obligatoria'),
  ('ING4218', 2, 1, 'obligatoria'),
  -- 2do año, 2do cuat
  ('ING4221', 2, 2, 'obligatoria'),
  ('ING4222', 2, 2, 'obligatoria'),
  ('INGF105', 2, 2, 'obligatoria'),
  ('ING4219', 2, 2, 'obligatoria'),
  ('ING4223', 2, 2, 'obligatoria'),
  -- 3er año, 1er cuat
  ('ING4227', 3, 1, 'obligatoria'),
  ('ING4225', 3, 1, 'obligatoria'),
  ('ING4224', 3, 1, 'obligatoria'),
  ('ING4220', 3, 1, 'obligatoria'),
  ('ING4226', 3, 1, 'obligatoria'),
  -- 3er año, 2do cuat
  ('ING4318', 3, 2, 'obligatoria'),
  ('ING4321', 3, 2, 'obligatoria'),
  ('ING4319', 3, 2, 'obligatoria'),
  ('ING4320', 3, 2, 'obligatoria'),
  ('ING4228', 3, 2, 'obligatoria'),
  -- 4to año, 1er cuat
  ('ING4322', 4, 1, 'obligatoria'),
  ('ING4323', 4, 1, 'obligatoria'),
  ('ING4324', 4, 1, 'obligatoria'),
  ('ING8411', 4, 1, 'obligatoria'),
  -- 4to año, 2do cuat
  ('ING6307', 4, 2, 'obligatoria'),
  ('ING8412', 4, 2, 'obligatoria'),
  ('ING4309', 4, 2, 'obligatoria'),
  ('ING8404', 4, 2, 'obligatoria'),
  ('ING4311', 4, 2, 'obligatoria'),
  -- 5to año, 1er cuat
  ('ING4310', 5, 1, 'obligatoria'),
  ('ING4314', 5, 1, 'obligatoria'),
  ('ING8403', 5, 1, 'obligatoria'),
  ('ING4313', 5, 1, 'obligatoria'),
  ('ING4326', 5, 1, 'obligatoria'),
  -- 5to año, 2do cuat
  ('ING4315', 5, 2, 'obligatoria'),
  ('ING4312', 5, 2, 'obligatoria'),
  ('ING4327', 5, 2, 'obligatoria')
) AS v(codigo, anio, cuat, tipo)
JOIN public.materias m ON m.codigo = v.codigo AND m.carrera_id = c.id
WHERE c.codigo = 'COM'
ON CONFLICT (carrera_id, materia_id) DO NOTHING;
