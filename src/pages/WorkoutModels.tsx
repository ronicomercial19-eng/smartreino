import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import { workoutGenerationService } from "@/services/workoutGenerationService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/components/ui/use-toast";
import { 
  Dumbbell, 
  Clock, 
  Target, 
  Zap, 
  Heart,
  TrendingUp,
  Activity,
  Play
} from "lucide-react";

const WorkoutModels = () => {
  const { userProfile } = useUserProfile();
  const [selectedCategory, setSelectedCategory] = useState("forca");
  const [generatedWorkouts, setGeneratedWorkouts] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const workoutCategories = [
    { id: "forca", name: "Força", icon: Dumbbell },
    { id: "condicionamento", name: "Condicionamento", icon: Heart },
    { id: "hipertrofia", name: "Hipertrofia", icon: TrendingUp },
    { id: "perda-peso", name: "Perda de Peso", icon: Zap },
    { id: "mobilidade", name: "Mobilidade", icon: Activity }
  ];

  const generateWorkoutModels = async () => {
    if (!userProfile) return;
    setIsGenerating(true);
    
    try {
      const workouts = [{
        name: `Treino de ${workoutCategories.find(c => c.id === selectedCategory)?.name}`,
        description: "Treino personalizado gerado com IA",
        duration: 45,
        estimatedCalories: 350,
        exercises: [
          { exercise: { name: "Exercício 1" }, sets: 3, reps: 12 },
          { exercise: { name: "Exercício 2" }, sets: 3, reps: 10 },
        ],
        targetPSE: 7
      }];
      
      setGeneratedWorkouts(workouts);
      toast({
        title: "Modelos Gerados!",
        description: `${workouts.length} modelo de treino criado`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar modelos",
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
                      {isGenerating ? "Gerando..." : "Gerar Modelos"}
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