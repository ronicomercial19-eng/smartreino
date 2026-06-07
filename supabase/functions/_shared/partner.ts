// Shared helpers for FitPro partner-key authenticated edge functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-partner-key, x-student-external-id",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

export async function requirePartnerKey(req: Request) {
  const key = req.headers.get("x-partner-key");
  const expected = Deno.env.get("FITPRO_API_KEY");
  if (!key) {
    return { error: jsonResponse({ error: "missing x-partner-key", code: "no_partner_key" }, 401) };
  }
  if (expected && key === expected) {
    return { key, connection_id: null as string | null, professor_id: null as string | null };
  }
  const sb = admin();
  const { data, error } = await sb.rpc("validate_partner_key", { p_key: key });
  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    return { error: jsonResponse({ error: "invalid partner key", code: "invalid_partner_key" }, 401) };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { key, connection_id: row.connection_id ?? null, professor_id: row.professor_id ?? null };
}

export interface ResolvedAluno {
  id: string;
  source: "fitpro_map" | "alunos" | "athletes" | "students";
  table: "alunos" | "athletes" | "students";
  fitpro_student_id: string | null;
  professor_id: string | null;
  nome: string | null;
  email: string | null;
  objetivo: string | null;
  nivel: string | null;
  foco_muscular: string | null;
  tempo_disponivel_min: number | null;
  raw: Record<string, unknown>;
  mapping?: Record<string, unknown> | null;
}

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeResolved(row: any, table: ResolvedAluno["table"], source: ResolvedAluno["source"], mapping?: any): ResolvedAluno {
  const metadata = row?.metadata ?? {};
  const goals = Array.isArray(row?.goals) ? row.goals.join(", ") : null;
  const duration = typeof row?.session_duration === "string" ? Number.parseInt(row.session_duration, 10) : null;
  return {
    id: String(row.id),
    table,
    source,
    fitpro_student_id: cleanText(mapping?.fitpro_student_id) ?? cleanText(row?.fitpro_student_id) ?? String(row.id),
    professor_id: cleanText(row?.professor_id) ?? cleanText(row?.coach_id) ?? cleanText(mapping?.fitpro_professor_id),
    nome: cleanText(row?.nome) ?? cleanText(row?.nome_completo) ?? cleanText(row?.name),
    email: cleanText(row?.email) ?? cleanText(metadata?.email),
    objetivo: cleanText(row?.objetivo) ?? cleanText(row?.primary_goal) ?? cleanText(goals),
    nivel: cleanText(row?.nivel_experiencia) ?? cleanText(row?.nivel) ?? cleanText(row?.training_level) ?? cleanText(row?.experience_level),
    foco_muscular: cleanText(row?.foco_muscular) ?? cleanText(row?.primary_goal) ?? cleanText(goals),
    tempo_disponivel_min: Number.isFinite(row?.tempo_disponivel_min) ? row.tempo_disponivel_min : (Number.isFinite(duration) ? duration : null),
    raw: row,
    mapping: mapping ?? null,
  };
}

async function getById(sb: ReturnType<typeof admin>, table: ResolvedAluno["table"], id: string, source: ResolvedAluno["source"], mapping?: any) {
  const { data } = await sb.from(table).select("*").eq("id", id).maybeSingle();
  return data ? normalizeResolved(data, table, source, mapping) : null;
}

export async function resolveAluno(externalId: string | null | undefined): Promise<ResolvedAluno | null> {
  const value = cleanText(externalId);
  if (!value) return null;
  const sb = admin();

  const { data: mapping } = await sb
    .from("fitpro_student_map")
    .select("*")
    .eq("fitpro_student_id", value)
    .order("last_seen_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const candidateIds = [mapping?.athlete_id, isUuid(value) ? value : null].filter(Boolean) as string[];
  for (const id of candidateIds) {
    const aluno = await getById(sb, "alunos", id, mapping ? "fitpro_map" : "alunos", mapping);
    if (aluno) return aluno;
    const athlete = await getById(sb, "athletes", id, mapping ? "fitpro_map" : "athletes", mapping);
    if (athlete) return athlete;
    const student = await getById(sb, "students", id, mapping ? "fitpro_map" : "students", mapping);
    if (student) return student;
  }

  const lowered = value.toLowerCase();
  if (lowered.includes("@")) {
    const [{ data: alunos }, { data: athletes }, { data: students }] = await Promise.all([
      sb.from("alunos").select("*").limit(500),
      sb.from("athletes").select("*").limit(500),
      sb.from("students").select("*").limit(500),
    ]);
    const aluno = (alunos ?? []).find((r: any) => cleanText(r.email)?.toLowerCase() === lowered);
    if (aluno) return normalizeResolved(aluno, "alunos", "alunos", mapping);
    const athlete = (athletes ?? []).find((r: any) =>
      cleanText(r.email)?.toLowerCase() === lowered || cleanText(r.metadata?.email)?.toLowerCase() === lowered
    );
    if (athlete) return normalizeResolved(athlete, "athletes", "athletes", mapping);
    const student = (students ?? []).find((r: any) => cleanText(r.email)?.toLowerCase() === lowered);
    if (student) return normalizeResolved(student, "students", "students", mapping);
  }

  return null;
}

export async function resolveAlunoId(externalId: string | null | undefined): Promise<string | null> {
  return (await resolveAluno(externalId))?.id ?? null;
}

export async function getActivePeriodizacao(aluno: ResolvedAluno) {
  const sb = admin();
  const status = ["in_progress", "assigned", "active"];
  const { data: ap } = await sb
    .from("athlete_periodizations")
    .select("*")
    .eq("athlete_id", aluno.id)
    .in("status", status)
    .order("assigned_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ap) {
    const assignedAt = ap.assigned_at ?? ap.created_at ?? new Date().toISOString();
    const semana = Math.max(1, Math.ceil((Date.now() - new Date(assignedAt).getTime()) / 604_800_000));
    const { data: annual } = ap.annual_plan_id
      ? await sb.from("periodization_annual_plans").select("*").eq("id", ap.annual_plan_id).maybeSingle()
      : { data: null } as any;
    return {
      tem_periodizacao: true,
      fonte: "internal",
      athlete_periodization_id: ap.id,
      annual_plan_id: ap.annual_plan_id ?? null,
      fitpro_periodization_id: null,
      objetivo: cleanText(annual?.goal) ?? cleanText(annual?.objetivo) ?? cleanText(ap.notes) ?? aluno.objetivo ?? "força_hipertrofia",
      nivel: aluno.nivel ?? cleanText(annual?.training_level) ?? "intermediario",
      fase_atual: semana <= 4 ? "acumulacao" : semana <= 8 ? "intensificacao" : semana <= 11 ? "realizacao" : "deload",
      semana_atual: semana,
      raw: { athlete_periodization: ap, annual_plan: annual },
    };
  }

  const fitproIds = [aluno.fitpro_student_id, aluno.id].filter(isUuid);
  for (const id of fitproIds) {
    const { data: fsp } = await sb
      .from("fitpro_smartperiodizer_periodizations")
      .select("*")
      .eq("fitpro_student_id", id)
      .in("status", ["active", "in_progress"])
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (fsp) {
      return {
        tem_periodizacao: true,
        fonte: "fitpro",
        athlete_periodization_id: null,
        annual_plan_id: null,
        fitpro_periodization_id: fsp.id,
        objetivo: fsp.goal ?? aluno.objetivo ?? "força_hipertrofia",
        nivel: fsp.training_level ?? aluno.nivel ?? "intermediario",
        fase_atual: fsp.current_phase ?? "acumulacao",
        semana_atual: fsp.cycle_week ?? 1,
        volume_level: fsp.volume_level,
        intensity_level: fsp.intensity_level,
        recovery_status: fsp.recovery_status,
        adherence_level: fsp.adherence_level,
        fatigue_level: fsp.fatigue_level,
        raw: { fitpro_periodization: fsp },
      };
    }
  }

  return { tem_periodizacao: false, fonte: null, objetivo: aluno.objetivo, nivel: aluno.nivel, semana_atual: null, fase_atual: null };
}

function focusTerms(foco?: string | null) {
  const v = (foco ?? "").toLowerCase();
  if (v.includes("infer") || v.includes("perna") || v.includes("glute")) return ["quadr", "glute", "posterior", "panturr", "perna"];
  if (v.includes("super") || v.includes("peito") || v.includes("cost") || v.includes("dors")) return ["peit", "dors", "ombro", "bíceps", "tríceps", "braco"];
  if (v.includes("core") || v.includes("abd")) return ["core", "abd", "lombar"];
  if (v.includes("mobil") || v.includes("funcional")) return ["core", "mobil", "quadril", "ombro"];
  return ["peit", "dors", "quadr", "glute", "core"];
}

function pickExercises(items: any[], terms: string[], count: number, used = new Set<string>()) {
  const matches = items.filter((item) => {
    if (used.has(item.id)) return false;
    const hay = `${item.name ?? ""} ${item.category ?? ""} ${item.subcategory ?? ""}`.toLowerCase();
    return terms.some((term) => hay.includes(term.toLowerCase()));
  });
  const pool = matches.length >= count ? matches : items.filter((item) => !used.has(item.id));
  return pool.slice(0, count).map((item) => {
    used.add(item.id);
    return {
      id: item.id,
      nome: item.name,
      grupo_muscular: item.subcategory ?? item.category,
      categoria: item.category,
      subcategoria: item.subcategory,
      video_url: item.payload?.videoUrl ?? item.player_url,
      player_url: item.player_url ?? item.payload?.playerUrl ?? null,
      thumb: item.thumbnail_url ?? item.payload?.thumbnailUrl ?? null,
    };
  });
}

function withParams(items: any[], params: Record<string, unknown>) {
  return items.map((item) => ({ ...item, ...params }));
}

export async function buildWorkoutFromLibrary(params: { aluno: ResolvedAluno; respostas?: any; data?: string }) {
  const sb = admin();
  const { data: exercises } = await sb
    .from("library_items")
    .select("id,type,name,category,subcategory,thumbnail_url,player_url,payload")
    .eq("type", "exercise")
    .limit(600);
  const items = (exercises ?? []).filter((item: any) => item.player_url || item.payload?.playerUrl || item.payload?.videoUrl);
  const used = new Set<string>();
  const foco = cleanText(params.respostas?.foco) ?? params.aluno.foco_muscular ?? params.aluno.objetivo;
  const energia = cleanText(params.respostas?.energia)?.toLowerCase() ?? "media";
  const rpe = energia.includes("alta") ? 8 : energia.includes("baixa") ? 6 : 7;

  const neural = withParams(pickExercises(items, ["core", "ombro", "quadril", "mobil"], 2, used), {
    series: 2, reps: "6-8", rpe: 3, descanso: "60s", cadencia: "controlada",
    nota_tecnica: "Ativação neuromuscular — foco em qualidade e velocidade",
  });
  const integracao = withParams(pickExercises(items, ["core", "dors", "glute", "ombro"], 2, used), {
    series: 2, reps: "8-10", rpe: 5, descanso: "60s", cadencia: "fluida",
    nota_tecnica: "Integração cinética multiplanar",
  });
  const bloco9 = withParams(pickExercises(items, focusTerms(foco), 4, used), {
    series: 4, reps: "8-12", rpe, descanso: "90s", cadencia: "2-0-1-0",
    nota_tecnica: "Estímulo principal — RPE controlado pela periodização",
  });
  const reset = withParams(pickExercises(items, ["core", "mobil", "panturr", "lombar"], 2, used), {
    series: 2, reps: "30-60s", rpe: 2, descanso: "30s", cadencia: "lenta",
    nota_tecnica: "Recuperação ativa e mobilidade",
  });

  return { neural, integracao, bloco9, reset };
}

export function toBlocos(treino: any) {
  return [
    { tipo: "neural", cor: "#22c55e", titulo: "🟢 Ativação Neural", exercicios: treino?.neural ?? [] },
    { tipo: "integration", cor: "#3b82f6", titulo: "🔵 Integração", exercicios: treino?.integracao ?? treino?.integration ?? [] },
    { tipo: "block9", cor: "#E8571A", titulo: "🟠 Block 9", exercicios: treino?.bloco9 ?? treino?.block_9 ?? [] },
    { tipo: "reset", cor: "#9ca3af", titulo: "⚪ Reset", exercicios: treino?.reset ?? [] },
  ];
}

export async function persistWorkout(alunoId: string, treino: any, contexto?: any, dataDia = new Date().toISOString().slice(0, 10)) {
  const sb = admin();
  const { data } = await sb.from("historico_treinos_realizados").insert({
    aluno_id: alunoId,
    data_treino: dataDia,
    semana_treino: contexto?.semana_atual ?? null,
    dia_treino: new Date(`${dataDia}T00:00:00Z`).getUTCDay(),
    duracao_minutos: contexto?.duracao_min ?? null,
    exercicios_realizados: treino,
    notas_professor: "Prescrito automaticamente pela integração FitPro/SmartReino",
  }).select("id").maybeSingle();
  return data?.id ?? null;
}

export async function emitFitproWorkoutEvent(params: {
  studentExternalId: string;
  professorExternalId?: string | null;
  treino: any;
  treinoId?: string | null;
  contexto?: any;
  eventType?: string;
}) {
  const apiKey = Deno.env.get("FITPRO_API_KEY");
  if (!apiKey) return { success: false, skipped: true, reason: "FITPRO_API_KEY_not_configured" };
  const apiUrl = Deno.env.get("FITPRO_API_URL") || `${Deno.env.get("SUPABASE_URL")}/functions/v1/fitpro-api`;
  try {
    const resp = await fetch(`${apiUrl}/v1/fitpro/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        event_type: params.eventType ?? "workout_delivered",
        fitpro_student_id: params.studentExternalId,
        fitpro_professor_id: params.professorExternalId ?? null,
        entity_type: "workout",
        entity_id: params.treinoId ?? null,
        payload: { source: "smartreino", delivered_at: new Date().toISOString(), contexto: params.contexto, treino: params.treino },
      }),
    });
    const body = await resp.json().catch(() => null);
    return { success: resp.ok, status: resp.status, body };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
