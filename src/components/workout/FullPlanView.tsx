import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Target,
  TrendingUp,
  Clock,
  Zap,
  Layers,
} from "lucide-react";

interface Exercise {
  nome: string;
  series: string;
  repeticoes: string;
  descanso: string;
  observacao?: string;
}

interface Day {
  dia: string;
  nome: string;
  tipo: string;
  exercicios: Exercise[];
}

interface Week {
  numero: number;
  mesociclo: string;
  foco_semana?: string;
  dias: Day[];
}

interface Mesocycle {
  nome: string;
  semana_inicio: number;
  semana_fim: number;
  foco: string;
  volume: string;
  intensidade: string;
  descricao?: string;
}

interface FullPlan {
  macrociclo: {
    nome: string;
    duracao_semanas: number;
  };
  mesociclos: Mesocycle[];
  semanas: Week[];
}

interface FullPlanViewProps {
  plan: FullPlan;
  currentWeek?: number;
  planName?: string;
}

const volumeColor = (vol: string) => {
  const v = vol?.toLowerCase();
  if (v === "alto" || v === "muito alto") return "bg-red-500/20 text-red-400 border-red-500/30";
  if (v === "moderado") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  return "bg-green-500/20 text-green-400 border-green-500/30";
};

const intensityColor = (int: string) => {
  const i = int?.toLowerCase();
  if (i === "alta" || i === "muito alta") return "bg-red-500/20 text-red-400 border-red-500/30";
  if (i === "moderada") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  return "bg-green-500/20 text-green-400 border-green-500/30";
};

const FullPlanView = ({ plan, currentWeek = 1, planName }: FullPlanViewProps) => {
  const [selectedMesocycle, setSelectedMesocycle] = useState<string>("all");
  const [viewWeek, setViewWeek] = useState(currentWeek);

  if (!plan?.macrociclo || !plan?.semanas?.length) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Plano sem dados para exibir.</p>
        </CardContent>
      </Card>
    );
  }

  const totalWeeks = plan.semanas.length;
  const progressPercent = Math.round((viewWeek / totalWeeks) * 100);

  const filteredWeeks = selectedMesocycle === "all"
    ? plan.semanas
    : plan.semanas.filter(w => w.mesociclo === selectedMesocycle);

  const currentWeekData = plan.semanas.find(w => w.numero === viewWeek);
  const currentMeso = plan.mesociclos.find(m =>
    viewWeek >= m.semana_inicio && viewWeek <= m.semana_fim
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl font-heading text-card-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                {planName || plan.macrociclo.nome}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {totalWeeks} semanas · {plan.mesociclos.length} mesociclos · {plan.semanas[0]?.dias?.length || 0} dias/semana
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Calendar className="h-3 w-3 mr-1" />
                Semana {viewWeek}/{totalWeeks}
              </Badge>
              {currentMeso && (
                <Badge variant="outline" className="border-primary/30">
                  {currentMeso.nome}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Progresso</span>
            <Progress value={progressPercent} className="flex-1" />
            <span className="text-xs font-medium text-primary">{progressPercent}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Mesocycle Overview */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {plan.mesociclos.map((meso, idx) => {
          const isActive = currentMeso?.nome === meso.nome;
          return (
            <Card
              key={idx}
              className={`cursor-pointer transition-all border ${
                isActive ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
              }`}
              onClick={() => {
                setSelectedMesocycle(meso.nome === selectedMesocycle ? "all" : meso.nome);
                setViewWeek(meso.semana_inicio);
              }}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-card-foreground">{meso.nome}</h4>
                  {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  Semanas {meso.semana_inicio}–{meso.semana_fim} · {meso.foco}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] ${volumeColor(meso.volume)}`}>
                    Vol: {meso.volume}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${intensityColor(meso.intensidade)}`}>
                    Int: {meso.intensidade}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Week Navigation */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewWeek(Math.max(1, viewWeek - 1))}
              disabled={viewWeek <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>

            <div className="text-center">
              <h3 className="font-semibold text-card-foreground">
                Semana {viewWeek}
              </h3>
              {currentWeekData?.foco_semana && (
                <p className="text-xs text-muted-foreground">{currentWeekData.foco_semana}</p>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewWeek(Math.min(totalWeeks, viewWeek + 1))}
              disabled={viewWeek >= totalWeeks}
            >
              Próxima <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Workouts for Current Week */}
      {currentWeekData?.dias?.length ? (
        <Accordion type="multiple" defaultValue={[currentWeekData.dias[0]?.dia]} className="space-y-3">
          {currentWeekData.dias.map((day, dayIdx) => (
            <AccordionItem key={dayIdx} value={day.dia} className="border border-border rounded-lg overflow-hidden bg-card">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-card-foreground">{day.nome || day.dia}</p>
                    <p className="text-xs text-muted-foreground">{day.tipo} · {day.exercicios?.length || 0} exercícios</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  {day.exercicios?.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <span className="text-xs font-bold text-primary bg-primary/10 w-6 h-6 rounded flex items-center justify-center shrink-0">
                        {exIdx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-card-foreground">{ex.nome}</p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Target className="h-3 w-3" />
                            {ex.series} × {ex.repeticoes}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Clock className="h-3 w-3" />
                            {ex.descanso}
                          </Badge>
                        </div>
                        {ex.observacao && (
                          <p className="text-xs text-muted-foreground mt-1.5 italic">
                            💡 {ex.observacao}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Nenhum treino encontrado para esta semana.</p>
          </CardContent>
        </Card>
      )}

      {/* Week List (compact) */}
      {selectedMesocycle !== "all" && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading text-card-foreground">
              Semanas do Mesociclo: {selectedMesocycle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filteredWeeks.map(w => (
                <Button
                  key={w.numero}
                  variant={w.numero === viewWeek ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewWeek(w.numero)}
                  className="text-xs"
                >
                  S{w.numero}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FullPlanView;
