// POST /fitpro-adjust-workout
// Body: { student_external_id, treino_atual_id?, treino_atual?, mensagem }
// Returns: { success, treino_ajustado, delta, mensagem_ron }
import { admin, corsHeaders, jsonResponse, requirePartnerKey, resolveAlunoId } from "../_shared/partner.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  const auth = await requirePartnerKey(req);
  if ("error" in auth) return auth.error;

  let body: any = {};
  try { body = await req.json(); } catch { return jsonResponse({ error: "invalid_json" }, 400); }

  const externalId = body.student_external_id ?? req.headers.get("x-student-external-id");
  const mensagem = String(body.mensagem ?? "").trim();
  if (!externalId || !mensagem) {
    return jsonResponse({ error: "student_external_id and mensagem required" }, 400);
  }

  const alunoId = await resolveAlunoId(externalId);
  if (!alunoId) return jsonResponse({ error: "aluno_nao_mapeado", code: "student_not_mapped" }, 404);

  const sb = admin();
  // Carrega treino atual: param explícito > último de historico_treinos_realizados
  let treinoAtual: any = body.treino_atual ?? null;
  if (!treinoAtual && body.treino_atual_id) {
    const { data } = await sb.from("historico_treinos_realizados")
      .select("*").eq("id", body.treino_atual_id).maybeSingle();
    treinoAtual = data;
  }
  if (!treinoAtual) {
    const { data } = await sb.from("historico_treinos_realizados")
      .select("*").eq("aluno_id", alunoId).order("data_treino", { ascending: false }).limit(1).maybeSingle();
    treinoAtual = data;
  }

  // Carrega aluno + protocolo p/ contexto da IA
  const { data: aluno } = await sb.from("alunos").select("nome,objetivo,nivel,restricoes,foco_muscular").eq("id", alunoId).maybeSingle();

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return jsonResponse({ error: "ai_not_configured" }, 500);

  const systemPrompt = `Você é RON, IA do 9FIT. Ajuste o treino do aluno conforme o pedido, mantendo a estrutura 4-blocos (Neural, Integration, Block 9, Reset). Responda APENAS JSON válido com este shape:
{"treino_ajustado":{"neural":[...],"integracao":[...],"bloco9":[...],"reset":[...]},"delta":["mudança 1","mudança 2"],"mensagem_ron":"resposta curta ao aluno"}`;

  const userPrompt = `Aluno: ${JSON.stringify(aluno)}
Treino atual: ${JSON.stringify(treinoAtual).slice(0, 6000)}
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

  // Log no chat history
  await sb.from("ai_chat_messages").insert([
    { aluno_id: alunoId, role: "user", content: mensagem, metadata: { source: "fitpro_adjust" } },
    { aluno_id: alunoId, role: "assistant", content: aiJson?.mensagem_ron ?? "", metadata: { source: "fitpro_adjust", delta: aiJson?.delta } },
  ]).then(() => null).catch(() => null);

  return jsonResponse({
    success: true,
    aluno_id: alunoId,
    treino_ajustado: aiJson?.treino_ajustado ?? null,
    delta: aiJson?.delta ?? [],
    mensagem_ron: aiJson?.mensagem_ron ?? "",
  });
});
