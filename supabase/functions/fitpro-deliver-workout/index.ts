// Delivers a prescribed workout to the FitPro ecosystem via the fitpro-api edge function.
// Also writes an audit row to `fitpro_delivery_log` with status/attempt info.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let logId: string | null = null;
  let athlete_id: string | null = null;
  let plano_id: string | null = null;
  let workout_date: string = new Date().toISOString().slice(0, 10);
  let source = "unknown";
  let payloadBody: any = null;

  try {
    const FITPRO_API_URL =
      Deno.env.get("FITPRO_API_URL") ||
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/fitpro-api`;
    const FITPRO_API_KEY = Deno.env.get("FITPRO_API_KEY");

    const body = await req.json();
    athlete_id = body?.athlete_id ?? body?.aluno_id ?? null;
    plano_id = body?.plano_id ?? body?.historico_id ?? null;
    workout_date = body?.workout_date ?? workout_date;
    source = body?.source ?? "unknown";
    const treino = body?.treino ?? { auto: true, plano_id, workout_date };
    const contexto = body?.contexto;
    // retry re-use of an existing log row
    const existingLogId = body?.log_id ?? null;
    payloadBody = { treino, contexto, source };

    if (!athlete_id) {
      return new Response(
        JSON.stringify({ success: false, error: "athlete_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Upsert audit log row (pending)
    if (existingLogId) {
      logId = existingLogId;
      await supabase.from("fitpro_delivery_log").update({
        status: "retrying",
        attempt_count: (body?.attempt_count ?? 0) + 1,
        payload: payloadBody,
      }).eq("id", existingLogId);
    } else {
      const { data: logRow } = await supabase.from("fitpro_delivery_log").insert({
        athlete_id, plano_id, workout_date, source, payload: payloadBody,
        status: "pending", attempt_count: 1,
      }).select("id").maybeSingle();
      logId = logRow?.id ?? null;
    }

    if (!FITPRO_API_KEY) {
      await markFailed(supabase, logId, "FITPRO_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "FITPRO_API_KEY not configured", log_id: logId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Materializa workout_executions do dia (idempotente por athlete_id + workout_date)
    try {
      const { data: existing } = await supabase
        .from("workout_executions")
        .select("id")
        .eq("athlete_id", athlete_id)
        .eq("workout_date", workout_date)
        .maybeSingle();
      if (!existing) {
        await supabase.from("workout_executions").insert({
          athlete_id, workout_date,
          status: "pending", phase_name: "prescribed",
          notes: plano_id ? `plano:${plano_id}` : null,
        });
      }
    } catch (e) { console.warn("workout_executions materialize warn:", e); }

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
        contexto, treino, delivery_source: source,
      },
    };

    const resp = await fetch(`${FITPRO_API_URL}/v1/fitpro/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": FITPRO_API_KEY },
      body: JSON.stringify(eventPayload),
    });

    const text = await resp.text();
    let parsed: any = {};
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

    if (!resp.ok) {
      const errMsg = parsed?.error || `FitPro API ${resp.status}`;
      await markFailed(supabase, logId, errMsg, parsed);
      return new Response(
        JSON.stringify({ success: false, error: errMsg, status: resp.status, log_id: logId }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (logId) {
      await supabase.from("fitpro_delivery_log").update({
        status: "success", result: parsed, last_error: null, next_retry_at: null,
      }).eq("id", logId);
    }

    return new Response(
      JSON.stringify({
        success: true, log_id: logId, fitpro_student_id,
        mapped: !!mapping, fitpro_response: parsed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("fitpro-deliver-workout error", msg);
    if (logId) await markFailed(supabase, logId, msg);
    return new Response(
      JSON.stringify({ success: false, error: msg, log_id: logId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

async function markFailed(supabase: any, logId: string | null, error: string, result?: any) {
  if (!logId) return;
  // exponential backoff: 2^attempt minutes, cap 60m
  const { data: row } = await supabase.from("fitpro_delivery_log").select("attempt_count").eq("id", logId).maybeSingle();
  const attempts = row?.attempt_count ?? 1;
  const backoffMin = Math.min(60, Math.pow(2, attempts));
  const nextRetry = new Date(Date.now() + backoffMin * 60_000).toISOString();
  await supabase.from("fitpro_delivery_log").update({
    status: "failed", last_error: error, result: result ?? null, next_retry_at: nextRetry,
  }).eq("id", logId);
}
