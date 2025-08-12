
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Play, CheckCircle, Timer, Target, Dumbbell } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  target_muscles: string[];
  sets: number;
  reps: string;
  rest_seconds: number;
  rpe_target?: number;
  notes?: string;
}

export default function RecommendedWorkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { week, day, periodizations, selectedModels } = location.state || {};

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  useEffect(() => {
    generateRecommendedExercises();
  }, []);

  const generateRecommendedExercises = async () => {
    try {
      setLoading(true);
      
      // Simular geração de exercícios com base na periodização e modelos
      // Na implementação real, isso seria feito via IA/edge function
      
      const mockExercises: Exercise[] = [
        {
          id: '1',
          name: 'Agachamento Livre',
          target_muscles: ['Quadríceps', 'Glúteos'],
          sets: 4,
          reps: '8-10',
          rest_seconds: 120,
          rpe_target: 8,
          notes: 'Manter postura ereta durante todo o movimento'
        },
        {
          id: '2',
          name: 'Supino Reto',
          target_muscles: ['Peitoral', 'Tríceps'],
          sets: 3,
          reps: '10-12',
          rest_seconds: 90,
          rpe_target: 7,
          notes: 'Controlar a descida da barra'
        },
        {
          id: '3',
          name: 'Puxada Alta',
          target_muscles: ['Latíssimo', 'Bíceps'],
          sets: 3,
          reps: '12-15',
          rest_seconds: 60,
          rpe_target: 7,
          notes: 'Focar na contração das costas'
        },
        {
          id: '4',
          name: 'Desenvolvimento com Halteres',
          target_muscles: ['Ombros', 'Tríceps'],
          sets: 3,
          reps: '10-12',
          rest_seconds: 90,
          rpe_target: 8,
          notes: 'Amplitude completa do movimento'
        }
      ];

      setExercises(mockExercises);
    } catch (error) {
      console.error('Erro ao gerar exercícios:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar exercícios recomendados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    toast({
      title: "Treino iniciado!",
      description: "Boa sorte com seu treino. Lembre-se de manter a forma correta.",
    });
  };

  const handleCompleteSet = (exerciseId: string) => {
    const currentSets = completedSets[exerciseId] || 0;
    const exercise = exercises.find(e => e.id === exerciseId);
    
    if (exercise && currentSets < exercise.sets) {
      setCompletedSets(prev => ({
        ...prev,
        [exerciseId]: currentSets + 1
      }));
    }
  };

  const handleCompleteWorkout = () => {
    setWorkoutCompleted(true);
    toast({
      title: "Parabéns!",
      description: "Treino concluído com sucesso. Ótimo trabalho!",
    });
  };

  const isWorkoutComplete = exercises.every(exercise => 
    (completedSets[exercise.id] || 0) >= exercise.sets
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-pulse-orange">
            <Dumbbell className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">Gerando treino recomendado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/student-interface')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading gradient-text">
            Treino Recomendado
          </h1>
          <p className="text-muted-foreground">
            Semana {week} - {dayNames[day - 1]} | Exercícios personalizados pela IA
          </p>
        </div>
      </div>

      {/* Informações do Treino */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Target className="h-5 w-5" />
            Resumo do Treino
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{exercises.length}</div>
              <div className="text-sm text-muted-foreground">Exercícios</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {exercises.reduce((acc, ex) => acc + ex.sets, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Séries Totais</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">45-60</div>
              <div className="text-sm text-muted-foreground">Minutos</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">7-8</div>
              <div className="text-sm text-muted-foreground">RPE Médio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Iniciar Treino */}
      {!workoutStarted && !workoutCompleted && (
        <Card className="glass border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Play className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold font-heading mb-2">
              Pronto para começar?
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Seu treino foi personalizado com base na sua periodização atual.
            </p>
            <Button onClick={handleStartWorkout} size="lg" className="btn-glow">
              <Play className="mr-2 h-5 w-5" />
              Iniciar Treino
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de Exercícios */}
      {workoutStarted && !workoutCompleted && (
        <div className="space-y-4">
          {exercises.map((exercise, index) => {
            const completedSetsCount = completedSets[exercise.id] || 0;
            const isExerciseComplete = completedSetsCount >= exercise.sets;

            return (
              <Card key={exercise.id} className={`glass border-border/50 ${isExerciseComplete ? 'bg-green-50 dark:bg-green-950' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-heading text-lg flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        {exercise.name}
                        {isExerciseComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
                      </CardTitle>
                      <CardDescription>
                        {exercise.target_muscles.join(', ')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {exercise.rpe_target && (
                        <Badge variant="outline">RPE {exercise.rpe_target}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-lg font-bold">
                        {completedSetsCount}/{exercise.sets}
                      </div>
                      <div className="text-sm text-muted-foreground">Séries</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-lg font-bold">{exercise.reps}</div>
                      <div className="text-sm text-muted-foreground">Repetições</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-lg font-bold">{exercise.rest_seconds}s</div>
                      <div className="text-sm text-muted-foreground">Descanso</div>
                    </div>
                  </div>

                  {exercise.notes && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm"><strong>Dica:</strong> {exercise.notes}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleCompleteSet(exercise.id)}
                    disabled={isExerciseComplete}
                    className="w-full"
                    variant={isExerciseComplete ? "outline" : "default"}
                  >
                    {isExerciseComplete ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Exercício Concluído
                      </>
                    ) : (
                      <>
                        <Timer className="mr-2 h-4 w-4" />
                        Concluir Série {completedSetsCount + 1}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {/* Botão Finalizar Treino */}
          {isWorkoutComplete && (
            <Card className="glass border-border/50 bg-green-50 dark:bg-green-950">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold font-heading mb-2">
                  Todas as séries concluídas!
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Parabéns! Você completou todas as séries do treino.
                </p>
                <Button onClick={handleCompleteWorkout} size="lg" className="btn-glow">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Finalizar Treino
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Treino Concluído */}
      {workoutCompleted && (
        <Card className="glass border-border/50 bg-green-50 dark:bg-green-950">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-20 w-20 text-green-600 mb-6" />
            <h2 className="text-2xl font-bold font-heading mb-4 text-green-800 dark:text-green-200">
              Treino Concluído!
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              Excelente trabalho! Seu treino foi registrado e seus dados de progresso foram atualizados.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => navigate('/student-interface')} className="btn-glow">
                Voltar aos Treinos
              </Button>
              <Button variant="outline" onClick={() => navigate('/progresso')}>
                Ver Progresso
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
