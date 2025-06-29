
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";

const ExerciseLibrary = () => {
  // Base de exercícios simulada
  const exercises = [
    {
      id: 1,
      name: "Flexão de Braço",
      muscleGroup: "Peito, Tríceps",
      type: "peso_corporal",
      video: "https://example.com/flexao",
      duration: "10 repetições x 10 séries",
      description: "Exercício clássico do método 10X para membros superiores"
    },
    {
      id: 2,
      name: "Agachamento",
      muscleGroup: "Quadríceps, Glúteos",
      type: "peso_corporal",
      video: "https://example.com/agachamento",
      duration: "10 repetições x 10 séries",
      description: "Fundamental para o desenvolvimento de membros inferiores"
    },
    {
      id: 3,
      name: "Supino",
      muscleGroup: "Peito, Tríceps, Ombros",
      type: "com_carga",
      video: "https://example.com/supino",
      duration: "10 repetições x 10 séries",
      description: "Exercício base para ganho de força no tronco"
    },
    {
      id: 4,
      name: "Burpee",
      muscleGroup: "Corpo Inteiro",
      type: "peso_corporal",
      video: "https://example.com/burpee",
      duration: "30 segundos x 10 séries",
      description: "Exercício cardiovascular intenso para condicionamento"
    },
    {
      id: 5,
      name: "Levantamento Terra",
      muscleGroup: "Posterior, Glúteos, Core",
      type: "com_carga",
      video: "https://example.com/terra",
      duration: "10 repetições x 10 séries",
      description: "Um dos melhores exercícios compostos para força geral"
    },
    {
      id: 6,
      name: "Mountain Climber",
      muscleGroup: "Core, Ombros",
      type: "peso_corporal",
      video: "https://example.com/mountain",
      duration: "30 segundos x 10 séries",
      description: "Excelente para core e condicionamento cardiovascular"
    }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [muscleFilter, setMuscleFilter] = useState("todos");

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "todos" || exercise.type === typeFilter;
    const matchesMuscle = muscleFilter === "todos" || 
                         exercise.muscleGroup.toLowerCase().includes(muscleFilter.toLowerCase());
    
    return matchesSearch && matchesType && matchesMuscle;
  });

  const getTypeColor = (type: string) => {
    return type === "peso_corporal" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";
  };

  const getTypeLabel = (type: string) => {
    return type === "peso_corporal" ? "Peso Corporal" : "Com Carga";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏋️ Biblioteca de Exercícios
          </h1>
          <p className="text-gray-600">
            Explore nossa coleção de exercícios para o método 10X
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros de Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar Exercício</label>
                <Input
                  placeholder="Nome ou grupo muscular..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="peso_corporal">Peso Corporal</SelectItem>
                    <SelectItem value="com_carga">Com Carga</SelectItem>
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
                    <SelectItem value="todos">Todos os Grupos</SelectItem>
                    <SelectItem value="peito">Peito</SelectItem>
                    <SelectItem value="quadríceps">Quadríceps</SelectItem>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="ombros">Ombros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Exercícios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <Badge className={getTypeColor(exercise.type)}>
                    {getTypeLabel(exercise.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Grupo Muscular:</p>
                  <p className="font-medium text-blue-600">{exercise.muscleGroup}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duração/Repetições:</p>
                  <p className="font-medium">{exercise.duration}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Descrição:</p>
                  <p className="text-sm">{exercise.description}</p>
                </div>
                
                <div className="pt-2">
                  <a 
                    href={exercise.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    🎥 Ver Vídeo Demonstrativo
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhum exercício encontrado</p>
            <p className="text-sm text-gray-400">
              Tente ajustar os filtros de busca
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
