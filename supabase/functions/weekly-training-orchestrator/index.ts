import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-weekly-training-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const dateOnly = (date: Date) => date.toISOString().slice(0, 10);

function nextMonday(base = new Date()) {
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
  const day = d.getUTCDay();
  const days = day === 0 ? 1 : 8 - day;
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function hasCriticalSignal(values: string[]) {
  const text = values.join(" ").toLowerCase();
  return /dor|les[aã]o|agudo|overload|sobrecarga|cr[ií]tic|parar|interven[cç][aã]o imediata|risco/.test(text);
}

async function invoke(url: string, secret: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-weekly-training-secret": secret },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, payload };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const schedulerSecret = Deno.env.get("WEEKLY_TRAINING_SCHEDULER_SECRET");
  const suppliedSecret = req.headers.get("x-weekly-training-secret");
  if (!schedulerSecret || !suppliedSecret || suppliedSecret !== schedulerSecret) {
    return json({ success: false, error: "unauthorized_scheduler" }, 401);
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const week = body?.week_start ? new Date(`${body.week_start}T00:00:00Z`) : nextMonday();
    const weekStart = dateOnly(week);
    const weekEndDate = new Date(week);
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);
    const weekEnd = dateOnly(weekEndDate);
    const runKey = `lote-0:${weekStart}`;

    const { data: existing } = await admin.from("training_automation_runs").select("*").eq("run_key", runKey).maybeSingle();
    if (existing?.status === "completed" || existing?.status === "completed_with_errors") {
      return json({ success: true, idempotent: true, run_id: existing.id, status: existing.status });
    }

    const { data: run, error: runError } = await admin.from("training_automation_runs").upsert({
      run_key: runKey, week_start: weekStart, week_end: weekEnd, status: "running", metadata: { batch: "lote-0" },
    }, { onConflict: "run_key" }).select().single();
    if (runError || !run) throw runError ?? new Error("run_not_created");

    const { data: rules, error: rulesError } = await admin.from("smart_treino_macro_rules")
      .select("id, aluno_id, weekly_frequency, macro_objetivo, rpe_target, status")
      .eq("status", "active");
    if (rulesError) throw rulesError;

    await admin.from("training_automation_runs").update({ total_athletes: rules?.length ?? 0 }).eq("id", run.id);
    let generated = 0, blocked = 0, failed = 0, processed = 0;

    for (const rule of rules ?? []) {
      const summary: Record<string, unknown> = { weekly_frequency: rule.weekly_frequency, rpe_target: rule.rpe_target };
      try {
        const [feedbackResult, syncResult, executionsResult] = await Promise.all([
          admin.from("protocol_feedback").select("notes, outcome, reported_at").eq("athlete_id", rule.aluno_id).order("reported_at", { ascending: false }).limit(12),
          admin.from("sync_score_logs").select("score, feedback_text, inferred_state, created_at").eq("user_id", rule.aluno_id).order("created_at", { ascending: false }).limit(12),
          admin.from("workout_executions").select("status, rpe, avg_rpe, rating, notes, workout_date").eq("athlete_id", rule.aluno_id).order("workout_date", { ascending: false }).limit(14),
        ]);
        const feedback = feedbackResult.data ?? [];
        const sync = syncResult.data ?? [];
        const executions = executionsResult.data ?? [];
        const texts = [...feedback.map((x: any) => `${x.notes ?? ""} ${x.outcome ?? ""}`), ...sync.map((x: any) => `${x.feedback_text ?? ""} ${x.inferred_state ?? ""}`), ...executions.map((x: any) => x.notes ?? "")];
        const completed = executions.filter((x: any) => x.status === "completed").length;
        const rpes = executions.map((x: any) => Number(x.avg_rpe ?? x.rpe)).filter(Number.isFinite);
        summary.feedback_count = feedback.length;
        summary.sync_scores = sync.slice(0, 5).map((x: any) => x.score);
        summary.completed_recent = completed;
        summary.average_rpe = rpes.length ? Math.round((rpes.reduce((a, b) => a + b, 0) / rpes.length) * 10) / 10 : null;
        summary.critical_signal = hasCriticalSignal(texts);

        const { data: item } = await admin.from("training_automation_items").upsert({
          run_id: run.id, athlete_id: rule.aluno_id, macro_rules_id: rule.id,
          status: summary.critical_signal ? "blocked" : "pending", feedback_summary: summary,
        }, { onConflict: "run_id,athlete_id" }).select().single();

        if (summary.critical_signal) {
          blocked++;
          await admin.from("training_automation_items").update({ error_message: "critical_feedback_requires_review" }).eq("id", item?.id ?? "");
        } else {
          const feedbackLoop = await invoke(`${url}/functions/v1/training-feedback-loop`, schedulerSecret, { athlete_id: rule.aluno_id, macro_rules_id: rule.id, week_start: weekStart });
          if (!feedbackLoop.ok) throw new Error(`feedback_loop_failed:${feedbackLoop.status}`);
          const generation = await invoke(`${url}/functions/v1/generate-smart-treino`, schedulerSecret, { aluno_id: rule.aluno_id, macro_rules_id: rule.id, week_start: weekStart, automation_context: summary });
          if (!generation.ok) throw new Error(`generation_failed:${generation.status}`);
          const delivery = await invoke(`${url}/functions/v1/fitpro-deliver-week`, schedulerSecret, { athlete_id: rule.aluno_id, week_start: weekStart });
          if (!delivery.ok || delivery.payload?.success === false) throw new Error(`delivery_failed:${delivery.status}`);
          generated++;
          await admin.from("training_automation_items").update({ status: "delivered", generation_result: generation.payload, delivery_result: delivery.payload }).eq("id", item?.id ?? "");
        }
      } catch (error) {
        failed++;
        await admin.from("training_automation_items").upsert({ run_id: run.id, athlete_id: rule.aluno_id, macro_rules_id: rule.id, status: "failed", feedback_summary: summary, error_message: error instanceof Error ? error.message : String(error) }, { onConflict: "run_id,athlete_id" });
      }
      processed++;
    }

    const status = failed ? "completed_with_errors" : "completed";
    await admin.from("training_automation_runs").update({ status, processed_athletes: processed, generated_athletes: generated, blocked_athletes: blocked, failed_athletes: failed, completed_at: new Date().toISOString() }).eq("id", run.id);
    return json({ success: failed === 0, batch: "lote-0", run_id: run.id, week_start: weekStart, processed, generated, blocked, failed });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
