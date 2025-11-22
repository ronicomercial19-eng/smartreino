import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentId, objetivo, nivel, frequenciaSemanal, restricoes, ambiente } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get student data
    const { data: student, error: studentError } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      throw new Error('Aluno não encontrado');
    }

    // Build AI prompt
    const prompt = `Você é um personal trainer experiente. Crie um plano de treino COMPLETO e DETALHADO para o seguinte perfil:

PERFIL DO ALUNO:
- Nome: ${student.nome}
- Objetivo: ${objetivo || student.objetivo}
- Nível: ${nivel || student.nivel_experiencia}
- Frequência Semanal: ${frequenciaSemanal || student.frequencia_semanal} dias/semana
- Ambiente: ${ambiente || student.ambiente_treino}
- Peso: ${student.peso_atual || 'N/A'} kg
- Altura: ${student.altura_cm || 'N/A'} cm
- Restrições Médicas: ${restricoes || student.restricoes_medicas || 'Nenhuma'}

INSTRUÇÕES:
1. Crie um plano estruturado por DIA DA SEMANA
2. Para cada dia, inclua:
   - Nome/Foco do treino (ex: "Treino A - Peito e Tríceps")
   - Lista de 6-8 exercícios apropriados
   - Para cada exercício especifique:
     * Nome do exercício
     * Séries (número)
     * Repetições (range ou número fixo)
     * Tempo de descanso (segundos)
     * Observações técnicas importantes

3. Considere:
   - Progressão adequada ao nível
   - Equilíbrio muscular
   - Variação de intensidade
   - Restrições médicas mencionadas
   - Ambiente de treino disponível

4. Adicione orientações gerais sobre:
   - Aquecimento
   - Execução técnica
   - Progressão de carga
   - Sinais de alerta

FORMATO DE RESPOSTA JSON:
{
  "plan_name": "Nome do Plano",
  "duration_weeks": 4-8,
  "overview": "Breve descrição do plano e objetivos",
  "weekly_structure": [
    {
      "day": 1,
      "name": "Nome do Treino",
      "focus": "Grupos musculares trabalhados",
      "exercises": [
        {
          "name": "Nome do Exercício",
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 60,
          "notes": "Observações técnicas"
        }
      ]
    }
  ],
  "general_guidelines": {
    "warmup": "Instruções de aquecimento",
    "progression": "Como progredir",
    "warnings": "Sinais de alerta"
  }
}`;

    // Call Lovable AI Gateway
    const aiApiKey = Deno.env.get('LOVABLE_API_KEY');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Você é um personal trainer certificado com expertise em periodização e prescrição de treinos. Responda sempre em português brasileiro com planos detalhados e cientificamente embasados.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'google/gemini-2.0-flash-exp',
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    // Parse JSON response
    let workoutPlan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        workoutPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Falha ao processar resposta da IA');
    }

    // Save to database
    const authHeader = req.headers.get('Authorization');
    const userSupabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader! } }
    });

    const { data: savedPlan, error: saveError } = await userSupabase
      .from('planos_de_treino_gerados')
      .insert({
        estudante_id: studentId,
        professor_id: student.professor_id,
        nome_plano: workoutPlan.plan_name,
        objetivo: objetivo || student.objetivo,
        nivel: nivel || student.nivel_experiencia,
        duracao_semanas: workoutPlan.duration_weeks,
        plano_completo: workoutPlan,
        status: 'ativo'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving plan:', saveError);
      throw new Error('Erro ao salvar plano de treino');
    }

    return new Response(JSON.stringify({
      success: true,
      plan: savedPlan,
      message: 'Plano de treino gerado com sucesso!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-workout function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
