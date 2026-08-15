// POST /fitpro-adjust-workout
// Two modes:
//  - Structured: { student_external_id, changes:[{action,exercise_id?,new_exercise_id?,load_percentage?,sets?,reps_range?}], workout_date? }
//  - NLP fallback: { student_external_id, mensagem }
// Structured changes affect ONLY the day's workout_exercises (override_locked=true).
import {
  admin,
  buildWorkoutFromLibrary,
  corsHeaders,
  emitFitproWorkoutEvent,
  getActivePeriodizacao,
  jsonResponse,
  persistWorkout,
  requirePartnerKey,
  resolveAluno,
  toBlocos,
} from "../_shared/partner.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  const auth = await requirePartnerKey(req);
  if ("error" in auth) return auth.error;

  let body: any = {};
  try { body = await req.json(); } catch { return jsonResponse({ error: "invalid_json" }, 400); }

  const externalId = body.student_external_id ?? req.headers.get("x-student-external-id");
  if (!externalId) return jsonResponse({ error: "student_external_id_required" }, 400);

  const aluno = await resolveAluno(externalId);
  if (!aluno) return jsonResponse({ error: "aluno_nao_encontrado", code: "student_not_found" }, 404);

  const sb = admin();

  // STRUCTURED PATH: changes[] → RPC aplicar_ajuste_treino_dia (today only)
  if (Array.isArray(body.changes) && body.changes.length > 0) {
    const workoutDate: string = body.workout_date ?? new Date().toISOString().slice(0, 10);
    const { data: applied, error: rpcError } = await sb.rpc("aplicar_ajuste_treino_dia", {
      p_athlete_id: aluno.id,
      p_data: workoutDate,
      p_changes: body.changes,
    });
    if (rpcError) return jsonResponse({ error: "apply_failed", detail: rpcError.message }, 500);
    const execId = (applied as any)?.id ?? null;
    const { data: updated } = await sb
      .from("workout_exercises")
      .select("id, exercise_id, exercise_order, sets, reps_range, load_percentage, override_locked")
      .eq("daily_workout_id", execId)
      .order("exercise_order");
    await emitFitproWorkoutEvent({
      studentExternalId: aluno.fitpro_student_id ?? externalId,
      professorExternalId: String(aluno.mapping?.fitpro_professor_id ?? "") || null,
      treino: { exercises: updated },
      treinoId: execId,
      contexto: { source: "fitpro_adjust_structured", workout_date: workoutDate },
      eventType: "workout_adjusted",
    });
    return jsonResponse({ success: true, mode: "structured", execution_id: execId, applied, treino_atualizado: updated });
  }

  // NLP PATH (legacy / human freeform)
  const mensagem = String(body.mensagem ?? "").trim();
  if (!mensagem) return jsonResponse({ error: "changes_or_mensagem_required" }, 400);
  // Carrega treino atual: param explícito > último de historico_treinos_realizados
  let treinoAtual: any = body.treino_atual ?? null;
  if (!treinoAtual && body.treino_atual_id) {
    const { data } = await sb.from("historico_treinos_realizados")
      .select("*").eq("id", body.treino_atual_id).maybeSingle();
    treinoAtual = data;
  }
  if (!treinoAtual) {
    const { data } = await sb.from("historico_treinos_realizados")
      .select("*").eq("aluno_id", aluno.id).order("data_treino", { ascending: false }).limit(1).maybeSingle();
    treinoAtual = data;
  }
  const periodizacao = await getActivePeriodizacao(aluno);
  if (!treinoAtual) {
    treinoAtual = await buildWorkoutFromLibrary({ aluno, respostas: { foco: aluno.foco_muscular ?? periodizacao.objetivo, energia: "media" } });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return jsonResponse({ error: "ai_not_configured" }, 500);

  const systemPrompt = `Você é RON, IA do 9FIT. Ajuste o treino do aluno conforme o pedido, mantendo a estrutura 4-blocos (Neural, Integration, Block 9, Reset). Responda APENAS JSON válido com este shape:
{"treino_ajustado":{"neural":[...],"integracao":[...],"bloco9":[...],"reset":[...]},"delta":["mudança 1","mudança 2"],"mensagem_ron":"resposta curta ao aluno"}`;

  const userPrompt = `Aluno: ${JSON.stringify({ id: aluno.id, nome: aluno.nome, objetivo: aluno.objetivo, nivel: aluno.nivel, fonte: aluno.source })}
Periodização: ${JSON.stringify(periodizacao)}
Treino atual: ${JSON.stringify(treinoAtual).slice(0, 9000)}
Pedido do aluno: ${mensagem}`;

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 110_000);
  let aiJson: any = null;
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      signal: ac.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_object" },
      }),
    });
    clearTimeout(t);
    if (!resp.ok) {
      const err = await resp.text();
      return jsonResponse({ error: "ai_gateway_error", details: err.slice(0, 500) }, 502);
    }
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    aiJson = JSON.parse(content);
  } catch (e) {
    return jsonResponse({ error: "ai_failed", details: String(e) }, 502);
  }

  const treinoAjustado = aiJson?.treino_ajustado ?? treinoAtual?.exercicios_realizados ?? treinoAtual;
  const contexto = {
    aluno_id: aluno.id,
    aluno_nome: aluno.nome,
    aluno_source: aluno.source,
    fitpro_student_id: aluno.fitpro_student_id,
    periodizacao,
    ajuste_solicitado: mensagem,
  };
  const treinoId = await persistWorkout(aluno.id, treinoAjustado, contexto);
  const delivery = await emitFitproWorkoutEvent({
    studentExternalId: aluno.fitpro_student_id ?? externalId,
    professorExternalId: String(aluno.mapping?.fitpro_professor_id ?? "") || null,
    treino: treinoAjustado,
    treinoId,
    contexto,
    eventType: "adjusted_workout_delivered",
  });

  // Log no chat history
  if (aluno.professor_id) {
    await sb.from("ai_chat_messages").insert([
      { user_id: aluno.professor_id, role: "user", content: mensagem, metadata: { source: "fitpro_adjust", aluno_id: aluno.id } },
      { user_id: aluno.professor_id, role: "assistant", content: aiJson?.mensagem_ron ?? "", metadata: { source: "fitpro_adjust", aluno_id: aluno.id, delta: aiJson?.delta } },
    ]).then(() => null).catch(() => null);
  }

  return jsonResponse({
    success: true,
    treino_id: treinoId,
    aluno_id: aluno.id,
    aluno_source: aluno.source,
    treino_ajustado: treinoAjustado,
    blocos: toBlocos(treinoAjustado),
    delta: aiJson?.delta ?? [],
    mensagem_ron: aiJson?.mensagem_ron ?? "",
    contexto,
    delivery,
  });
});
