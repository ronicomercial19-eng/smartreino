import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const secret = Deno.env.get("WEEKLY_TRAINING_SCHEDULER_SECRET");
  if (!secret || req.headers.get("x-weekly-training-secret") !== secret) return json({ error: "unauthorized" }, 401);
  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const [{ data: critical }, { data: failed }] = await Promise.all([
    admin.from("training_adjustment_recommendations").select("id,athlete_id,week_start,athletes(name,coach_id)").eq("status", "pending").eq("recommendation_type", "review_with_professor").limit(100),
    admin.from("training_adjustment_deliveries").select("id,recommendation_id,athlete_id,last_error,attempt_count,athletes(name,coach_id)").eq("status", "failed").gte("attempt_count", 3).limit(100),
  ]);
  let created = 0;
  for (const item of [...(critical ?? []), ...(failed ?? [])] as any[]) {
    const coachId = item.athletes?.coach_id;
    if (!coachId) continue;
    const isFailed = "recommendation_id" in item;
    const relatedId = isFailed ? item.recommendation_id : item.id;
    const title = isFailed ? "Entrega de treino pendente" : "Revisão crítica de treino";
    const message = isFailed ? `${item.athletes?.name ?? "Aluno"}: entrega falhou ${item.attempt_count} vezes. ${item.last_error ?? "Verifique a integração."}` : `${item.athletes?.name ?? "Aluno"}: há um sinal crítico aguardando sua revisão.`;
    const { data: existing } = await admin.from("notifications").select("id").eq("user_id", coachId).eq("related_id", relatedId).eq("event_type", isFailed ? "training_adjustment_delivery_alert" : "training_adjustment_critical_alert").limit(1).maybeSingle();
    if (existing) continue;
    const { error } = await admin.from("notifications").insert({ user_id: coachId, title, message, type: "training_adjustment_alert", action_url: "/students", related_table: "training_adjustment_recommendations", related_id: relatedId, event_type: isFailed ? "training_adjustment_delivery_alert" : "training_adjustment_critical_alert" });
    if (!error) created++;
  }
  return json({ success: true, critical_scanned: critical?.length ?? 0, failed_scanned: failed?.length ?? 0, notifications_created: created });
});
