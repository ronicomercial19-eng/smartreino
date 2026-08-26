import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mapa de sinônimos: movement_pattern/target_muscle da IA -> termo de busca em exercises.target_muscles
// Vocabulário real confirmado em exercises.target_muscles (2026-08): glúteos, peitoral, Dorsais, latíssimo,
// romboides, trapézio, deltoides, Ombro, bíceps, tríceps, isquiotibiais, membros inferiores, core, Abdômen.
// "quadríceps", "panturrilha" e "dorsal" (singular) NÃO existem no catálogo — mapeados para o termo genérico
// mais próximo disponível ("membros inferiores") ou deixados para cair no fallback por movement_pattern.
const MUSCLE_SYNONYMS: Record<string, string[]> = {
  gluteos: ["glúteo"],
  "glúteos": ["glúteo"],
  quadriceps: ["membros inferiores"],
  "quadríceps": ["membros inferiores"],
  posterior_coxa: ["isquiotibiais", "membros inferiores"],
  posterior_de_coxa: ["isquiotibiais", "membros inferiores"],
  panturrilhas: ["membros inferiores"],
  panturrilha: ["membros inferiores"],
  peito: ["peitoral"],
  peitoral: ["peitoral"],
  dorsais: ["dorsais", "latíssimo", "romboides", "trapézio"],
  dorsal: ["dorsais", "latíssimo", "romboides", "trapézio"],
  costas: ["dorsais", "latíssimo", "romboides", "trapézio"],
  ombros: ["ombro", "deltoides"],
  ombro: ["ombro", "deltoides"],
  biceps: ["bíceps"],
  "bíceps": ["bíceps"],
  triceps: ["tríceps"],
  "tríceps": ["tríceps"],
  core: ["core", "abdômen"],
  abdomen: ["abdômen", "core"],
  "abdômen": ["abdômen", "core"],
};

async function resolveExerciseId(
  supabase: any,
  targetMuscle: string,
  movementPattern: string,
  cache: Map<string, string | null>
): Promise<string | null> {
  const key = `${targetMuscle}|${movementPattern}`;
  if (cache.has(key)) return cache.get(key)!;

  const normalized = (targetMuscle || "").toLowerCase().trim();
  const terms = MUSCLE_SYNONYMS[normalized] || [normalized];

  let foundId: string | null = null;
  for (const term of terms) {
    if (!term) continue;
    const { data, error } = await supabase.rpc("fn_search_exercises_by_muscle_term", {
      p_term: `%${term}%`,
      p_limit: 1,
    });
    if (!error && data && data.length > 0) {
      foundId = data[0].id;
      break;
    }
  }

  // Fallback: tenta pelo próprio movement_pattern como termo
  if (!foundId && movementPattern) {
    const { data, error } = await supabase.rpc("fn_search_exercises_by_muscle_term", {
      p_term: `%${movementPattern.toLowerCase()}%`,
      p_limit: 1,
    });
    if (!error && data && data.length > 0) foundId = data[0].id;
  }

  cache.set(key, foundId);
  return foundId;
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

    const { aluno_id, macro_rules_id, week_start } = await req.json();
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
    const sessions = Array.isArray(result.sessions) ? result.sessions : [];

    // ---- PERSISTÊNCIA: grava um daily_workout + workout_exercises por sessão gerada ----
    // Usa service role para não depender de RLS nas escritas em lote.
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Data-base da semana: hoje, ou week_start se fornecido (formato YYYY-MM-DD)
    const baseDate = week_start ? new Date(`${week_start}T00:00:00`) : new Date();
    // Ajusta para a segunda-feira da semana de baseDate
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - ((baseDate.getDay() + 6) % 7));

    const exerciseCache = new Map<string, string | null>();
    let diasGravados = 0;
    const warnings: string[] = [];

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      const workoutDate = new Date(monday);
      workoutDate.setDate(monday.getDate() + i);
      const isoDate = workoutDate.toISOString().slice(0, 10);

      // Monta lista de slots respeitando ordem: neural -> integration -> block_9 -> reset (se blocks), ou slots direto
      let orderedSlots: any[] = [];
      if (session.blocks) {
        orderedSlots = [
          ...(session.blocks.neural || []),
          ...(session.blocks.integration || []),
          ...(session.blocks.block_9 || []),
          ...(session.blocks.reset || []),
        ];
      } else if (Array.isArray(session.slots)) {
        orderedSlots = session.slots;
      }

      if (orderedSlots.length === 0) {
        warnings.push(`Sessão ${session.session_label ?? i + 1}: sem exercícios retornados pela IA — dia não gravado`);
        continue;
      }

      // Upsert do daily_workout (substitui se já existir para essa data/atleta)
      const { data: existing } = await admin
        .from("daily_workouts")
        .select("id")
        .eq("athlete_id", aluno_id)
        .eq("workout_date", isoDate)
        .maybeSingle();

      let dailyWorkoutId: string;
      const focusMuscles = session.focus_muscles || [];

      if (existing?.id) {
        dailyWorkoutId = existing.id;
        await admin.from("workout_exercises").delete().eq("daily_workout_id", dailyWorkoutId);
        await admin.from("daily_workouts").update({
          day_number: i + 1,
          day_name: session.session_name ?? session.session_label ?? `Dia ${i + 1}`,
          focus_muscles: focusMuscles,
          workout_type: protocolData ? protocolData.pillar : "smart_treino",
          updated_at: new Date().toISOString(),
        }).eq("id", dailyWorkoutId);
      } else {
        const { data: inserted, error: insertErr } = await admin.from("daily_workouts").insert({
          athlete_id: aluno_id,
          workout_date: isoDate,
          day_number: i + 1,
          day_name: session.session_name ?? session.session_label ?? `Dia ${i + 1}`,
          focus_muscles: focusMuscles,
          workout_type: protocolData ? protocolData.pillar : "smart_treino",
        }).select("id").single();
        if (insertErr || !inserted) {
          warnings.push(`Sessão ${session.session_label ?? i + 1}: falha ao criar daily_workout — ${insertErr?.message}`);
          continue;
        }
        dailyWorkoutId = inserted.id;
      }

      // Resolve exercise_id e monta linhas de workout_exercises
      const rows = [];
      for (let order = 0; order < orderedSlots.length; order++) {
        const slot = orderedSlots[order];
        const exerciseId = await resolveExerciseId(
          admin,
          slot.target_muscle ?? "",
          slot.movement_pattern ?? "",
          exerciseCache
        );
        if (!exerciseId) {
          warnings.push(`Sessão ${session.session_label ?? i + 1}, slot ${order + 1}: nenhum exercício encontrado para "${slot.target_muscle ?? slot.movement_pattern}"`);
          continue;
        }
        rows.push({
          daily_workout_id: dailyWorkoutId,
          exercise_id: exerciseId,
          exercise_order: slot.order ?? order + 1,
          sets: slot.sets ?? 3,
          reps_range: slot.reps ?? "8-12",
          rest_seconds: slot.rest_seconds ?? 60,
          load_percentage: slot.intensity ?? null,
          tempo: slot.cadence ?? null,
          rpe_target: rules.rpe_target ? Math.round(rules.rpe_target) : null,
          notes: slot.notes ?? null,
        });
      }

      if (rows.length > 0) {
        const { error: wErr } = await admin.from("workout_exercises").insert(rows);
        if (wErr) {
          warnings.push(`Sessão ${session.session_label ?? i + 1}: falha ao gravar exercícios — ${wErr.message}`);
          continue;
        }
        diasGravados++;
      } else {
        warnings.push(`Sessão ${session.session_label ?? i + 1}: nenhum exercício resolvido — daily_workout criado mas vazio`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: result,
      dias_gravados: diasGravados,
      total_sessoes_geradas: sessions.length,
      warnings,
    }), {
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
