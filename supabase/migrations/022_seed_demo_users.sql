-- ============================================================
-- 022_seed_demo_users.sql
-- Seed auth users (staff + students), usuario, usuario_roles, estudiantes
-- Uses SECURITY DEFINER function to insert into auth.users (owned by supabase_auth_admin)
-- ============================================================

-- Helper function: insert auth user with SECURITY DEFINER (runs as function owner = supabase_auth_admin)
CREATE OR REPLACE FUNCTION public._seed_insert_auth_user(
  p_id uuid, p_email text, p_password text, p_metadata jsonb, p_now timestamptz
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role, instance_id, is_sso_user, is_anonymous, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, phone_change_token, reauthentication_token, email_change, phone_change, created_at, updated_at)
  VALUES (p_id, p_email, p_password, p_now, p_metadata, '{"provider":"email","providers":["email"]}'::jsonb, 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', false, false, '', '', '', '', '', '', '', '', p_now, p_now);
END;
$function$;

-- Helper function: disable/enable trigger on auth.users
CREATE OR REPLACE FUNCTION public._seed_set_auth_trigger(p_enable boolean) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF p_enable THEN
    ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
  ELSE
    ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;
  END IF;
END;
$function$;

DO $$
DECLARE
  v_pass text := crypt('Demo2024!', gen_salt('bf', 10));
  v_now  timestamptz := now();

  -- Carrera IDs (looked up dynamically)
  v_inf uuid;
  v_com uuid;
  v_elc uuid;
  v_ind uuid;

  -- Staff IDs (pre-generated)
  v_admin          uuid := 'a0000000-0000-4000-8000-000000000000';
  v_prof_garcia   uuid := 'a0000001-0000-4000-8000-000000000001';
  v_prof_lopez    uuid := 'a0000002-0000-4000-8000-000000000002';
  v_tut_martinez  uuid := 'a0000003-0000-4000-8000-000000000003';
  v_tut_fernandez uuid := 'a0000004-0000-4000-8000-000000000004';
  v_asesor_gonz   uuid := 'a0000005-0000-4000-8000-000000000005';
  v_asesora_diaz  uuid := 'a0000006-0000-4000-8000-000000000006';

  -- Student IDs (pre-generated)
  -- INF (7): 2 verde, 2 amarillo, 2 naranja, 1 rojo
  v_lucia_perez   uuid := 'b1000001-0000-4000-8000-000000000001';
  v_martin_sosa   uuid := 'b1000002-0000-4000-8000-000000000002';
  v_camila_ruiz   uuid := 'b1000003-0000-4000-8000-000000000003';
  v_fer_diaz      uuid := 'b1000004-0000-4000-8000-000000000004';
  v_val_garcia    uuid := 'b1000005-0000-4000-8000-000000000005';
  v_jose_lopez    uuid := 'b1000006-0000-4000-8000-000000000006';
  v_tomas_rojas   uuid := 'b1000007-0000-4000-8000-000000000007';

  -- COM (5): 1 verde, 2 amarillo, 1 naranja, 1 rojo
  v_ana_martinez  uuid := 'b2000001-0000-4000-8000-000000000001';
  v_diego_hern    uuid := 'b2000002-0000-4000-8000-000000000002';
  v_sofi_ramirez  uuid := 'b2000003-0000-4000-8000-000000000003';
  v_pedro_torres  uuid := 'b2000004-0000-4000-8000-000000000004';
  v_lauta_castro  uuid := 'b2000005-0000-4000-8000-000000000005';

  -- ELC (5): 2 verde, 1 amarillo, 1 naranja, 1 rojo
  v_maria_gomez   uuid := 'b3000001-0000-4000-8000-000000000001';
  v_juan_morales  uuid := 'b3000002-0000-4000-8000-000000000002';
  v_laura_vargas  uuid := 'b3000003-0000-4000-8000-000000000003';
  v_carlos_reyes  uuid := 'b3000004-0000-4000-8000-000000000004';
  v_rodr_mendoza  uuid := 'b3000005-0000-4000-8000-000000000005';

  -- IND (5): 1 verde, 2 amarillo, 1 naranja, 1 rojo
  v_andres_ramos  uuid := 'b4000001-0000-4000-8000-000000000001';
  v_natalia_flores uuid := 'b4000002-0000-4000-8000-000000000002';
  v_alejandro_silva uuid := 'b4000003-0000-4000-8000-000000000003';
  v_paula_ortiz   uuid := 'b4000004-0000-4000-8000-000000000004';
  v_miguel_nav    uuid := 'b4000005-0000-4000-8000-000000000005';
BEGIN
  -- Look up carrera IDs dynamically
  SELECT id INTO v_inf FROM public.carreras WHERE codigo = 'INF';
  SELECT id INTO v_com FROM public.carreras WHERE codigo = 'COM';
  SELECT id INTO v_elc FROM public.carreras WHERE codigo = 'ELC';
  SELECT id INTO v_ind FROM public.carreras WHERE codigo = 'IND';

  -- Disable the trigger temporarily to control inserts
  PERFORM public._seed_set_auth_trigger(false);

  -- =====================
  -- 1. ADMIN + STAFF USERS (7)
  -- =====================
  PERFORM public._seed_insert_auth_user(v_admin,       'admin@travesia.com',                   v_pass, '{"nombre":"Admin","apellido":"Travesia","rol":"admin"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_prof_garcia,  'profesor.garcia@fi.mdp.edu.ar',   v_pass, '{"nombre":"Carlos","apellido":"Garcia","rol":"docente"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_prof_lopez,   'profesora.lopez@fi.mdp.edu.ar',    v_pass, '{"nombre":"Maria","apellido":"Lopez","rol":"docente"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_tut_martinez, 'tutor.martinez@fi.mdp.edu.ar',     v_pass, '{"nombre":"Roberto","apellido":"Martinez","rol":"tutor"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_tut_fernandez,'tutor.fernandez@fi.mdp.edu.ar',    v_pass, '{"nombre":"Ana","apellido":"Fernandez","rol":"tutor"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_asesor_gonz,  'asesor.gonzalez@fi.mdp.edu.ar',    v_pass, '{"nombre":"Luis","apellido":"Gonzalez","rol":"asesor_par"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_asesora_diaz, 'asesora.diaz@fi.mdp.edu.ar',       v_pass, '{"nombre":"Elena","apellido":"Diaz","rol":"asesor_par"}'::jsonb, v_now);

  -- =====================
  -- 2. STUDENT USERS (17)
  -- =====================
  PERFORM public._seed_insert_auth_user(v_lucia_perez,  'lucia.perez@fi.mdp.edu.ar',        v_pass, '{"nombre":"Lucia","apellido":"Perez"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_martin_sosa,  'martin.sosa@fi.mdp.edu.ar',        v_pass, '{"nombre":"Martin","apellido":"Sosa"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_camila_ruiz,  'camila.ruiz@fi.mdp.edu.ar',        v_pass, '{"nombre":"Camila","apellido":"Ruiz"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_fer_diaz,     'fer.diaz@fi.mdp.edu.ar',           v_pass, '{"nombre":"Fernando","apellido":"Diaz"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_val_garcia,   'val.garcia@fi.mdp.edu.ar',         v_pass, '{"nombre":"Valentina","apellido":"Garcia"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_jose_lopez,   'jose.lopez@fi.mdp.edu.ar',         v_pass, '{"nombre":"Jose","apellido":"Lopez"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_tomas_rojas,  'tomas.rojas@fi.mdp.edu.ar',        v_pass, '{"nombre":"Tomas","apellido":"Rojas"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_ana_martinez, 'ana.martinez@fi.mdp.edu.ar',       v_pass, '{"nombre":"Ana","apellido":"Martinez"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_diego_hern,   'diego.hernandez@fi.mdp.edu.ar',    v_pass, '{"nombre":"Diego","apellido":"Hernandez"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_sofi_ramirez, 'sofi.ramirez@fi.mdp.edu.ar',       v_pass, '{"nombre":"Sofia","apellido":"Ramirez"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_pedro_torres, 'pedro.torres@fi.mdp.edu.ar',       v_pass, '{"nombre":"Pedro","apellido":"Torres"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_lauta_castro, 'lautaro.castro@fi.mdp.edu.ar',     v_pass, '{"nombre":"Lautaro","apellido":"Castro"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_maria_gomez,  'maria.gomez@fi.mdp.edu.ar',        v_pass, '{"nombre":"Maria","apellido":"Gomez"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_juan_morales, 'juan.morales@fi.mdp.edu.ar',       v_pass, '{"nombre":"Juan","apellido":"Morales"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_laura_vargas, 'laura.vargas@fi.mdp.edu.ar',       v_pass, '{"nombre":"Laura","apellido":"Vargas"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_carlos_reyes, 'carlos.reyes@fi.mdp.edu.ar',       v_pass, '{"nombre":"Carlos","apellido":"Reyes"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_rodr_mendoza, 'rodrigo.mendoza@fi.mdp.edu.ar',    v_pass, '{"nombre":"Rodrigo","apellido":"Mendoza"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_andres_ramos, 'andres.ramos@fi.mdp.edu.ar',       v_pass, '{"nombre":"Andres","apellido":"Ramos"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_natalia_flores,'natalia.flores@fi.mdp.edu.ar',    v_pass, '{"nombre":"Natalia","apellido":"Flores"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_alejandro_silva,'alejandro.silva@fi.mdp.edu.ar',  v_pass, '{"nombre":"Alejandro","apellido":"Silva"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_paula_ortiz,  'paula.ortiz@fi.mdp.edu.ar',        v_pass, '{"nombre":"Paula","apellido":"Ortiz"}'::jsonb, v_now);
  PERFORM public._seed_insert_auth_user(v_miguel_nav,   'miguel.navarro@fi.mdp.edu.ar',     v_pass, '{"nombre":"Miguel","apellido":"Navarro"}'::jsonb, v_now);

  -- Re-enable trigger
  PERFORM public._seed_set_auth_trigger(true);

  -- =====================
  -- 3. USUARIOS (since trigger was disabled, insert manually)
  -- =====================
  INSERT INTO public.usuarios (id, nombre, apellido, email, legajo) VALUES
    (v_admin,       'Admin',    'Travesia',  'admin@travesia.com',                   NULL),
    (v_prof_garcia,  'Carlos',   'Garcia',     'profesor.garcia@fi.mdp.edu.ar',   'DOC-001'),
    (v_prof_lopez,   'María',    'López',      'profesora.lopez@fi.mdp.edu.ar',    'DOC-002'),
    (v_tut_martinez, 'Roberto',  'Martínez',   'tutor.martinez@fi.mdp.edu.ar',     'TUT-001'),
    (v_tut_fernandez,'Ana',      'Fernández',  'tutor.fernandez@fi.mdp.edu.ar',    'TUT-002'),
    (v_asesor_gonz,  'Luis',     'González',   'asesor.gonzalez@fi.mdp.edu.ar',    'AP-001'),
    (v_asesora_diaz, 'Elena',    'Díaz',       'asesora.diaz@fi.mdp.edu.ar',       'AP-002'),
    (v_lucia_perez,  'Lucía',    'Pérez',      'lucia.perez@fi.mdp.edu.ar',        'INF-22-001'),
    (v_martin_sosa,  'Martín',   'Sosa',       'martin.sosa@fi.mdp.edu.ar',        'INF-22-002'),
    (v_camila_ruiz,  'Camila',   'Ruiz',       'camila.ruiz@fi.mdp.edu.ar',        'INF-23-001'),
    (v_fer_diaz,     'Fernando', 'Díaz',       'fer.diaz@fi.mdp.edu.ar',           'INF-23-002'),
    (v_val_garcia,   'Valentina','García',     'val.garcia@fi.mdp.edu.ar',         'INF-24-001'),
    (v_jose_lopez,   'José',     'López',      'jose.lopez@fi.mdp.edu.ar',         'INF-24-002'),
    (v_tomas_rojas,  'Tomás',    'Rojas',      'tomas.rojas@fi.mdp.edu.ar',        'INF-25-001'),
    (v_ana_martinez, 'Ana',      'Martínez',   'ana.martinez@fi.mdp.edu.ar',       'COM-23-001'),
    (v_diego_hern,   'Diego',    'Hernández',  'diego.hernandez@fi.mdp.edu.ar',    'COM-23-002'),
    (v_sofi_ramirez, 'Sofía',    'Ramírez',    'sofi.ramirez@fi.mdp.edu.ar',       'COM-24-001'),
    (v_pedro_torres, 'Pedro',    'Torres',     'pedro.torres@fi.mdp.edu.ar',       'COM-24-002'),
    (v_lauta_castro, 'Lautaro',  'Castro',     'lautaro.castro@fi.mdp.edu.ar',     'COM-25-001'),
    (v_maria_gomez,  'María',    'Gómez',      'maria.gomez@fi.mdp.edu.ar',        'ELC-22-001'),
    (v_juan_morales, 'Juan',     'Morales',    'juan.morales@fi.mdp.edu.ar',       'ELC-23-001'),
    (v_laura_vargas, 'Laura',    'Vargas',     'laura.vargas@fi.mdp.edu.ar',       'ELC-24-001'),
    (v_carlos_reyes, 'Carlos',   'Reyes',      'carlos.reyes@fi.mdp.edu.ar',       'ELC-24-002'),
    (v_rodr_mendoza, 'Rodrigo',  'Mendoza',    'rodrigo.mendoza@fi.mdp.edu.ar',    'ELC-25-001'),
    (v_andres_ramos, 'Andrés',   'Ramos',      'andres.ramos@fi.mdp.edu.ar',       'IND-22-001'),
    (v_natalia_flores,'Natalia', 'Flores',     'natalia.flores@fi.mdp.edu.ar',     'IND-23-001'),
    (v_alejandro_silva,'Alejandro','Silva',     'alejandro.silva@fi.mdp.edu.ar',    'IND-24-001'),
    (v_paula_ortiz,  'Paula',    'Ortiz',      'paula.ortiz@fi.mdp.edu.ar',        'IND-24-002'),
    (v_miguel_nav,   'Miguel',   'Navarro',    'miguel.navarro@fi.mdp.edu.ar',     'IND-25-001')
  ON CONFLICT (id) DO NOTHING;

  -- =====================
  -- 4. USUARIO_ROLES (trigger was disabled, insert manually with carrera_id)
  -- =====================
  -- Staff roles
  INSERT INTO public.usuario_roles (usuario_id, rol, carrera_id) VALUES
    (v_admin,       'admin',     NULL),
    (v_prof_garcia,  'docente',   NULL),
    (v_prof_lopez,   'docente',   NULL),
    (v_tut_martinez, 'tutor',     v_com),
    (v_tut_fernandez,'tutor',     v_elc),
    (v_asesor_gonz,  'asesor_par',NULL),
    (v_asesora_diaz, 'asesor_par',NULL)
  ON CONFLICT DO NOTHING;

  -- Student roles
  INSERT INTO public.usuario_roles (usuario_id, rol, carrera_id) VALUES
    (v_lucia_perez,   'estudiante', v_inf),
    (v_martin_sosa,   'estudiante', v_inf),
    (v_camila_ruiz,   'estudiante', v_inf),
    (v_fer_diaz,      'estudiante', v_inf),
    (v_val_garcia,    'estudiante', v_inf),
    (v_jose_lopez,    'estudiante', v_inf),
    (v_tomas_rojas,   'estudiante', v_inf),
    (v_ana_martinez,  'estudiante', v_com),
    (v_diego_hern,    'estudiante', v_com),
    (v_sofi_ramirez,  'estudiante', v_com),
    (v_pedro_torres,  'estudiante', v_com),
    (v_lauta_castro,  'estudiante', v_com),
    (v_maria_gomez,   'estudiante', v_elc),
    (v_juan_morales,  'estudiante', v_elc),
    (v_laura_vargas,  'estudiante', v_elc),
    (v_carlos_reyes,  'estudiante', v_elc),
    (v_rodr_mendoza,  'estudiante', v_elc),
    (v_andres_ramos,  'estudiante', v_ind),
    (v_natalia_flores,'estudiante', v_ind),
    (v_alejandro_silva,'estudiante', v_ind),
    (v_paula_ortiz,   'estudiante', v_ind),
    (v_miguel_nav,    'estudiante', v_ind)
  ON CONFLICT DO NOTHING;

  -- =====================
  -- 5. ESTUDIANTES
  -- =====================
  INSERT INTO public.estudiantes (usuario_id, carrera_id, anio_ingreso, encuesta_inicial_completada) VALUES
    -- INF
    (v_lucia_perez,   v_inf, 2022, true),
    (v_martin_sosa,   v_inf, 2022, true),
    (v_camila_ruiz,   v_inf, 2023, true),
    (v_fer_diaz,      v_inf, 2023, true),
    (v_val_garcia,    v_inf, 2024, true),
    (v_jose_lopez,    v_inf, 2024, true),
    (v_tomas_rojas,   v_inf, 2025, false),
    -- COM
    (v_ana_martinez,  v_com, 2023, true),
    (v_diego_hern,    v_com, 2023, true),
    (v_sofi_ramirez,  v_com, 2024, true),
    (v_pedro_torres,  v_com, 2024, true),
    (v_lauta_castro,  v_com, 2025, false),
    -- ELC
    (v_maria_gomez,   v_elc, 2022, true),
    (v_juan_morales,  v_elc, 2023, true),
    (v_laura_vargas,  v_elc, 2024, true),
    (v_carlos_reyes,  v_elc, 2024, true),
    (v_rodr_mendoza,  v_elc, 2025, false),
    -- IND
    (v_andres_ramos,  v_ind, 2022, true),
    (v_natalia_flores, v_ind, 2023, true),
    (v_alejandro_silva, v_ind, 2024, true),
    (v_paula_ortiz,   v_ind, 2024, true),
    (v_miguel_nav,    v_ind, 2025, false)
  ON CONFLICT (usuario_id) DO NOTHING;

END $$;

-- ============================================================
-- 6. AUTH IDENTITIES (required by GoTrue for login)
-- ============================================================
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  u.id::text,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', false, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
FROM auth.users u
WHERE (u.id::text LIKE 'a0000%' OR u.id::text LIKE 'b%0000%')
AND NOT EXISTS (SELECT 1 FROM auth.identities i WHERE i.user_id = u.id);
