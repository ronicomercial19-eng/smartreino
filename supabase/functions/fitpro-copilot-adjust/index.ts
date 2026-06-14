// POST /fitpro-copilot-adjust
// Body: { student_external_id, command: string, workout_date? }
// Interprets NL command via Lovable AI (Gemini), produces structured `changes`,
// and applies them ONLY to today's workout_exercises (override_locked=true).
import { admin, corsHeaders, emitFitproWorkoutEvent, jsonResponse, requirePartnerKey, resolveAluno } from "../_shared/partner.ts";

const SYSTEM = `Você é o FitCopilot do 9FIT. Interprete um comando do aluno e responda APENAS com JSON.
Estrutura: {"changes":[{action,exercise_id?,new_exercise_id?,load_percentage?,sets?,reps_range?}],"intent":"swap|load|sets|add|remove|mixed","explanation":"PT-BR curto","scope_violation":false}
Regras: ajustes só afetam o DIA atual. Se o pedido envolver mudar a semana/periodização, retorne scope_violation=true.
Ações: swap (exercise_id->new_exercise_id), load (exercise_id+load_percentage 0-150), sets (exercise_id+sets+reps_range), add (new_exercise_id+sets+reps_range), remove (exercise_id).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  const auth = await requirePartnerKey(req);
  if ("error" in auth) return auth.error;

  let body: any = {};
  try { body = await req.json(); } catch { return jsonResponse({ error: "invalid_json" }, 400); }

  const externalId: string = body.student_external_id ?? req.headers.get("x-student-external-id") ?? "";
  const command: string = String(body.command ?? "").trim();
  if (!externalId || !command) return jsonResponse({ error: "student_external_id_and_command_required" }, 400);

  const aluno = await resolveAluno(externalId);
  if (!aluno) return jsonResponse({ error: "aluno_nao_encontrado" }, 404);

  const sb = admin();
  const workoutDate: string = body.workout_date ?? new Date().toISOString().slice(0, 10);

  const { data: exec } = await sb
    .from("workout_executions")
    .select("id")
    .eq("athlete_id", aluno.id)
    .eq("workout_date", workoutDate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!exec) return jsonResponse({ error: "no_workout_for_day" }, 404);

  const { data: currentEx } = await sb
    .from("workout_exercises")
    .select("id, exercise_id, exercise_order, sets, reps_range, load_percentage")
    .eq("daily_workout_id", exec.id);

  const { data: catalog } = await sb
    .from("exercises")
    .select("id, name, target_muscles, equipment")
    .limit(400);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return jsonResponse({ error: "LOVABLE_API_KEY missing" }, 500);

  const userMsg = `Comando do aluno: "${command}"
Treino do dia (workout_exercises):
${JSON.stringify(currentEx ?? [], null, 0)}
Catálogo (id+nome+grupo):
${JSON.stringify((catalog ?? []).map((e: any) => ({ id: e.id, name: e.name, target_muscles: e.target_muscles })))}`;

  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userMsg }],
      response_format: { type: "json_object" },
    }),
  });

  if (!aiResp.ok) {
    const errTxt = await aiResp.text();
    return jsonResponse({ error: "ai_failed", status: aiResp.status, detail: errTxt }, 502);
  }
  const aiJson = await aiResp.json();
  let parsed: any = {};
  try { parsed = JSON.parse(aiJson?.choices?.[0]?.message?.content ?? "{}"); } catch { parsed = {}; }

  if (parsed.scope_violation) {
    return jsonResponse({
      success: false,
      error: "planning_required",
      redirect: "/settings/planejamento",
      interpretation: parsed.explanation ?? "Comando fora do escopo do dia atual.",
    }, 422);
  }

  const changes = Array.isArray(parsed.changes) ? parsed.changes : [];
  if (changes.length === 0) {
    return jsonResponse({ success: false, error: "no_changes_parsed", interpretation: parsed.explanation ?? null }, 400);
  }

  const { data: applied, error: rpcError } = await sb.rpc("aplicar_ajuste_treino_dia", {
    p_athlete_id: aluno.id,
    p_workout_date: workoutDate,
    p_changes: changes,
  });

  if (rpcError) return jsonResponse({ error: "apply_failed", detail: rpcError.message }, 500);

  const { data: updated } = await sb
    .from("workout_exercises")
    .select("id, exercise_id, exercise_order, sets, reps_range, load_percentage, override_locked")
    .eq("daily_workout_id", exec.id)
    .order("exercise_order");

  await emitFitproWorkoutEvent({
    studentExternalId: aluno.fitpro_student_id ?? externalId,
    professorExternalId: String(aluno.mapping?.fitpro_professor_id ?? "") || null,
    treino: { exercises: updated },
    treinoId: exec.id,
    contexto: { source: "copilot", command, intent: parsed.intent ?? null },
    eventType: "workout_adjusted",
  });

  return jsonResponse({
    success: true,
    execution_id: exec.id,
    aluno_id: aluno.id,
    interpretation: parsed.explanation ?? null,
    intent: parsed.intent ?? null,
    applied,
    treino_atualizado: updated,
  });
});
