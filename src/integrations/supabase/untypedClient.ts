
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mfrydtrzjxscbkaiwfnw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mcnlkdHJ6anhzY2JrYWl3Zm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNzgxNjUsImV4cCI6MjA2NjY1NDE2NX0.TAd5TktzP3fITqECC8UUVOSyUmrfgFhhGHE5TQukxWA";

// Untyped Supabase client for new tables/views not yet in types.ts
export const supabaseUntyped = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
