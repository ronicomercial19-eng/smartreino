import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import { workoutGenerationService } from "@/services/workoutGenerationService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/utils/logger";
import { 
  Dumbbell, 
  Clock, 
  Target, 
  Zap, 
  Heart,
  TrendingUp,
  Activity,
  Play,
  RefreshCw
} from "lucide-react";

const WorkoutModels = () => {
  const { userProfile } = useUserProfile();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("forca");
  const [generatedWorkouts, setGeneratedWorkouts] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  const workoutCategories = [
    { id: "forca", name: "Força", icon: Dumbbell },
    { id: "condicionamento", name: "Condicionamento", icon: Heart },
    { id: "hipertrofia", name: "Hipertrofia", icon: TrendingUp },
    { id: "perda-peso", name: "Perda de Peso", icon: Zap },
    { id: "mobilidade", name: "Mobilidade", icon: Activity }
  ];

  const generateWorkoutModels = async () => {
    if (!userProfile) {
      toast({
        title: "Erro",
        description: "Perfil do usuário não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      logger.info('Gerando modelo de treino');
      
      const result = await workoutGenerationService.gerarModelo({
        estudante_id: userProfile.id,
        objetivo: selectedCategory,
        nivel: userProfile.level || 'intermediario',
        periodizacao: {}
      });

      setHasGeneratedOnce(true);
      
      toast({
        title: "Treino Gerado com Sucesso!",
        description: "Redirecionando para visualizar seus treinos...",
      });

      // Redirecionar para a página de visualização após 1 segundo
      setTimeout(() => {
        navigate('/meus-treinos');
      }, 1000);
      
    } catch (error) {
      logger.error('Erro ao gerar modelo de treino');
      toast({
        title: "Erro",
        description: "Erro ao gerar modelo de treino",
        variant: "destructive"
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
              🏋️ Modelos de Treinos
            </h1>
            <p className="text-muted-foreground">
              Gere modelos personalizados baseados nos seus objetivos
            </p>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="glass grid w-full grid-cols-5">
            {workoutCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                <category.icon className="h-4 w-4 mr-1" />
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {workoutCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              <Card className="glass border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-heading">Modelos de {category.name}</CardTitle>
                    <Button 
                      onClick={generateWorkoutModels}
                      disabled={isGenerating}
                      className="btn-glow"
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : hasGeneratedOnce ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Trocar Treinos
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Gerar Modelos
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {generatedWorkouts.length > 0 && (
                <div className="grid gap-4">
                  {generatedWorkouts.map((workout, index) => (
                    <Card key={index} className="glass border-border/50">
                      <CardContent className="p-4">
                        <h3 className="font-heading text-lg mb-2">{workout.name}</h3>
                        <p className="text-muted-foreground mb-4">{workout.description}</p>
                        <Button className="btn-glow">
                          <Play className="h-4 w-4 mr-2" />
                          Executar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default WorkoutModels;