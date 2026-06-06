// POST /fitpro-plan-workout
// Body: { student_external_id, data? }
// Lê periodização ativa (interna OU FitPro/SmartPeriodizer) e prescreve treino do dia.
import { admin, corsHeaders, jsonResponse, requirePartnerKey, resolveAlunoId } from "../_shared/partner.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  const auth = await requirePartnerKey(req);
  if ("error" in auth) return auth.error;

  let body: any = {};
  try { body = await req.json(); } catch { return jsonResponse({ error: "invalid_json" }, 400); }

  const externalId = body.student_external_id ?? req.headers.get("x-student-external-id");
  const dataDia = body.data ?? new Date().toISOString().slice(0, 10);
  if (!externalId) return jsonResponse({ error: "student_external_id_required" }, 400);

  const alunoId = await resolveAlunoId(externalId);
  if (!alunoId) return jsonResponse({ error: "aluno_nao_mapeado", code: "student_not_mapped" }, 404);

  const sb = admin();

  // Verifica periodização ativa (interna OU FitPro)
  const { data: periodVw } = await sb
    .from("vw_periodizacao_ativa_aluno")
    .select("*")
    .eq("aluno_id", alunoId)
    .maybeSingle();

  if (!periodVw || periodVw.tem_periodizacao === false) {
    await sb.rpc("notificar_falta_periodizacao", { p_aluno_id: alunoId }).catch(() => null);
    return jsonResponse({
      error: "sem_periodizacao_ativa",
      code: "no_active_periodization",
      cta_url: "/periodization-upload",
      message: "Aluno sem periodização ativa. Cadastre uma no SmartPeriodizer para liberar o treino do dia.",
    }, 409);
  }

  const { data: rpc, error } = await sb.rpc("prescrever_treino_partner", {
    p_aluno_id: alunoId, p_data: dataDia,
  });
  if (error) return jsonResponse({ error: error.message, code: "rpc_error" }, 500);
  const result: any = rpc;

  if (result?.sucesso === false) {
    return jsonResponse({ error: result?.motivo ?? "falha_geracao", code: "generation_failed", details: result }, 422);
  }

  const treino = result?.treino ?? result;
  const blocos = [
    { tipo: "neural",      cor: "#22c55e", titulo: "🟢 Ativação Neural", exercicios: treino?.neural ?? [] },
    { tipo: "integration", cor: "#3b82f6", titulo: "🔵 Integração",      exercicios: treino?.integracao ?? treino?.integration ?? [] },
    { tipo: "block9",      cor: "#E8571A", titulo: "🟠 Block 9",         exercicios: treino?.bloco9 ?? treino?.block_9 ?? [] },
    { tipo: "reset",       cor: "#9ca3af", titulo: "⚪ Reset",            exercicios: treino?.reset ?? [] },
  ];

  return jsonResponse({
    success: true,
    treino_id: result?.historico_id ?? null,
    aluno_id: alunoId,
    data: dataDia,
    periodizacao: {
      fonte: periodVw.fonte,
      objetivo: periodVw.objetivo,
      fase_atual: periodVw.fase_atual,
      semana_atual: periodVw.semana_atual,
    },
    blocos,
    contexto: result?.contexto ?? null,
  });
});
