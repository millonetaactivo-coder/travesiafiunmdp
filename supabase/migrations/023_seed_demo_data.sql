-- ============================================================
-- 023_seed_demo_data.sql
-- Seed academic records, surveys, scores, alerts, interventions
-- ============================================================

DO $$
DECLARE
  -- Carrera IDs (looked up dynamically)
  v_inf uuid;
  v_com uuid;
  v_elc uuid;
  v_ind uuid;

  -- Encuesta IDs (looked up dynamically)
  v_enc_inicial    uuid;
  v_enc_cuatrim    uuid;
  v_enc_entrevista uuid;

  -- Pregunta IDs (looked up dynamically)
  p_carrera     uuid;
  p_horas_est   uuid;
  p_espacio     uuid;
  p_trabajo     uuid;
  p_familia     uuid;
  p_cargo       uuid;
  p_rendimiento uuid;
  p_materias    uuid;
  p_dificultad  uuid;
  p_tiempo_est  uuid;
  p_motivacion  uuid;
  p_apoyo       uuid;
  p_dejar       uuid;
  p_estado_tut  uuid;
  p_factores    uuid;
  p_seguimiento uuid;

  -- Staff IDs
  v_tut_martinez  uuid := 'a0000003-0000-4000-8000-000000000003';
  v_tut_fernandez uuid := 'a0000004-0000-4000-8000-000000000004';
  v_asesor_gonz   uuid := 'a0000005-0000-4000-8000-000000000005';
  v_admin         uuid;

  -- Student IDs
  v_lucia_perez   uuid := 'b1000001-0000-4000-8000-000000000001';
  v_martin_sosa   uuid := 'b1000002-0000-4000-8000-000000000002';
  v_camila_ruiz   uuid := 'b1000003-0000-4000-8000-000000000003';
  v_fer_diaz      uuid := 'b1000004-0000-4000-8000-000000000004';
  v_val_garcia    uuid := 'b1000005-0000-4000-8000-000000000005';
  v_jose_lopez    uuid := 'b1000006-0000-4000-8000-000000000006';
  v_tomas_rojas   uuid := 'b1000007-0000-4000-8000-000000000007';
  v_ana_martinez  uuid := 'b2000001-0000-4000-8000-000000000001';
  v_diego_hern    uuid := 'b2000002-0000-4000-8000-000000000002';
  v_sofi_ramirez  uuid := 'b2000003-0000-4000-8000-000000000003';
  v_pedro_torres  uuid := 'b2000004-0000-4000-8000-000000000004';
  v_lauta_castro  uuid := 'b2000005-0000-4000-8000-000000000005';
  v_maria_gomez   uuid := 'b3000001-0000-4000-8000-000000000001';
  v_juan_morales  uuid := 'b3000002-0000-4000-8000-000000000002';
  v_laura_vargas  uuid := 'b3000003-0000-4000-8000-000000000003';
  v_carlos_reyes  uuid := 'b3000004-0000-4000-8000-000000000004';
  v_rodr_mendoza  uuid := 'b3000005-0000-4000-8000-000000000005';
  v_andres_ramos  uuid := 'b4000001-0000-4000-8000-000000000001';
  v_natalia_flores uuid := 'b4000002-0000-4000-8000-000000000002';
  v_alejandro_silva uuid := 'b4000003-0000-4000-8000-000000000003';
  v_paula_ortiz   uuid := 'b4000004-0000-4000-8000-000000000004';
  v_miguel_nav    uuid := 'b4000005-0000-4000-8000-000000000005';

  v_now timestamptz := now();
  v_rec record;
  v_sesion_id uuid;
  v_interv_id uuid;
BEGIN
  -- Look up carrera IDs dynamically
  SELECT id INTO v_inf FROM public.carreras WHERE codigo = 'INF';
  SELECT id INTO v_com FROM public.carreras WHERE codigo = 'COM';
  SELECT id INTO v_elc FROM public.carreras WHERE codigo = 'ELC';
  SELECT id INTO v_ind FROM public.carreras WHERE codigo = 'IND';

  -- Look up admin user (first admin in the system)
  SELECT u.id INTO v_admin FROM public.usuarios u
  JOIN public.usuario_roles ur ON ur.usuario_id = u.id
  WHERE ur.rol = 'admin' LIMIT 1;
  -- Fallback: if no admin role exists, use first usuario
  IF v_admin IS NULL THEN
    SELECT id INTO v_admin FROM public.usuarios LIMIT 1;
  END IF;

  -- Look up encuesta IDs dynamically
  SELECT id INTO v_enc_inicial    FROM public.encuestas WHERE tipo = 'inicial';
  SELECT id INTO v_enc_cuatrim    FROM public.encuestas WHERE tipo = 'cuatrimestral';
  SELECT id INTO v_enc_entrevista FROM public.encuestas WHERE tipo = 'entrevista';

  -- Look up pregunta IDs dynamically using orden within sections
  -- INICIAL: Estado General section (orden=1), Contexto Personal section (orden=2)
  SELECT p.id INTO p_carrera   FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_inicial AND es.orden = 1 AND p.orden = 1;
  SELECT p.id INTO p_horas_est FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_inicial AND es.orden = 1 AND p.orden = 2;
  SELECT p.id INTO p_espacio   FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_inicial AND es.orden = 1 AND p.orden = 3;
  SELECT p.id INTO p_trabajo   FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_inicial AND es.orden = 2 AND p.orden = 1;
  SELECT p.id INTO p_familia   FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_inicial AND es.orden = 2 AND p.orden = 2;
  SELECT p.id INTO p_cargo     FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_inicial AND es.orden = 2 AND p.orden = 3;

  -- CUATRIMESTRAL: Rendimiento section (orden=1), Bienestar section (orden=2)
  SELECT p.id INTO p_rendimiento FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_cuatrim AND es.orden = 1 AND p.orden = 1;
  SELECT p.id INTO p_materias    FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_cuatrim AND es.orden = 1 AND p.orden = 2;
  SELECT p.id INTO p_dificultad  FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_cuatrim AND es.orden = 1 AND p.orden = 3;
  SELECT p.id INTO p_tiempo_est  FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_cuatrim AND es.orden = 1 AND p.orden = 4;
  SELECT p.id INTO p_motivacion  FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_cuatrim AND es.orden = 2 AND p.orden = 1;
  SELECT p.id INTO p_apoyo       FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_cuatrim AND es.orden = 2 AND p.orden = 2;
  SELECT p.id INTO p_dejar       FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_cuatrim AND es.orden = 2 AND p.orden = 3;

  -- ENTREVISTA: Entrevista de Tutoria section (orden=1)
  SELECT p.id INTO p_estado_tut  FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_entrevista AND p.orden = 1;
  SELECT p.id INTO p_factores    FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_entrevista AND p.orden = 2;
  SELECT p.id INTO p_seguimiento FROM public.preguntas p JOIN public.encuesta_secciones es ON es.id = p.seccion_id WHERE es.encuesta_id = v_enc_entrevista AND p.orden = 5;

  -- =============================================
  -- 1. SURVEY SESSIONS + RESPONSES
  -- =============================================

  -- 1a. ENCUESTA INICIAL (17 sessions, one per student)
  -- Verde students: completada
  -- Amarillo/Naranja/Rojo: mix of completada/en_progreso

  -- INF verde
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_lucia_perez, 1, 2026, 'completada', v_now - interval '30 days', v_now - interval '28 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_martin_sosa, 1, 2026, 'completada', v_now - interval '25 days', v_now - interval '23 days');
  -- INF amarillo
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_camila_ruiz, 1, 2026, 'completada', v_now - interval '20 days', v_now - interval '18 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at)
  VALUES (v_enc_inicial, v_fer_diaz, 1, 2026, 'en_progreso', v_now - interval '10 days');
  -- INF naranja
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_val_garcia, 1, 2026, 'completada', v_now - interval '35 days', v_now - interval '33 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at)
  VALUES (v_enc_inicial, v_jose_lopez, 1, 2026, 'en_progreso', v_now - interval '5 days');
  -- INF rojo
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at)
  VALUES (v_enc_inicial, v_tomas_rojas, 1, 2026, 'en_progreso', v_now - interval '3 days');
  -- COM
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_ana_martinez, 1, 2026, 'completada', v_now - interval '22 days', v_now - interval '20 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_diego_hern, 1, 2026, 'completada', v_now - interval '18 days', v_now - interval '16 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at)
  VALUES (v_enc_inicial, v_sofi_ramirez, 1, 2026, 'en_progreso', v_now - interval '8 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_pedro_torres, 1, 2026, 'completada', v_now - interval '27 days', v_now - interval '25 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at)
  VALUES (v_enc_inicial, v_lauta_castro, 1, 2026, 'en_progreso', v_now - interval '2 days');
  -- ELC
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_maria_gomez, 1, 2026, 'completada', v_now - interval '29 days', v_now - interval '27 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_juan_morales, 1, 2026, 'completada', v_now - interval '24 days', v_now - interval '22 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at)
  VALUES (v_enc_inicial, v_laura_vargas, 1, 2026, 'en_progreso', v_now - interval '7 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_carlos_reyes, 1, 2026, 'completada', v_now - interval '26 days', v_now - interval '24 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at)
  VALUES (v_enc_inicial, v_rodr_mendoza, 1, 2026, 'en_progreso', v_now - interval '1 day');
  -- IND
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_andres_ramos, 1, 2026, 'completada', v_now - interval '31 days', v_now - interval '29 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_natalia_flores, 1, 2026, 'completada', v_now - interval '19 days', v_now - interval '17 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at)
  VALUES (v_enc_inicial, v_alejandro_silva, 1, 2026, 'en_progreso', v_now - interval '6 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES (v_enc_inicial, v_paula_ortiz, 1, 2026, 'completada', v_now - interval '28 days', v_now - interval '26 days');
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at)
  VALUES (v_enc_inicial, v_miguel_nav, 1, 2026, 'en_progreso', v_now - interval '4 days');

  -- 1b. ENCUESTA CUATRIMESTRAL (10 sessions for students with 2+ years)
  INSERT INTO public.sesiones_encuesta (encuesta_id, estudiante_id, cuatrimestre, anio, estado, iniciada_at, completada_at)
  VALUES
    (v_enc_cuatrim, v_lucia_perez, 1, 2026, 'completada', v_now - interval '40 days', v_now - interval '38 days'),
    (v_enc_cuatrim, v_martin_sosa, 1, 2026, 'completada', v_now - interval '36 days', v_now - interval '34 days'),
    (v_enc_cuatrim, v_camila_ruiz, 1, 2026, 'completada', v_now - interval '32 days', v_now - interval '30 days'),
    (v_enc_cuatrim, v_fer_diaz, 1, 2026, 'en_progreso', v_now - interval '15 days', NULL),
    (v_enc_cuatrim, v_val_garcia, 1, 2026, 'completada', v_now - interval '37 days', v_now - interval '35 days'),
    (v_enc_cuatrim, v_ana_martinez, 1, 2026, 'completada', v_now - interval '33 days', v_now - interval '31 days'),
    (v_enc_cuatrim, v_diego_hern, 1, 2026, 'completada', v_now - interval '29 days', v_now - interval '27 days'),
    (v_enc_cuatrim, v_maria_gomez, 1, 2026, 'completada', v_now - interval '34 days', v_now - interval '32 days'),
    (v_enc_cuatrim, v_juan_morales, 1, 2026, 'completada', v_now - interval '30 days', v_now - interval '28 days'),
    (v_enc_cuatrim, v_andres_ramos, 1, 2026, 'completada', v_now - interval '39 days', v_now - interval '37 days');

  -- 1c. RESPONSES - INICIAL (for completada sessions)
  -- Verde students: low-risk answers
  FOR v_sesion_id IN
    SELECT se.id FROM public.sesiones_encuesta se
    WHERE se.encuesta_id = v_enc_inicial AND se.estado = 'completada'
    AND se.estudiante_id IN (v_lucia_perez, v_martin_sosa, v_ana_martinez, v_maria_gomez, v_juan_morales, v_andres_ramos, v_natalia_flores, v_paula_ortiz)
  LOOP
    INSERT INTO public.respuestas (sesion_id, pregunta_id, valor) VALUES
      (v_sesion_id, p_carrera, 'Muy motivado/a'),
      (v_sesion_id, p_horas_est, '15'),
      (v_sesion_id, p_espacio, 'Sí, tengo un espacio tranquilo'),
      (v_sesion_id, p_trabajo, 'No trabajo'),
      (v_sesion_id, p_familia, '8'),
      (v_sesion_id, p_cargo, 'No');
  END LOOP;

  -- Amarillo students: moderate-risk answers
  FOR v_sesion_id IN
    SELECT se.id FROM public.sesiones_encuesta se
    WHERE se.encuesta_id = v_enc_inicial AND se.estado = 'completada'
    AND se.estudiante_id IN (v_camila_ruiz, v_sofi_ramirez, v_laura_vargas, v_carlos_reyes, v_alejandro_silva)
  LOOP
    INSERT INTO public.respuestas (sesion_id, pregunta_id, valor) VALUES
      (v_sesion_id, p_carrera, 'Todavía no sé'),
      (v_sesion_id, p_horas_est, '6'),
      (v_sesion_id, p_espacio, 'Más o menos, a veces me cuesta concentrarme'),
      (v_sesion_id, p_trabajo, 'Trabajo medio tiempo (hasta 20 h/sem)'),
      (v_sesion_id, p_familia, '5'),
      (v_sesion_id, p_cargo, 'Sí, pero no interfiere con el estudio');
  END LOOP;

  -- Naranja students: high-risk answers
  FOR v_sesion_id IN
    SELECT se.id FROM public.sesiones_encuesta se
    WHERE se.encuesta_id = v_enc_inicial AND se.estado = 'completada'
    AND se.estudiante_id IN (v_val_garcia, v_pedro_torres, v_diego_hern)
  LOOP
    INSERT INTO public.respuestas (sesion_id, pregunta_id, valor) VALUES
      (v_sesion_id, p_carrera, 'Un poco inseguro/a'),
      (v_sesion_id, p_horas_est, '3'),
      (v_sesion_id, p_espacio, 'No, es difícil estudiar donde vivo'),
      (v_sesion_id, p_trabajo, 'Trabajo tiempo parcial (20-35 h/sem)'),
      (v_sesion_id, p_familia, '3'),
      (v_sesion_id, p_cargo, 'Sí, y afecta mi disponibilidad horaria');
  END LOOP;

  -- 1d. RESPONSES - CUATRIMESTRAL (for completada sessions)
  -- Verde
  FOR v_sesion_id IN
    SELECT se.id FROM public.sesiones_encuesta se
    WHERE se.encuesta_id = v_enc_cuatrim AND se.estado = 'completada'
    AND se.estudiante_id IN (v_lucia_perez, v_martin_sosa, v_ana_martinez, v_maria_gomez, v_juan_morales, v_andres_ramos)
  LOOP
    INSERT INTO public.respuestas (sesion_id, pregunta_id, valor) VALUES
      (v_sesion_id, p_rendimiento, '8'),
      (v_sesion_id, p_materias, 'Promoví / Aprobé'),
      (v_sesion_id, p_dificultad, 'No, pude seguir sin problemas'),
      (v_sesion_id, p_tiempo_est, 'Entre 10 y 20 horas'),
      (v_sesion_id, p_motivacion, '9'),
      (v_sesion_id, p_apoyo, 'No, estoy bien'),
      (v_sesion_id, p_dejar, 'No, nunca lo pensé');
  END LOOP;

  -- Amarillo
  FOR v_sesion_id IN
    SELECT se.id FROM public.sesiones_encuesta se
    WHERE se.encuesta_id = v_enc_cuatrim AND se.estado = 'completada'
    AND se.estudiante_id IN (v_camila_ruiz, v_natalia_flores, v_paula_ortiz)
  LOOP
    INSERT INTO public.respuestas (sesion_id, pregunta_id, valor) VALUES
      (v_sesion_id, p_rendimiento, '5'),
      (v_sesion_id, p_materias, 'Regularicé / Habilité'),
      (v_sesion_id, p_dificultad, 'En algunas materias me costó'),
      (v_sesion_id, p_tiempo_est, 'Entre 5 y 10 horas'),
      (v_sesion_id, p_motivacion, '6'),
      (v_sesion_id, p_apoyo, 'Tal vez me servirían las clases de consulta'),
      (v_sesion_id, p_dejar, 'Lo pensé pero fue pasajero');
  END LOOP;

  -- Naranja
  FOR v_sesion_id IN
    SELECT se.id FROM public.sesiones_encuesta se
    WHERE se.encuesta_id = v_enc_cuatrim AND se.estado = 'completada'
    AND se.estudiante_id IN (v_val_garcia, v_diego_hern)
  LOOP
    INSERT INTO public.respuestas (sesion_id, pregunta_id, valor) VALUES
      (v_sesion_id, p_rendimiento, '3'),
      (v_sesion_id, p_materias, 'Desaprobé / Abandoné'),
      (v_sesion_id, p_dificultad, 'En la mayoría me costó seguir'),
      (v_sesion_id, p_tiempo_est, 'Menos de 5 horas'),
      (v_sesion_id, p_motivacion, '3'),
      (v_sesion_id, p_apoyo, 'Creo que necesitaría una tutoría'),
      (v_sesion_id, p_dejar, 'Lo consideré seriamente');
  END LOOP;

  -- =============================================
  -- 2. CURSADAS (via temp table to avoid nested FOR issues)
  -- =============================================
  CREATE TEMP TABLE _seed_cursadas AS
  SELECT
    e.usuario_id AS est_id,
    e.carrera_id AS car_id,
    e.anio_ingreso,
    pe.materia_id,
    pe.cuatrimestre,
    pe.anio_teorico,
    CASE
      WHEN e.usuario_id IN (v_lucia_perez, v_martin_sosa, v_ana_martinez, v_maria_gomez, v_juan_morales, v_andres_ramos) THEN 'verde'
      WHEN e.usuario_id IN (v_camila_ruiz, v_fer_diaz, v_sofi_ramirez, v_natalia_flores, v_paula_ortiz) THEN 'amarillo'
      WHEN e.usuario_id IN (v_val_garcia, v_jose_lopez, v_pedro_torres, v_diego_hern, v_laura_vargas, v_carlos_reyes, v_alejandro_silva) THEN 'naranja'
      ELSE 'rojo'
    END AS riesgo
  FROM public.estudiantes e
  JOIN public.plan_estudios pe ON pe.carrera_id = e.carrera_id
  WHERE e.usuario_id IN (
    v_lucia_perez, v_martin_sosa, v_camila_ruiz, v_fer_diaz, v_val_garcia, v_jose_lopez, v_tomas_rojas,
    v_ana_martinez, v_diego_hern, v_sofi_ramirez, v_pedro_torres, v_lauta_castro,
    v_maria_gomez, v_juan_morales, v_laura_vargas, v_carlos_reyes, v_rodr_mendoza,
    v_andres_ramos, v_natalia_flores, v_alejandro_silva, v_paula_ortiz, v_miguel_nav
  )
  AND pe.anio_teorico <= (e.anio_ingreso - 2022 + 4)
  AND random() < 0.6;

  INSERT INTO public.cursadas (id, estudiante_id, materia_id, cuatrimestre, anio, situacion, nota_cursada, es_confiable, created_at)
  SELECT
    gen_random_uuid(),
    sc.est_id,
    sc.materia_id,
    sc.cuatrimestre,
    (sc.anio_ingreso + sc.anio_teorico - 1),
    CASE sc.riesgo
      WHEN 'verde' THEN (ARRAY['promovio','promovio','promovio','habilito'])[1 + floor(random()*4)::int]
      WHEN 'amarillo' THEN (ARRAY['promovio','promovio','habilito','habilito','desaprobo'])[1 + floor(random()*5)::int]
      WHEN 'naranja' THEN (ARRAY['promovio','habilito','desaprobo','desaprobo','abandono'])[1 + floor(random()*5)::int]
      WHEN 'rojo' THEN (ARRAY['habilito','desaprobo','desaprobo','abandono','abandono'])[1 + floor(random()*5)::int]
    END,
    CASE sc.riesgo
      WHEN 'verde' THEN (7 + floor(random()*4)::int)
      WHEN 'amarillo' THEN (4 + floor(random()*4)::int)
      WHEN 'naranja' THEN (1 + floor(random()*5)::int)
      WHEN 'rojo' THEN (1 + floor(random()*3)::int)
    END,
    true,
    v_now - ((2026 - (sc.anio_ingreso + sc.anio_teorico - 1)) * 365 + (2 - sc.cuatrimestre) * 180)::int * interval '1 day'
  FROM _seed_cursadas sc;

  DROP TABLE _seed_cursadas;

  -- =============================================
  -- 3. FINALES (subset of cursadas)
  -- =============================================
  INSERT INTO public.finales (cursada_id, estudiante_id, materia_id, resultado, nota, fecha_intento, numero_intento, es_confiable)
  SELECT
    c.id,
    c.estudiante_id,
    c.materia_id,
    CASE
      WHEN c.nota_cursada >= 7 THEN (ARRAY['aprobado','aprobado','aprobado'])[1 + floor(random()*3)::int]
      WHEN c.nota_cursada >= 4 THEN (ARRAY['aprobado','desaprobado','desaprobado'])[1 + floor(random()*3)::int]
      ELSE (ARRAY['desaprobado','ausente'])[1 + floor(random()*2)::int]
    END,
    CASE
      WHEN c.nota_cursada >= 7 THEN (4 + floor(random()*7)::int)
      WHEN c.nota_cursada >= 4 THEN (2 + floor(random()*6)::int)
      ELSE (1 + floor(random()*3)::int)
    END,
    (c.created_at + (30 + floor(random()*120))::int * interval '1 day')::date,
    1,
    true
  FROM public.cursadas c
  WHERE c.estudiante_id IN (
    v_lucia_perez, v_martin_sosa, v_camila_ruiz, v_fer_diaz, v_val_garcia, v_jose_lopez,
    v_ana_martinez, v_diego_hern, v_sofi_ramirez, v_pedro_torres,
    v_maria_gomez, v_juan_morales, v_laura_vargas, v_carlos_reyes,
    v_andres_ramos, v_natalia_flores, v_alejandro_silva, v_paula_ortiz
  )
  AND random() < 0.3;

  -- =============================================
  -- 4. SCORES (one snapshot per student)
  -- =============================================
  INSERT INTO public.scores (estudiante_id, valor, nivel_riesgo, cuatrimestre, anio, componentes, calculado_at, fecha_entrada_rojo)
  VALUES
    -- INF
    (v_lucia_perez, 12, 'bajo', 1, 2026, '{"academic":10,"survey":8,"grades":15}', v_now - interval '2 days', NULL),
    (v_martin_sosa, 18, 'bajo', 1, 2026, '{"academic":15,"survey":12,"grades":22}', v_now - interval '2 days', NULL),
    (v_camila_ruiz, 38, 'medio', 1, 2026, '{"academic":35,"survey":30,"grades":45}', v_now - interval '2 days', NULL),
    (v_fer_diaz, 45, 'medio', 1, 2026, '{"academic":42,"survey":40,"grades":50}', v_now - interval '2 days', NULL),
    (v_val_garcia, 65, 'alto', 1, 2026, '{"academic":60,"survey":55,"grades":75}', v_now - interval '2 days', NULL),
    (v_jose_lopez, 72, 'alto', 1, 2026, '{"academic":68,"survey":62,"grades":80}', v_now - interval '2 days', NULL),
    (v_tomas_rojas, 88, 'critico', 1, 2026, '{"academic":85,"survey":80,"grades":95}', v_now - interval '2 days', v_now - interval '15 days'),
    -- COM
    (v_ana_martinez, 15, 'bajo', 1, 2026, '{"academic":12,"survey":10,"grades":20}', v_now - interval '2 days', NULL),
    (v_diego_hern, 55, 'medio', 1, 2026, '{"academic":50,"survey":48,"grades":60}', v_now - interval '2 days', NULL),
    (v_sofi_ramirez, 42, 'medio', 1, 2026, '{"academic":38,"survey":35,"grades":48}', v_now - interval '2 days', NULL),
    (v_pedro_torres, 68, 'alto', 1, 2026, '{"academic":65,"survey":58,"grades":78}', v_now - interval '2 days', NULL),
    (v_lauta_castro, 90, 'critico', 1, 2026, '{"academic":88,"survey":82,"grades":98}', v_now - interval '2 days', v_now - interval '20 days'),
    -- ELC
    (v_maria_gomez, 8, 'bajo', 1, 2026, '{"academic":5,"survey":6,"grades":12}', v_now - interval '2 days', NULL),
    (v_juan_morales, 20, 'bajo', 1, 2026, '{"academic":18,"survey":15,"grades":25}', v_now - interval '2 days', NULL),
    (v_laura_vargas, 48, 'medio', 1, 2026, '{"academic":45,"survey":42,"grades":52}', v_now - interval '2 days', NULL),
    (v_carlos_reyes, 62, 'alto', 1, 2026, '{"academic":58,"survey":55,"grades":70}', v_now - interval '2 days', NULL),
    (v_rodr_mendoza, 85, 'critico', 1, 2026, '{"academic":82,"survey":78,"grades":92}', v_now - interval '2 days', v_now - interval '10 days'),
    -- IND
    (v_andres_ramos, 10, 'bajo', 1, 2026, '{"academic":8,"survey":7,"grades":14}', v_now - interval '2 days', NULL),
    (v_natalia_flores, 35, 'medio', 1, 2026, '{"academic":32,"survey":28,"grades":42}', v_now - interval '2 days', NULL),
    (v_alejandro_silva, 50, 'medio', 1, 2026, '{"academic":48,"survey":44,"grades":55}', v_now - interval '2 days', NULL),
    (v_paula_ortiz, 70, 'alto', 1, 2026, '{"academic":66,"survey":60,"grades":80}', v_now - interval '2 days', NULL),
    (v_miguel_nav, 92, 'critico', 1, 2026, '{"academic":90,"survey":85,"grades":98}', v_now - interval '2 days', v_now - interval '8 days');

  -- =============================================
  -- 5. TUTOR ASSIGNMENTS
  -- =============================================
  INSERT INTO public.asignaciones_tutor (tutor_id, estudiante_id, rol_tutor, activa) VALUES
    -- Tutor Martinez (COM) -> 6 students
    (v_tut_martinez, v_ana_martinez,  'tutor', true),
    (v_tut_martinez, v_diego_hern,    'tutor', true),
    (v_tut_martinez, v_sofi_ramirez,  'tutor', true),
    (v_tut_martinez, v_pedro_torres,  'tutor', true),
    (v_tut_martinez, v_lauta_castro,  'tutor', true),
    (v_tut_martinez, v_lucia_perez,   'tutor', true),
    -- Tutor Fernandez (ELC) -> 5 students (no tomas.rojas!)
    (v_tut_fernandez, v_maria_gomez,  'tutor', true),
    (v_tut_fernandez, v_juan_morales, 'tutor', true),
    (v_tut_fernandez, v_laura_vargas, 'tutor', true),
    (v_tut_fernandez, v_carlos_reyes, 'tutor', true),
    (v_tut_fernandez, v_rodr_mendoza, 'tutor', true),
    -- Asesor Gonzalez -> peer support for some
    (v_asesor_gonz, v_martin_sosa,    'asesor_par', true),
    (v_asesor_gonz, v_camila_ruiz,    'asesor_par', true),
    (v_asesor_gonz, v_fer_diaz,       'asesor_par', true),
    (v_asesor_gonz, v_andres_ramos,   'asesor_par', true),
    (v_asesor_gonz, v_natalia_flores, 'asesor_par', true);
    -- NOTE: tomas.rojas (INF, rojo) intentionally has NO tutor

  -- =============================================
  -- 6. ALERTS
  -- =============================================
  INSERT INTO public.alertas (estudiante_id, tutor_id, tipo, origen, descripcion, estado, created_at)
  VALUES
    -- 3 rojo: score_critico, pendiente
    (v_tomas_rojas, NULL,  'score_critico', 'automatica', 'Score alcanzó nivel crítico (88). Sin tutor asignado.', 'pendiente', v_now - interval '2 days'),
    (v_lauta_castro, v_tut_martinez, 'score_critico', 'automatica', 'Score en nivel crítico (90). Requiere intervención urgente.', 'pendiente', v_now - interval '2 days'),
    (v_rodr_mendoza, v_tut_fernandez, 'score_critico', 'automatica', 'Score en nivel crítico (85). Seguimiento cercano necesario.', 'pendiente', v_now - interval '2 days'),
    -- 2 naranja: score_alto, pendiente
    (v_val_garcia, NULL,  'perfil_silencioso', 'automatica', 'Perfil silencioso detectado: score alto sin intervención previa.', 'pendiente', v_now - interval '3 days'),
    (v_pedro_torres, v_tut_martinez, 'ralentizacion', 'automatica', 'Ralentización detectada en rendimiento académico.', 'pendiente', v_now - interval '3 days'),
    -- 1 encuesta_pendiente
    (v_tomas_rojas, NULL, 'encuesta_omitida', 'automatica', 'Encuesta inicial sin completar. Estudiante nuevo sin respuesta.', 'pendiente', v_now - interval '5 days'),
    -- 2 resueltas
    (v_miguel_nav, NULL, 'score_critico', 'automatica', 'Score en nivel crítico. Intervención realizada.', 'resuelta', v_now - interval '20 days'),
    (v_carlos_reyes, v_tut_fernandez, 'ralentizacion', 'automatica', 'Ralentización detectada. Tutor realizó seguimiento.', 'resuelta', v_now - interval '15 days');

  -- Update resuelta_at and resuelta_por for resolved alerts
  UPDATE public.alertas SET resuelta_at = v_now - interval '18 days', resuelta_por = v_admin
  WHERE estudiante_id = v_miguel_nav AND estado = 'resuelta';
  UPDATE public.alertas SET resuelta_at = v_now - interval '13 days', resuelta_por = v_tut_fernandez
  WHERE estudiante_id = v_carlos_reyes AND estado = 'resuelta';

  -- =============================================
  -- 7. INTERVENTIONS
  -- =============================================
  -- 3 realizadas (linked to rojo students)
  INSERT INTO public.intervenciones (id, estudiante_id, tutor_id, tipo, modalidad, fecha_realizada, motivo, resumen, compromisos, proxima_accion, estado)
  VALUES
    (gen_random_uuid(), v_lauta_castro, v_tut_martinez, 'entrevista', 'presencial', v_now - interval '10 days',
     'Score crítico detectado. Primer contacto con el estudiante.',
     'Lautaro reconoce dificultades para seguir el ritmo. Trabaja tiempo completo y tiene poco tiempo de estudio. Se siente abrumado.',
     'Reducir carga horaria laboral si es posible. Asistir a clases de consulta de Programación I y Álgebra.',
     'Reunión de seguimiento en 2 semanas',
     'realizada'),
    (gen_random_uuid(), v_rodr_mendoza, v_tut_fernandez, 'entrevista', 'virtual', v_now - interval '8 days',
     'Score crítico. Seguimiento post-encuesta.',
     'Rodrigo muestra desinterés creciente. Menciona que la carrera no es lo que esperaba. Considera cambiarse.',
     'Asistir a una clase de la carrera que le interese. Hablar con el departamento de orientación.',
     'Contactar al departamento de orientación vocacional',
     'realizada'),
    (gen_random_uuid(), v_miguel_nav, v_asesor_gonz, 'contacto_email', 'virtual', v_now - interval '18 days',
     'Alerta resuelta: score mejoró después de intervención inicial.',
     'Miguel mejoró su rendimiento después de la intervención. Asistió a las clases de consulta.',
     'Continuar asistiendo a consulta. Mantener comunicación regular con tutor.',
     NULL,
     'realizada');

  -- 4 planificadas (future dates)
  INSERT INTO public.intervenciones (id, estudiante_id, tutor_id, tipo, modalidad, fecha_realizada, motivo, resumen, estado)
  VALUES
    (gen_random_uuid(), v_tomas_rojas, v_tut_martinez, 'entrevista', 'presencial', v_now + interval '7 days',
     'Estudiante nuevo sin tutor. Score critico. Primer contacto necesario.',
     'Pendiente de realizacion.',
     'planificada'),
    (gen_random_uuid(), v_val_garcia, v_tut_martinez, 'contacto_telefono', 'telefonica', v_now + interval '5 days',
     'Perfil silencioso: alto score sin intervencion previa.',
     'Pendiente de realizacion.',
     'planificada'),
    (gen_random_uuid(), v_lauta_castro, v_tut_martinez, 'entrevista', 'presencial', v_now + interval '14 days',
     'Seguimiento post-intervencion. Verificar compromisos.',
     'Pendiente de realizacion.',
     'planificada'),
    (gen_random_uuid(), v_rodr_mendoza, v_tut_fernandez, 'reunion_grupal', 'virtual', v_now + interval '10 days',
     'Reunion grupal con estudiantes de ELC en riesgo.',
     'Pendiente de realizacion.',
     'planificada');

  -- =============================================
  -- 8. INTERVIEWS (linked to realizadas intervenciones)
  -- =============================================
  INSERT INTO public.entrevistas (intervencion_id, motivo_entrevista, estado_alumno_percibido, factores_riesgo, acciones_acordadas, derivaciones, seguimiento_requerido, notas_adicionales)
  SELECT
    i.id,
    i.motivo,
    CASE
      WHEN i.estudiante_id = v_lauta_castro THEN 'en_riesgo'
      WHEN i.estudiante_id = v_rodr_mendoza THEN 'critico'
      WHEN i.estudiante_id = v_miguel_nav THEN 'regular'
    END,
    CASE
      WHEN i.estudiante_id = v_lauta_castro THEN ARRAY['Problemas laborales','Falta de motivación','Dificultades académicas severas']
      WHEN i.estudiante_id = v_rodr_mendoza THEN ARRAY['Falta de motivación','Dificultades académicas severas']
      WHEN i.estudiante_id = v_miguel_nav THEN ARRAY['Dificultades académicas severas']
    END,
    CASE
      WHEN i.estudiante_id = v_lauta_castro THEN 'Reducir carga laboral. Asistir a consulta de Programación I y Álgebra. Reunión de seguimiento en 2 semanas.'
      WHEN i.estudiante_id = v_rodr_mendoza THEN 'Asistir a clase de carrera de interés. Contactar departamento de orientación vocacional.'
      WHEN i.estudiante_id = v_miguel_nav THEN 'Continuar asistiendo a consulta. Mantener comunicación regular.'
    END,
    CASE
      WHEN i.estudiante_id = v_rodr_mendoza THEN 'Departamento de Orientación Vocacional'
      ELSE NULL
    END,
    CASE
      WHEN i.estudiante_id IN (v_lauta_castro, v_rodr_mendoza) THEN true
      ELSE false
    END,
    CASE
      WHEN i.estudiante_id = v_lauta_castro THEN 'Primer contacto. Estudiante receptivo pero abrumado.'
      WHEN i.estudiante_id = v_rodr_mendoza THEN 'Estudiante desmotivado. Considera seriamente cambiarse de carrera.'
      WHEN i.estudiante_id = v_miguel_nav THEN 'Intervención exitosa. Estudiante mejoró rendimiento.'
    END
  FROM public.intervenciones i
  WHERE i.estado = 'realizada'
    AND i.tipo IN ('entrevista', 'contacto_email')
    AND i.estudiante_id IN (v_lauta_castro, v_rodr_mendoza, v_miguel_nav);

END $$;
