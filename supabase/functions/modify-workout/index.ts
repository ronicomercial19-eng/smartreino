import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Fix: use getUser instead of non-existent getClaims
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !user) {
      console.error("[modify-workout] Auth error:", authError?.message);
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    console.log(`[modify-workout] Authenticated user: ${userId}`);

    const { workoutPlanId, currentPlan, userCommand } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurado");
    }

    console.log(`[modify-workout] Modificando treino ${workoutPlanId} com comando: ${userCommand}`);

    const systemPrompt = `Você é um especialista em prescrição de treinos do sistema 9FIT. Sua tarefa é modificar o plano de treino atual baseado no comando do usuário.

METODOLOGIA 9FIT — ESTRUTURA OBRIGATÓRIA DE 4 BLOCOS:
Todo treino segue obrigatoriamente esta sequência:
1. NEURAL (Ativação) — Preparação neuromuscular específica
2. INTEGRAÇÃO (Conexão) — Mobilidade e aquecimento funcional
3. BLOCO 9 (Execução Principal) — O foco do treino com exercícios principais
4. RESET (Recuperação) — Volta à calma e regeneração

PROTOCOLOS POR MODALIDADE:
- FORÇA: Tensão Mecânica (séries 4-6, reps 3-6, RPE 8-9, descanso 120-180s, cadência 3:1:2:0)
- HIPERTROFIA: Estresse Metabólico (séries 3-4, reps 8-15, RPE 7-8, descanso 60-90s, cadência 3:0:1:0)
- EMAGRECIMENTO: Circuitos + densidade alta (séries 3, reps 12-20, RPE 6-7, descanso 30-45s)
- PERFORMANCE: Potência + velocidade (séries 3-5, reps 3-8, RPE 7-9, descanso 90-120s)
- FUNCIONAL: Movimentos integrados (séries 2-3, reps 10-15, RPE 5-7, descanso 45-60s)

TÉCNICAS DE INTENSIDADE DISPONÍVEIS:
- Drop Set: Reduzir carga 20-30% sem descanso, 2-3 drops
- Rest-Pause: Pausas de 10-15s entre mini-séries até falha
- Super Set: Dois exercícios consecutivos sem descanso
- Giant Set: 3+ exercícios consecutivos
- Tempo Negativo: Fase excêntrica 4-6 segundos
- Cluster Set: Micro-pausas de 10-20s intra-série

REGRAS:
- Retorne APENAS o plano de treino modificado em formato JSON válido
- Mantenha a estrutura existente, aplique APENAS as modificações solicitadas
- Respeite os parâmetros do protocolo da modalidade
- Quando aplicar técnicas de intensidade, adicione campo "tecnica_intensidade" ao exercício

Formato de resposta OBRIGATÓRIO (JSON puro, sem markdown):
{
  "response": "Descrição clara da modificação realizada",
  "updatedPlan": { ... plano modificado completo ... }
}`;

    const userPrompt = `Plano de Treino Atual:\n${JSON.stringify(currentPlan, null, 2)}\n\nComando do Usuário: ${userCommand}\n\nModifique o treino conforme solicitado e retorne o resultado em JSON válido.`;

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
        temperature: 0.3,
        max_tokens: 8000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[modify-workout] Erro na IA:", aiResponse.status, errorText);
      throw new Error(`Erro na IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error("IA não retornou resposta válida");
    }

    console.log(`[modify-workout] AI response length: ${aiContent.length}`);

    let result;
    try {
      // Try to extract JSON from code blocks first
      const codeBlockMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = codeBlockMatch ? codeBlockMatch[1] : aiContent;
      
      // Find the outermost JSON object
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        result = JSON.parse(jsonStr.substring(firstBrace, lastBrace + 1));
      } else {
        result = { response: aiContent.substring(0, 500), updatedPlan: null };
      }
      
      if (result && !result.response) {
        result.response = "Treino modificado com sucesso!";
      }
    } catch (e) {
      console.error("[modify-workout] Erro ao fazer parse da resposta:", e);
      result = { response: aiContent.substring(0, 500), updatedPlan: null };
    }

    console.log(`[modify-workout] Modificação concluída. Has updatedPlan: ${!!result.updatedPlan}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[modify-workout] Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
