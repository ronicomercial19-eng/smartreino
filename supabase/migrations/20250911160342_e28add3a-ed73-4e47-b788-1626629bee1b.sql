-- Add basic RLS policies for core tables

-- User profiles extended - Users can view/edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles_extended
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles_extended
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles_extended
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Students table - Users can view/manage their own students
CREATE POLICY "Users can view own students" ON public.estudantes
FOR SELECT USING (auth.uid()::text = created_by);

CREATE POLICY "Users can create students" ON public.estudantes
FOR INSERT WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can update own students" ON public.estudantes
FOR UPDATE USING (auth.uid()::text = created_by);

-- Training models - Users can view/manage their own models
CREATE POLICY "Users can view own models" ON public.modelos_de_treino
FOR SELECT USING (auth.uid()::text = estudante_id OR estudante_id IS NULL);

CREATE POLICY "Users can create models" ON public.modelos_de_treino
FOR INSERT WITH CHECK (auth.uid()::text = estudante_id);

CREATE POLICY "Users can update own models" ON public.modelos_de_treino
FOR UPDATE USING (auth.uid()::text = estudante_id);

-- Generated plans - Users can view/manage their own plans
CREATE POLICY "Users can view own plans" ON public.planos_de_treino_gerados
FOR SELECT USING (auth.uid()::text = estudante_id);

CREATE POLICY "Users can create plans" ON public.planos_de_treino_gerados
FOR INSERT WITH CHECK (auth.uid()::text = estudante_id);

-- Periodization uploads - Users can view/manage their own uploads
CREATE POLICY "Users can view own uploads" ON public.uploads_periodizacao
FOR SELECT USING (auth.uid()::text = estudante_id);

CREATE POLICY "Users can create uploads" ON public.uploads_periodizacao
FOR INSERT WITH CHECK (auth.uid()::text = estudante_id);

-- Student periodization - Users can view/manage their own data
CREATE POLICY "Users can view own periodization" ON public.aluno_periodizacao
FOR SELECT USING (auth.uid()::text = estudante_id);

CREATE POLICY "Users can create periodization" ON public.aluno_periodizacao
FOR INSERT WITH CHECK (auth.uid()::text = estudante_id);

-- Fix security definer function search paths
CREATE OR REPLACE FUNCTION public.gerar_modelo_treino(
  p_estudante_id text,
  p_objetivo text,
  p_nivel text,
  p_periodizacao jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(modelo_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  novo_modelo_id text;
BEGIN
  -- Generate new UUID for the model
  novo_modelo_id := gen_random_uuid()::text;
  
  -- Insert new training model
  INSERT INTO public.modelos_de_treino (
    id,
    estudante_id,
    nome,
    descricao,
    objetivo,
    nivel,
    duracao_em_semanas,
    periodizacao,
    tag
  ) VALUES (
    novo_modelo_id,
    p_estudante_id,
    'Modelo ' || p_objetivo || ' - ' || p_nivel,
    'Modelo gerado automaticamente baseado nos parâmetros fornecidos',
    p_objetivo,
    p_nivel,
    12, -- Default 12 weeks
    p_periodizacao,
    'gerado_programa'
  );
  
  -- Return the generated model ID
  RETURN QUERY SELECT novo_modelo_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.calcular_periodizacao_correspondencia(estudante text)
RETURNS TABLE(
  semana integer,
  carga_prevista numeric,
  carga_real numeric,
  diferenca numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH semanas AS (
    SELECT generate_series(1, 12) as semana_num
  ),
  prevista AS (
    SELECT 
      ap.semana,
      ap.carga_prevista
    FROM public.aluno_periodizacao ap
    WHERE ap.estudante_id = estudante
  ),
  real AS (
    SELECT 
      EXTRACT(WEEK FROM ap.data_treino)::integer as semana,
      SUM(ap.carga_interna) as carga_real_total
    FROM public.aluno_periodizacao ap
    WHERE ap.estudante_id = estudante
    AND ap.data_treino IS NOT NULL
    GROUP BY EXTRACT(WEEK FROM ap.data_treino)
  )
  SELECT 
    s.semana_num::integer,
    COALESCE(p.carga_prevista, 0)::numeric,
    COALESCE(r.carga_real_total, 0)::numeric,
    (COALESCE(r.carga_real_total, 0) - COALESCE(p.carga_prevista, 0))::numeric
  FROM semanas s
  LEFT JOIN prevista p ON p.semana = s.semana_num
  LEFT JOIN real r ON r.semana = s.semana_num
  ORDER BY s.semana_num;
END;
$$;