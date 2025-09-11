-- Add basic RLS policies for core tables (corrected column names)

-- User profiles extended - Users can view/edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles_extended
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles_extended
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles_extended
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Students table - Allow users to view and manage students (no owner column exists)
CREATE POLICY "Users can view students" ON public.estudantes
FOR SELECT USING (true);

CREATE POLICY "Users can create students" ON public.estudantes
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update students" ON public.estudantes
FOR UPDATE USING (true);

-- Training models - Users can view/manage models
CREATE POLICY "Users can view models" ON public.modelos_de_treino
FOR SELECT USING (auth.uid()::text = estudante_id OR estudante_id IS NULL);

CREATE POLICY "Users can create models" ON public.modelos_de_treino
FOR INSERT WITH CHECK (auth.uid()::text = estudante_id OR estudante_id IS NULL);

CREATE POLICY "Users can update models" ON public.modelos_de_treino
FOR UPDATE USING (auth.uid()::text = estudante_id OR estudante_id IS NULL);

-- Generated plans - Users can view/manage their own plans
CREATE POLICY "Users can view plans" ON public.planos_de_treino_gerados
FOR SELECT USING (auth.uid()::text = estudante_id);

CREATE POLICY "Users can create plans" ON public.planos_de_treino_gerados
FOR INSERT WITH CHECK (auth.uid()::text = estudante_id);

-- Periodization uploads - Users can view/manage their own uploads
CREATE POLICY "Users can view uploads" ON public.uploads_periodizacao
FOR SELECT USING (auth.uid()::text = estudante_id);

CREATE POLICY "Users can create uploads" ON public.uploads_periodizacao
FOR INSERT WITH CHECK (auth.uid()::text = estudante_id);

-- Student periodization - Users can view/manage their own data
CREATE POLICY "Users can view periodization" ON public.aluno_periodizacao
FOR SELECT USING (auth.uid()::text = estudante_id);

CREATE POLICY "Users can create periodization" ON public.aluno_periodizacao
FOR INSERT WITH CHECK (auth.uid()::text = estudante_id);