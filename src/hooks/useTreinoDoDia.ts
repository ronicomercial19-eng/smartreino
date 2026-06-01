import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { prescreverTreino, TreinoPrescrito } from "@/services/prescreverTreinoService";
import { emitHubEvent } from "@/lib/ecosystem/hubEmit";

export function useTreinoDoDia(alunoId?: string, data?: string, enabled = true) {
  const query = useQuery<TreinoPrescrito>({
    queryKey: ["treino-do-dia", alunoId ?? "self", data ?? "today"],
    queryFn: () => prescreverTreino(alunoId, data),
    enabled,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (query.data?.sucesso && query.data.contexto?.aluno_id) {
      emitHubEvent({
        event_type: "treino_prescrito",
        aluno_id: query.data.contexto.aluno_id,
        payload: {
          historico_id: query.data.historico_id,
          semana: query.data.contexto.semana_atual,
          fase: query.data.contexto.fase,
          protocol_code: query.data.contexto.protocol_code,
        },
      });
    }
  }, [query.data?.historico_id]);

  return query;
}

