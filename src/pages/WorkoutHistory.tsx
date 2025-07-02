
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getUserWorkouts, getWorkoutStats } from "@/data/mockData";

const WorkoutHistory = () => {
  const { userProfile } = useUserProfile();
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [workoutStats, setWorkoutStats] = useState(null);

  useEffect(() => {
    if (userProfile) {
      const userWorkouts = getUserWorkouts(userProfile.id);
      const stats = getWorkoutStats(userProfile.id);
      
      setWorkouts(userWorkouts);
      setFilteredWorkouts(userWorkouts);
      setWorkoutStats(stats);
    }
  }, [userProfile]);

  useEffect(() => {
    if (dateFilter) {
      const filtered = workouts.filter(workout => 
        workout.date.includes(dateFilter)
      );
      setFilteredWorkouts(filtered);
    } else {
      setFilteredWorkouts(workouts);
    }
  }, [dateFilter, workouts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getAverageLoad = () => {
    if (filteredWorkouts.length === 0) return 0;
    const total = filteredWorkouts.reduce((sum, workout) => sum + workout.cargaInterna, 0);
    return Math.round(total / filteredWorkouts.length);
  };

  const getPSEBadgeColor = (pse: number) => {
    if (pse <= 3) return 'bg-green-100 text-green-800';
    if (pse <= 6) return 'bg-yellow-100 text-yellow-800';
    if (pse <= 8) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getLoadColor = (load: number) => {
    if (load > 400) return 'text-red-600';
    if (load > 300) return 'text-orange-600';
    if (load > 200) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Carregando dados do usuário...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📈 Histórico de Treinos
          </h1>
          <p className="text-gray-600">
            Acompanhe sua evolução e performance ao longo do tempo
          </p>
        </div>

        {/* Estatísticas Resumidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {filteredWorkouts.length}
                </p>
                <p className="text-sm text-gray-600">Total de Treinos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {getAverageLoad()}
                </p>
                <p className="text-sm text-gray-600">Carga Média</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {filteredWorkouts.length > 0 ? 
                    Math.round(filteredWorkouts.reduce((sum, w) => sum + w.pse, 0) / filteredWorkouts.length) 
                    : 0
                  }
                </p>
                <p className="text-sm text-gray-600">PSE Médio</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {filteredWorkouts.length > 0 ? 
                    Math.round(filteredWorkouts.reduce((sum, w) => sum + parseInt(w.duration), 0) / filteredWorkouts.length) 
                    : 0
                  } min
                </p>
                <p className="text-sm text-gray-600">Duração Média</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros de Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFilter">Filtrar por Período</Label>
                <Input
                  id="dateFilter"
                  type="month"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="Selecione o mês/ano"
                />
              </div>
              <div className="space-y-2">
                <Label>Progresso</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600">
                    {filteredWorkouts.filter(w => w.pse <= 6).length} Leves
                  </Badge>
                  <Badge variant="outline" className="text-orange-600">
                    {filteredWorkouts.filter(w => w.pse > 6 && w.pse <= 8).length} Intensos
                  </Badge>
                  <Badge variant="outline" className="text-red-600">
                    {filteredWorkouts.filter(w => w.pse > 8).length} Extremos
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Histórico */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico Detalhado</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredWorkouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum treino encontrado</p>
                <p className="text-sm text-gray-400">
                  {workouts.length === 0 
                    ? "Comece registrando seu primeiro treino!" 
                    : "Tente ajustar os filtros acima"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Treino</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>PSE</TableHead>
                      <TableHead>Carga Interna</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkouts
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((workout) => (
                      <TableRow key={workout.id}>
                        <TableCell className="font-medium">
                          {formatDate(workout.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{workout.workout}</span>
                            {workout.workout.includes('10X') && (
                              <Badge variant="outline" className="text-blue-600">
                                10X
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{workout.duration} min</TableCell>
                        <TableCell>
                          <Badge className={getPSEBadgeColor(workout.pse)}>
                            {workout.pse}/10
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${getLoadColor(workout.cargaInterna)}`}>
                            {workout.cargaInterna}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={workout.feedback}>
                            {workout.feedback || "-"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutHistory;
