// Shared helpers for FitPro partner-key authenticated edge functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-partner-key, x-student-external-id",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

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

export async function requirePartnerKey(req: Request) {
  const key = req.headers.get("x-partner-key");
  const expected = Deno.env.get("FITPRO_API_KEY");
  if (!key) {
    return { error: jsonResponse({ error: "missing x-partner-key", code: "no_partner_key" }, 401) };
  }
  // Primary: equality with the configured shared FITPRO_API_KEY.
  if (expected && key === expected) {
    return { key, connection_id: null as string | null, professor_id: null as string | null };
  }
  // Fallback: validate against fitpro_connections.api_key_hash (sha256 hex).
  const sb = admin();
  const { data, error } = await sb.rpc("validate_partner_key", { p_key: key });
  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    return { error: jsonResponse({ error: "invalid partner key", code: "invalid_partner_key" }, 401) };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { key, connection_id: row.connection_id ?? null, professor_id: row.professor_id ?? null };
}

export async function resolveAlunoId(externalId: string | null | undefined): Promise<string | null> {
  if (!externalId) return null;
  const sb = admin();
  const { data } = await sb.rpc("resolve_aluno_by_external", { p_external_id: externalId });
  return (typeof data === "string" ? data : null) || null;
}
