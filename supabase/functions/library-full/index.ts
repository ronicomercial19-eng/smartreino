// GET /library-full?student_external_id=<ID>
// Retorna biblioteca 9FIT completa: exercícios, protocolos 9x9x9, infoprodutos, aulas.
import { admin, corsHeaders, jsonResponse, requirePartnerKey, resolveAlunoId } from "../_shared/partner.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const auth = await requirePartnerKey(req);
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const externalId = url.searchParams.get("student_external_id")
    ?? req.headers.get("x-student-external-id");

  const sb = admin();
  let alunoCtx: any = null;
  if (externalId) {
    const alunoId = await resolveAlunoId(externalId);
    if (alunoId) {
      const { data } = await sb.from("alunos")
        .select("id,nome,objetivo,nivel,foco_muscular").eq("id", alunoId).maybeSingle();
      alunoCtx = data;
    }
  }

  const [exercisesQ, protocolsQ, libraryQ] = await Promise.all([
    sb.from("exercise_library").select("*").limit(500),
    sb.from("smart_treino_protocols")
      .select("id,pillar,pillar_label,protocol_name,variation_name,variation_focus,block_neural,block_integration,block_9_template,block_reset,rpe_range,goal_tags,recommended_for")
      .limit(1000),
    sb.from("library_items").select("id,type,name,category,subcategory,thumbnail_url,player_url,payload").limit(500),
  ]);

  const exercicios = (exercisesQ.data ?? []).map((e: any) => ({
    id: e.id,
    nome: typeof e.nome === "string" ? e.nome : (e.nome?.pt ?? e.nome?.en ?? e.name ?? ""),
    grupo: typeof e.categoria === "string" ? e.categoria : (e.categoria?.pt ?? null),
    video_url: e.video_url ?? e.player_url ?? null,
    thumb: e.thumbnail_url ?? null,
  }));

  const protocolos = (protocolsQ.data ?? []).map((p: any) => ({
    code: p.id,
    pilar: p.pillar,
    pilar_label: p.pillar_label,
    nome: p.protocol_name,
    variacao: p.variation_name,
    foco: p.variation_focus,
    block_9_template: p.block_9_template,
    rpe_range: p.rpe_range,
    goal_tags: p.goal_tags,
    recommended_for: p.recommended_for,
  }));

  const libraryItems = libraryQ.data ?? [];
  const infoprodutos = libraryItems.filter((i: any) => i.type === "infoproduct").map((i: any) => ({
    id: i.id, titulo: i.name, categoria: i.category, thumb: i.thumbnail_url, cta_url: i.player_url, payload: i.payload,
  }));
  const videos_aulas = libraryItems.filter((i: any) => i.type === "video" || i.type === "class").map((i: any) => ({
    id: i.id, titulo: i.name, categoria: i.category, thumb: i.thumbnail_url, player_url: i.player_url,
  }));

  return jsonResponse({
    success: true,
    biblioteca: {
      exercicios,
      protocolos_9x9x9: protocolos,
      infoprodutos,
      videos_aulas,
    },
    contagens: {
      exercicios: exercicios.length,
      protocolos: protocolos.length,
      infoprodutos: infoprodutos.length,
      videos: videos_aulas.length,
    },
    personalizado_para: alunoCtx,
  });
});
