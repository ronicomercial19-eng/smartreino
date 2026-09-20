// POST /fitpro-deliver-week
// Body: { athlete_id: string, plano_id?: string, week_start?: 'YYYY-MM-DD' }
// Entrega os 7 treinos da semana para o FitPro via fitpro-deliver-workout.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-weekly-training-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const schedulerSecret = Deno.env.get("WEEKLY_TRAINING_SCHEDULER_SECRET");
    const isSchedulerCall = !!schedulerSecret && req.headers.get("x-weekly-training-secret") === schedulerSecret;
    if (!isSchedulerCall && !authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success: false, error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    if (!isSchedulerCall) {
      const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader! } } });
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      if (userErr || !userData.user) {
        return new Response(JSON.stringify({ success: false, error: "invalid_token" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json().catch(() => ({}));
    const athlete_id: string | null = body?.athlete_id ?? null;
    const plano_id: string | null = body?.plano_id ?? null;
    if (!athlete_id) {
      return new Response(JSON.stringify({ success: false, error: "athlete_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Base: segunda-feira da semana atual (ou week_start)
    const start = body?.week_start ? new Date(body.week_start) : (() => {
      const t = new Date();
      const monday = new Date(t);
      monday.setDate(t.getDate() - ((t.getDay() + 6) % 7));
      return monday;
    })();

    const admin = createClient(SUPABASE_URL, SERVICE);
    const results: any[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      try {
        const r = await fetch(`${SUPABASE_URL}/functions/v1/fitpro-deliver-workout`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE}` },
          body: JSON.stringify({
            athlete_id, plano_id, workout_date: iso,
            source: "week_deliver",
            treino: { day: i + 1, week_start: start.toISOString().slice(0, 10) },
          }),
        });
        const j = await r.json().catch(() => ({}));
        results.push({ date: iso, ok: r.ok, response: j });
      } catch (e) {
        results.push({ date: iso, ok: false, error: e instanceof Error ? e.message : String(e) });
      }
    }

    const okCount = results.filter(r => r.ok).length;
    return new Response(JSON.stringify({
      success: okCount === 7,
      delivered: okCount, total: 7, results,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
