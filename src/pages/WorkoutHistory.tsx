
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navigation from "@/components/Navigation";

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const savedWorkouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    setWorkouts(savedWorkouts);
    setFilteredWorkouts(savedWorkouts);
  }, []);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
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
                        <TableCell>{workout.workout}</TableCell>
                        <TableCell>{workout.duration} min</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            workout.pse <= 3 ? 'bg-green-100 text-green-800' :
                            workout.pse <= 6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {workout.pse}/10
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            workout.cargaInterna > 300 ? 'text-red-600' :
                            workout.cargaInterna > 200 ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {workout.cargaInterna}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {workout.feedback || "-"}
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
