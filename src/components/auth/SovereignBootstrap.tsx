import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const PORTAL_URL = "https://ninelogin.lovable.app";

/**
 * Sovereign Auth Bootstrap (híbrido):
 * - Captura ?access_token=&refresh_token= da URL e estabelece sessão.
 * - Limpa a URL.
 * - NÃO redireciona se já existir sessão válida (previne loops).
 * - Login local continua disponível como fallback.
 */
export function SovereignBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const access_token = url.searchParams.get("access_token");
    const refresh_token = url.searchParams.get("refresh_token");

    const hasTokens = Boolean(access_token && refresh_token);

    if (!hasTokens) {
      setReady(true);
      return;
    }

    setBootstrapping(true);

    (async () => {
      try {
        // Se já há sessão válida, não sobrescreve (evita loop)
        const { data: existing } = await supabase.auth.getSession();
        if (!existing.session) {
          await supabase.auth.setSession({
            access_token: access_token!,
            refresh_token: refresh_token!,
          });
          try {
            localStorage.setItem("ninefit_token", access_token!);
          } catch {}
        }
      } catch (e) {
        console.error("[SovereignBootstrap] erro ao estabelecer sessão", e);
      } finally {
        // Limpa a URL
        url.searchParams.delete("access_token");
        url.searchParams.delete("refresh_token");
        url.searchParams.delete("user_id");
        window.history.replaceState({}, "", url.pathname + (url.search ? `?${url.searchParams.toString()}` : ""));
        setBootstrapping(false);
        setReady(true);
      }
    })();
  }, []);

  if (!ready || bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 mx-auto rounded-xl bg-brand-orange flex items-center justify-center font-display font-bold text-white text-xl animate-pulse">
            9
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            Validando acesso ao Ecossistema 9FIT…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export const NINEFIT_PORTAL_URL = PORTAL_URL;
