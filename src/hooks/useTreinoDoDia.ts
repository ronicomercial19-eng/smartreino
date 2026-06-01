import { useQuery } from "@tanstack/react-query";
import { prescreverTreino, TreinoPrescrito } from "@/services/prescreverTreinoService";

export function useTreinoDoDia(alunoId?: string, data?: string, enabled = true) {
  return useQuery<TreinoPrescrito>({
    queryKey: ["treino-do-dia", alunoId ?? "self", data ?? "today"],
    queryFn: () => prescreverTreino(alunoId, data),
    enabled,
    staleTime: 60 * 1000,
  });
}
