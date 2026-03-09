import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { aluno_id, macro_rules_id } = await req.json();
    if (!aluno_id || !macro_rules_id) {
      return new Response(JSON.stringify({ error: "aluno_id and macro_rules_id required" }), { status: 400, headers: corsHeaders });
    }

    // Fetch all data in parallel
    const [profileRes, rulesRes, volumeRes, athleteRes] = await Promise.all([
      supabase.from("smart_treino_profiles").select("*").eq("aluno_id", aluno_id).single(),
      supabase.from("smart_treino_macro_rules").select("*").eq("id", macro_rules_id).single(),
      supabase.from("smart_treino_muscle_volume").select("*").eq("macro_rules_id", macro_rules_id),
      supabase.from("athletes").select("name, experience_level, goals, injuries, sessions_per_week").eq("id", aluno_id).single(),
    ]);

    if (profileRes.error) throw new Error(`Profile: ${profileRes.error.message}`);
    if (rulesRes.error) throw new Error(`Rules: ${rulesRes.error.message}`);
    if (volumeRes.error) throw new Error(`Volume: ${volumeRes.error.message}`);

    const profile = profileRes.data;
    const rules = rulesRes.data;
    const volumes = volumeRes.data;
    const athlete = athleteRes.data;

    const macroNames: Record<number, string> = {
      1: "Base Técnica / Estrutural",
      2: "Hipertrofia Funcional",
      3: "Força Máxima",
      4: "Manutenção / Performance",
    };

    const sessionLabels = ["A", "B", "C", "D", "E", "F"].slice(0, rules.weekly_frequency);

    const volumeSummary = volumes.map((v: any) =>
      `- ${v.muscle_group}: ${v.weekly_sets} séries/semana ${v.is_emphasis ? "(ÊNFASE)" : ""} | Distribuição: ${JSON.stringify(v.distribution_json)}`
    ).join("\n");

    const systemPrompt = `Você é o SMART TREINO da 9FIT — módulo v2.0 Premium.

MISSÃO: Converter decisões do Smart Periodizer em arquitetura executável de treino.

REGRAS ABSOLUTAS:
- Volume é definido por MÚSCULO, nunca por treino
- Músculo em ênfase = volume mais alto conforme definido
- Músculo normal = volume padrão conforme definido
- Nunca criar exercícios específicos — apenas definir padrões de movimento
- Cada sessão tem 4-6 slots de exercício
- Responder APENAS em JSON válido usando tool calling

REGRAS DO MOTOR:
- IF técnica degrada → bloquear progressão (incluir nota)
- IF RPE médio > alvo → reduzir densidade 20% (incluir nota)
- IF dor > 3/10 → reduzir volume local (incluir nota)
- IF 2 semanas técnica limpa + RPE ≤ alvo → liberar progressão

PROGRESSÃO DO MACROCICLO (12 semanas):
- Semanas 1-3: progressão leve
- Semana 4: absorção
- Semanas 5-7: progressão
- Semana 8: estabilização
- Semanas 9-10: última progressão
- Semana 11: manutenção
- Semana 12: deload (carga -30%, volume mantido)

SEGURANÇA:
- Proibido falha muscular no Macro 1
- Proibido progressão sem técnica
- Proibido aumento simultâneo de volume e carga`;

    const userPrompt = `GERE A ESTRUTURA DE TREINO para o atleta abaixo.

ATLETA: ${athlete?.name || "Atleta"}
NÍVEL: ${athlete?.experience_level || "intermediário"}
LESÕES: ${athlete?.injuries?.join(", ") || "nenhuma"}

PERFIL TÉCNICO:
- Dominante: ${profile.dominant_profile}
- Secundário: ${profile.secondary_profile || "nenhum"}
- Score Global: ${profile.score_global}
- Gargalos: ${profile.gargalos_tecnicos?.join(", ") || "nenhum"}
- Riscos: ${profile.riscos_estruturais?.join(", ") || "nenhum"}
- Modalidade: ${profile.modalidade_principal}

MACRO ATUAL: ${rules.macro_number} — ${macroNames[rules.macro_number as number] || rules.macro_objetivo}
OBJETIVO: ${rules.macro_objetivo}

PARÂMETROS:
- Reps: ${rules.reps_range}
- RPE alvo: ${rules.rpe_target}
- Progressão: ${rules.progression_type}
- Controle de densidade: ${rules.density_control ? "SIM" : "NÃO"}
- Volume travado: ${rules.volume_locked ? "SIM" : "NÃO"}
- Deload planejado: ${rules.deload_planned ? "SIM" : "NÃO"}
- Descanso compostos: ${rules.descanso_compostos}
- Descanso acessórios: ${rules.descanso_acessorios}
- Descanso core: ${rules.descanso_core}
- Carga inicial: ${rules.carga_inicial_percent}% 1RM

FREQUÊNCIA: ${rules.weekly_frequency}x/semana
SESSÕES: ${sessionLabels.join(", ")}

VOLUME SEMANAL POR MÚSCULO:
${volumeSummary}

Gere a estrutura de ${sessionLabels.length} sessões (${sessionLabels.join("/")}) respeitando TODO o volume definido acima.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_training_structure",
              description: "Generate the complete training session structure",
              parameters: {
                type: "object",
                properties: {
                  sessions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        session_label: { type: "string", description: "A, B, C, D etc" },
                        session_name: { type: "string", description: "Ex: MMII Anterior + Core" },
                        focus_muscles: { type: "array", items: { type: "string" } },
                        volume_percentage: { type: "number" },
                        slots: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              order: { type: "number" },
                              movement_pattern: { type: "string", description: "Ex: Empurrar horizontal, Puxar vertical, Anti-extensão" },
                              target_muscle: { type: "string" },
                              sets: { type: "number" },
                              reps: { type: "string" },
                              rest_seconds: { type: "number" },
                              intensity: { type: "string", description: "Ex: RPE 5-6, 60% 1RM" },
                              notes: { type: "string" },
                            },
                            required: ["order", "movement_pattern", "target_muscle", "sets", "reps", "rest_seconds"],
                          },
                        },
                      },
                      required: ["session_label", "session_name", "focus_muscles", "slots"],
                    },
                  },
                  progression_notes: { type: "string" },
                  safety_notes: { type: "string" },
                },
                required: ["sessions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_training_structure" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const text = await aiResponse.text();
      console.error("AI Gateway error:", status, text);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI error ${status}: ${text}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-smart-treino error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
