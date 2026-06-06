// POST /fitpro-quick-workout
// Body: { student_external_id, respostas: {tempo_min, foco, energia} }
// Returns: { success, treino, blocos, ... } with 4-block 9FIT structure.
import { admin, corsHeaders, jsonResponse, requirePartnerKey, resolveAlunoId } from "../_shared/partner.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  const auth = await requirePartnerKey(req);
  if ("error" in auth) return auth.error;

  let body: any = {};
  try { body = await req.json(); } catch { return jsonResponse({ error: "invalid_json" }, 400); }

  const externalId: string = body.student_external_id ?? req.headers.get("x-student-external-id") ?? "";
  const respostas = body.respostas ?? {};
  if (!externalId) return jsonResponse({ error: "student_external_id_required" }, 400);

  const alunoId = await resolveAlunoId(externalId);
  if (!alunoId) {
    return jsonResponse({
      error: "aluno_nao_mapeado",
      code: "student_not_mapped",
      hint: "Sincronize o aluno do FitPro com o SmartReino antes de chamar este endpoint.",
    }, 404);
  }

  const sb = admin();
  const { data: rpc, error } = await sb.rpc("prescrever_treino_partner", {
    p_aluno_id: alunoId,
    p_data: new Date().toISOString().slice(0, 10),
  });

  if (error) return jsonResponse({ error: error.message, code: "rpc_error" }, 500);
  const result: any = rpc;

  if (result?.sucesso === false && result?.motivo === "sem_periodizacao_ativa") {
    await sb.rpc("notificar_falta_periodizacao", { p_aluno_id: alunoId }).catch(() => null);
    return jsonResponse({
      error: "sem_periodizacao_ativa",
      code: "no_active_periodization",
      cta_url: "/periodization-upload",
      message: "Aluno sem periodização ativa. Cadastre uma para liberar treinos personalizados.",
    }, 409);
  }
  if (result?.sucesso === false) {
    return jsonResponse({ error: result.motivo ?? "falha_geracao", code: "generation_failed", details: result }, 422);
  }

  // Aplica preferências das respostas como override de duração/foco
  const tempoMin = Number(respostas.tempo_min ?? 45);
  const foco = String(respostas.foco ?? "");
  const energia = String(respostas.energia ?? "media");

  const treino = result?.treino ?? result;
  const blocos = [
    { tipo: "neural",      cor: "#22c55e", titulo: "🟢 Ativação Neural", exercicios: treino?.neural ?? [] },
    { tipo: "integration", cor: "#3b82f6", titulo: "🔵 Integração",      exercicios: treino?.integracao ?? treino?.integration ?? [] },
    { tipo: "block9",      cor: "#E8571A", titulo: "🟠 Block 9",         exercicios: treino?.bloco9 ?? treino?.block_9 ?? [] },
    { tipo: "reset",       cor: "#9ca3af", titulo: "⚪ Reset",            exercicios: treino?.reset ?? [] },
  ];

  // Sugere infoproduto da biblioteca alinhado ao foco
  const { data: info } = await sb
    .from("library_items")
    .select("id,name,thumbnail_url,player_url,subcategory")
    .eq("type", "infoproduct")
    .limit(1)
    .maybeSingle();

  return jsonResponse({
    success: true,
    treino_id: result?.historico_id ?? null,
    aluno_id: alunoId,
    duracao_min: tempoMin,
    foco,
    energia,
    blocos,
    contexto: result?.contexto ?? null,
    infoproduto_sugerido: info ? {
      id: info.id, titulo: info.name, thumb: info.thumbnail_url, cta_url: info.player_url,
    } : null,
  });
});
