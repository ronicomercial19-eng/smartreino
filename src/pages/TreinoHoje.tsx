import { useParams, useSearchParams } from "react-router-dom";
import { useTreinoDoDia } from "@/hooks/useTreinoDoDia";
import { TreinoDoDiaView } from "@/components/workout/TreinoDoDiaView";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function TreinoHoje() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const alunoId = id ?? search.get("aluno") ?? undefined;
  const data = search.get("data") ?? undefined;

  const { data: treino, isLoading, error, refetch, isFetching } = useTreinoDoDia(alunoId, data);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">9FIT · Treino de Hoje</h1>
            <p className="text-sm text-muted-foreground">
              Prescrição automática · Estrutura NINE
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Re-prescrever
          </Button>
        </div>

        <TreinoDoDiaView treino={treino} isLoading={isLoading} error={error as Error | null} />
      </div>
    </AppLayout>
  );
}
