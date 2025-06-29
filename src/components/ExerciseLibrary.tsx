
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Play, 
  Clock, 
  Target,
  Dumbbell,
  Heart,
  Zap,
  Users
} from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  category: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: string;
  target: string[];
  description: string;
  equipment: string;
  video?: string;
}

const ExerciseLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const exercises: Exercise[] = [
    {
      id: 1,
      name: "Flexão de Braço",
      category: "peso-corporal",
      difficulty: "Intermediário",
      duration: "3 séries × 10-15 reps",
      target: ["Peito", "Tríceps", "Core"],
      description: "Exercício fundamental para desenvolver força do tronco superior.",
      equipment: "Peso Corporal"
    },
    {
      id: 2,
      name: "Agachamento",
      category: "peso-corporal",
      difficulty: "Iniciante",
      duration: "3 séries × 15-20 reps",
      target: ["Quadríceps", "Glúteos", "Core"],
      description: "Movimento básico para fortalecer membros inferiores.",
      equipment: "Peso Corporal"
    },
    {
      id: 3,
      name: "Burpee",
      category: "cardio",
      difficulty: "Avançado",
      duration: "3 séries × 8-12 reps",
      target: ["Corpo Todo", "Cardio"],
      description: "Exercício completo que combina força e resistência.",
      equipment: "Peso Corporal"
    },
    {
      id: 4,
      name: "Prancha",
      category: "core",
      difficulty: "Intermediário",
      duration: "3 séries × 30-60s",
      target: ["Core", "Ombros", "Glúteos"],
      description: "Isometria para fortalecimento do core e estabilização.",
      equipment: "Peso Corporal"
    },
    {
      id: 5,
      name: "Mountain Climbers",
      category: "cardio",
      difficulty: "Intermediário",
      duration: "3 séries × 30-45s",
      target: ["Core", "Cardio", "Ombros"],
      description: "Exercício dinâmico para queima calórica e fortalecimento.",
      equipment: "Peso Corporal"
    },
    {
      id: 6,
      name: "Supino com Halteres",
      category: "forca",
      difficulty: "Intermediário",
      duration: "3 séries × 8-12 reps",
      target: ["Peito", "Tríceps", "Ombros"],
      description: "Exercício clássico para desenvolvimento do peitoral.",
      equipment: "Halteres"
    }
  ];

  const categories = [
    { id: "all", name: "Todos", icon: Target },
    { id: "peso-corporal", name: "Peso Corporal", icon: Users },
    { id: "forca", name: "Força", icon: Dumbbell },
    { id: "cardio", name: "Cardio", icon: Heart },
    { id: "core", name: "Core", icon: Zap }
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.target.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante':
        return 'bg-green-500/20 text-green-400';
      case 'Intermediário':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Avançado':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Biblioteca de Exercícios</CardTitle>
          <CardDescription className="text-gray-400">
            Encontre o exercício perfeito para seu treino
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar exercícios ou grupos musculares..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5 bg-black/30">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500"
                >
                  <category.icon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="bg-black/30 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{exercise.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getDifficultyColor(exercise.difficulty)}>
                      {exercise.difficulty}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed">{exercise.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-gray-300">{exercise.duration}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Dumbbell className="h-4 w-4 text-purple-400 mr-2" />
                  <span className="text-gray-300">{exercise.equipment}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Músculos Trabalhados:</p>
                <div className="flex flex-wrap gap-1">
                  {exercise.target.map((muscle, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-white/20 text-gray-300">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Play className="h-4 w-4 mr-2" />
                Ver Demonstração
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <Card className="bg-black/30 backdrop-blur-sm border-white/10">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">Nenhum exercício encontrado</h3>
            <p className="text-gray-400">Tente ajustar sua busca ou filtros.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExerciseLibrary;
