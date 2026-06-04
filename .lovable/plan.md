## Objetivo

Tornar o SmartTreino operacional ponta-a-ponta: gerar treino (rápido / planejado / ajustado), entregar no FitPro via API do professor, respeitar a periodização do aluno e usar o catálogo 9x9x9 como motor real.

## Fluxos cobertos

1. **Treino rápido (aluno solicita / professor gera na hora)**
  - Entrada: `aluno_id` (canônico).
  - Motor: RPC `prescrever_treino` já existente (catálogo 9x9x9 + anti-repetição 7d) + fallback de protocolo padrão.
  - Saída: treino estruturado (Neural / Integration / Block 9 / Reset) + envio FitPro.
2. **Planejamento completo a partir da periodização**
  - Lê `fitpro_smartperiodizer_periodizations` / `athlete_periodizations` (via `vw_alunos_canonical`).
  - Se não houver periodização → cria notificação ("Cadastrar periodização no SmartPeriodizer") e bloqueia geração.
  - Se houver → gera matriz semana×sessão chamando `prescrever_treino` por dia, agregando no `planos_treino_aluno`.
3. **Ajuste via chat RON**
  - Edge function `modify-workout` (já existe) recebe `workout_plan_id` + comando → re-prescreve mantendo contexto.
  - Resultado sincronizado de volta ao FitPro.
4. **Entrega no FitPro**
  - Nova edge function `fitpro-deliver-workout`: pega `fitpro_student_id` do `fitpro_student_map`, autentica com `FITPRO_API_KEY` do professor (secret), faz POST no endpoint do FitPro.
  - Loga em `fitpro_events` (sucesso/erro) e em `historico_treinos_realizados` para auditoria.
5. APIS COM FITPRO 
  FITPRO API   
  [https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/fitpro-api](https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/fitpro-api)
  ```typescript
  // FitPro ↔ SmartPeriodizer integration API v1
  // Authentication: x-api-key header validated against fitpro_connections.api_key_hash
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  };

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  async function sha256(input: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function authenticate(req: Request, supabase: any) {
    const key = req.headers.get("x-api-key") || "";
    if (!key) return { ok: false, status: 401, error: "Missing x-api-key" };
    const hash = await sha256(key);
    const { data, error } = await supabase
      .from("fitpro_connections")
      .select("id, name, status, professor_id")
      .eq("api_key_hash", hash)
      .eq("status", "active")
      .maybeSingle();
    if (error || !data) return { ok: false, status: 401, error: "Invalid API key" };
    return { ok: true, connection: data };
  }

  async function logEvent(supabase: any, connection_id: string, event_type: string, body: any = {}) {
    try {
      await supabase.from("fitpro_events").insert({
        connection_id, event_type, module: "SmartPeriodizer",
        fitpro_student_id: body.fitpro_student_id ?? null,
        fitpro_professor_id: body.fitpro_professor_id ?? null,
        entity_type: body.entity_type ?? null,
        entity_id: body.entity_id ?? null,
        payload: body.payload ?? body ?? {},
      });
    } catch (e) { console.warn("logEvent failed:", e); }
  }

  async function resolveAthlete(supabase: any, conn_id: string, fitpro_student_id: string) {
    const { data } = await supabase
      .from("fitpro_student_map")
      .select("athlete_id")
      .eq("connection_id", conn_id)
      .eq("fitpro_student_id", fitpro_student_id)
      .maybeSingle();
    return data?.athlete_id || null;
  }

  Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    const url = new URL(req.url);
    const path = url.pathname.replace(/^.*\/fitpro-api/, "").replace(/\/+$/, "") || "/";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    try {
      // --- Public: health ---
      if (req.method === "GET" && (path === "/v1/health" || path === "/health")) {
        return json({ status: "ok", service: "fitpro-api", version: "1.0", time: new Date().toISOString() });
      }

      // All other endpoints require x-api-key
      const auth = await authenticate(req, supabase);
      if (!auth.ok) return json({ error: auth.error }, auth.status);
      const conn = auth.connection!;

      // --- POST /v1/fitpro/connect ---
      if (req.method === "POST" && path === "/v1/fitpro/connect") {
        await supabase.from("fitpro_connections").update({ last_sync_at: new Date().toISOString() }).eq("id", conn.id);
        await logEvent(supabase, conn.id, "smartperiodizer_connected", { payload: { name: conn.name } });
        return json({ status: "connected", connection_id: conn.id, name: conn.name });
      }

      // --- POST /v1/fitpro/sync ---
      if (req.method === "POST" && path === "/v1/fitpro/sync") {
        const body = await req.json().catch(() => ({}));
        const students: any[] = Array.isArray(body.students) ? body.students : [];
        let upserted = 0;
        for (const s of students) {
          if (!s.fitpro_student_id) continue;
          await supabase.from("fitpro_student_map").upsert({
            connection_id: conn.id,
            fitpro_student_id: String(s.fitpro_student_id),
            fitpro_professor_id: s.fitpro_professor_id ? String(s.fitpro_professor_id) : null,
            athlete_id: s.athlete_id || null,
            context: s.context || {},
            last_seen_at: new Date().toISOString(),
          }, { onConflict: "connection_id,fitpro_student_id" });
          upserted++;
        }
        await supabase.from("fitpro_connections").update({ last_sync_at: new Date().toISOString() }).eq("id", conn.id);
        await logEvent(supabase, conn.id, "smartperiodizer_synced", { payload: { upserted } });
        return json({ synced: upserted });
      }

      // --- POST /v1/fitpro/student-context ---
      if (req.method === "POST" && path === "/v1/fitpro/student-context") {
        const body = await req.json();
        if (!body?.fitpro_student_id) return json({ error: "fitpro_student_id required" }, 400);
        await supabase.from("fitpro_student_map").upsert({
          connection_id: conn.id,
          fitpro_student_id: String(body.fitpro_student_id),
          fitpro_professor_id: body.fitpro_professor_id ? String(body.fitpro_professor_id) : null,
          athlete_id: body.athlete_id || null,
          context: body,
          last_seen_at: new Date().toISOString(),
        }, { onConflict: "connection_id,fitpro_student_id" });
        await logEvent(supabase, conn.id, "student_context_loaded", {
          fitpro_student_id: body.fitpro_student_id,
          fitpro_professor_id: body.fitpro_professor_id,
          payload: body,
        });
        return json({ status: "stored" });
      }

      // --- GET /v1/fitpro/periodization/current?fitpro_student_id=... ---
      if (req.method === "GET" && path === "/v1/fitpro/periodization/current") {
        const sid = url.searchParams.get("fitpro_student_id");
        if (!sid) return json({ error: "fitpro_student_id required" }, 400);
        const athleteId = await resolveAthlete(supabase, conn.id, sid);
        if (!athleteId) return json({ error: "Student not mapped. Call /sync first." }, 404);
        const { data: assign } = await supabase
          .from("athlete_periodizations")
          .select("id, annual_plan_id, status, match_percentage, notes, assigned_at")
          .eq("athlete_id", athleteId).eq("status", "in_progress")
          .order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (!assign) return json({ status: "no_periodization", athlete_id: athleteId }, 404);
        let plan = null;
        if (assign.annual_plan_id) {
          const { data } = await supabase.from("periodization_annual_plans")
            .select("*").eq("id", assign.annual_plan_id).maybeSingle();
          plan = data;
        }
        return json({ assignment: assign, plan });
      }

      // --- POST /v1/fitpro/periodization/generate ---
      // body: { fitpro_student_id, goal, profile, chief_id?, variation_id?, scores?, master_rules? }
      if (req.method === "POST" && path === "/v1/fitpro/periodization/generate") {
        const body = await req.json();
        if (!body?.fitpro_student_id) return json({ error: "fitpro_student_id required" }, 400);
        const athleteId = body.athlete_id || await resolveAthlete(supabase, conn.id, body.fitpro_student_id);
        if (!athleteId) return json({ error: "Athlete not mapped" }, 404);

        const { data: plan, error } = await supabase.from("periodization_annual_plans").insert({
          athlete_id: athleteId,
          coach_id: conn.professor_id || athleteId,
          annual_goal: body.goal || "hipertrofia",
          dominant_profile: body.profile || {},
          scores: body.scores || {},
          flags: body.flags || [],
          selected_chief_id: body.chief_id || null,
          selected_model_id: body.variation_id || null,
          master_rules: body.master_rules || {},
          macrocycles: body.macrocycles || [],
          mesocycles: body.mesocycles || [],
          micro_rules: body.micro_rules || {},
          output_json: body.output_json || {},
          assessment_snapshot: body.assessment || {},
          status: "active",
        }).select("id").single();
        if (error) return json({ error: error.message }, 400);

        await logEvent(supabase, conn.id, "periodization_created", {
          fitpro_student_id: body.fitpro_student_id,
          entity_type: "periodization", entity_id: plan.id,
          payload: { goal: body.goal, chief: body.chief_id, variation: body.variation_id },
        });
        return json({ plan_id: plan.id, status: "created" });
      }

      // --- PATCH /v1/fitpro/periodization/update ---
      if (req.method === "PATCH" && path === "/v1/fitpro/periodization/update") {
        const body = await req.json();
        if (!body?.plan_id) return json({ error: "plan_id required" }, 400);
        const updates: any = {};
        for (const k of ["macrocycles","mesocycles","micro_rules","master_rules","output_json","status","selected_chief_id","selected_model_id"]) {
          if (body[k] !== undefined) updates[k] = body[k];
        }
        const { error } = await supabase.from("periodization_annual_plans").update(updates).eq("id", body.plan_id);
        if (error) return json({ error: error.message }, 400);
        await logEvent(supabase, conn.id, "periodization_updated", {
          fitpro_student_id: body.fitpro_student_id,
          entity_type: "periodization", entity_id: body.plan_id,
          payload: updates,
        });
        return json({ status: "updated" });
      }

      // --- POST /v1/fitpro/periodization/adjust ---
      // body: { plan_id, dimension: 'volume'|'intensity'|'recovery'|'phase'|'deload', value, fitpro_student_id }
      if (req.method === "POST" && path === "/v1/fitpro/periodization/adjust") {
        const body = await req.json();
        if (!body?.plan_id || !body?.dimension) return json({ error: "plan_id and dimension required" }, 400);
        const { data: plan } = await supabase.from("periodization_annual_plans")
          .select("master_rules, output_json").eq("id", body.plan_id).maybeSingle();
        const rules = { ...(plan?.master_rules || {}), [body.dimension]: body.value };
        const { error } = await supabase.from("periodization_annual_plans")
          .update({ master_rules: rules }).eq("id", body.plan_id);
        if (error) return json({ error: error.message }, 400);
        const eventMap: Record<string,string> = {
          volume: "volume_adjusted", intensity: "intensity_adjusted",
          recovery: "recovery_adjusted", phase: "phase_changed", deload: "deload_applied",
        };
        await logEvent(supabase, conn.id, eventMap[body.dimension] || "periodization_updated", {
          fitpro_student_id: body.fitpro_student_id,
          entity_type: "periodization", entity_id: body.plan_id,
          payload: { dimension: body.dimension, value: body.value },
        });
        return json({ status: "adjusted", dimension: body.dimension });
      }

      // --- POST /v1/fitpro/events ---
      if (req.method === "POST" && path === "/v1/fitpro/events") {
        const body = await req.json();
        if (!body?.event_type) return json({ error: "event_type required" }, 400);
        await logEvent(supabase, conn.id, body.event_type, body);
        return json({ status: "logged" });
      }

      return json({ error: "Not found", path, method: req.method }, 404);
    } catch (err: any) {
      console.error("fitpro-api error:", err);
      return json({ error: "Internal error", details: err.message }, 500);
    }
  });

  ```
  GENERATE SMARTTREINO   
  [https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/generate-smart-treino](https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/generate-smart-treino)

```typescript
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
```

&nbsp;

- GENERATE WORKOUT :   
[https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/generate-workout](https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/generate-workout)
  ```typescript
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

  ```

## Componentes técnicos

### Backend

- **Migração SQL**:
  - View `vw_periodizacao_ativa_aluno`: une `athlete_periodizations` + `fitpro_smartperiodizer_periodizations` por `aluno_id` retornando fase, semana atual, objetivo.
  - Função `tem_periodizacao_ativa(p_aluno_id uuid)` → boolean.
  - Função `notificar_falta_periodizacao(p_aluno_id uuid)` → insere em `notifications` para o professor.
  - Ajuste em `prescrever_treino`: se sem periodização ativa, retorna `sucesso=false` + `motivo='periodizacao_ausente'` + `sugestao_cta='cadastrar_periodizacao'`.
  - GRANTs apropriados.
- **Edge functions**:
  - `fitpro-deliver-workout` (nova): entrega payload formatado ao FitPro via API.
  - `generate-quick-workout` (nova): wrapper sobre `prescrever_treino` + `fitpro-deliver-workout`.
  - `generate-full-plan` (existe — ajustar): consumir `vw_periodizacao_ativa_aluno`, iterar semanas, persistir em `planos_treino_aluno`, opcionalmente entregar primeiro treino ao FitPro.
  - `modify-workout` (existe — ajustar): após modificar, chamar `fitpro-deliver-workout`.
- **Secret**: `FITPRO_API_KEY` (pedir ao usuário antes do deploy do `fitpro-deliver-workout`).

### Catálogo 9x9x9 funcional

- Página `ProtocolCatalog` já existe (browser). Adicionar botão "Gerar treino com este protocolo" → chama `generate-quick-workout` com `protocol_code` forçado.
- `prescrever_treino` já consome `smart_treino_protocols`; expor parâmetro `p_protocol_code` opcional para override manual.

### Frontend

- `**/treino-hoje**` (existe): adicionar botão "Enviar ao FitPro" que chama `fitpro-deliver-workout`.
- `**SmartTreinoBuilder**`: 
  - Ao selecionar aluno, checar `vw_periodizacao_ativa_aluno`. Se ausente → mostrar banner com CTA "Cadastrar no SmartPeriodizer" + botão "Notificar professor".
  - Pré-preencher objetivo/nível/fase da view canônica (somente leitura).
  - Botão "Gerar plano completo" → `generate-full-plan`.
  - Botão "Gerar treino rápido" → `generate-quick-workout`.
- `**RealTimeAIChat` / RON**: garantir que comandos de ajuste invoquem `modify-workout` com `workout_plan_id` do treino atual e propaguem ao FitPro.
- `**AlunoDetalhes**`: badge de status de periodização (ativa / ausente) + ação rápida "Gerar treino agora" → fluxo rápido.

## Validação

- Aluno sem periodização → UI mostra CTA e notificação é criada; nenhum treino é gerado às cegas.
- Aluno com periodização → `/treino-hoje` mostra prescrição NINE; "Enviar ao FitPro" registra evento em `fitpro_events`.
- Comando RON "trocar agachamento por leg press" → `modify-workout` atualiza `planos_treino_aluno` e re-entrega.
- Catálogo 9x9x9 → seleção de protocolo gera treino correspondente.

## Fora de escopo

- Importar os XLSX anexados (Treino_Renato, Vitoria, Pedro, Emagrecimento_Semana_*) — esses parecem ser referências de planejamento; vou tratá-los como material de referência e **não** importar no banco a menos que você peça. IMPORTE PARA O BANCO COMO REFERENCIAS REAIS 
- Reescrever o `workout_generator.py` em Python — o motor canônico fica no Postgres (`prescrever_treino`) + edge functions Deno.

## Próximos passos imediatos

1. Confirmar este plano.
2. Você fornecer o endpoint + chave da API do FitPro (`FITPRO_API_KEY`) — 
  - [https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/fitpro-api   /  chave>  secrete key > sb_secret_4-q0csWuluVOtUGuefCiuw_F7Qyheza    /    **NAO TORNA PUBLICO A CHAVE** *](https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/fitpro-api)
3. Eu rodar a migração da view + função de checagem.
4. Criar/atualizar edge functions e UI conforme acima.

Confirma para eu seguir? Se sim, já me diga se a `FITPRO_API_KEY` está disponível ou se entrego em modo simulado primeiro.