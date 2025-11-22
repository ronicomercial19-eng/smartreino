import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/shared/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { WorkoutAIService } from '@/services/workoutAIService';
import { ArrowLeft, Calendar, Target, TrendingUp, Download, Dumbbell } from 'lucide-react';
import type { GeneratedWorkoutPlan } from '@/services/workoutAIService';

export default function WorkoutPlan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plan, setPlan] = useState<GeneratedWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await WorkoutAIService.getWorkoutById(id);
        setPlan(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar plano',
          description: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <PageLayout title="Carregando Plano">
        <LoadingSpinner text="Carregando plano de treino..." />
      </PageLayout>
    );
  }

  if (!plan) {
    return (
      <PageLayout title="Plano não encontrado">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Plano não encontrado</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const workoutData = plan.plano_completo;

  return (
    <PageLayout title={plan.nome_plano}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Badge variant={plan.status === 'ativo' ? 'default' : 'secondary'}>
              {plan.status}
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral do Plano</CardTitle>
            <CardDescription>{workoutData.overview}</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Objetivo</p>
                <p className="font-medium capitalize">{plan.objetivo}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Nível</p>
                <p className="font-medium capitalize">{plan.nivel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Duração</p>
                <p className="font-medium">{plan.duracao_semanas} semanas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Structure */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Estrutura Semanal</h2>
          {workoutData.weekly_structure?.map((day: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    Dia {day.day} - {day.name}
                  </CardTitle>
                  <Badge variant="outline">{day.focus}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {day.exercises?.map((exercise: any, exIndex: number) => (
                  <div key={exIndex} className="border-l-2 border-primary pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{exercise.name}</h4>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{exercise.sets}x{exercise.reps}</span>
                        <span>•</span>
                        <span>{exercise.rest_seconds}s</span>
                      </div>
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Guidelines */}
        {workoutData.general_guidelines && (
          <Card>
            <CardHeader>
              <CardTitle>Orientações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workoutData.general_guidelines.warmup && (
                <div>
                  <h4 className="font-semibold mb-2">Aquecimento</h4>
                  <p className="text-sm text-muted-foreground">{workoutData.general_guidelines.warmup}</p>
                </div>
              )}
              <Separator />
              {workoutData.general_guidelines.progression && (
                <div>
                  <h4 className="font-semibold mb-2">Progressão</h4>
                  <p className="text-sm text-muted-foreground">{workoutData.general_guidelines.progression}</p>
                </div>
              )}
              <Separator />
              {workoutData.general_guidelines.warnings && (
                <div>
                  <h4 className="font-semibold mb-2">Sinais de Alerta</h4>
                  <p className="text-sm text-muted-foreground">{workoutData.general_guidelines.warnings}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
