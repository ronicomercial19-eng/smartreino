
-- Primeiro, vamos corrigir a tabela students para ter valores padrão adequados
ALTER TABLE public.students 
ALTER COLUMN professor_id SET DEFAULT auth.uid();

-- Corrigir as políticas RLS da tabela students
DROP POLICY IF EXISTS "Professors can manage their students" ON public.students;
DROP POLICY IF EXISTS "Students can view their profile" ON public.students;

-- Criar políticas RLS mais robustas
CREATE POLICY "Professors can manage their students" 
ON public.students 
FOR ALL 
USING (auth.uid() = professor_id)
WITH CHECK (auth.uid() = professor_id);

CREATE POLICY "Students can view their own profile" 
ON public.students 
FOR SELECT 
USING (
  auth.uid()::text IN (
    SELECT u.id::text 
    FROM auth.users u 
    WHERE u.email = students.email
  )
);

-- Criar uma função para obter o perfil do usuário atual de forma segura
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE(user_id uuid, user_email text)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid() as user_id, auth.email() as user_email;
$$;

-- Criar view para student_periodizations se não existir
CREATE OR REPLACE VIEW public.vw_student_periodizations AS
SELECT 
  sp.id,
  sp.student_id,
  sp.periodization_plan_id,
  sp.assigned_by,
  sp.created_at,
  p.title as periodization_title,
  p.description as periodization_description
FROM student_periodizations sp
LEFT JOIN periodizations p ON sp.periodization_plan_id = p.id;

-- Criar view para student_selected_models se não existir
CREATE OR REPLACE VIEW public.vw_student_selected_models AS
SELECT 
  ssm.id,
  ssm.student_id,
  ssm.model_id,
  ssm.assigned_by,
  ssm.notes,
  ssm.created_at,
  wm.name as model_name,
  wm.general_objective,
  wm.level
FROM student_selected_models ssm
LEFT JOIN workout_models wm ON ssm.model_id = wm.id;

-- Criar view para workout_modalities se não existir
CREATE OR REPLACE VIEW public.vw_workout_modalities AS
SELECT 
  general_objective as modality,
  COUNT(*) as model_count,
  array_agg(DISTINCT level) as levels_available
FROM workout_models
GROUP BY general_objective;

-- Criar as tabelas faltantes se não existirem
CREATE TABLE IF NOT EXISTS public.student_periodizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  periodization_plan_id uuid NOT NULL,
  assigned_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_selected_models (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  model_id uuid NOT NULL REFERENCES workout_models(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL DEFAULT auth.uid(),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.student_periodizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_selected_models ENABLE ROW LEVEL SECURITY;

-- Políticas para student_periodizations
CREATE POLICY "Professors can manage student periodizations" 
ON public.student_periodizations 
FOR ALL 
USING (
  student_id IN (
    SELECT id FROM students WHERE professor_id = auth.uid()
  )
)
WITH CHECK (
  student_id IN (
    SELECT id FROM students WHERE professor_id = auth.uid()
  )
);

-- Políticas para student_selected_models
CREATE POLICY "Professors can manage student models" 
ON public.student_selected_models 
FOR ALL 
USING (
  student_id IN (
    SELECT id FROM students WHERE professor_id = auth.uid()
  )
)
WITH CHECK (
  student_id IN (
    SELECT id FROM students WHERE professor_id = auth.uid()
  )
);
