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
  const body = await req.json().catch(() => ({}));
  if (!body.recommendation_id || typeof body.accepted !== "boolean") return json({ error: "recommendation_id_and_accepted_required" }, 400);
  const { data: rec } = await admin.from("training_adjustment_recommendations").select("id,athlete_id,status,week_start").eq("id", body.recommendation_id).maybeSingle();
  if (!rec || rec.status !== "applied") return json({ error: "adjustment_not_found_or_not_applied" }, 404);
  const { data: athlete } = await admin.from("athletes").select("user_id").eq("id", rec.athlete_id).maybeSingle();
  if (!athlete || athlete.user_id !== auth.user.id) return json({ error: "forbidden_athlete" }, 403);
  const { data: feedback, error } = await admin.from("training_adjustment_feedback").upsert({ recommendation_id: rec.id, athlete_id: rec.athlete_id, accepted: body.accepted, rating: body.rating ?? null, outcome: body.outcome ?? null, notes: body.notes ?? null }, { onConflict: "recommendation_id,athlete_id" }).select().single();
  if (error) return json({ error: error.message }, 500);
  await admin.from("protocol_feedback").insert({ athlete_id: rec.athlete_id, content_ref: `training_adjustment:${rec.id}`, outcome: body.outcome ?? (body.accepted ? "accepted" : "rejected"), notes: body.notes ?? null, reported_at: new Date().toISOString() });
  return json({ success: true, feedback });
});
