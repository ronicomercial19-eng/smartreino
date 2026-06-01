import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPRA_HUB_URL = Deno.env.get("SUPRA_HUB_URL");
const SUPRA_HUB_SERVICE_KEY = Deno.env.get("SUPRA_HUB_SERVICE_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { event_type, aluno_id, aluno_email, payload } = body ?? {};

    if (!event_type) {
      return new Response(
        JSON.stringify({ error: "event_type é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!SUPRA_HUB_URL || !SUPRA_HUB_SERVICE_KEY) {
      console.warn("[hub-emit] SUPRA_HUB_URL/SERVICE_KEY ausentes - evento descartado");
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: "hub_not_configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hubBody = {
      source_system: "smartreino",
      event_type,
      aluno_email: aluno_email ?? null,
      aluno_id: aluno_id ?? null,
      payload: payload ?? {},
      occurred_at: new Date().toISOString(),
    };

    const res = await fetch(`${SUPRA_HUB_URL.replace(/\/$/, "")}/rest/v1/intelligence_hub`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPRA_HUB_SERVICE_KEY,
        Authorization: `Bearer ${SUPRA_HUB_SERVICE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(hubBody),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("[hub-emit] hub respondeu", res.status, txt);
      return new Response(
        JSON.stringify({ ok: false, status: res.status, error: txt }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[hub-emit] erro", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
