/**
 * StudentWorkoutView - Exibe treino ativo do aluno com template 9FIT
 * Inclui modo de execução com checkboxes e timer de descanso
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Play, Pause, RotateCcw, Clock, Dumbbell, Target, 
  CheckCircle2, Timer, ChevronRight 
} from "lucide-react";

interface Exercise {
  nome: string;
  series: string;
  repeticoes: string;
  descanso?: string;
  observacao?: string;
  tipo?: string;
}

interface DayWorkout {
  dia: string;
  tipo: string;
  exercicios: Exercise[];
  cardio?: {
    tipo: string;
    duracao: string;
    intensidade: string;
  };
}

interface WorkoutPlanData {
  nome: string;
  objetivo: string;
  nivel: string;
  estrutura_semanal: DayWorkout[];
}

interface StudentWorkoutViewProps {
  plan: WorkoutPlanData | null;
  loading: boolean;
  onStartWorkout: (dayIndex: number) => void;
}

function RestTimer({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || remaining <= 0) {
      if (remaining <= 0) onComplete();
      return;
    }
    const timer = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning, remaining, onComplete]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30 animate-fade-in">
      <Timer className="h-5 w-5 text-primary animate-pulse" />
      <span className="font-mono text-lg font-bold text-primary">
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
      <div className="flex gap-1 ml-auto">
        <Button size="sm" variant="ghost" onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setRemaining(seconds); setIsRunning(true); }}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function StudentWorkoutView({ plan, loading, onStartWorkout }: StudentWorkoutViewProps) {
  const [executionMode, setExecutionMode] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const toggleExercise = (key: string) => {
    setCompletedExercises(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const startRestTimer = (exerciseKey: string) => {
    setActiveTimer(exerciseKey);
  };

  const parseDescanso = (descanso?: string): number => {
    if (!descanso) return 60;
    const match = descanso.match(/(\d+)/);
    return match ? parseInt(match[1]) : 60;
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!plan || !plan.estrutura_semanal?.length) {
    return (
      <Card className="glass border-border/50 animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold font-heading mb-2">
            Nenhum treino ativo
          </h3>
          <p className="text-muted-foreground text-center">
            Seu professor ainda não enviou um treino para você. Aguarde ou entre em contato pelo chat.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentDay = plan.estrutura_semanal[activeDayIndex];
  const totalExercises = currentDay?.exercicios?.length || 0;
  const completedCount = currentDay?.exercicios?.filter((_, i) => 
    completedExercises.has(`${activeDayIndex}-${i}`)
  ).length || 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header do Plano */}
      <Card className="glass border-primary/30 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-heading">{plan.nome}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  <Target className="h-3 w-3 mr-1" />
                  {plan.objetivo}
                </Badge>
                <Badge variant="outline" className="border-primary/50">
                  {plan.nivel}
                </Badge>
              </div>
            </div>
            {!executionMode ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => { setExecutionMode(true); onStartWorkout(activeDayIndex); }} className="btn-glow">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Treino
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Iniciar modo de execução do treino</TooltipContent>
              </Tooltip>
            ) : (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className="text-lg font-bold text-primary">{completedCount}/{totalExercises}</p>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Tabs por dia */}
      <Tabs 
        value={`dia-${activeDayIndex}`} 
        onValueChange={(v) => setActiveDayIndex(parseInt(v.split('-')[1]))}
        className="w-full"
      >
        <TabsList className="grid w-full bg-card overflow-x-auto" style={{ gridTemplateColumns: `repeat(${plan.estrutura_semanal.length}, 1fr)` }}>
          {plan.estrutura_semanal.map((day, index) => (
            <TabsTrigger
              key={index}
              value={`dia-${index}`}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              {day.dia}
            </TabsTrigger>
          ))}
        </TabsList>

        {plan.estrutura_semanal.map((day, dayIndex) => (
          <TabsContent key={dayIndex} value={`dia-${dayIndex}`} className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{day.dia}</h3>
              <Badge className="bg-primary/20 text-primary border-primary/50">{day.tipo}</Badge>
            </div>

            {day.exercicios.map((exercise, exIndex) => {
              const key = `${dayIndex}-${exIndex}`;
              const isCompleted = completedExercises.has(key);

              return (
                <div
                  key={exIndex}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:border-primary/30 ${
                    isCompleted 
                      ? 'bg-primary/5 border-primary/30 opacity-70' 
                      : 'bg-muted/30 border-border/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {executionMode && (
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => toggleExercise(key)}
                        className="mt-1"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {exercise.nome}
                        </h4>
                        {exercise.tipo && (
                          <Badge variant="outline" className="text-xs">{exercise.tipo}</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Séries: </span>
                          <span className="font-bold text-primary">{exercise.series}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reps: </span>
                          <span className="font-bold text-primary">{exercise.repeticoes}</span>
                        </div>
                        {exercise.descanso && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Descanso: </span>
                            <span className="font-medium">{exercise.descanso}</span>
                          </div>
                        )}
                      </div>
                      {exercise.observacao && (
                        <p className="text-xs text-muted-foreground italic">💡 {exercise.observacao}</p>
                      )}

                      {/* Timer de descanso */}
                      {executionMode && activeTimer === key && (
                        <RestTimer 
                          seconds={parseDescanso(exercise.descanso)} 
                          onComplete={() => setActiveTimer(null)} 
                        />
                      )}
                      {executionMode && !isCompleted && activeTimer !== key && (
                        <Button 
                          size="sm" variant="ghost" 
                          className="text-xs text-primary"
                          onClick={() => startRestTimer(key)}
                        >
                          <Timer className="h-3 w-3 mr-1" />
                          Timer Descanso
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {day.cardio && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <h4 className="font-semibold mb-2">Cardio / Aeróbio</h4>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div><span className="text-muted-foreground">Tipo:</span> <span className="font-medium">{day.cardio.tipo}</span></div>
                    <div><span className="text-muted-foreground">Duração:</span> <span className="font-medium text-primary">{day.cardio.duracao}</span></div>
                    <div><span className="text-muted-foreground">Intensidade:</span> <span className="font-medium">{day.cardio.intensidade}</span></div>
                  </div>
                </div>
              </>
            )}

            {executionMode && completedCount === totalExercises && totalExercises > 0 && (
              <Card className="border-green-500/50 bg-green-500/10 animate-fade-in">
                <CardContent className="flex items-center gap-3 py-4">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-500">Treino Concluído! 🎉</p>
                    <p className="text-sm text-muted-foreground">Não esqueça de registrar no Histórico.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
