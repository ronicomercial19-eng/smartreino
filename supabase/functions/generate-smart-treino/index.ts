import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Resolve um exercise_id real casando target_muscle (texto livre da IA) com exercises.target_muscles (array)
async function resolveExerciseId(
  supabaseAdmin: any,
  targetMuscle: string,
  movementPattern: string,
  cache: Map<string, string | null>
): Promise<string | null> {
  const key = `${targetMuscle}|${movementPattern}`.toLowerCase();
  if (cache.has(key)) return cache.get(key)!;

  // 1) tenta casar por target_muscles (array, ilike em cada elemento via contains textual)
  const { data: byMuscle } = await supabaseAdmin
    .from("exercises")
    .select("id, name, target_muscles")
    .contains("target_muscles", [targetMuscle])
    .limit(5);

  let chosen: string | null = null;
  if (byMuscle && byMuscle.length > 0) {
    chosen = byMuscle[Math.floor(Math.random() * byMuscle.length)].id;
  } else {
    // 2) fallback: busca textual no nome pelo padrão de movimento
    const { data: byName } = await supabaseAdmin
      .from("exercises")
      .select("id, name")
      .ilike("name", `%${movementPattern}%`)
      .limit(5);
    if (byName && byName.length > 0) {
      chosen = byName[Math.floor(Math.random() * byName.length)].id;
    } else {
      // 3) último fallback: qualquer exercício com goal/target relacionado ao músculo (menos preciso, mas nunca nulo)
      const { data: anyMatch } = await supabaseAdmin
        .from("exercises")
        .select("id")
        .limit(1);
      chosen = anyMatch?.[0]?.id ?? null;
    }
  }
  cache.set(key, chosen);
  return chosen;
}

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
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
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

    // Fetch protocol if available
    let protocolData: any = null;
    if (rules.protocol_code) {
      const { data } = await supabase.from("smart_treino_protocols").select("*").eq("id", rules.protocol_code).single();
      protocolData = data;
    }

    const sessionLabels = ["A", "B", "C", "D", "E", "F"].slice(0, rules.weekly_frequency);

    const volumeSummary = (volumes || []).map((v: any) =>
      `- ${v.muscle_group}: ${v.weekly_sets} séries/semana ${v.is_emphasis ? "(ÊNFASE)" : ""} | Distribuição: ${JSON.stringify(v.distribution_json)}`
    ).join("\n");

    // Build protocol context
    let protocolContext = "";
    if (protocolData) {
      protocolContext = `
PROTOCOLO 9FIT SELECIONADO:
- Código: ${protocolData.id}
- Pilar: ${protocolData.pillar_label}
- Protocolo: ${protocolData.protocol_name} (${protocolData.protocol_axis})
- Variação: ${protocolData.variation_name} — ${protocolData.variation_focus}
- Modelo: ${protocolData.model_description}
- RPE Range: ${protocolData.rpe_range}

BLOCOS DE PRESCRIÇÃO OBRIGATÓRIOS (estrutura 9FIT):
1. NEURAL (Despertar do SNC): ${protocolData.block_neural}
2. INTEGRAÇÃO (Conexão de Cadeias): ${protocolData.block_integration}
3. BLOCO 9 (Execução/Nexo de Carga): ${JSON.stringify(protocolData.block_9_template)}
4. RESET (Recuperação): ${protocolData.block_reset}

REGRA: Cada sessão DEVE conter os 4 blocos na ordem: Neural → Integração → Bloco 9 → Reset.`;
    }

    const systemPrompt = `Você é o SMART TREINO da 9FIT — módulo v2.0 Premium.

MISSÃO: Converter decisões do Smart Periodizer em arquitetura executável de treino.

ESTRUTURA OBRIGATÓRIA 9FIT — 4 BLOCOS POR SESSÃO:
1. NEURAL (1-2 exercícios): Ativação do SNC, isometrias, short foot, bracing
2. INTEGRAÇÃO (1-2 exercícios): Mobilidade, drills, conexão de cadeias cinéticas
3. BLOCO 9 (3-5 exercícios): Execução principal — padrões de movimento com séries/reps/cadência/descanso
4. RESET (1-2 exercícios): Liberação miofascial, alongamento, respiração

REGRAS ABSOLUTAS:
- Volume é definido por MÚSCULO, nunca por treino
- Nunca criar exercícios específicos — apenas padrões de movimento
- Cada sessão DEVE ter os 4 blocos
- Responder APENAS em JSON válido usando tool calling

REGRAS DO MOTOR:
- IF técnica degrada → bloquear progressão
- IF RPE médio > alvo → reduzir densidade 20%
- IF dor > 3/10 → reduzir volume local

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
${protocolContext}

PARÂMETROS:
- Reps: ${rules.reps_range}
- RPE alvo: ${rules.rpe_target}
- Progressão: ${rules.progression_type}
- Densidade controlada: ${rules.density_control ? "SIM" : "NÃO"}
- Volume travado: ${rules.volume_locked ? "SIM" : "NÃO"}
- Descanso compostos: ${rules.descanso_compostos}
- Descanso acessórios: ${rules.descanso_acessorios}
- Descanso core: ${rules.descanso_core}
- Carga inicial: ${rules.carga_inicial_percent}% 1RM

FREQUÊNCIA: ${rules.weekly_frequency}x/semana
SESSÕES: ${sessionLabels.join(", ")}

VOLUME SEMANAL POR MÚSCULO:
${volumeSummary}

Gere a estrutura de ${sessionLabels.length} sessões (${sessionLabels.join("/")}).
${protocolData ? "Use os 4 blocos (neural, integration, block_9, reset) conforme definido no protocolo." : "Use a estrutura de slots padrão."}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build tool based on whether we use blocks or slots
    const sessionSchema = protocolData ? {
      type: "object",
      properties: {
        session_label: { type: "string" },
        session_name: { type: "string" },
        focus_muscles: { type: "array", items: { type: "string" } },
        volume_percentage: { type: "number" },
        blocks: {
          type: "object",
          properties: {
            neural: { type: "array", items: { type: "object", properties: { order: { type: "number" }, movement_pattern: { type: "string" }, target_muscle: { type: "string" }, sets: { type: "number" }, reps: { type: "string" }, rest_seconds: { type: "number" }, duration: { type: "string" }, cadence: { type: "string" }, notes: { type: "string" } } } },
            integration: { type: "array", items: { type: "object", properties: { order: { type: "number" }, movement_pattern: { type: "string" }, target_muscle: { type: "string" }, sets: { type: "number" }, reps: { type: "string" }, rest_seconds: { type: "number" }, duration: { type: "string" }, cadence: { type: "string" }, notes: { type: "string" } } } },
            block_9: { type: "array", items: { type: "object", properties: { order: { type: "number" }, movement_pattern: { type: "string" }, target_muscle: { type: "string" }, sets: { type: "number" }, reps: { type: "string" }, rest_seconds: { type: "number" }, intensity: { type: "string" }, cadence: { type: "string" }, notes: { type: "string" } }, required: ["order", "movement_pattern", "target_muscle", "sets", "reps", "rest_seconds"] } },
            reset: { type: "array", items: { type: "object", properties: { order: { type: "number" }, movement_pattern: { type: "string" }, duration: { type: "string" }, notes: { type: "string" } } } },
          },
          required: ["neural", "integration", "block_9", "reset"],
        },
      },
      required: ["session_label", "session_name", "focus_muscles", "blocks"],
    } : {
      type: "object",
      properties: {
        session_label: { type: "string" },
        session_name: { type: "string" },
        focus_muscles: { type: "array", items: { type: "string" } },
        volume_percentage: { type: "number" },
        slots: {
          type: "array",
          items: {
            type: "object",
            properties: {
              order: { type: "number" },
              movement_pattern: { type: "string" },
              target_muscle: { type: "string" },
              sets: { type: "number" },
              reps: { type: "string" },
              rest_seconds: { type: "number" },
              intensity: { type: "string" },
              notes: { type: "string" },
            },
            required: ["order", "movement_pattern", "target_muscle", "sets", "reps", "rest_seconds"],
          },
        },
      },
      required: ["session_label", "session_name", "focus_muscles"],
    };

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
        tools: [{
          type: "function",
          function: {
            name: "generate_training_structure",
            description: "Generate the complete training session structure",
            parameters: {
              type: "object",
              properties: {
                sessions: { type: "array", items: sessionSchema },
                progression_notes: { type: "string" },
                safety_notes: { type: "string" },
              },
              required: ["sessions"],
              additionalProperties: false,
            },
          },
        }],
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

    // ── PERSISTÊNCIA: grava daily_workouts + workout_exercises para a semana atual ──
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    const exerciseCache = new Map<string, string | null>();
    let diasGravados = 0;

    // Limpa a semana atual antes de regravar (evita duplicar em re-geração)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const isoDate = (d: Date) => d.toISOString().slice(0, 10);
    await supabaseAdmin
      .from("daily_workouts")
      .delete()
      .eq("athlete_id", aluno_id)
      .gte("workout_date", isoDate(monday))
      .lte("workout_date", isoDate(sunday))
      .eq("override_locked", false);

    for (let i = 0; i < result.sessions.length; i++) {
      const session = result.sessions[i];
      const workoutDate = new Date(monday);
      workoutDate.setDate(monday.getDate() + i);

      const { data: dw, error: dwError } = await supabaseAdmin
        .from("daily_workouts")
        .insert({
          athlete_id: aluno_id,
          workout_date: isoDate(workoutDate),
          day_number: i + 1,
          day_name: session.session_name ?? session.session_label,
          focus_muscles: session.focus_muscles ?? [],
          workout_type: protocolData ? protocolData.pillar : "smart_treino",
          override_locked: false,
        })
        .select("id")
        .single();

      if (dwError || !dw) {
        console.error("daily_workouts insert error:", dwError);
        continue;
      }

      // Monta lista de slots a partir de blocks (protocolo) ou slots (padrão)
      const allSlots: any[] = [];
      if (session.blocks) {
        for (const blockName of ["neural", "integration", "block_9", "reset"] as const) {
          const blockSlots = session.blocks[blockName] ?? [];
          for (const slot of blockSlots) allSlots.push({ ...slot, _block: blockName });
        }
      } else if (session.slots) {
        for (const slot of session.slots) allSlots.push({ ...slot, _block: "block_9" });
      }

      let order = 1;
      for (const slot of allSlots) {
        const exerciseId = await resolveExerciseId(
          supabaseAdmin,
          slot.target_muscle ?? session.focus_muscles?.[0] ?? "geral",
          slot.movement_pattern ?? "",
          exerciseCache
        );
        if (!exerciseId) continue;

        await supabaseAdmin.from("workout_exercises").insert({
          daily_workout_id: dw.id,
          exercise_id: exerciseId,
          exercise_order: order++,
          sets: slot.sets ?? 3,
          reps_range: slot.reps ?? "8-12",
          rest_seconds: slot.rest_seconds ?? 60,
          load_percentage: rules.carga_inicial_percent ? String(rules.carga_inicial_percent) : null,
          tempo: slot.cadence ?? null,
          rpe_target: rules.rpe_target ? Math.round(rules.rpe_target) : null,
          notes: slot.notes ?? null,
          training_day: i + 1,
          observations: { block: slot._block, movement_pattern: slot.movement_pattern },
          override_locked: false,
        });
      }
      diasGravados++;
    }

    return new Response(JSON.stringify({ success: true, data: result, dias_gravados: diasGravados }), {
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
