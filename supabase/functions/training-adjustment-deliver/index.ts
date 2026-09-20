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
  const { data: rec } = await admin.from("training_adjustment_recommendations").select("*").eq("id", id).maybeSingle();
  if (!rec) return json({ error: "recommendation_not_found" }, 404);
  if (rec.status !== "applied") return json({ error: "recommendation_must_be_applied", status: rec.status }, 409);
  const { data: athlete } = await admin.from("athletes").select("user_id,coach_id,name").eq("id", rec.athlete_id).maybeSingle();
  if ((role === "professor" || role === "trainer") && athlete?.coach_id !== auth.user.id) return json({ error: "forbidden_athlete" }, 403);

  const delivery = await fetch(`${url}/functions/v1/fitpro-deliver-week`, {
    method: "POST", headers: { "Content-Type": "application/json", "x-weekly-training-secret": Deno.env.get("WEEKLY_TRAINING_SCHEDULER_SECRET")! },
    body: JSON.stringify({ athlete_id: rec.athlete_id, week_start: rec.week_start, source: "lote-4-adjustment-delivery", recommendation_id: rec.id }),
  });
  const deliveryBody = await delivery.json().catch(() => ({}));
  if (!delivery.ok || deliveryBody?.success === false) return json({ error: "delivery_failed", detail: deliveryBody }, 502);

  const title = "Ajuste de treino aplicado";
  const message = `Seu treino foi atualizado com base no feedback recente. Semana de ${rec.week_start}.`;
  if (athlete?.user_id) await admin.from("notifications").insert({ user_id: athlete.user_id, title, message, type: "training_adjustment", action_url: "/train", related_table: "training_adjustment_recommendations", related_id: rec.id, event_type: "training_adjustment_applied" });
  if (athlete?.coach_id) await admin.from("notifications").insert({ user_id: athlete.coach_id, title: "Ajuste entregue ao aluno", message: `${athlete.name ?? "Aluno"}: ajuste aplicado e entregue.`, type: "training_adjustment", action_url: "/students", related_table: "training_adjustment_recommendations", related_id: rec.id, event_type: "training_adjustment_delivered" });
  return json({ success: true, recommendation_id: rec.id, delivery: deliveryBody, notified: { athlete: !!athlete?.user_id, coach: !!athlete?.coach_id } });
});
