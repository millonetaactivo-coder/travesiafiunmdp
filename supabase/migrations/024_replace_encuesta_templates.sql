-- =========================================================================
-- Migration 024: Replace Encuesta Templates with Real Survey Instruments
-- =========================================================================
-- Source of truth: docs/travesia_formularios.md
-- Replaces ALL placeholder child data (secciones, preguntas, scoring)
-- for the 3 existing encuesta templates (inicial, cuatrimestral, entrevista).
-- The 3 encuestas rows are NOT touched.
-- =========================================================================

-- 0. Idempotency guard — skip if final state already present
DO $$
BEGIN
  IF (
    SELECT count(*) FROM public.categorias_pregunta
    WHERE nombre IN ('Rendimiento Académico','Encuestas y Bienestar Emocional','Alerta de Aislamiento')
  ) = 3 AND (
    SELECT count(*) FROM public.preguntas
    WHERE texto IN (
      '¿Es esta tu primera experiencia universitaria?',
      '¿Con quién vivís actualmente?',
      '¿Tenés hijos o alguien a tu cargo?',
      '¿Quién financia principalmente tus estudios?',
      '¿Contás con los materiales necesarios para cursar correctamente?',
      '¿Trabajás actualmente?',
      '¿Cuántas horas trabajás semanalmente?',
      '¿Ha ocurrido algún cambio importante en tu vida personal este cuatrimestre que haya afectado tu rendimiento?',
      '¿Cómo describirías tu ritmo de estudio?',
      'Del 1 al 10, ¿qué tan satisfecho estás con tu rendimiento este cuatrimestre?',
      '¿Qué es lo que hoy te hace dudar más sobre seguir adelante con esta carrera?',
      '¿Quién es la primera persona a la que recurrís cuando tenés una dificultad?',
      'Mirando hacia el próximo mes, ¿qué tan posible ves aprobar al menos una instancia de evaluación?',
      'Si no pudieras continuar este cuatrimestre, ¿qué estarías haciendo en lugar de estudiar?',
      '¿Qué te mantiene hoy inscripto en la carrera?'
    )
  ) = 15 THEN
    RAISE NOTICE 'Idempotency guard: data already matches expected state, skipping.';
    RETURN;
  END IF;
END $$;

BEGIN;

-- -------------------------------------------------------------------------
-- 1. Categorías Pregunta — align to 3 document dimensiones
--    No unique constraint on nombre, so DELETE + INSERT.
-- -------------------------------------------------------------------------
DELETE FROM public.categorias_pregunta
WHERE nombre NOT IN ('Rendimiento Académico', 'Encuestas y Bienestar Emocional', 'Alerta de Aislamiento');

-- Delete any existing rows with these names to avoid duplicates
DELETE FROM public.categorias_pregunta
WHERE nombre IN ('Rendimiento Académico', 'Encuestas y Bienestar Emocional', 'Alerta de Aislamiento');

INSERT INTO public.categorias_pregunta (nombre, descripcion, score_maximo, color, activa) VALUES
  ('Rendimiento Académico', 'Percepción del estudiante sobre su desempeño académico y rendimiento.', 50, '#ef4444', true),
  ('Encuestas y Bienestar Emocional', 'Estado emocional, motivación, situación personal y bienestar del estudiante.', 40, '#f59e0b', true),
  ('Alerta de Aislamiento', 'Indicadores de desconexión social, falta de apoyo y riesgo de abandono.', 30, '#8b5cf6', true);

-- -------------------------------------------------------------------------
-- 2. DELETE child data — cascades to preguntas → scoring_opciones + scoring_tramos
-- -------------------------------------------------------------------------
DELETE FROM public.encuesta_secciones
WHERE encuesta_id IN (
  SELECT id FROM public.encuestas WHERE tipo IN ('inicial', 'cuatrimestral', 'entrevista')
);

-- -------------------------------------------------------------------------
-- 3. INSERT 4 secciones
-- -------------------------------------------------------------------------
INSERT INTO public.encuesta_secciones (encuesta_id, titulo, descripcion, orden)
SELECT
  (SELECT id FROM public.encuestas WHERE tipo = 'inicial'),
  'Contexto Personal', 'Perfil, contexto familiar y situación del estudiante al ingresar.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.encuesta_secciones WHERE titulo = 'Contexto Personal' AND encuesta_id = (SELECT id FROM public.encuestas WHERE tipo = 'inicial'));

INSERT INTO public.encuesta_secciones (encuesta_id, titulo, descripcion, orden)
SELECT
  (SELECT id FROM public.encuestas WHERE tipo = 'cuatrimestral'),
  'Rendimiento del Cuatrimestre', 'Autoevaluación del desempeño académico y carga de trabajo.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.encuesta_secciones WHERE titulo = 'Rendimiento del Cuatrimestre' AND encuesta_id = (SELECT id FROM public.encuestas WHERE tipo = 'cuatrimestral'));

INSERT INTO public.encuesta_secciones (encuesta_id, titulo, descripcion, orden)
SELECT
  (SELECT id FROM public.encuestas WHERE tipo = 'cuatrimestral'),
  'Bienestar y Motivación', 'Estado emocional, satisfacción y factores de riesgo.', 2
WHERE NOT EXISTS (SELECT 1 FROM public.encuesta_secciones WHERE titulo = 'Bienestar y Motivación' AND encuesta_id = (SELECT id FROM public.encuestas WHERE tipo = 'cuatrimestral'));

INSERT INTO public.encuesta_secciones (encuesta_id, titulo, descripcion, orden)
SELECT
  (SELECT id FROM public.encuestas WHERE tipo = 'entrevista'),
  'Entrevista de Tutoría', 'Preguntas guía para la entrevista personal con el estudiante.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.encuesta_secciones WHERE titulo = 'Entrevista de Tutoría' AND encuesta_id = (SELECT id FROM public.encuestas WHERE tipo = 'entrevista'));

-- -------------------------------------------------------------------------
-- 4. INSERT 15 preguntas
-- -------------------------------------------------------------------------
DO $$
DECLARE
  sec_inicial uuid;
  sec_cuatri_rend uuid;
  sec_cuatri_bien uuid;
  sec_entrevista uuid;
  cat_rendimiento uuid;
  cat_bienestar uuid;
  cat_aislamiento uuid;
BEGIN
  SELECT id INTO sec_inicial      FROM public.encuesta_secciones WHERE titulo = 'Contexto Personal'           AND encuesta_id = (SELECT id FROM public.encuestas WHERE tipo = 'inicial');
  SELECT id INTO sec_cuatri_rend  FROM public.encuesta_secciones WHERE titulo = 'Rendimiento del Cuatrimestre' AND encuesta_id = (SELECT id FROM public.encuestas WHERE tipo = 'cuatrimestral');
  SELECT id INTO sec_cuatri_bien  FROM public.encuesta_secciones WHERE titulo = 'Bienestar y Motivación'       AND encuesta_id = (SELECT id FROM public.encuestas WHERE tipo = 'cuatrimestral');
  SELECT id INTO sec_entrevista   FROM public.encuesta_secciones WHERE titulo = 'Entrevista de Tutoría'        AND encuesta_id = (SELECT id FROM public.encuestas WHERE tipo = 'entrevista');

  SELECT id INTO cat_rendimiento FROM public.categorias_pregunta WHERE nombre = 'Rendimiento Académico';
  SELECT id INTO cat_bienestar   FROM public.categorias_pregunta WHERE nombre = 'Encuestas y Bienestar Emocional';
  SELECT id INTO cat_aislamiento FROM public.categorias_pregunta WHERE nombre = 'Alerta de Aislamiento';

  -- ENCUESTA INICIAL — Contexto Personal (5 preguntas)
  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_inicial, '¿Es esta tu primera experiencia universitaria?', 'unica',
     '[{"valor":"Sí, es la primera carrera que inicio"},{"valor":"No, inicié otra carrera pero la dejé"},{"valor":"No, inicié otra carrera y la estoy cursando en paralelo"},{"valor":"No, ya tengo título universitario"}]',
     1, true, cat_rendimiento, false, 0);

  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_inicial, '¿Con quién vivís actualmente?', 'unica',
     '[{"valor":"Con mi familia (padres, hermanos, etc)"},{"valor":"Con pareja o hijos/as"},{"valor":"Con compañeros/as o amigos/as"},{"valor":"Solo/a"},{"valor":"Otro"}]',
     2, true, cat_bienestar, false, 0);

  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_inicial, '¿Tenés hijos o alguien a tu cargo?', 'unica',
     '[{"valor":"No"},{"valor":"Sí"}]',
     3, true, cat_bienestar, false, 0);

  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_inicial, '¿Quién financia principalmente tus estudios?', 'unica',
     '[{"valor":"Mi familia"},{"valor":"Una beca o subsidio"},{"valor":"Yo mismo/a con mi trabajo"},{"valor":"Otro"}]',
     4, true, cat_bienestar, false, 0);

  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_inicial, '¿Contás con los materiales necesarios para cursar correctamente?', 'unica',
     '[{"valor":"Sí"},{"valor":"No"}]',
     5, true, cat_bienestar, false, 0);

  -- ENCUESTA CUATRIMESTRAL — Rendimiento del Cuatrimestre (4 preguntas)
  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_cuatri_rend, '¿Trabajás actualmente?', 'unica',
     '[{"valor":"No"},{"valor":"Sí"}]',
     1, true, cat_bienestar, false, 0);

  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_cuatri_rend, '¿Cuántas horas trabajás semanalmente?', 'unica',
     '[{"valor":"Entre 1 y 10 horas"},{"valor":"Entre 11 y 20 horas"},{"valor":"Entre 21 y 30 horas"},{"valor":"Entre 31 y 40 horas"},{"valor":"Más de 40 horas"}]',
     2, true, cat_bienestar, false, 0);

  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_cuatri_rend, '¿Ha ocurrido algún cambio importante en tu vida personal este cuatrimestre que haya afectado tu rendimiento?', 'unica',
     '[{"valor":"No"},{"valor":"Sí"}]',
     3, true, cat_bienestar, false, 0);

  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_cuatri_rend, '¿Cómo describirías tu ritmo de estudio?', 'unica',
     '[{"valor":"Suelo seguir el ritmo de las clases y estoy al día"},{"valor":"Suelo estar un poco atrasado/a, pero puedo recuperar"},{"valor":"Siempre estoy muy perdido/a y no logro seguir los temas"}]',
     4, true, cat_rendimiento, false, 0);

  -- ENCUESTA CUATRIMESTRAL — Bienestar y Motivación (1 pregunta)
  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, valor_minimo, valor_maximo, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_cuatri_bien, 'Del 1 al 10, ¿qué tan satisfecho estás con tu rendimiento este cuatrimestre?', 'escala',
     NULL, 1, 10,
     1, true, cat_bienestar, false, 0);

  -- ENCUESTA ENTREVISTA — Entrevista de Tutoría (5 preguntas)
  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_entrevista, '¿Qué es lo que hoy te hace dudar más sobre seguir adelante con esta carrera?', 'unica',
     '[{"valor":"Desinterés por los contenidos de la carrera"},{"valor":"Exceso de presión/estrés académico"},{"valor":"Problemas personales/familiares"},{"valor":"Dificultades económicas"},{"valor":"Siento que no estoy aprendiendo/avanzando"}]',
     1, true, cat_bienestar, false, 0);

  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_entrevista, '¿Quién es la primera persona a la que recurrís cuando tenés una dificultad?', 'unica',
     '[{"valor":"Profesor de la cátedra"},{"valor":"Compañeros de estudio"},{"valor":"Nadie, intento resolverlo solo/a"},{"valor":"Nadie, me rindo y dejo la materia"}]',
     2, true, cat_aislamiento, false, 0);

  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_entrevista, 'Mirando hacia el próximo mes, ¿qué tan posible ves aprobar al menos una instancia de evaluación?', 'unica',
     '[{"valor":"Muy posible"},{"valor":"Posible, pero con ayuda extra"},{"valor":"Poco probable"},{"valor":"Imposible, ya decidí dejar de intentar"}]',
     3, true, cat_rendimiento, false, 0);

  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_entrevista, 'Si no pudieras continuar este cuatrimestre, ¿qué estarías haciendo en lugar de estudiar?', 'unica',
     '[{"valor":"Buscaría trabajo o dedicaría más tiempo al actual"},{"valor":"Me cambiaría a una carrera más corta"},{"valor":"No tengo plan definido/estoy desorientado"}]',
     4, true, cat_aislamiento, false, 0);

  INSERT INTO public.preguntas (seccion_id, texto, tipo, opciones, orden, es_obligatoria, categoria_id, aplica_por_materia, peso_defecto) VALUES
    (sec_entrevista, '¿Qué te mantiene hoy inscripto en la carrera?', 'unica',
     '[{"valor":"La carrera en sí"},{"valor":"Su grupo de amigos"}]',
     5, true, cat_bienestar, false, 0);

END $$;

-- -------------------------------------------------------------------------
-- 5. INSERT scoring_opciones — risk scores per multiple-choice option
-- -------------------------------------------------------------------------
INSERT INTO public.scoring_opciones (pregunta_id, opcion_valor, score)
SELECT p.id, v.opcion, v.score
FROM (VALUES
  -- ENCUESTA INICIAL
  -- experiencia_universitaria_previa
  ('¿Es esta tu primera experiencia universitaria?', 'Sí, es la primera carrera que inicio', 0),
  ('¿Es esta tu primera experiencia universitaria?', 'No, inicié otra carrera pero la dejé', 2),
  ('¿Es esta tu primera experiencia universitaria?', 'No, inicié otra carrera y la estoy cursando en paralelo', 1),
  ('¿Es esta tu primera experiencia universitaria?', 'No, ya tengo título universitario', 0),
  -- situacion_convivencia
  ('¿Con quién vivís actualmente?', 'Con mi familia (padres, hermanos, etc)', 0),
  ('¿Con quién vivís actualmente?', 'Con pareja o hijos/as', 1),
  ('¿Con quién vivís actualmente?', 'Con compañeros/as o amigos/as', 1),
  ('¿Con quién vivís actualmente?', 'Solo/a', 2),
  ('¿Con quién vivís actualmente?', 'Otro', 1),
  -- dependientes_a_cargo
  ('¿Tenés hijos o alguien a tu cargo?', 'No', 0),
  ('¿Tenés hijos o alguien a tu cargo?', 'Sí', 3),
  -- fuente_financiamiento
  ('¿Quién financia principalmente tus estudios?', 'Mi familia', 0),
  ('¿Quién financia principalmente tus estudios?', 'Una beca o subsidio', 1),
  ('¿Quién financia principalmente tus estudios?', 'Yo mismo/a con mi trabajo', 2),
  ('¿Quién financia principalmente tus estudios?', 'Otro', 2),
  -- acceso_materiales
  ('¿Contás con los materiales necesarios para cursar correctamente?', 'Sí', 0),
  ('¿Contás con los materiales necesarios para cursar correctamente?', 'No', 3),

  -- ENCUESTA CUATRIMESTRAL
  -- situacion_laboral
  ('¿Trabajás actualmente?', 'No', 0),
  ('¿Trabajás actualmente?', 'Sí', 1),
  -- horas_trabajo_semanal
  ('¿Cuántas horas trabajás semanalmente?', 'Entre 1 y 10 horas', 1),
  ('¿Cuántas horas trabajás semanalmente?', 'Entre 11 y 20 horas', 2),
  ('¿Cuántas horas trabajás semanalmente?', 'Entre 21 y 30 horas', 3),
  ('¿Cuántas horas trabajás semanalmente?', 'Entre 31 y 40 horas', 4),
  ('¿Cuántas horas trabajás semanalmente?', 'Más de 40 horas', 5),
  -- cambio_vida_personal
  ('¿Ha ocurrido algún cambio importante en tu vida personal este cuatrimestre que haya afectado tu rendimiento?', 'No', 0),
  ('¿Ha ocurrido algún cambio importante en tu vida personal este cuatrimestre que haya afectado tu rendimiento?', 'Sí', 3),
  -- ritmo_estudio
  ('¿Cómo describirías tu ritmo de estudio?', 'Suelo seguir el ritmo de las clases y estoy al día', 0),
  ('¿Cómo describirías tu ritmo de estudio?', 'Suelo estar un poco atrasado/a, pero puedo recuperar', 2),
  ('¿Cómo describirías tu ritmo de estudio?', 'Siempre estoy muy perdido/a y no logro seguir los temas', 4),

  -- ENCUESTA ENTREVISTA
  -- motivo_duda_continuidad
  ('¿Qué es lo que hoy te hace dudar más sobre seguir adelante con esta carrera?', 'Desinterés por los contenidos de la carrera', 3),
  ('¿Qué es lo que hoy te hace dudar más sobre seguir adelante con esta carrera?', 'Exceso de presión/estrés académico', 2),
  ('¿Qué es lo que hoy te hace dudar más sobre seguir adelante con esta carrera?', 'Problemas personales/familiares', 3),
  ('¿Qué es lo que hoy te hace dudar más sobre seguir adelante con esta carrera?', 'Dificultades económicas', 3),
  ('¿Qué es lo que hoy te hace dudar más sobre seguir adelante con esta carrera?', 'Siento que no estoy aprendiendo/avanzando', 2),
  -- red_de_apoyo
  ('¿Quién es la primera persona a la que recurrís cuando tenés una dificultad?', 'Profesor de la cátedra', 0),
  ('¿Quién es la primera persona a la que recurrís cuando tenés una dificultad?', 'Compañeros de estudio', 0),
  ('¿Quién es la primera persona a la que recurrís cuando tenés una dificultad?', 'Nadie, intento resolverlo solo/a', 2),
  ('¿Quién es la primera persona a la que recurrís cuando tenés una dificultad?', 'Nadie, me rindo y dejo la materia', 4),
  -- expectativa_aprobacion
  ('Mirando hacia el próximo mes, ¿qué tan posible ves aprobar al menos una instancia de evaluación?', 'Muy posible', 0),
  ('Mirando hacia el próximo mes, ¿qué tan posible ves aprobar al menos una instancia de evaluación?', 'Posible, pero con ayuda extra', 2),
  ('Mirando hacia el próximo mes, ¿qué tan posible ves aprobar al menos una instancia de evaluación?', 'Poco probable', 3),
  ('Mirando hacia el próximo mes, ¿qué tan posible ves aprobar al menos una instancia de evaluación?', 'Imposible, ya decidí dejar de intentar', 5),
  -- plan_alternativo
  ('Si no pudieras continuar este cuatrimestre, ¿qué estarías haciendo en lugar de estudiar?', 'Buscaría trabajo o dedicaría más tiempo al actual', 2),
  ('Si no pudieras continuar este cuatrimestre, ¿qué estarías haciendo en lugar de estudiar?', 'Me cambiaría a una carrera más corta', 3),
  ('Si no pudieras continuar este cuatrimestre, ¿qué estarías haciendo en lugar de estudiar?', 'No tengo plan definido/estoy desorientado', 4),
  -- motivacion_continuidad
  ('¿Qué te mantiene hoy inscripto en la carrera?', 'La carrera en sí', 0),
  ('¿Qué te mantiene hoy inscripto en la carrera?', 'Su grupo de amigos', 2)
) AS v(texto_pregunta, opcion, score)
JOIN public.preguntas p ON p.texto = v.texto_pregunta;

-- -------------------------------------------------------------------------
-- 6. INSERT scoring_tramos — inverted scale for satisfaccion_rendimiento
--    10 tramos: answer 1→risk 9, answer 10→risk 0
-- -------------------------------------------------------------------------
INSERT INTO public.scoring_tramos (pregunta_id, orden, condicion_tipo, condicion_valor, formula)
SELECT p.id, v.orden, v.condicion_tipo, v.condicion_valor, v.formula
FROM (VALUES
  (1, 'igual', 1,  '10 - 1'),
  (2, 'igual', 2,  '10 - 2'),
  (3, 'igual', 3,  '10 - 3'),
  (4, 'igual', 4,  '10 - 4'),
  (5, 'igual', 5,  '10 - 5'),
  (6, 'igual', 6,  '10 - 6'),
  (7, 'igual', 7,  '10 - 7'),
  (8, 'igual', 8,  '10 - 8'),
  (9, 'igual', 9,  '10 - 9'),
  (10, 'igual', 10, '10 - 10')
) AS v(orden, condicion_tipo, condicion_valor, formula)
JOIN public.preguntas p ON p.texto = 'Del 1 al 10, ¿qué tan satisfecho estás con tu rendimiento este cuatrimestre?';

COMMIT;
