
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { periodizationAnalysisService, RecommendedWorkoutModel } from "@/services/periodizationAnalysisService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/components/ui/use-toast";
import { 
  Database,
  Search,
  Filter,
  Star,
  Clock,
  Target,
  Activity,
  Users,
  TrendingUp,
  Heart,
  Zap,
  Dumbbell,
  Play,
  Download,
  Eye
} from "lucide-react";

const WorkoutModelsDatabase = () => {
  const { userProfile } = useUserProfile();
  const [allModels, setAllModels] = useState<RecommendedWorkoutModel[]>([]);
  const [userModels, setUserModels] = useState<RecommendedWorkoutModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<RecommendedWorkoutModel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedView, setSelectedView] = useState<"all" | "user">("all");

  const categories = [
    { id: "all", name: "Todos", icon: Database, color: "text-gray-500" },
    { id: "forca", name: "Força", icon: Dumbbell, color: "text-red-500" },
    { id: "condicionamento", name: "Condicionamento", icon: Heart, color: "text-blue-500" },
    { id: "hipertrofia", name: "Hipertrofia", icon: TrendingUp, color: "text-green-500" },
    { id: "perda-peso", name: "Perda de Peso", icon: Zap, color: "text-orange-500" },
    { id: "mobilidade", name: "Mobilidade", icon: Activity, color: "text-purple-500" }
  ];

  useEffect(() => {
    loadModels();
  }, [userProfile]);

  useEffect(() => {
    filterModels();
  }, [allModels, userModels, searchTerm, selectedCategory, selectedView]);

  const loadModels = () => {
    try {
      const allWorkoutModels = periodizationAnalysisService.getAllWorkoutModels();
      const userWorkoutModels = userProfile 
        ? periodizationAnalysisService.getUserWorkoutModels(userProfile.id)
        : [];

      setAllModels(allWorkoutModels);
      setUserModels(userWorkoutModels);
      
      console.log(`Carregados ${allWorkoutModels.length} modelos totais e ${userWorkoutModels.length} modelos do usuário`);
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      toast({
        title: "Erro ao Carregar Modelos",
        description: "Não foi possível carregar os modelos de treino.",
      });
    }
  };

  const filterModels = () => {
    let modelsToFilter = selectedView === "all" ? allModels : userModels;
    
    // Filtrar por categoria
    if (selectedCategory !== "all") {
      modelsToFilter = modelsToFilter.filter(model => model.category === selectedCategory);
    }
    
    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      modelsToFilter = modelsToFilter.filter(model =>
        model.name.toLowerCase().includes(term) ||
        model.description.toLowerCase().includes(term) ||
        model.phase.toLowerCase().includes(term) ||
        model.aiReasoning.toLowerCase().includes(term)
      );
    }
    
    setFilteredModels(modelsToFilter);
  };

  const saveModelToUser = (model: RecommendedWorkoutModel) => {
    if (!userProfile) return;

    try {
      const userModelsKey = `userWorkoutModels_${userProfile.id}`;
      const existingUserModels = JSON.parse(localStorage.getItem(userModelsKey) || "[]");
      
      // Verificar se já existe
      const exists = existingUserModels.some((existing: RecommendedWorkoutModel) => existing.id === model.id);
      
      if (!exists) {
        const modelWithUserRef = { ...model, savedByUser: userProfile.id, savedAt: new Date().toISOString() };
        existingUserModels.push(modelWithUserRef);
        localStorage.setItem(userModelsKey, JSON.stringify(existingUserModels));
        
        setUserModels(existingUserModels);
        
        toast({
          title: "Modelo Salvo!",
          description: `O modelo "${model.name}" foi adicionado à sua biblioteca.`,
        });
      } else {
        toast({
          title: "Modelo já existe",
          description: "Este modelo já está na sua biblioteca.",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o modelo.",
      });
    }
  };

  const executeWorkout = (model: RecommendedWorkoutModel) => {
    localStorage.setItem("currentWorkout", JSON.stringify(model));
    toast({
      title: "Treino Selecionado!",
      description: `Modelo "${model.name}" pronto para execução.`,
    });
  };

  const getIntensityColor = (pse: number) => {
    if (pse <= 4) return "bg-green-100 text-green-800";
    if (pse <= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getIntensityLabel = (pse: number) => {
    if (pse <= 4) return "Baixa";
    if (pse <= 6) return "Moderada";
    return "Alta";
  };

  const groupModelsByPhase = (models: RecommendedWorkoutModel[]) => {
    return models.reduce((acc, model) => {
      const phase = model.phase || "Geral";
      if (!acc[phase]) {
        acc[phase] = [];
      }
      acc[phase].push(model);
      return acc;
    }, {} as Record<string, RecommendedWorkoutModel[]>);
  };

  const groupedModels = groupModelsByPhase(filteredModels);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🗄️ Banco de Modelos de Treino
          </h1>
          <p className="text-gray-600">
            Explore todos os modelos de treino disponíveis, organizados por categorias e fases
          </p>
        </div>

        {/* Controles de Visualização e Busca */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex space-x-2">
              <Button
                variant={selectedView === "all" ? "default" : "outline"}
                onClick={() => setSelectedView("all")}
                className="flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span>Todos ({allModels.length})</span>
              </Button>
              <Button
                variant={selectedView === "user" ? "default" : "outline"}
                onClick={() => setSelectedView("user")}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Meus Modelos ({userModels.length})</span>
              </Button>
            </div>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar modelos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtros por Categoria */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                  <category.icon className={`h-4 w-4 ${category.color}`} />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{allModels.length}</div>
              <div className="text-sm text-gray-600">Total de Modelos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userModels.length}</div>
              <div className="text-sm text-gray-600">Meus Modelos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Filter className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{filteredModels.length}</div>
              <div className="text-sm text-gray-600">Filtrados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{Object.keys(groupedModels).length}</div>
              <div className="text-sm text-gray-600">Fases Diferentes</div>
            </CardContent>
          </Card>
        </div>

        {/* Modelos Agrupados por Fase */}
        {Object.keys(groupedModels).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedModels).map(([phase, models]) => (
              <div key={phase}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="h-6 w-6 text-blue-500 mr-2" />
                  {phase}
                  <Badge variant="secondary" className="ml-2">
                    {models.length} modelo{models.length > 1 ? 's' : ''}
                  </Badge>
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {models.map((model) => (
                    <Card key={model.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{model.name}</CardTitle>
                            <Badge className={getIntensityColor(model.targetPSE)}>
                              {getIntensityLabel(model.targetPSE)} (PSE {model.targetPSE})
                            </Badge>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {model.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">{model.description}</p>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{model.duration} min</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-green-500" />
                            <span>{model.muscleGroups.length} grupos</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                            <span>{model.recommendationScore}% match</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4 text-gray-500" />
                            <span className="text-xs">{model.createdAt.split('T')[0]}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Grupos Musculares:</h4>
                          <div className="flex flex-wrap gap-1">
                            {model.muscleGroups.slice(0, 3).map((group, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {group}
                              </Badge>
                            ))}
                            {model.muscleGroups.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{model.muscleGroups.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-800 font-medium mb-1">IA Recomenda:</p>
                          <p className="text-xs text-blue-700">{model.aiReasoning}</p>
                        </div>

                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-500 hover:bg-green-600"
                            onClick={() => executeWorkout(model)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Executar
                          </Button>
                          {selectedView === "all" && userProfile && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => saveModelToUser(model)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Nenhum modelo encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `Nenhum modelo corresponde aos critérios de busca "${searchTerm}"`
                  : "Não há modelos disponíveis nesta categoria"
                }
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm("")} variant="outline">
                  Limpar Busca
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkoutModelsDatabase;
