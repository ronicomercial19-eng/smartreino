import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentId, studentData } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Variáveis de ambiente não configuradas");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log(`[generate-recommendations] Gerando recomendações para aluno ${studentId}`);

    // Buscar dados adicionais do aluno
    const { data: workoutHistory } = await supabase
      .from("historico_treinos_realizados")
      .select("*")
      .eq("aluno_id", studentId)
      .order("data_treino", { ascending: false })
      .limit(10);

    const { data: evaluations } = await supabase
      .from("avaliacoes_unificadas")
      .select("*")
      .eq("aluno_id", studentId)
      .order("data_avaliacao", { ascending: false })
      .limit(5);

    // Construir prompt para IA
    const systemPrompt = `Você é um personal trainer especializado em análise de desempenho e periodização de treino.

Analise os dados do aluno e gere recomendações ESPECÍFICAS e ACIONÁVEIS. Cada recomendação deve ter:
- type: "warning" (alerta crítico), "suggestion" (melhoria sugerida) ou "success" (reconhecimento positivo)
- title: Título direto e objetivo (máx 60 caracteres)
- description: Explicação clara baseada em dados (100-150 caracteres)
- action: Ação específica recomendada com números concretos

CRITÉRIOS DE ANÁLISE:
1. Progressão de Carga: Identificar estagnação ou progressão inadequada
2. Volume Total: Analisar se está dentro dos limites ideais para o objetivo
3. Frequência: Comparar frequência planejada vs realizada
4. PSE: Identificar sinais de overtraining (PSE >8) ou undertraining (PSE <5)
5. Aderência: Se <70%, sugerir ajustes na programação
6. Evolução Física: Analisar tendências de peso e medidas

EXEMPLOS DE BOAS RECOMENDAÇÕES:
{
  "type": "warning",
  "title": "Aderência abaixo do esperado",
  "description": "Apenas 60% dos treinos foram realizados nas últimas 4 semanas. Isso pode comprometer os resultados.",
  "action": "Reduzir frequência para 3x/semana com maior intensidade ou revisar horários disponíveis"
}

{
  "type": "suggestion", 
  "title": "Oportunidade de progressão de carga",
  "description": "PSE médio de 5.8 indica treinos muito confortáveis. Há espaço para aumentar intensidade.",
  "action": "Aumentar carga em 5-10% nos exercícios principais ou reduzir descanso em 15-20s"
}

Retorne JSON com: { "recommendations": [...] }`;

    const userPrompt = `DADOS DO ALUNO:
${JSON.stringify(studentData, null, 2)}

HISTÓRICO DE TREINOS (últimos 10):
${JSON.stringify(workoutHistory || [], null, 2)}

AVALIAÇÕES FÍSICAS (últimas 5):
${JSON.stringify(evaluations || [], null, 2)}

Gere 3-5 recomendações baseadas nos dados reais. Seja específico com números e prazos.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.4,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[generate-recommendations] Erro na IA:", aiResponse.status, errorText);
      throw new Error(`Erro na IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error("IA não retornou resposta válida");
    }

    // Parse da resposta com múltiplas estratégias
    let recommendations;
    try {
      // Tentar extrair JSON de blocos de código markdown
      const codeBlockMatch = aiContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        const parsed = JSON.parse(codeBlockMatch[1]);
        recommendations = parsed.recommendations || [];
      } else {
        // Tentar extrair JSON direto
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          recommendations = parsed.recommendations || [];
        } else {
          // Fallback: criar recomendação genérica
          recommendations = [{
            type: "suggestion",
            title: "Análise Pendente",
            description: "Continue registrando treinos para receber recomendações mais precisas",
            action: "Registre pelo menos 5 treinos para análise detalhada"
          }];
        }
      }
    } catch (e) {
      console.error("[generate-recommendations] Erro ao parsear resposta:", e);
      recommendations = [{
        type: "warning",
        title: "Erro na Análise",
        description: "Não foi possível processar as recomendações. Tente novamente.",
        action: "Verificar logs para mais detalhes"
      }];
    }

    console.log(`[generate-recommendations] ${recommendations.length} recomendações geradas`);

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[generate-recommendations] Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
