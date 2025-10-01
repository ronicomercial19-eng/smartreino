import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import { CalendarDays, Play, Clock, Target, BookOpen, RefreshCw, CheckCircle, Calendar } from "lucide-react";
import { generatedPlansService } from "@/services/generatedPlansService";
import { simpleModelsService } from "@/services/simpleModelsService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

export default function MeusTreinos() {
  const navigate = useNavigate();
  const { userProfile } = useUserProfile();
  const { toast } = useToast();
  const [activeWorkouts, setActiveWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveWorkouts();
  }, [userProfile]);

  const loadActiveWorkouts = async () => {
    if (!userProfile?.id) return;
    
    try {
      setLoading(true);
      logger.info('Carregando treinos ativos');
      
      const plans = await generatedPlansService.getByStudent(userProfile.id);
      
      // Carregar detalhes dos modelos
      const workoutsWithDetails = await Promise.all(
        plans.map(async (plan) => {
          try {
            const model = await simpleModelsService.getById(plan.modelo_id);
            return { ...plan, model };
          } catch (error) {
            logger.error('Erro ao carregar modelo');
            return { ...plan, model: null };
          }
        })
      );
      
      setActiveWorkouts(workoutsWithDetails.filter(w => w.model));
      
    } catch (error) {
      logger.error('Erro ao carregar treinos ativos');
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus treinos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeWorkout = () => {
    navigate('/workout-models');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-heading gradient-text">
              🎯 Meus Treinos
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus planos de treino personalizados e acompanhe seu progresso
            </p>
          </div>
        </div>

        <Tabs defaultValue="ativos" className="space-y-6">
          <TabsList className="glass grid w-full grid-cols-3">
            <TabsTrigger value="ativos">Treinos Ativos</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="modelos">Modelos Salvos</TabsTrigger>
          </TabsList>

          <TabsContent value="ativos" className="space-y-4">
            <Card className="glass border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-foreground">Planos Ativos</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Seus treinos em andamento
                    </CardDescription>
                  </div>
                  {activeWorkouts.length > 0 && (
                    <Button 
                      onClick={handleChangeWorkout}
                      variant="outline"
                      className="btn-glow"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Trocar Treinos
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Carregando seus treinos...</p>
                  </div>
                ) : activeWorkouts.length > 0 ? (
                  <div className="space-y-4">
                    {activeWorkouts.map((workout) => (
                      <Card key={workout.id} className="border-border/50 hover:border-primary/50 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <h3 className="font-heading text-lg text-foreground">
                                  {workout.model?.nome || 'Modelo de Treino'}
                                </h3>
                              </div>
                              <p className="text-muted-foreground text-sm">
                                {workout.model?.descricao || 'Sem descrição'}
                              </p>
                              {workout.model?.duracao_em_semanas && (
                                <Badge variant="secondary" className="mt-2">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {workout.model.duracao_em_semanas} semanas
                                </Badge>
                              )}
                            </div>
                            <Button className="btn-glow">
                              <Play className="h-4 w-4 mr-2" />
                              Ver Treino
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
                      Nenhum treino ativo
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Comece gerando um novo plano de treino personalizado
                    </p>
                    <Button 
                      onClick={handleChangeWorkout}
                      className="btn-glow"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Gerar Novo Treino
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Histórico de Treinos</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Treinos já concluídos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
                    Nenhum histórico disponível
                  </h3>
                  <p className="text-muted-foreground">
                    Complete alguns treinos para ver seu histórico aqui
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modelos" className="space-y-4">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="font-heading text-foreground">Modelos Salvos</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Seus modelos de treino personalizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
                    Nenhum modelo salvo
                  </h3>
                  <p className="text-muted-foreground">
                    Salve modelos de treino para reutilizar no futuro
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}