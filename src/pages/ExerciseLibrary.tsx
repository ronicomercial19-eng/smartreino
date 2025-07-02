
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import EnhancedExerciseCard from "@/components/EnhancedExerciseCard";
import { completeExerciseDatabase, getCompleteExerciseStats } from "@/data/exerciseDatabase";
import { 
  Search, 
  Target,
  Users,
  Dumbbell,
  Heart,
  Zap,
  Gauge,
  Activity,
  TrendingUp
} from "lucide-react";

const ExerciseLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");

  const stats = getCompleteExerciseStats();

  const categories = [
    { id: "all", name: "Todos", icon: Target, count: stats.total },
    { id: "peso-corporal", name: "Peso Corporal", icon: Users, count: stats.byCategory['peso-corporal'] || 0 },
    { id: "forca", name: "Força", icon: Dumbbell, count: stats.byCategory['forca'] || 0 },
    { id: "cardio", name: "Cardio", icon: Heart, count: stats.byCategory['cardio'] || 0 },
    { id: "core", name: "Core", icon: Zap, count: stats.byCategory['core'] || 0 },
    { id: "mobilidade", name: "Mobilidade", icon: Gauge, count: stats.byCategory['mobilidade'] || 0 },
    { id: "funcional", name: "Funcional", icon: Activity, count: stats.byCategory['funcional'] || 0 },
    { id: "pliometrico", name: "Pliométrico", icon: TrendingUp, count: stats.byCategory['pliometrico'] || 0 }
  ];

  const muscleGroups = [
    "Peito", "Costas", "Ombros", "Bíceps", "Tríceps", 
    "Quadríceps", "Posteriores", "Glúteos", "Panturrilhas", 
    "Core", "Oblíquos", "Cardio", "Corpo Todo"
  ];

  const equipmentOptions = [
    "Peso Corporal", "Halteres", "Barra", "Kettlebell", 
    "Banda Elástica", "TRX", "Caixa", "Banco"
  ];

  const filteredExercises = completeExerciseDatabase.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscleGroup.some(muscle => 
                           muscle.toLowerCase().includes(searchTerm.toLowerCase())
                         ) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exercise.targetMuscles && exercise.targetMuscles.join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory;
    const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
    const matchesMuscle = muscleFilter === "all" || 
                         exercise.muscleGroup.some(muscle => 
                           muscle.toLowerCase().includes(muscleFilter.toLowerCase())
                         );
    const matchesEquipment = equipmentFilter === "all" ||
                            exercise.equipment.toLowerCase().includes(equipmentFilter.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesMuscle && matchesEquipment;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏋️ Biblioteca Completa de Exercícios
          </h1>
          <p className="text-gray-600">
            {stats.total} exercícios categorizados para todos os níveis e objetivos
          </p>
        </div>

        {/* Estatísticas Expandidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          {categories.map((category) => (
            <Card key={category.id} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <category.icon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-600">{category.count}</p>
                <p className="text-xs text-gray-600">{category.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estatísticas por Dificuldade */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Distribuição por Dificuldade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.byDifficulty.Iniciante}</p>
                <p className="text-sm text-gray-600">Iniciante</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.byDifficulty.Intermediário}</p>
                <p className="text-sm text-gray-600">Intermediário</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.byDifficulty.Avançado}</p>
                <p className="text-sm text-gray-600">Avançado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros Avançados */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros de Busca Avançados</CardTitle>
            <CardDescription>
              Use os filtros para encontrar exercícios específicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nome, músculo ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Dificuldade</label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Iniciante">Iniciante</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Grupo Muscular</label>
                <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {muscleGroups.map((muscle) => (
                      <SelectItem key={muscle} value={muscle}>
                        {muscle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Equipamento</label>
                <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {equipmentOptions.map((equipment) => (
                      <SelectItem key={equipment} value={equipment}>
                        {equipment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              {filteredExercises.length} exercícios encontrados
            </Badge>
            {searchTerm && (
              <Badge variant="secondary">
                Buscando: "{searchTerm}"
              </Badge>
            )}
          </div>
        </div>

        {/* Grade de Exercícios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <EnhancedExerciseCard
              key={exercise.id}
              exercise={exercise}
              onAddToWorkout={(exercise) => {
                console.log("Adicionando ao treino:", exercise.name);
                // Aqui poderia implementar lógica para adicionar ao treino
              }}
            />
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum exercício encontrado</h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros ou termos de busca
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setDifficultyFilter("all");
                    setMuscleFilter("all");
                    setEquipmentFilter("all");
                  }}
                >
                  Limpar Filtros
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
