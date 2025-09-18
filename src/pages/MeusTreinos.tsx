import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import { CalendarDays, Play, Clock, Target, BookOpen } from "lucide-react";
import { workoutGenerationService } from "@/services/workoutGenerationService";
import { useToast } from "@/hooks/use-toast";

export default function MeusTreinos() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateWorkout = async () => {
    setIsGenerating(true);
    try {
      // Simular geração de treino
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Treino Gerado",
        description: "Novo plano de treino criado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o treino.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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
                <CardTitle className="font-heading text-foreground">Planos Ativos</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Seus treinos em andamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
                    Nenhum treino ativo
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Comece gerando um novo plano de treino personalizado
                  </p>
                  <Button 
                    onClick={handleGenerateWorkout}
                    disabled={isGenerating}
                    className="btn-glow"
                  >
                    {isGenerating ? "Gerando..." : "Gerar Novo Treino"}
                  </Button>
                </div>
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