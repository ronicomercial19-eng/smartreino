
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { 
  Zap, 
  Target, 
  Filter, 
  Search, 
  CheckCircle, 
  Dumbbell,
  Brain,
  Hand,
  Shuffle
} from "lucide-react";
import { completeExerciseDatabase, getExercisesByMultipleCriteria } from "@/data/exerciseDatabase";

interface ExerciseSelectionProps {
  analysisData: any;
  onExercisesSelected: (exercises: any[]) => void;
}

const ExerciseSelection = ({ analysisData, onExercisesSelected }: ExerciseSelectionProps) => {
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [filteredExercises, setFilteredExercises] = useState(completeExerciseDatabase);
  const [autoRecommendedExercises, setAutoRecommendedExercises] = useState<any[]>([]);

  // Grupos musculares principais
  const muscleGroups = [
    "Peitoral", "Dorsais", "Bíceps", "Tríceps", "Deltoide", 
    "Quadríceps", "Isquiotibiais", "Glúteos", "Panturrilha", 
    "Abdominal", "Core", "Trapézio", "Antebraço"
  ];

  const difficulties = ["Iniciante", "Intermediário", "Avançado"];

  useEffect(() => {
    generateAutoRecommendations();
  }, [analysisData]);

  useEffect(() => {
    filterExercises();
  }, [searchTerm, selectedMuscleGroup, selectedDifficulty]);

  const generateAutoRecommendations = () => {
    console.log("🤖 Gerando recomendações automáticas baseadas na análise:", analysisData);
    
    // Determinar grupos musculares baseado no objetivo
    let targetMuscles: string[] = [];
    const objetivo = analysisData?.mainObjective || "";
    
    if (objetivo.toLowerCase().includes("hipertrofia")) {
      targetMuscles = ["Peitoral", "Dorsais", "Quadríceps", "Bíceps", "Tríceps"];
    } else if (objetivo.toLowerCase().includes("força")) {
      targetMuscles = ["Peitoral", "Dorsais", "Quadríceps", "Glúteos"];
    } else if (objetivo.toLowerCase().includes("resistencia")) {
      targetMuscles = ["Core", "Quadríceps", "Dorsais", "Glúteos"];
    } else {
      // Treino geral
      targetMuscles = ["Peitoral", "Dorsais", "Quadríceps", "Bíceps", "Abdominal"];
    }

    const recommended: any[] = [];
    
    targetMuscles.forEach(muscle => {
      const muscleExercises = getExercisesByMultipleCriteria({
        muscleGroups: [muscle],
        difficulty: "Intermediário"
      });
      
      if (muscleExercises.length > 0) {
        // Seleciona 2-3 exercícios aleatórios para cada grupo
        const selected = muscleExercises
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.random() > 0.6 ? 3 : 2);
        recommended.push(...selected);
      }
    });

    setAutoRecommendedExercises(recommended);
    console.log(`✅ ${recommended.length} exercícios recomendados automaticamente`);
  };

  const filterExercises = () => {
    let filtered = completeExerciseDatabase;

    if (searchTerm) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscleGroup.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedMuscleGroup !== "all") {
      filtered = filtered.filter(ex =>
        ex.muscleGroup.some(mg => mg.includes(selectedMuscleGroup))
      );
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(ex => ex.difficulty === selectedDifficulty);
    }

    setFilteredExercises(filtered);
  };

  const handleExerciseToggle = (exercise: any, checked: boolean) => {
    if (checked) {
      setSelectedExercises(prev => [...prev, exercise]);
    } else {
      setSelectedExercises(prev => prev.filter(ex => ex.name !== exercise.name));
    }
  };

  const handleAutoSelection = () => {
    setSelectedExercises(autoRecommendedExercises);
    toast({
      title: "🤖 Seleção Automática Aplicada",
      description: `${autoRecommendedExercises.length} exercícios selecionados automaticamente.`,
    });
  };

  const handleConfirmSelection = () => {
    if (selectedExercises.length === 0) {
      toast({
        title: "⚠️ Nenhum Exercício Selecionado",
        description: "Selecione pelo menos um exercício para continuar.",
        variant: "destructive"
      });
      return;
    }

    onExercisesSelected(selectedExercises);
    toast({
      title: "✅ Exercícios Confirmados",
      description: `${selectedExercises.length} exercícios adicionados ao treino.`,
    });
  };

  const clearSelection = () => {
    setSelectedExercises([]);
    toast({
      title: "🧹 Seleção Limpa",
      description: "Todos os exercícios foram desmarcados.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-card-foreground">
            <Target className="h-6 w-6 text-primary" />
            <span>Seleção de Exercícios</span>
            <Badge className="bg-primary/20 text-primary">
              {selectedExercises.length} selecionados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="automatica" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="automatica" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Seleção Automática</span>
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center space-x-2">
                <Hand className="h-4 w-4" />
                <span>Seleção Manual</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="automatica" className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Exercícios Recomendados pela IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Baseado no seu objetivo: {analysisData?.mainObjective || "Desenvolvimento Geral"}
                    </p>
                  </div>
                  <Button 
                    onClick={handleAutoSelection}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Aplicar Seleção
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-3">
                  {autoRecommendedExercises.map((exercise, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-background rounded-lg border">
                      <Dumbbell className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{exercise.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {exercise.muscleGroup.join(", ")} • {exercise.difficulty}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {exercise.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              {/* Filtros */}
              <div className="grid md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar exercícios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Grupo muscular" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os grupos</SelectItem>
                    {muscleGroups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as dificuldades</SelectItem>
                    {difficulties.map(diff => (
                      <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedMuscleGroup("all");
                    setSelectedDifficulty("all");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>

              {/* Lista de exercícios */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredExercises.map((exercise, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <Checkbox
                      checked={selectedExercises.some(ex => ex.name === exercise.name)}
                      onCheckedChange={(checked) => handleExerciseToggle(exercise, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.muscleGroup.join(", ")} • {exercise.difficulty} • {exercise.equipment}
                      </div>
                    </div>
                    <Badge variant="outline">{exercise.category}</Badge>
                  </div>
                ))}
              </div>
              
              {filteredExercises.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum exercício encontrado com os filtros aplicados.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Ações */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={clearSelection}>
                <Shuffle className="h-4 w-4 mr-2" />
                Limpar Seleção
              </Button>
            </div>
            
            <Button 
              onClick={handleConfirmSelection}
              className="bg-primary hover:bg-primary/90"
              disabled={selectedExercises.length === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Seleção ({selectedExercises.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseSelection;
