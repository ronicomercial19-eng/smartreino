/**
 * invokeWithAuth — chama uma Edge Function garantindo sessão válida.
 * - Renova sessão automaticamente se expirada.
 * - Retorna erro claro sem redirecionar forçadamente (deixa UI decidir).
 */
import { supabase } from "@/integrations/supabase/client";

export interface InvokeAuthResult<T = any> {
  data: T | null;
  error: string | null;
  status?: number;
}

async function ensureFreshToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
  if (expiresAt && expiresAt - Date.now() < 60_000) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session?.access_token) return null;
    return data.session.access_token;
  }
  return session.access_token;
}

export async function invokeWithAuth<T = any>(
  functionName: string,
  body: Record<string, any> = {},
  opts: { timeoutMs?: number } = {}
): Promise<InvokeAuthResult<T>> {
  let token = await ensureFreshToken();
  if (!token) {
    return { data: null, error: "Sessão expirada. Faça login novamente." };
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
  const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const controller = new AbortController();
  const timer = opts.timeoutMs
    ? setTimeout(() => controller.abort(), opts.timeoutMs)
    : null;

  const doCall = async (bearer: string) =>
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer}`,
        apikey,
      },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    });

  try {
    let resp = await doCall(token);
    if (resp.status === 401) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      const newToken = refreshed?.session?.access_token;
      if (newToken) {
        token = newToken;
        resp = await doCall(newToken);
      }
    }

    const raw = await resp.text();
    let parsed: any = null;
    if (raw) {
      try { parsed = JSON.parse(raw); } catch { parsed = { raw }; }
    }

    if (!resp.ok) {
      const msg = parsed?.error || parsed?.message || `Erro HTTP ${resp.status}`;
      return { data: null, error: msg, status: resp.status };
    }
    return { data: parsed as T, error: null, status: resp.status };
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Tempo esgotado na chamada da função." : (e?.message ?? String(e));
    return { data: null, error: msg };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
