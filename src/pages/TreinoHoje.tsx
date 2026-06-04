import { useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useTreinoDoDia } from "@/hooks/useTreinoDoDia";
import { TreinoDoDiaView } from "@/components/workout/TreinoDoDiaView";
import { PeriodizacaoMissingBanner } from "@/components/workout/PeriodizacaoMissingBanner";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw, Send } from "lucide-react";
import { entregarTreinoFitpro } from "@/services/fitproDelivery";
import { toast } from "@/hooks/use-toast";

export default function TreinoHoje() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const alunoId = id ?? search.get("aluno") ?? undefined;
  const data = search.get("data") ?? undefined;
  const [delivering, setDelivering] = useState(false);

  const { data: treino, isLoading, error, refetch, isFetching } = useTreinoDoDia(alunoId, data);

  const semPeriodizacao =
    treino && (treino as any).sucesso === false &&
    (treino as any).motivo === "sem_periodizacao_ativa";

  const enviarFitpro = async () => {
    if (!treino?.sucesso || !treino.contexto) return;
    setDelivering(true);
    try {
      const res: any = await entregarTreinoFitpro({
        alunoId: treino.contexto.aluno_id,
        historicoId: treino.historico_id,
        contexto: treino.contexto,
        treino: treino.treino,
      });
      if (res?.success) {
        toast({
          title: "Treino enviado ao FitPro",
          description: res.mapped
            ? "Aluno mapeado com sucesso."
            : "Enviado sem mapeamento — usando aluno_id como referência.",
        });
      } else {
        toast({
          title: "Falha ao entregar",
          description: res?.error ?? "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Erro de rede",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setDelivering(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">9FIT · Treino de Hoje</h1>
            <p className="text-sm text-muted-foreground">
              Prescrição automática · Estrutura NINE
            </p>
          </div>
          <div className="flex gap-2">
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
            {treino?.sucesso && (
              <Button
                size="sm"
                onClick={enviarFitpro}
                disabled={delivering}
                className="gap-2"
              >
                <Send className={`h-4 w-4 ${delivering ? "animate-pulse" : ""}`} />
                Enviar ao FitPro
              </Button>
            )}
          </div>
        </div>

        {semPeriodizacao && alunoId && (
          <PeriodizacaoMissingBanner alunoId={alunoId} />
        )}

        <TreinoDoDiaView treino={treino} isLoading={isLoading} error={error as Error | null} />
      </div>
    </AppLayout>
  );
}
