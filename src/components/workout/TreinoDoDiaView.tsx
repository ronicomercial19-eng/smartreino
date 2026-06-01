import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Brain, Link2, Flame, RotateCcw, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { TreinoPrescrito, ExercicioPrescrito } from "@/services/prescreverTreinoService";

const BLOCOS = [
  { key: "neural" as const, label: "Neural", icon: Brain, border: "border-l-green-500", bg: "bg-green-50 dark:bg-green-950/20" },
  { key: "integracao" as const, label: "Integração", icon: Link2, border: "border-l-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
  { key: "bloco9" as const, label: "Bloco 9", icon: Flame, border: "border-l-brand-orange", bg: "bg-orange-50 dark:bg-orange-950/20" },
  { key: "reset" as const, label: "Reset", icon: RotateCcw, border: "border-l-gray-400", bg: "bg-gray-50 dark:bg-gray-950/20" },
];

function ExercicioRow({ ex }: { ex: ExercicioPrescrito }) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-2 border-b border-border/40 last:border-b-0">
      <span className="flex-1 min-w-[180px] font-medium">{ex.nome}</span>
      {ex.grupo_muscular && <Badge variant="outline" className="text-xs">{ex.grupo_muscular}</Badge>}
      <span className="font-mono text-sm">{ex.series}×{ex.reps}</span>
      <Badge variant="secondary" className="font-mono text-xs">RPE {ex.rpe}</Badge>
      <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
        <Clock className="h-3 w-3" /> {ex.descanso}
      </span>
    </div>
  );
}

export function TreinoDoDiaView({
  treino,
  isLoading,
  error,
}: {
  treino?: TreinoPrescrito;
  isLoading?: boolean;
  error?: Error | null;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <p className="font-medium">Erro ao prescrever treino</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!treino) return null;

  if (!treino.sucesso) {
    return (
      <Card className="border-brand-orange/40 animate-fade-in">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-brand-orange mt-0.5" />
            <div className="flex-1">
              <p className="font-display font-bold text-lg">
                {treino.motivo === "sem_periodizacao_ativa"
                  ? "Sem periodização ativa"
                  : "Treino indisponível"}
              </p>
              <p className="text-sm text-muted-foreground">
                {treino.motivo === "sem_periodizacao_ativa"
                  ? "Esse aluno ainda não tem um plano ativo. Gere um agora para começar a prescrever treinos."
                  : `Motivo: ${treino.motivo}`}
              </p>
            </div>
          </div>
          {treino.sugestao_cta === "gerar_smart_treino" && (
            <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
              <Link to="/smart-treino-builder">Gerar plano agora</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const ctx = treino.contexto!;
  const params = treino.parametros!;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header / contexto */}
      <Card className="border-l-4 border-l-brand-orange">
        <CardHeader className="pb-3">
          <CardTitle className="font-display tracking-tight">
            Treino de {ctx.aluno_nome}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Semana <span className="font-mono">{ctx.semana_atual}</span> · Fase{" "}
            <span className="font-mono">{ctx.fase}</span>
            {ctx.protocolo && (
              <> · {ctx.protocolo} {ctx.variacao && `· ${ctx.variacao}`}</>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><dt className="text-xs text-muted-foreground uppercase">RPE</dt><dd className="font-mono font-medium">{params.rpe_alvo}</dd></div>
            <div><dt className="text-xs text-muted-foreground uppercase">Descanso</dt><dd className="font-mono font-medium">{params.descanso_padrao}</dd></div>
            <div><dt className="text-xs text-muted-foreground uppercase">Cadência</dt><dd className="font-mono font-medium">{params.cadencia_padrao}</dd></div>
            <div><dt className="text-xs text-muted-foreground uppercase">Duração</dt><dd className="font-mono font-medium">{params.duracao_estimada}</dd></div>
          </dl>
        </CardContent>
      </Card>

      {/* Blocos NINE */}
      {BLOCOS.map(({ key, label, icon: Icon, border, bg }) => {
        const items = treino.treino?.[key] ?? [];
        return (
          <Card key={key} className={`border-l-4 ${border} ${bg}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 font-display uppercase tracking-wider">
                <Icon className="h-4 w-4" /> {label}
                <Badge variant="outline" className="ml-auto font-mono text-xs">
                  {items.length} exercício{items.length !== 1 ? "s" : ""}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Sem exercícios atribuídos.</p>
              ) : (
                items.map(ex => <ExercicioRow key={ex.id} ex={ex} />)
              )}
            </CardContent>
          </Card>
        );
      })}

      {treino.rationale && (
        <Card>
          <CardContent className="pt-4 text-sm text-muted-foreground italic">
            {treino.rationale}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
