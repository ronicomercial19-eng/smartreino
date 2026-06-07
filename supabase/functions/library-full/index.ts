// GET /library-full?student_external_id=<ID>
// Retorna biblioteca 9FIT completa para grid nativo no FitPro.
import { admin, corsHeaders, jsonResponse, requirePartnerKey, resolveAluno } from "../_shared/partner.ts";

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
  const aluno = externalId ? await resolveAluno(externalId) : null;
  const alunoCtx = aluno ? {
    id: aluno.id,
    source: aluno.source,
    nome: aluno.nome,
    objetivo: aluno.objetivo,
    nivel: aluno.nivel,
    foco_muscular: aluno.foco_muscular,
  } : null;

  const [protocolsQ, libraryQ] = await Promise.all([
    sb.from("smart_treino_protocols")
      .select("id,pillar,pillar_label,protocol_name,variation_name,variation_focus,block_neural,block_integration,block_9_template,block_reset,rpe_range,goal_tags,recommended_for")
      .limit(1000),
    sb.from("library_items").select("id,type,name,category,subcategory,thumbnail_url,player_url,payload").limit(1000),
  ]);

  const libraryItems = libraryQ.data ?? [];
  const exercicios = libraryItems.filter((i: any) => i.type === "exercise").map((i: any) => ({
    id: i.id,
    nome: i.name,
    grupo: i.subcategory ?? i.category ?? null,
    categoria: i.category,
    subcategoria: i.subcategory,
    video_url: i.payload?.videoUrl ?? i.player_url ?? null,
    player_url: i.player_url ?? i.payload?.playerUrl ?? null,
    thumb: i.thumbnail_url ?? i.payload?.thumbnailUrl ?? null,
    assignable: i.payload?.assignable ?? null,
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

  const infoprodutos = libraryItems.filter((i: any) => ["infoproduto", "infoproduct", "ebook"].includes(i.type)).map((i: any) => ({
    id: i.id, titulo: i.name, categoria: i.category, thumb: i.thumbnail_url, cta_url: i.player_url, payload: i.payload,
  }));
  const videos_aulas = libraryItems.filter((i: any) => ["video", "class", "sistema", "app"].includes(i.type)).map((i: any) => ({
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
    grid_nativo_fitpro: {
      tabs: ["Exercícios", "Protocolos 9x9x9", "Infoprodutos", "Aulas"],
      card_fields: ["thumb", "nome/titulo", "grupo/categoria", "player_url", "cta_url"],
    },
  });
});
