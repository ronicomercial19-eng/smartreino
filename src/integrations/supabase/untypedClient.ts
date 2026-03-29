// Re-export the main Supabase client as untyped to avoid duplicate GoTrueClient instances.
// Previously this file created a separate createClient() call, causing auth state conflicts.
import { supabase } from "./client";

// Cast to 'any' so callers can query tables not yet in types.ts
export const supabaseUntyped = supabase as any;
