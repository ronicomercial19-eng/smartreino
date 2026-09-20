import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const secret = Deno.env.get("WEEKLY_TRAINING_SCHEDULER_SECRET");
  if (!secret || req.headers.get("x-weekly-training-secret") !== secret) return json({ error: "unauthorized" }, 401);
  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const now = new Date().toISOString();
  const { data: rows, error } = await admin.from("training_adjustment_deliveries").select("id,recommendation_id,athlete_id,week_start,attempt_count").eq("status", "failed").lte("next_retry_at", now).order("next_retry_at", { ascending: true }).limit(20);
  if (error) return json({ error: error.message }, 500);
  let succeeded = 0, failed = 0;
  for (const row of rows ?? []) {
    const response = await fetch(`${url}/functions/v1/fitpro-deliver-week`, { method: "POST", headers: { "Content-Type": "application/json", "x-weekly-training-secret": secret }, body: JSON.stringify({ athlete_id: row.athlete_id, week_start: row.week_start, source: "lote-6-retry", recommendation_id: row.recommendation_id }) });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload?.success !== false) {
      succeeded++;
      await admin.from("training_adjustment_deliveries").update({ status: "success", response: payload, last_error: null, next_retry_at: null }).eq("id", row.id);
    } else {
      failed++;
      const attempt = (row.attempt_count ?? 0) + 1;
      const nextRetry = new Date(Date.now() + Math.min(360, 2 ** Math.min(attempt, 8)) * 60_000).toISOString();
      await admin.from("training_adjustment_deliveries").update({ attempt_count: attempt, last_error: payload?.error ?? `HTTP ${response.status}`, response: payload, next_retry_at: nextRetry }).eq("id", row.id);
    }
  }
  return json({ success: true, inspected: rows?.length ?? 0, succeeded, failed });
});
