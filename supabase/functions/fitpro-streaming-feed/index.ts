// GET /fitpro-streaming-feed?student_external_id=...
// Returns curated videos from library_items filtered by current_phase_category.
import { admin, corsHeaders, jsonResponse, requirePartnerKey, resolveAluno } from "../_shared/partner.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  const auth = await requirePartnerKey(req);
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const externalId =
    url.searchParams.get("student_external_id") ??
    req.headers.get("x-student-external-id") ??
    (req.method === "POST" ? (await req.clone().json().catch(() => ({})))?.student_external_id : null) ?? "";

  if (!externalId) return jsonResponse({ error: "student_external_id_required" }, 400);

  const aluno = await resolveAluno(externalId);
  if (!aluno) return jsonResponse({ error: "aluno_nao_encontrado" }, 404);

  const sb = admin();
  const { data: periodizacao } = await sb
    .from("vw_athlete_periodizacao_ativa")
    .select("current_phase_category, current_phase")
    .eq("athlete_id", aluno.id)
    .maybeSingle();

  const phaseCategory = periodizacao?.current_phase_category ?? "geral";

  let { data: items } = await sb
    .from("library_items")
    .select("id, name, category, subcategory, thumbnail_url, player_url, type, payload")
    .eq("type", "videos")
    .eq("category", phaseCategory)
    .order("synced_at", { ascending: false })
    .limit(60);

  if ((!items || items.length === 0) && phaseCategory !== "geral") {
    const fb = await sb
      .from("library_items")
      .select("id, name, category, subcategory, thumbnail_url, player_url, type, payload")
      .eq("type", "videos")
      .eq("category", "geral")
      .order("synced_at", { ascending: false })
      .limit(60);
    items = fb.data ?? [];
  }

  return jsonResponse({
    success: true,
    aluno_id: aluno.id,
    phase_category: phaseCategory,
    current_phase: periodizacao?.current_phase ?? null,
    items: (items ?? []).map((it: any) => ({
      id: it.id,
      name: it.name,
      category: it.category,
      subcategory: it.subcategory,
      thumbnail_url: it.thumbnail_url ?? it.payload?.thumbnailUrl ?? null,
      player_url: it.player_url ?? it.payload?.playerUrl ?? null,
    })),
  });
});
