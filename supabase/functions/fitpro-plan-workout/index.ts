// POST /fitpro-plan-workout
// Body: { student_external_id, data? }
// Lê periodização ativa em tabelas existentes e entrega treino do dia ao FitPro.
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
  const dataDia = body.data ?? new Date().toISOString().slice(0, 10);
  if (!externalId) return jsonResponse({ error: "student_external_id_required", code: "student_external_id_required" }, 400);

  const aluno = await resolveAluno(externalId);
  if (!aluno) return jsonResponse({ error: "aluno_nao_encontrado", code: "student_not_found" }, 404);

  const sb = admin();
  const periodizacao = await getActivePeriodizacao(aluno);

  if (!periodizacao.tem_periodizacao) {
    await sb.rpc("notificar_falta_periodizacao", { p_aluno_id: aluno.id }).catch(() => null);
    return jsonResponse({
      error: "sem_periodizacao_ativa",
      code: "no_active_periodization",
      cta_url: "/periodization-upload",
      aluno_id: aluno.id,
      aluno_source: aluno.source,
      message: "Aluno encontrado, mas sem periodização anual ativa. Cadastre uma no SmartPeriodizer para liberar o treino do dia.",
    }, 409);
  }

  const contexto = {
    aluno_id: aluno.id,
    aluno_nome: aluno.nome,
    aluno_source: aluno.source,
    resolver_table: aluno.table,
    fitpro_student_id: aluno.fitpro_student_id,
    periodizacao,
  };
  const treino = await buildWorkoutFromLibrary({ aluno, respostas: { foco: periodizacao.objetivo, energia: "media" }, data: dataDia });
  const treinoId = await persistWorkout(aluno.id, treino, contexto, dataDia);
  const delivery = await emitFitproWorkoutEvent({
    studentExternalId: aluno.fitpro_student_id ?? externalId,
    professorExternalId: String(aluno.mapping?.fitpro_professor_id ?? "") || null,
    treino,
    treinoId,
    contexto,
    eventType: "planned_workout_delivered",
  });

  return jsonResponse({
    success: true,
    treino_id: treinoId,
    aluno_id: aluno.id,
    aluno_source: aluno.source,
    data: dataDia,
    periodizacao: {
      fonte: periodizacao.fonte,
      objetivo: periodizacao.objetivo,
      fase_atual: periodizacao.fase_atual,
      semana_atual: periodizacao.semana_atual,
    },
    treino,
    blocos: toBlocos(treino),
    contexto,
    delivery,
  });
});
