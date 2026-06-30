-- =========================================================================
-- Migration 025: is_staff() function + RLS policy updates for staff roles
-- =========================================================================
-- Adds is_staff() helper (admin, docente, tutor, asesor_par) and updates
-- all (own OR is_admin()) policies to (own OR is_staff()).
-- =========================================================================

-- 1. Create is_staff() function (SECURITY DEFINER like is_admin)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuario_roles
    WHERE usuario_id = auth.uid()
    AND rol IN ('admin', 'docente', 'tutor', 'asesor_par')
    AND activo = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon;

-- 2. DROP and RECREATE policies that use (own OR is_admin()) pattern

-- estudiantes
DROP POLICY IF EXISTS "estudiantes_own_or_admin" ON public.estudiantes;
CREATE POLICY "estudiantes_own_or_staff"
  ON public.estudiantes FOR ALL TO authenticated
  USING (usuario_id = auth.uid() OR public.is_staff())
  WITH CHECK (usuario_id = auth.uid() OR public.is_staff());

-- scores
DROP POLICY IF EXISTS "scores_own_or_admin" ON public.scores;
CREATE POLICY "scores_own_or_staff"
  ON public.scores FOR ALL TO authenticated
  USING (estudiante_id = auth.uid() OR public.is_staff())
  WITH CHECK (estudiante_id = auth.uid() OR public.is_staff());

-- cursadas
DROP POLICY IF EXISTS "cursadas_own_or_admin" ON public.cursadas;
CREATE POLICY "cursadas_own_or_staff"
  ON public.cursadas FOR ALL TO authenticated
  USING (estudiante_id = auth.uid() OR public.is_staff())
  WITH CHECK (estudiante_id = auth.uid() OR public.is_staff());

-- finales
DROP POLICY IF EXISTS "finales_own_or_admin" ON public.finales;
CREATE POLICY "finales_own_or_staff"
  ON public.finales FOR ALL TO authenticated
  USING (estudiante_id = auth.uid() OR public.is_staff())
  WITH CHECK (estudiante_id = auth.uid() OR public.is_staff());

-- progreso_estudiante
DROP POLICY IF EXISTS "progreso_estudiante_own_or_admin" ON public.progreso_estudiante;
CREATE POLICY "progreso_estudiante_own_or_staff"
  ON public.progreso_estudiante FOR ALL TO authenticated
  USING (estudiante_id = auth.uid() OR public.is_staff())
  WITH CHECK (estudiante_id = auth.uid() OR public.is_staff());

-- sesiones_encuesta
DROP POLICY IF EXISTS "sesiones_encuesta_own_or_admin" ON public.sesiones_encuesta;
CREATE POLICY "sesiones_encuesta_own_or_staff"
  ON public.sesiones_encuesta FOR ALL TO authenticated
  USING (estudiante_id = auth.uid() OR public.is_staff())
  WITH CHECK (estudiante_id = auth.uid() OR public.is_staff());

-- respuestas
DROP POLICY IF EXISTS "respuestas_own_session_or_admin" ON public.respuestas;
CREATE POLICY "respuestas_own_session_or_staff"
  ON public.respuestas FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sesiones_encuesta s
      WHERE s.id = respuestas.sesion_id AND (s.estudiante_id = auth.uid() OR public.is_staff())
    ) OR public.is_staff()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sesiones_encuesta s
      WHERE s.id = respuestas.sesion_id AND (s.estudiante_id = auth.uid() OR public.is_staff())
    ) OR public.is_staff()
  );

-- asignaciones_tutor
DROP POLICY IF EXISTS "asignaciones_tutor_own_or_admin" ON public.asignaciones_tutor;
CREATE POLICY "asignaciones_tutor_own_or_staff"
  ON public.asignaciones_tutor FOR ALL TO authenticated
  USING (tutor_id = auth.uid() OR estudiante_id = auth.uid() OR public.is_staff())
  WITH CHECK (tutor_id = auth.uid() OR estudiante_id = auth.uid() OR public.is_staff());

-- alertas
DROP POLICY IF EXISTS "alertas_own_or_admin" ON public.alertas;
CREATE POLICY "alertas_own_or_staff"
  ON public.alertas FOR ALL TO authenticated
  USING (estudiante_id = auth.uid() OR tutor_id = auth.uid() OR public.is_staff())
  WITH CHECK (estudiante_id = auth.uid() OR tutor_id = auth.uid() OR public.is_staff());

-- intervenciones
DROP POLICY IF EXISTS "intervenciones_own_or_admin" ON public.intervenciones;
CREATE POLICY "intervenciones_own_or_staff"
  ON public.intervenciones FOR ALL TO authenticated
  USING (estudiante_id = auth.uid() OR tutor_id = auth.uid() OR public.is_staff())
  WITH CHECK (estudiante_id = auth.uid() OR tutor_id = auth.uid() OR public.is_staff());

-- entrevistas
DROP POLICY IF EXISTS "entrevistas_own_or_admin" ON public.entrevistas;
CREATE POLICY "entrevistas_own_or_staff"
  ON public.entrevistas FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.intervenciones i
      WHERE i.id = entrevistas.intervencion_id
        AND (i.estudiante_id = auth.uid() OR i.tutor_id = auth.uid())
    ) OR public.is_staff()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.intervenciones i
      WHERE i.id = entrevistas.intervencion_id
        AND (i.estudiante_id = auth.uid() OR i.tutor_id = auth.uid())
    ) OR public.is_staff()
  );

-- usuarios
DROP POLICY IF EXISTS "usuarios_own_or_admin" ON public.usuarios;
CREATE POLICY "usuarios_own_or_staff"
  ON public.usuarios FOR ALL TO authenticated
  USING (id = auth.uid() OR public.is_staff())
  WITH CHECK (id = auth.uid() OR public.is_staff());

-- 3. Reference tables: update admin-only write policies to staff

-- configuracion
DROP POLICY IF EXISTS "Admin can insert configuracion" ON public.configuracion;
CREATE POLICY "Staff can insert configuracion"
  ON public.configuracion FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admin can update configuracion" ON public.configuracion;
CREATE POLICY "Staff can update configuracion"
  ON public.configuracion FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Admin can delete configuracion" ON public.configuracion;
CREATE POLICY "Staff can delete configuracion"
  ON public.configuracion FOR DELETE TO authenticated
  USING (public.is_staff());

-- carreras
DROP POLICY IF EXISTS "Permitir todo a administradores en carreras" ON public.carreras;
CREATE POLICY "Permitir todo a staff en carreras"
  ON public.carreras FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- materias
DROP POLICY IF EXISTS "Permitir todo a administradores en materias" ON public.materias;
CREATE POLICY "Permitir todo a staff en materias"
  ON public.materias FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- plan_estudios
DROP POLICY IF EXISTS "Permitir todo a administradores en plan_estudios" ON public.plan_estudios;
CREATE POLICY "Permitir todo a staff en plan_estudios"
  ON public.plan_estudios FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- encuestas
DROP POLICY IF EXISTS "Permitir todo a administradores en encuestas" ON public.encuestas;
CREATE POLICY "Permitir todo a staff en encuestas"
  ON public.encuestas FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- encuesta_secciones
DROP POLICY IF EXISTS "Permitir todo a administradores en encuesta_secciones" ON public.encuesta_secciones;
CREATE POLICY "Permitir todo a staff en encuesta_secciones"
  ON public.encuesta_secciones FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- preguntas
DROP POLICY IF EXISTS "Permitir todo a administradores en preguntas" ON public.preguntas;
CREATE POLICY "Permitir todo a staff en preguntas"
  ON public.preguntas FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- indicadores
DROP POLICY IF EXISTS "Permitir todo a administradores en indicadores" ON public.indicadores;
CREATE POLICY "Permitir todo a staff en indicadores"
  ON public.indicadores FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- categorias_pregunta
DROP POLICY IF EXISTS "Permitir todo a administradores en categorias_pregunta" ON public.categorias_pregunta;
CREATE POLICY "Permitir todo a staff en categorias_pregunta"
  ON public.categorias_pregunta FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- scoring_opciones
DROP POLICY IF EXISTS "Permitir todo a administradores en scoring_opciones" ON public.scoring_opciones;
CREATE POLICY "Permitir todo a staff en scoring_opciones"
  ON public.scoring_opciones FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- scoring_tramos
DROP POLICY IF EXISTS "Permitir todo a administradores en scoring_tramos" ON public.scoring_tramos;
CREATE POLICY "Permitir todo a staff en scoring_tramos"
  ON public.scoring_tramos FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- usuario_roles
DROP POLICY IF EXISTS "Administradores pueden todo en usuario_roles" ON public.usuario_roles;
CREATE POLICY "Staff pueden todo en usuario_roles"
  ON public.usuario_roles FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());
