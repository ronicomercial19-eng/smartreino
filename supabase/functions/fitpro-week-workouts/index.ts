// POST /fitpro-week-workouts
// Body: { student_external_id }
// Returns 7-day preview of current week from planos_de_treino_gerados + vw_athlete_periodizacao_ativa
import { admin, corsHeaders, jsonResponse, requirePartnerKey, resolveAluno } from "../_shared/partner.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  const auth = await requirePartnerKey(req);
  if ("error" in auth) return auth.error;

  let body: any = {};
  try { body = await req.json(); } catch { return jsonResponse({ error: "invalid_json" }, 400); }
  const externalId: string = body.student_external_id ?? req.headers.get("x-student-external-id") ?? "";
  if (!externalId) return jsonResponse({ error: "student_external_id_required" }, 400);

  const aluno = await resolveAluno(externalId);
  if (!aluno) return jsonResponse({ error: "aluno_nao_encontrado", code: "student_not_found" }, 404);

  const sb = admin();

  // Active plan (canonical: planos_de_treino_gerados scoped by athlete_id)
  const { data: plano } = await sb
    .from("planos_de_treino_gerados")
    .select("*")
    .eq("athlete_id", aluno.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Periodization context
  const { data: periodizacao } = await sb
    .from("vw_athlete_periodizacao_ativa")
    .select("*")
    .eq("athlete_id", aluno.id)
    .maybeSingle();

  if (!plano && !periodizacao) {
    return jsonResponse({
      error: "sem_plano_ativo",
      code: "no_active_plan",
      cta_url: "/periodization-upload",
      aluno_id: aluno.id,
    }, 409);
  }

  // Today's executions (for is_today flag + status)
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const isoDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    isoDates.push(d.toISOString().slice(0, 10));
  }
  const todayIso = today.toISOString().slice(0, 10);

  const { data: executions } = await sb
    .from("workout_executions")
    .select("id, workout_date, status, phase_name, day_number, week_number")
    .eq("athlete_id", aluno.id)
    .in("workout_date", isoDates);

  const execByDate = new Map<string, any>();
  for (const e of executions ?? []) execByDate.set(e.workout_date, e);

  const planoCompleto: any = plano?.plano_completo ?? {};
  const semanas: any[] = Array.isArray(planoCompleto?.semanas) ? planoCompleto.semanas : [];
  const semanaIdx = Math.max(0, (periodizacao?.current_week_index ?? 1) - 1);
  const semanaAtiva = semanas[semanaIdx] ?? semanas[0] ?? null;
  const dias: any[] = Array.isArray(semanaAtiva?.dias) ? semanaAtiva.dias : [];

  const week = isoDates.map((iso, i) => {
    const dia = dias[i] ?? null;
    const exec = execByDate.get(iso);
    const isToday = iso === todayIso;
    return {
      date: iso,
      day_number: i + 1,
      is_today: isToday,
      executable: isToday,
      daily_workout_id: isToday ? exec?.id ?? null : null,
      status: exec?.status ?? (dia ? "scheduled" : "rest"),
      phase_name: exec?.phase_name ?? dia?.fase ?? periodizacao?.current_phase ?? null,
      summary: dia ? {
        foco: dia.foco ?? dia.focus ?? null,
        blocos: Array.isArray(dia.blocos) ? dia.blocos.map((b: any) => ({
          tipo: b.tipo, titulo: b.titulo, qtd_exercicios: Array.isArray(b.exercicios) ? b.exercicios.length : 0,
        })) : null,
      } : null,
    };
  });

  return jsonResponse({
    success: true,
    aluno_id: aluno.id,
    aluno_source: aluno.source,
    periodizacao: periodizacao ? {
      plan_id: periodizacao.plan_id,
      plan_name: periodizacao.plan_name,
      current_phase: periodizacao.current_phase,
      current_phase_category: periodizacao.current_phase_category,
      current_week_index: periodizacao.current_week_index,
    } : null,
    semana: { inicio: isoDates[0], fim: isoDates[6] },
    dias: week,
  });
});
