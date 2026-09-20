import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const secret = Deno.env.get("WEEKLY_TRAINING_SCHEDULER_SECRET");
  if (!secret || req.headers.get("x-weekly-training-secret") !== secret) return json({ error: "unauthorized" }, 401);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const [runs, items, recommendations, deliveries, feedback] = await Promise.all([
    admin.from("training_automation_runs").select("id,run_key,status,week_start,total_athletes,processed_athletes,generated_athletes,blocked_athletes,failed_athletes,completed_at").order("created_at", { ascending: false }).limit(5),
    admin.from("training_automation_items").select("status").limit(1000),
    admin.from("training_adjustment_recommendations").select("status,recommendation_type").limit(1000),
    admin.from("training_adjustment_deliveries").select("status,attempt_count").limit(1000),
    admin.from("training_adjustment_feedback").select("rating,accepted").limit(1000),
  ]);
  const count = (rows: any[] | null | undefined, key: string, value: unknown) => (rows ?? []).filter((x) => x[key] === value).length;
  const runError = runs.error?.message ?? items.error?.message ?? recommendations.error?.message ?? deliveries.error?.message ?? feedback.error?.message ?? null;
  const health = {
    status: runError ? "degraded" : "ok",
    generated_at: new Date().toISOString(),
    last_runs: runs.data ?? [],
    automation_items: { total: items.data?.length ?? 0, delivered: count(items.data, "status", "delivered"), blocked: count(items.data, "status", "blocked"), failed: count(items.data, "status", "failed") },
    recommendations: { total: recommendations.data?.length ?? 0, pending: count(recommendations.data, "status", "pending"), accepted: count(recommendations.data, "status", "accepted"), applied: count(recommendations.data, "status", "applied"), rejected: count(recommendations.data, "status", "rejected") },
    deliveries: { total: deliveries.data?.length ?? 0, success: count(deliveries.data, "status", "success"), failed: count(deliveries.data, "status", "failed"), retrying: (deliveries.data ?? []).filter((x: any) => x.status === "failed" && Number(x.attempt_count) < 3).length },
    feedback: { total: feedback.data?.length ?? 0, accepted: count(feedback.data, "accepted", true), rejected: count(feedback.data, "accepted", false), average_rating: (() => { const r = (feedback.data ?? []).map((x: any) => Number(x.rating)).filter(Number.isFinite); return r.length ? Math.round(r.reduce((a, b) => a + b, 0) / r.length * 100) / 100 : null; })() },
    error: runError,
  };
  return json(health, runError ? 500 : 200);
});
