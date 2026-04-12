/**
 * Template Visual de Treino - Padrão 9FIT
 * Design preto/laranja com abas por dia
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dumbbell, Clock, Target } from "lucide-react";

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

interface WorkoutPlan {
  nome: string;
  objetivo: string;
  nivel: string;
  estrutura_semanal: DayWorkout[];
}

interface WorkoutDisplayTemplateProps {
  plan: WorkoutPlan;
}

export function WorkoutDisplayTemplate({ plan }: WorkoutDisplayTemplateProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass border-primary/30 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-heading text-foreground">
              {plan.nome}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary text-primary-foreground">
                <Target className="h-3 w-3 mr-1" />
                {plan.objetivo}
              </Badge>
              <Badge variant="outline" className="border-primary/50">
                <Dumbbell className="h-3 w-3 mr-1" />
                {plan.nivel}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dias de Treino */}
      <Tabs defaultValue="dia-1" className="w-full">
        <TabsList className={`grid w-full bg-card`} style={{ gridTemplateColumns: `repeat(${plan.estrutura_semanal.length}, minmax(0, 1fr))` }}>
          {plan.estrutura_semanal.map((day, index) => (
            <TabsTrigger
              key={index}
              value={`dia-${index + 1}`}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
            >
              {day.dia}
            </TabsTrigger>
          ))}
        </TabsList>

        {plan.estrutura_semanal.map((day, dayIndex) => (
          <TabsContent key={dayIndex} value={`dia-${dayIndex + 1}`} className="space-y-4 mt-4">
            <Card className="glass border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-foreground">{day.dia}</CardTitle>
                  <Badge className="bg-primary/20 text-primary border-primary/50">
                    {day.tipo}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Exercícios */}
                <div className="space-y-4">
                  {day.exercicios.map((exercise, exIndex) => (
                    <div
                      key={exIndex}
                      className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-foreground">{exercise.nome}</h4>
                          {exercise.tipo && (
                            <Badge variant="outline" className="text-xs">
                              {exercise.tipo}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Séries:</span>
                            <span className="font-bold text-primary">{exercise.series}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Reps:</span>
                            <span className="font-bold text-primary">{exercise.repeticoes}</span>
                          </div>
                          {exercise.descanso && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Descanso:</span>
                              <span className="font-medium">{exercise.descanso}</span>
                            </div>
                          )}
                        </div>

                        {exercise.observacao && (
                          <p className="text-xs text-muted-foreground italic mt-2">
                            💡 {exercise.observacao}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cardio */}
                {day.cardio && (
                  <>
                    <Separator />
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <h4 className="font-semibold text-foreground mb-2">Cardio / Aeróbio</h4>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>{" "}
                          <span className="font-medium">{day.cardio.tipo}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duração:</span>{" "}
                          <span className="font-medium text-primary">{day.cardio.duracao}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Intensidade:</span>{" "}
                          <span className="font-medium">{day.cardio.intensidade}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
