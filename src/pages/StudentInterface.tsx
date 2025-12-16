
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Play, TrendingUp, BookOpen, MessageCircle, Bell } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { StudentPeriodizationService } from '@/services/studentPeriodizationService';
import { StudentModelsService } from '@/services/studentModelsService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function StudentInterface() {
  const [periodizations, setPeriodizations] = useState<any[]>([]);
  const [selectedModels, setSelectedModels] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Obter o ID do aluno atual baseado no email do usuário logado
      const { data: { user } } = await (await import('@/integrations/supabase/client')).supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar dados do aluno na tabela athletes pelo user_id
      const { data: student } = await (await import('@/integrations/supabase/client')).supabase
        .from('athletes')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!student) {
        throw new Error('Aluno não encontrado');
      }

      const [periodizationsData, modelsData] = await Promise.all([
        StudentPeriodizationService.getStudentPeriodizations(student.id),
        StudentModelsService.getStudentSelectedModels(student.id)
      ]);

      setPeriodizations(periodizationsData);
      setSelectedModels(modelsData);
    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar seus dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = (week: number, day: number) => {
    navigate('/treino/recomendado', { 
      state: { 
        week, 
        day,
        periodizations,
        selectedModels 
      } 
    });
  };

  const generateWeeks = () => {
    const maxWeeks = periodizations.length > 0 
      ? Math.max(...periodizations.map(p => p.macrocycle_duration_weeks || 12))
      : 12;
    
    return Array.from({ length: maxWeeks }, (_, i) => i + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-pulse-orange">
            <Calendar className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">Carregando seus treinos...</p>
        </div>
      </div>
    );
  }

  const actions = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => navigate('/chat-ia')}>
        <MessageCircle className="mr-2 h-4 w-4" />
        IA Coach
      </Button>
      <Button variant="outline" onClick={() => navigate('/lembretes')}>
        <Bell className="mr-2 h-4 w-4" />
        Lembretes
      </Button>
    </div>
  );

  return (
    <PageLayout
      title="Meus Treinos"
      subtitle="Acompanhe sua periodização e execute seus treinos"
      actions={actions}
    >

      {/* Resumo da Periodização */}
      {periodizations.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <TrendingUp className="h-5 w-5" />
              Sua Periodização Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {periodizations.map((p) => (
                <div key={p.id} className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">{p.plan_name}</h3>
                  <p className="text-sm text-muted-foreground">{p.periodization_type}</p>
                  <div className="mt-2">
                    <Badge variant="outline">
                      Fase {p.current_phase} de {p.total_phases}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modelos Atribuídos */}
      {selectedModels.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <BookOpen className="h-5 w-5" />
              Seus Modelos de Treino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {selectedModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">{model.model_name}</h4>
                    <p className="text-sm text-muted-foreground">{model.general_objective}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {model.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {model.stimulus_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Semanas de Treino */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Calendar className="h-5 w-5" />
            Cronograma de Treinos
          </CardTitle>
          <CardDescription>
            Selecione a semana e o dia para iniciar seu treino
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {generateWeeks().map((week) => (
              <Card key={week} className="border-border/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Semana {week}
                    {week === currentWeek && (
                      <Badge className="ml-2" variant="default">Atual</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-7">
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, index) => (
                      <Button
                        key={day}
                        variant={index < 5 ? "outline" : "ghost"}
                        size="sm"
                        onClick={() => handleStartWorkout(week, index + 1)}
                        className="flex flex-col h-auto p-3"
                        disabled={index >= 5} // Sábado e domingo desabilitados por padrão
                      >
                        <span className="text-xs font-medium">{day}</span>
                        <Play className="h-3 w-3 mt-1" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estado vazio */}
      {periodizations.length === 0 && selectedModels.length === 0 && (
        <Card className="glass border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold font-heading mb-2">
              Nenhuma periodização encontrada
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Entre em contato com seu treinador para que ele configure sua periodização e modelos de treino.
            </p>
            <Button onClick={() => navigate('/chat-ia')} className="btn-glow">
              <MessageCircle className="mr-2 h-4 w-4" />
              Falar com IA Coach
            </Button>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
