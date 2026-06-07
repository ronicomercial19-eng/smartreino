// POST /fitpro-quick-workout
// Body: { student_external_id, respostas: {tempo_min, foco, energia} }
// Generates a 4-block quick workout from annual periodization and 9FIT video library.
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

  const externalId: string = body.student_external_id ?? req.headers.get("x-student-external-id") ?? "";
  const respostas = body.respostas ?? {};
  if (!externalId) return jsonResponse({ error: "student_external_id_required", code: "student_external_id_required" }, 400);

  const aluno = await resolveAluno(externalId);
  if (!aluno) {
    return jsonResponse({
      error: "aluno_nao_encontrado",
      code: "student_not_found",
      hint: "O SmartReino agora busca em fitpro_student_map, alunos, athletes e students. Envie o UUID do aluno/athlete ou email existente se ainda não houver mapping.",
    }, 404);
  }

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
      message: "Aluno encontrado, mas sem periodização anual ativa. Cadastre/atribua uma periodização para liberar treinos personalizados.",
    }, 409);
  }

  const dataDia = body.data ?? new Date().toISOString().slice(0, 10);
  const tempoMin = Number(respostas.tempo_min ?? aluno.tempo_disponivel_min ?? 45);
  const foco = String(respostas.foco ?? aluno.foco_muscular ?? periodizacao.objetivo ?? "geral");
  const energia = String(respostas.energia ?? "media");
  const contexto = {
    aluno_id: aluno.id,
    aluno_nome: aluno.nome,
    aluno_source: aluno.source,
    resolver_table: aluno.table,
    fitpro_student_id: aluno.fitpro_student_id,
    duracao_min: tempoMin,
    foco,
    energia,
    periodizacao,
  };

  const treino = await buildWorkoutFromLibrary({ aluno, respostas: { ...respostas, tempo_min: tempoMin, foco, energia }, data: dataDia });
  const treinoId = await persistWorkout(aluno.id, treino, contexto, dataDia);
  const blocos = toBlocos(treino);

  const { data: info } = await sb
    .from("library_items")
    .select("id,name,thumbnail_url,player_url,type,subcategory")
    .in("type", ["infoproduto", "infoproduct", "ebook", "video"])
    .limit(1)
    .maybeSingle();

  const delivery = await emitFitproWorkoutEvent({
    studentExternalId: aluno.fitpro_student_id ?? externalId,
    professorExternalId: String(aluno.mapping?.fitpro_professor_id ?? "") || null,
    treino,
    treinoId,
    contexto,
    eventType: "quick_workout_delivered",
  });

  return jsonResponse({
    success: true,
    treino_id: treinoId,
    aluno_id: aluno.id,
    aluno_source: aluno.source,
    data: dataDia,
    duracao_min: tempoMin,
    foco,
    energia,
    perguntas_usadas: {
      tempo_min: tempoMin,
      foco,
      energia,
    },
    periodizacao: {
      fonte: periodizacao.fonte,
      objetivo: periodizacao.objetivo,
      fase_atual: periodizacao.fase_atual,
      semana_atual: periodizacao.semana_atual,
    },
    treino,
    blocos,
    contexto,
    delivery,
    infoproduto_sugerido: info ? {
      id: info.id, titulo: info.name, thumb: info.thumbnail_url, cta_url: info.player_url, tipo: info.type,
    } : null,
  });
});
