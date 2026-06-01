import { supabase } from "@/integrations/supabase/client";

export type HubEventType =
  | "treino_prescrito"
  | "treino_concluido"
  | "aluno_criado"
  | "periodizacao_atribuida"
  | "protocolo_alterado";

export async function emitHubEvent(params: {
  event_type: HubEventType;
  aluno_id?: string;
  aluno_email?: string;
  payload?: Record<string, unknown>;
}) {
  try {
    const { error } = await supabase.functions.invoke("hub-emit", {
      body: {
        event_type: params.event_type,
        aluno_id: params.aluno_id ?? null,
        aluno_email: params.aluno_email ?? null,
        payload: params.payload ?? {},
      },
    });
    if (error) console.warn("[hub-emit] falhou", error.message);
  } catch (e) {
    // Hub é best-effort, nunca quebra o fluxo principal
    console.warn("[hub-emit] erro", e);
  }
}
