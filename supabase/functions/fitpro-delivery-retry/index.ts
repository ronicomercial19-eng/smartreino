// Retries failed FitPro deliveries.
// - Sem body: processa até 20 logs failed com next_retry_at <= now e attempt_count < 5.
// - Com body { log_id }: retry pontual (usado pela UI).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(SUPABASE_URL, SERVICE);

  let target: string | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    target = body?.log_id ?? null;
  } catch { /* no body */ }

  let query = sb.from("fitpro_delivery_log")
    .select("id, athlete_id, plano_id, workout_date, source, payload, attempt_count")
    .lt("attempt_count", 5);

  if (target) {
    query = query.eq("id", target);
  } else {
    query = query.eq("status", "failed").lte("next_retry_at", new Date().toISOString()).limit(20);
  }

  const { data: logs, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: any[] = [];
  for (const log of logs ?? []) {
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/fitpro-deliver-workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE}` },
        body: JSON.stringify({
          athlete_id: log.athlete_id,
          plano_id: log.plano_id,
          workout_date: log.workout_date,
          source: log.source,
          treino: log.payload?.treino,
          contexto: log.payload?.contexto,
          log_id: log.id,
          attempt_count: log.attempt_count,
        }),
      });
      const json = await resp.json().catch(() => ({}));
      results.push({ log_id: log.id, ok: resp.ok, status: resp.status, response: json });
    } catch (e) {
      results.push({ log_id: log.id, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
