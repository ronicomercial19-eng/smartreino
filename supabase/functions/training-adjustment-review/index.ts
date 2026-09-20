import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const db = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user) return json({ error: "unauthorized" }, 401);
  const { data: role } = await admin.rpc("get_user_role", { _user_id: auth.user.id });
  if (!['professor', 'trainer', 'admin', 'super_admin'].includes(role ?? '')) return json({ error: "professor_role_required" }, 403);

  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  if (req.method === "GET") {
    const { data, error } = await admin.from("training_adjustment_recommendations").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(100);
    if (error) return json({ error: error.message }, 500);
    return json({ success: true, recommendations: data ?? [] });
  }
  const id = body.recommendation_id;
  const action = body.action;
  if (!id || !['accept', 'reject'].includes(action)) return json({ error: "recommendation_id_and_action_required" }, 400);
  const { data: rec, error: recError } = await admin.from("training_adjustment_recommendations").select("id,athlete_id,status").eq("id", id).maybeSingle();
  if (recError || !rec) return json({ error: "recommendation_not_found" }, 404);
  const { data: athlete } = await admin.from("athletes").select("coach_id").eq("id", rec.athlete_id).maybeSingle();
  if (role === "professor" || role === "trainer") {
    if (!athlete?.coach_id || athlete.coach_id !== auth.user.id) return json({ error: "forbidden_athlete" }, 403);
  }
  if (rec.status !== "pending") return json({ error: "recommendation_already_reviewed", status: rec.status }, 409);
  const nextStatus = action === "accept" ? "accepted" : "rejected";
  const { data, error } = await admin.from("training_adjustment_recommendations").update({ status: nextStatus, reviewed_by: auth.user.id, reviewed_at: new Date().toISOString() }).eq("id", id).eq("status", "pending").select().single();
  if (error) return json({ error: error.message }, 500);
  return json({ success: true, recommendation: data, next_step: action === "accept" ? "application_reserved_for_lote_3" : "none" });
});
