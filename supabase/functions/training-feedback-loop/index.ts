import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const critical = /dor|les[aã]o|agudo|overload|sobrecarga|cr[ií]tic|parar|risco/i;
const fatigue = /cansad|fadiga|exaust|recupera/i;

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const secret = Deno.env.get("WEEKLY_TRAINING_SCHEDULER_SECRET");
  if (!secret || req.headers.get("x-weekly-training-secret") !== secret) return json({ error: "unauthorized" }, 401);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const body = await req.json().catch(() => ({}));
  if (!body.athlete_id) return json({ error: "athlete_id_required" }, 400);
  const weekStart = body.week_start ?? new Date().toISOString().slice(0, 10);

  const [execResult, feedbackResult, syncResult] = await Promise.all([
    admin.from("workout_executions").select("id,status,avg_rpe,rpe,rating,notes,workout_date").eq("athlete_id", body.athlete_id).order("workout_date", { ascending: false }).limit(14),
    admin.from("protocol_feedback").select("notes,outcome,reported_at").eq("athlete_id", body.athlete_id).order("reported_at", { ascending: false }).limit(12),
    admin.from("sync_score_logs").select("score,feedback_text,inferred_state,created_at").eq("user_id", body.athlete_id).order("created_at", { ascending: false }).limit(12),
  ]);
  if (execResult.error) return json({ error: execResult.error.message }, 500);

  const executions = execResult.data ?? [];
  const texts = [
    ...executions.map((x: any) => x.notes ?? ""),
    ...(feedbackResult.data ?? []).flatMap((x: any) => [x.notes ?? "", x.outcome ?? ""]),
    ...(syncResult.data ?? []).flatMap((x: any) => [x.feedback_text ?? "", x.inferred_state ?? ""]),
  ];
  const completed = executions.filter((x: any) => x.status === "completed").length;
  const rpes = executions.map((x: any) => Number(x.avg_rpe ?? x.rpe)).filter(Number.isFinite);
  const avgRpe = rpes.length ? Math.round(rpes.reduce((a, b) => a + b, 0) / rpes.length * 10) / 10 : null;
  const text = texts.join(" ");
  const hasCritical = critical.test(text);
  const hasFatigue = fatigue.test(text);
  const recommendationType = hasCritical ? "review_with_professor" : hasFatigue || (avgRpe !== null && avgRpe >= 9) ? "increase_recovery" : completed < 2 ? "maintain" : "maintain";
  const rationale = hasCritical ? "Sinal crítico encontrado no histórico; revisão profissional obrigatória." : hasFatigue ? "Relatos de fadiga/recuperação insuficiente no histórico recente." : `Histórico recente sem alerta crítico; ${completed} treino(s) concluído(s).`;
  const sourceSummary = { executions: executions.length, completed, average_rpe: avgRpe, critical_signal: hasCritical, fatigue_signal: hasFatigue };

  const { data, error } = await admin.from("training_adjustment_recommendations").upsert({
    athlete_id: body.athlete_id, macro_rules_id: body.macro_rules_id ?? null, week_start: weekStart,
    status: "pending", recommendation_type: recommendationType, rationale,
    proposed_changes: recommendationType === "increase_recovery" ? { reduce_intensity_percent: 10, add_recovery_day: true } : {}, source_summary: sourceSummary,
  }, { onConflict: "athlete_id,week_start" }).select().single();
  if (error) return json({ error: error.message }, 500);

  return json({ success: true, recommendation: data });
});
