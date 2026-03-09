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
    // JWT Authentication
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

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authSupabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;
    console.log(`[modify-workout] Authenticated user: ${userId}`);

    const { workoutPlanId, currentPlan, userCommand } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurado");
    }

    console.log(`[modify-workout] Modificando treino ${workoutPlanId} com comando: ${userCommand}`);

    const systemPrompt = `Você é um especialista em prescrição de treinos. Sua tarefa é modificar o plano de treino atual baseado no comando do usuário.

IMPORTANTE: 
- Retorne APENAS o plano de treino modificado em formato JSON
- Mantenha a estrutura original do plano
- Aplique APENAS as modificações solicitadas
- Seja preciso e específico nas alterações
- Se a solicitação for ambígua, sugira a melhor interpretação

Formato de resposta esperado:
{
  "response": "Descrição clara da modificação realizada",
  "updatedPlan": { ... plano modificado em JSON ... }
}`;

    const userPrompt = `Plano de Treino Atual:\n${JSON.stringify(currentPlan, null, 2)}\n\nComando do Usuário: ${userCommand}\n\nModifique o treino conforme solicitado e retorne o resultado.`;

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
        max_tokens: 4000
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

    let result;
    try {
      const codeBlockMatch = aiContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        result = JSON.parse(codeBlockMatch[1]);
      } else {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          result = {
            response: aiContent,
            updatedPlan: null
          };
        }
      }
      
      if (result && !result.response) {
        result.response = "Treino modificado com sucesso!";
      }
      
    } catch (e) {
      console.error("[modify-workout] Erro ao fazer parse da resposta:", e);
      result = {
        response: aiContent.substring(0, 500),
        updatedPlan: null
      };
    }

    console.log(`[modify-workout] Modificação concluída: ${result.response}`);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[modify-workout] Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
