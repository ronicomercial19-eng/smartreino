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

Analise os dados do aluno e gere recomendações específicas e acionáveis. Cada recomendação deve ter:
- type: "warning" (alerta), "suggestion" (sugestão) ou "success" (ponto positivo)
- title: Título curto e direto
- description: Explicação clara do ponto
- action: Ação específica recomendada (opcional)

Foque em:
1. Progressão de carga e volume
2. Frequência e aderência ao treino
3. Sinais de overtraining ou undertraining
4. Evolução de medidas e peso
5. Ajustes necessários no plano atual

Retorne JSON com: { "recommendations": [...] }`;

    const userPrompt = `Dados do Aluno:\n${JSON.stringify(studentData, null, 2)}\n\nHistórico de Treinos (últimos 10):\n${JSON.stringify(workoutHistory || [], null, 2)}\n\nAvaliações Físicas (últimas 5):\n${JSON.stringify(evaluations || [], null, 2)}\n\nGere 3-5 recomendações personalizadas.`;

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

    // Parse da resposta
    let recommendations;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations || [];
      } else {
        recommendations = [];
      }
    } catch (e) {
      console.error("[generate-recommendations] Erro ao parsear resposta:", e);
      recommendations = [];
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
