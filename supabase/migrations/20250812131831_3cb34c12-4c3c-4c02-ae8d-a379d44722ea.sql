
-- Criar tabela workout_models que está faltando
CREATE TABLE IF NOT EXISTS workout_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  general_objective TEXT,
  method_description TEXT,
  level TEXT CHECK (level IN ('Básico', 'Intermediário', 'Avançado')),
  initial_activation TEXT,
  format_type TEXT,
  structure_description TEXT,
  sequence_description TEXT,
  timer_enabled BOOLEAN DEFAULT FALSE,
  timer_type TEXT,
  voice_cadence_enabled BOOLEAN DEFAULT FALSE,
  voice_cadence_pattern TEXT,
  additional_observations TEXT,
  periodization_phase TEXT CHECK (periodization_phase IN ('Base', 'Intensificação', 'Realização', 'Deload')),
  week_number INTEGER,
  stimulus_type TEXT,
  exercise_fields JSONB DEFAULT '[]'::JSONB,
  model_order INTEGER DEFAULT 0,
  plan_id UUID REFERENCES periodization_plans(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE TRIGGER update_workout_models_updated_at
    BEFORE UPDATE ON workout_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS para workout_models
ALTER TABLE workout_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view workout models" 
ON workout_models FOR SELECT 
USING (true);

-- Inserir alguns dados de exemplo
INSERT INTO workout_models (name, general_objective, method_description, level, periodization_phase, week_number, stimulus_type, model_order) VALUES
('Treino Full Body Iniciante', 'Desenvolvimento geral de força e condicionamento', 'Método tradicional com exercícios compostos', 'Básico', 'Base', 1, 'Força', 1),
('HIIT Cardio Avançado', 'Melhoria da capacidade cardiovascular', 'Intervalos de alta intensidade', 'Avançado', 'Intensificação', 3, 'Cardio', 2),
('Push/Pull/Legs', 'Hipertrofia muscular', 'Divisão por grupos musculares', 'Intermediário', 'Intensificação', 2, 'Hipertrofia', 3),
('Deload Week Recovery', 'Recuperação ativa e descanso', 'Volume reduzido com foco na técnica', 'Básico', 'Deload', 4, 'Recuperação', 4);

-- Criar view para resumo de periodização
CREATE OR REPLACE VIEW vw_periodization_summary AS
SELECT 
  pm.id,
  pm.plan_name,
  pm.periodization_type,
  pm.macrocycle_duration_weeks,
  pm.total_phases,
  COUNT(wm.id) as total_workout_models,
  array_agg(DISTINCT wm.level) as levels_covered,
  array_agg(DISTINCT wm.periodization_phase) as phases_covered
FROM periodization_plans pm
LEFT JOIN workout_models wm ON wm.plan_id = pm.id
GROUP BY pm.id, pm.plan_name, pm.periodization_type, pm.macrocycle_duration_weeks, pm.total_phases;
