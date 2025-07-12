import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
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
    { id: "forca", name: "Força", icon: Dumbbell, color: "text-red-500" },
    { id: "condicionamento", name: "Condicionamento", icon: Heart, color: "text-blue-500" },
    { id: "hipertrofia", name: "Hipertrofia", icon: TrendingUp, color: "text-green-500" },
    { id: "perda-peso", name: "Perda de Peso", icon: Zap, color: "text-orange-500" },
    { id: "mobilidade", name: "Mobilidade", icon: Activity, color: "text-purple-500" }
  ];

  const intensityLevels = [
    { id: "baixa", name: "Baixa", color: "bg-green-100 text-green-800", duration: 30 },
    { id: "moderada", name: "Moderada", color: "bg-yellow-100 text-yellow-800", duration: 45 },
    { id: "alta", name: "Alta", color: "bg-red-100 text-red-800", duration: 60 }
  ];

  const generateWorkoutModels = async () => {
    if (!userProfile) return;

    setIsGenerating(true);
    
    try {
      const workouts = [];
      
      // Gerar modelos para cada intensidade da categoria selecionada
      for (const intensity of intensityLevels) {
        const workoutGoal = {
          type: selectedCategory as any,
          duration: intensity.duration,
          intensity: intensity.id as any,
          muscleGroups: getMuscleGroupsForCategory(selectedCategory)
        };

        const workout = workoutGenerationService.generatePersonalizedWorkout(
          userProfile,
          workoutGoal,
          []
        );

        workouts.push({
          ...workout,
          intensityLevel: intensity,
          category: selectedCategory
        });
      }

      setGeneratedWorkouts(workouts);
      
      toast({
        title: "Modelos Gerados!",
        description: `${workouts.length} modelos de treino foram criados para ${workoutCategories.find(c => c.id === selectedCategory)?.name}`,
      });

    } catch (error) {
      toast({
        title: "Erro ao Gerar Modelos",
        description: "Ocorreu um erro ao gerar os modelos de treino.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getMuscleGroupsForCategory = (category: string): string[] => {
    const muscleGroupMap = {
      "forca": ["Peitoral", "Dorsais", "Quadríceps", "Deltoide"],
      "condicionamento": ["Corpo Todo"],
      "hipertrofia": ["Peitoral", "Dorsais", "Quadríceps", "Isquiotibiais", "Deltoide", "Bíceps", "Tríceps"],
      "perda-peso": ["Corpo Todo"],
      "mobilidade": ["Corpo Todo"]
    };
    
    return muscleGroupMap[category as keyof typeof muscleGroupMap] || ["Corpo Todo"];
  };

  const saveWorkoutModel = (workout: any) => {
    const savedModels = JSON.parse(localStorage.getItem("workoutModels") || "[]");
    const modelToSave = {
      ...workout,
      id: `model_${Date.now()}`,
      createdAt: new Date().toISOString(),
      userId: userProfile?.id
    };
    
    savedModels.push(modelToSave);
    localStorage.setItem("workoutModels", JSON.stringify(savedModels));
    
    toast({
      title: "Modelo Salvo!",
      description: "O modelo de treino foi salvo na sua biblioteca.",
    });
  };

  const executeWorkout = (workout: any) => {
    // Salvar treino atual para execução
    localStorage.setItem("currentWorkout", JSON.stringify(workout));
    
    toast({
      title: "Treino Iniciado!",
      description: "Redirecionando para execução do treino...",
    });
    
    // Aqui você pode redirecionar para uma página de execução de treino
    // navigate("/workout-execution");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏋️ Modelos de Treinos
          </h1>
          <p className="text-gray-600">
            Gere modelos personalizados baseados nos seus objetivos e periodização
          </p>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          {/* Categorias de Treino */}
          <TabsList className="grid w-full grid-cols-5">
            {workoutCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                <category.icon className={`h-4 w-4 ${category.color}`} />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {workoutCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                      <div>
                        <CardTitle>Modelos de {category.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Treinos personalizados para seus objetivos de {category.name.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={generateWorkoutModels}
                      disabled={isGenerating || !userProfile}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          Gerar Modelos
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Modelos Gerados */}
              {generatedWorkouts.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedWorkouts.map((workout, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{workout.name}</CardTitle>
                          <Badge className={workout.intensityLevel.color}>
                            {workout.intensityLevel.name}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">{workout.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{workout.duration} min</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-orange-500" />
                            <span>{workout.estimatedCalories} cal</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Dumbbell className="h-4 w-4 text-purple-500" />
                            <span>{workout.exercises.length} exercícios</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-green-500" />
                            <span>PSE {workout.targetPSE}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Exercícios Principais:</h4>
                          <div className="space-y-1">
                            {workout.exercises.slice(0, 3).map((ex: any, idx: number) => (
                              <div key={idx} className="text-xs text-gray-600 flex justify-between">
                                <span>{ex.exercise.name}</span>
                                <span>{ex.sets}x{ex.reps || `${ex.duration}s`}</span>
                              </div>
                            ))}
                            {workout.exercises.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{workout.exercises.length - 3} mais exercícios
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-500 hover:bg-green-600"
                            onClick={() => executeWorkout(workout)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Executar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => saveWorkoutModel(workout)}
                          >
                            Salvar Modelo
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {generatedWorkouts.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <category.icon className={`h-16 w-16 ${category.color} mx-auto mb-4 opacity-50`} />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Nenhum modelo gerado ainda
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Clique em "Gerar Modelos" para criar treinos personalizados de {category.name.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default WorkoutModels;
