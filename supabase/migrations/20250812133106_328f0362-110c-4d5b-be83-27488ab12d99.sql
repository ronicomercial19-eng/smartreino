
-- Criar tabela para modelos selecionados por alunos
CREATE TABLE IF NOT EXISTS student_selected_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES workout_models(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, model_id)
);

-- Criar tabela para periodizações dos alunos
CREATE TABLE IF NOT EXISTS student_periodizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  periodization_plan_id UUID NOT NULL REFERENCES periodization_plans(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, periodization_plan_id)
);

-- Criar tabela para notificações agendadas (WhatsApp)
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  whatsapp_number TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para student_selected_models
ALTER TABLE student_selected_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors can manage their students' selected models"
ON student_selected_models
FOR ALL
USING (
  student_id IN (
    SELECT id FROM students WHERE professor_id = auth.uid()
  )
);

CREATE POLICY "Students can view their selected models"
ON student_selected_models
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM students WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )::text
  )
);

-- RLS para student_periodizations
ALTER TABLE student_periodizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors can manage their students' periodizations"
ON student_periodizations
FOR ALL
USING (
  student_id IN (
    SELECT id FROM students WHERE professor_id = auth.uid()
  )
);

CREATE POLICY "Students can view their periodizations"
ON student_periodizations
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM students WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )::text
  )
);

-- RLS para scheduled_notifications
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors can manage notifications for their students"
ON scheduled_notifications
FOR ALL
USING (
  student_id IN (
    SELECT id FROM students WHERE professor_id = auth.uid()
  )
);

CREATE POLICY "Students can view their notifications"
ON scheduled_notifications
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM students WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )::text
  )
);

-- Views auxiliares
CREATE OR REPLACE VIEW vw_workout_modalities AS
SELECT 
  stimulus_type as modality,
  COUNT(*) as model_count,
  array_agg(DISTINCT level) as levels_available
FROM workout_models 
WHERE stimulus_type IS NOT NULL
GROUP BY stimulus_type
ORDER BY model_count DESC;

CREATE OR REPLACE VIEW vw_student_selected_models AS
SELECT 
  ssm.id,
  ssm.student_id,
  s.nome as student_name,
  ssm.model_id,
  wm.name as model_name,
  wm.general_objective,
  wm.level,
  wm.stimulus_type,
  ssm.notes,
  ssm.created_at
FROM student_selected_models ssm
JOIN students s ON ssm.student_id = s.id
JOIN workout_models wm ON ssm.model_id = wm.id;

CREATE OR REPLACE VIEW vw_student_periodizations AS
SELECT 
  sp.id,
  sp.student_id,
  s.nome as student_name,
  s.email as student_email,
  pp.plan_name,
  pp.periodization_type,
  pp.macrocycle_duration_weeks,
  pp.total_phases,
  pp.current_phase,
  sp.created_at
FROM student_periodizations sp
JOIN students s ON sp.student_id = s.id
JOIN periodization_plans pp ON sp.periodization_plan_id = pp.id;

-- Atualizar workout_models para incluir alguns dados de exemplo organizados por modalidade
INSERT INTO workout_models (name, general_objective, method_description, level, periodization_phase, week_number, stimulus_type, model_order) VALUES
-- Força
('Força Básica - Iniciantes', 'Desenvolvimento de força fundamental', 'Exercícios básicos com progressão linear', 'Básico', 'Base', 1, 'Força', 1),
('Força Intermediária - Push/Pull', 'Força específica por padrões de movimento', 'Divisão push/pull com intensidade moderada', 'Intermediário', 'Intensificação', 2, 'Força', 2),
('Força Avançada - Powerlifting', 'Maximização da força nos 3 levantamentos', 'Método conjugado com variações', 'Avançado', 'Realização', 3, 'Força', 3),

-- Hipertrofia
('Hipertrofia Básica - Full Body', 'Ganho de massa muscular geral', 'Treino full body com volume moderado', 'Básico', 'Base', 1, 'Hipertrofia', 4),
('Hipertrofia Push/Pull/Legs', 'Hipertrofia com divisão muscular', 'Alto volume com divisão por grupos', 'Intermediário', 'Intensificação', 2, 'Hipertrofia', 5),
('Hipertrofia Avançada - German Volume', 'Máximo estímulo hipertrófico', 'Alto volume com intensidade controlada', 'Avançado', 'Intensificação', 2, 'Hipertrofia', 6),

-- Cardio
('Cardio Básico - LISS', 'Melhora da capacidade aeróbica', 'Exercício contínuo de baixa intensidade', 'Básico', 'Base', 1, 'Cardio', 7),
('HIIT Intermediário', 'Condicionamento cardiovascular', 'Intervalos de alta intensidade', 'Intermediário', 'Intensificação', 2, 'Cardio', 8),
('Cardio Avançado - Tabata', 'Máximo VO2 e condicionamento', 'Protocolos de alta intensidade', 'Avançado', 'Intensificação', 3, 'Cardio', 9),

-- Funcional
('Funcional Básico - Movimentos Naturais', 'Melhora da funcionalidade diária', 'Padrões básicos de movimento', 'Básico', 'Base', 1, 'Funcional', 10),
('CrossTraining Intermediário', 'Condicionamento geral', 'WODs variados com intensidade', 'Intermediário', 'Intensificação', 2, 'Funcional', 11),
('Funcional Avançado - Athletic', 'Performance atlética', 'Movimentos complexos e explosivos', 'Avançado', 'Realização', 3, 'Funcional', 12),

-- Mobilidade
('Mobilidade Básica - Flexibilidade', 'Melhora da amplitude articular', 'Alongamentos estáticos e dinâmicos', 'Básico', 'Base', 1, 'Mobilidade', 13),
('Yoga Flow', 'Mobilidade e equilíbrio', 'Sequências de yoga adaptadas', 'Intermediário', 'Base', 1, 'Mobilidade', 14),
('Mobilidade Corretiva', 'Correção de disfunções', 'Protocolos específicos de mobilização', 'Avançado', 'Base', 1, 'Mobilidade', 15)

ON CONFLICT (id) DO NOTHING;
