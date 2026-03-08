import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Não autorizado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify user with getUser (reliable across all versions)
    const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user: authUser }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !authUser) {
      return new Response(JSON.stringify({ success: false, error: 'Token inválido' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { studentId, objetivo, nivel, frequenciaSemanal, ambiente, restricoes, quizAnswers } = await req.json();

    // Use service role for data operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: student, error: studentError } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      throw new Error('Aluno não encontrado');
    }

    // Build prompt with ALL student data
    const prompt = `Você é um personal trainer experiente. Crie um plano de treino COMPLETO e DETALHADO para o seguinte perfil:

PERFIL DO ALUNO:
- Nome: ${student.nome}
- Objetivo: ${objetivo || student.objetivo}
- Nível: ${nivel || student.nivel_experiencia || 'iniciante'}
- Frequência Semanal: ${frequenciaSemanal || student.frequencia_semanal || 3} dias/semana
- Ambiente: ${ambiente || student.ambiente_treino || 'academia'}
- Peso: ${student.peso_atual || 'N/A'} kg
- Altura: ${student.altura_cm || 'N/A'} cm
- Restrições Médicas: ${restricoes || student.restricoes_medicas || 'Nenhuma'}

INFORMAÇÕES DETALHADAS DE TREINO:
- Tempo disponível por sessão: ${student.tempo_disponivel_min || 60} minutos
- Histórico de lesões: ${student.historico_lesoes || 'Nenhuma'}
- Foco muscular prioritário: ${student.foco_muscular || 'corpo_todo'}
- Condicionamento cardiovascular: ${student.condicionamento_cardio || 'medio'}
- Experiência com pesos livres: ${student.experiencia_pesos_livres || 'basico'}

PREFERÊNCIAS DO ALUNO:
- Intensidade: ${student.preferencia_intensidade || 'moderado'}
- Cardio: ${student.preferencia_cardio || 'integrado'}
- Equipamento preferido: ${student.preferencia_equipamento || 'ambos'}
- Treina sozinho: ${student.treina_sozinho ? 'Sim' : 'Com parceiro'}
- Horário preferido: ${student.horario_preferido || 'manha'}
- Meta de tempo: ${student.meta_tempo_meses || 3} meses

${quizAnswers ? `RESPOSTAS DO QUIZ SMARTREINO:
${JSON.stringify(quizAnswers, null, 2)}` : ''}

INSTRUÇÕES:
1. Crie um plano estruturado por DIA DA SEMANA (${frequenciaSemanal || student.frequencia_semanal || 3} dias)
2. Para cada dia, inclua:
   - Nome/Foco do treino (ex: "Treino A - Peito e Tríceps")
   - Tipo do treino (ex: "Peito e Tríceps")
   - Lista de 6-8 exercícios apropriados
   - Para cada exercício:
     * Nome do exercício
     * Séries (número como string, ex: "3")
     * Repetições (range, ex: "8-12")
     * Tempo de descanso (ex: "60s")
     * Observações técnicas

3. Considere:
   - Progressão adequada ao nível
   - Equilíbrio muscular
   - Restrições médicas e lesões
   - Ambiente e equipamento disponível
   - Tempo por sessão (${student.tempo_disponivel_min || 60} min)

FORMATO DE RESPOSTA JSON (OBRIGATÓRIO):
{
  "plan_name": "Nome do Plano",
  "duration_weeks": 4,
  "overview": "Breve descrição",
  "estrutura_semanal": [
    {
      "dia": "Treino A",
      "tipo": "Peito e Tríceps",
      "exercicios": [
        {
          "nome": "Supino Reto com Barra",
          "series": "4",
          "repeticoes": "8-12",
          "descanso": "90s",
          "observacao": "Manter escápulas retraídas"
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
            content: 'Você é um personal trainer certificado. Responda SEMPRE em JSON válido, em português brasileiro. O campo "estrutura_semanal" DEVE ser um array de objetos com dia, tipo e exercicios. Cada exercício deve ter nome, series, repeticoes, descanso e observacao como strings.'
          },
          { role: 'user', content: prompt }
        ],
        model: 'google/gemini-3-flash-preview',
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errText);
      throw new Error(`Erro na API de IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

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
      console.error('Raw content:', content);
      throw new Error('Falha ao processar resposta da IA');
    }

    const freq = frequenciaSemanal || student.frequencia_semanal || 3;

    // Save to planos_treino_aluno (the table StudentInterface reads from)
    const { data: savedPlan, error: saveError } = await supabase
      .from('planos_treino_aluno')
      .insert({
        aluno_id: studentId,
        professor_id: student.professor_id,
        nome_plano: workoutPlan.plan_name || 'Plano SmartReino',
        objetivo: objetivo || student.objetivo,
        duracao_semanas: workoutPlan.duration_weeks || 4,
        frequencia_semanal: freq,
        estrutura_treino: workoutPlan.estrutura_semanal || workoutPlan.weekly_structure || [],
        status: 'ativo',
        semana_atual: 1,
        descricao: workoutPlan.overview || '',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving plan to planos_treino_aluno:', saveError);
      throw new Error('Erro ao salvar plano de treino');
    }

    // Also save quiz answers back to the student record
    if (quizAnswers) {
      await supabase
        .from('alunos')
        .update({
          objetivo: quizAnswers.objetivo || student.objetivo,
          nivel_experiencia: quizAnswers.nivel || student.nivel_experiencia,
          frequencia_semanal: parseInt(quizAnswers.frequencia) || student.frequencia_semanal,
          ambiente_treino: quizAnswers.ambiente || student.ambiente_treino,
          tempo_disponivel_min: parseInt(quizAnswers.tempo) || student.tempo_disponivel_min,
          historico_lesoes: quizAnswers.lesoes || student.historico_lesoes,
          foco_muscular: quizAnswers.foco || student.foco_muscular,
          condicionamento_cardio: quizAnswers.cardio || student.condicionamento_cardio,
          experiencia_pesos_livres: quizAnswers.pesos || student.experiencia_pesos_livres,
        })
        .eq('id', studentId);
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
