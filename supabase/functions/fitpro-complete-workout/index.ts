// POST /fitpro-complete-workout
// Body: { student_external_id, execution_id?, workout_date?, duration_minutes?, total_volume_kg?, avg_rpe? }
// Marks workout_executions as completed and awards XP.
import { admin, corsHeaders, emitFitproWorkoutEvent, jsonResponse, requirePartnerKey, resolveAluno } from "../_shared/partner.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  const auth = await requirePartnerKey(req);
  if ("error" in auth) return auth.error;

  let body: any = {};
  try { body = await req.json(); } catch { return jsonResponse({ error: "invalid_json" }, 400); }

  const externalId: string = body.student_external_id ?? req.headers.get("x-student-external-id") ?? "";
  if (!externalId) return jsonResponse({ error: "student_external_id_required" }, 400);

  const aluno = await resolveAluno(externalId);
  if (!aluno) return jsonResponse({ error: "aluno_nao_encontrado" }, 404);

  const sb = admin();
  let execution: any = null;
  if (body.execution_id) {
    const { data } = await sb.from("workout_executions").select("*").eq("id", body.execution_id).maybeSingle();
    execution = data;
  } else {
    const workoutDate = body.workout_date ?? new Date().toISOString().slice(0, 10);
    const { data } = await sb
      .from("workout_executions")
      .select("*")
      .eq("athlete_id", aluno.id)
      .eq("workout_date", workoutDate)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    execution = data;
  }

  if (!execution) return jsonResponse({ error: "execution_not_found" }, 404);

  const update: any = { status: "completed", completed_at: new Date().toISOString() };
  if (body.duration_minutes != null) update.duration_minutes = body.duration_minutes;
  if (body.total_volume_kg != null) update.total_volume_kg = body.total_volume_kg;
  if (body.avg_rpe != null) update.avg_rpe = body.avg_rpe;
  if (body.notes != null) update.notes = body.notes;
  if (body.rating != null) update.rating = body.rating;

  await sb.from("workout_executions").update(update).eq("id", execution.id);

  const xp = execution.phase_name === "quick" ? 50 : 100;
  const reason = execution.phase_name === "quick" ? "quick_workout" : "workout_completed";
  await sb.rpc("fn_award_xp", { p_athlete_id: aluno.id, p_amount: xp, p_reason: reason });

  const delivery = await emitFitproWorkoutEvent({
    studentExternalId: aluno.fitpro_student_id ?? externalId,
    professorExternalId: String(aluno.mapping?.fitpro_professor_id ?? "") || null,
    treino: null,
    treinoId: execution.id,
    contexto: { phase_name: execution.phase_name, xp_awarded: xp },
    eventType: "workout_completed",
  });

  return jsonResponse({
    success: true,
    execution_id: execution.id,
    aluno_id: aluno.id,
    xp_awarded: xp,
    reason,
    delivery,
  });
});
