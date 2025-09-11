-- Add corrected RLS policies with proper type casting

-- Training models - Fix UUID casting
CREATE POLICY "Users can view models" ON public.modelos_de_treino
FOR SELECT USING (auth.uid() = estudante_id::uuid OR estudante_id IS NULL);

CREATE POLICY "Users can create models" ON public.modelos_de_treino
FOR INSERT WITH CHECK (auth.uid() = estudante_id::uuid OR estudante_id IS NULL);

CREATE POLICY "Users can update models" ON public.modelos_de_treino
FOR UPDATE USING (auth.uid() = estudante_id::uuid OR estudante_id IS NULL);

-- Generated plans - Fix UUID casting
CREATE POLICY "Users can view plans" ON public.planos_de_treino_gerados
FOR SELECT USING (auth.uid() = estudante_id::uuid);

CREATE POLICY "Users can create plans" ON public.planos_de_treino_gerados
FOR INSERT WITH CHECK (auth.uid() = estudante_id::uuid);

-- Periodization uploads - Fix UUID casting
CREATE POLICY "Users can view uploads" ON public.uploads_periodizacao
FOR SELECT USING (auth.uid() = estudante_id::uuid);

CREATE POLICY "Users can create uploads" ON public.uploads_periodizacao
FOR INSERT WITH CHECK (auth.uid() = estudante_id::uuid);

-- Student periodization - Fix UUID casting
CREATE POLICY "Users can view periodization" ON public.aluno_periodizacao
FOR SELECT USING (auth.uid() = estudante_id::uuid);

CREATE POLICY "Users can create periodization" ON public.aluno_periodizacao
FOR INSERT WITH CHECK (auth.uid() = estudante_id::uuid);