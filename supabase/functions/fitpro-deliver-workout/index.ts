// Delivers a prescribed workout to the FitPro ecosystem via the fitpro-api edge function.
// Auth: x-api-key (FITPRO_API_KEY secret) against fitpro_connections.api_key_hash.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const FITPRO_API_URL =
      Deno.env.get("FITPRO_API_URL") ||
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/fitpro-api`;
    const FITPRO_API_KEY = Deno.env.get("FITPRO_API_KEY");
    if (!FITPRO_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "FITPRO_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    // Aceita ambas assinaturas: nova {athlete_id, plano_id, workout_date} e legada {aluno_id, treino}
    const athlete_id = body?.athlete_id ?? body?.aluno_id;
    const plano_id   = body?.plano_id ?? body?.historico_id ?? null;
    const workout_date = body?.workout_date ?? new Date().toISOString().slice(0, 10);
    const treino     = body?.treino ?? { auto: true, plano_id, workout_date };
    const contexto   = body?.contexto;

    if (!athlete_id) {
      return new Response(
        JSON.stringify({ success: false, error: "athlete_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Materializa workout_execution do dia (idempotente por athlete_id + workout_date)
    try {
      const { data: existing } = await supabase
        .from("workout_executions")
        .select("id")
        .eq("athlete_id", athlete_id)
        .eq("workout_date", workout_date)
        .maybeSingle();
      if (!existing) {
        await supabase.from("workout_executions").insert({
          athlete_id,
          workout_date,
          status: "pending",
          phase_name: "prescribed",
          notes: plano_id ? `plano:${plano_id}` : null,
        });
      }
    } catch (e) {
      console.warn("workout_executions materialize warn:", e);
    }

    // Resolve FitPro student mapping
    const { data: mapping } = await supabase
      .from("fitpro_student_map")
      .select("fitpro_student_id, fitpro_professor_id, connection_id")
      .eq("athlete_id", athlete_id)
      .order("last_seen_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const fitpro_student_id = mapping?.fitpro_student_id ?? athlete_id;

    const eventPayload = {
      event_type: "workout_delivered",
      fitpro_student_id,
      fitpro_professor_id: mapping?.fitpro_professor_id ?? null,
      entity_type: "workout",
      entity_id: plano_id,
      payload: {
        source: "smartreino",
        delivered_at: new Date().toISOString(),
        contexto,
        treino,
      },
    };

    const resp = await fetch(`${FITPRO_API_URL}/v1/fitpro/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": FITPRO_API_KEY,
      },
      body: JSON.stringify(eventPayload),
    });

    const text = await resp.text();
    let parsed: any = {};
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

    if (!resp.ok) {
      console.error("fitpro-api error", resp.status, text);
      return new Response(
        JSON.stringify({
          success: false,
          error: parsed?.error || `FitPro API ${resp.status}`,
          status: resp.status,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        fitpro_student_id,
        mapped: !!mapping,
        fitpro_response: parsed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("fitpro-deliver-workout error", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
