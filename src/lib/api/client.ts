/**
 * 9FIT Ecosystem — Unified Supabase Client
 * 
 * Single source of truth for all Supabase interactions.
 * Replaces both `client.ts` and `untypedClient.ts`.
 */
import { supabase } from "@/integrations/supabase/client";

// Re-export the typed client as the single entry point
export { supabase };

// Helper: get current authenticated user ID
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Helper: get current session token for edge function calls
export async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

// Helper: invoke edge function with automatic auth
export async function invokeFunction<T = any>(
  functionName: string,
  body: Record<string, any>
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });
  
  if (error) {
    console.error(`[9FIT] Edge function ${functionName} error:`, error);
    return { data: null, error: error.message };
  }
  
  return { data: data as T, error: null };
}

// ── API Gateway ────────────────────────────────────────
// Invoke via the centralized api-gateway with versioned routes
export async function invokeGateway<T = any>(
  route: string,
  body: Record<string, any> = {}
): Promise<{ data: T | null; error: string | null }> {
  return invokeFunction<T>('api-gateway', { route, body });
}

// Module identifier for ecosystem headers
export const MODULE_ID = 'smartreino' as const;
export const MODULE_VERSION = '1.0.0' as const;
