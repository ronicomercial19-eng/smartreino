import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);
  const url = Deno.env.get("SUPABASE_URL")!;
  const db = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user) return json({ error: "unauthorized" }, 401);
  const { data: role } = await admin.rpc("get_user_role", { _user_id: auth.user.id });
  if (!['professor', 'trainer', 'admin', 'super_admin'].includes(role ?? '')) return json({ error: "professor_role_required" }, 403);

  const { recommendation_id: id } = await req.json().catch(() => ({}));
  if (!id) return json({ error: "recommendation_id_required" }, 400);
  const { data: rec, error: recError } = await admin.from("training_adjustment_recommendations").select("*").eq("id", id).maybeSingle();
  if (recError || !rec) return json({ error: "recommendation_not_found" }, 404);
  if (rec.status !== "accepted") return json({ error: "recommendation_must_be_accepted", status: rec.status }, 409);
  const { data: athlete } = await admin.from("athletes").select("coach_id").eq("id", rec.athlete_id).maybeSingle();
  if ((role === "professor" || role === "trainer") && athlete?.coach_id !== auth.user.id) return json({ error: "forbidden_athlete" }, 403);

  const changes = { ...(rec.proposed_changes ?? {}), recommendation_id: rec.id, recommendation_type: rec.recommendation_type, applied_by: auth.user.id };
  const applied: unknown[] = [];
  const start = new Date(`${rec.week_start}T00:00:00Z`);
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);
    const { data, error } = await admin.rpc("aplicar_ajuste_treino_dia", { p_athlete_id: rec.athlete_id, p_data: date.toISOString().slice(0, 10), p_changes: changes });
    if (error) return json({ error: "apply_failed", detail: error.message, applied_days: applied.length }, 500);
    applied.push(data);
  }
  const { error: updateError } = await admin.from("training_adjustment_recommendations").update({ status: "applied", reviewed_by: auth.user.id, reviewed_at: new Date().toISOString() }).eq("id", id).eq("status", "accepted");
  if (updateError) return json({ error: updateError.message, applied_days: applied.length }, 500);
  return json({ success: true, recommendation_id: id, applied_days: applied.length, week_start: rec.week_start });
});
