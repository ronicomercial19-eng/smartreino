
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/shared/PageLayout";

interface WorkoutRecord {
  id: number;
  workout: string;
  date: string;
  duration: string;
  pse: number;
  cargaInterna: number;
  feedback: string;
}

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutRecord[]>([]);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("workouts") || "[]");
    setWorkouts(stored);
    setFilteredWorkouts(stored);
  }, []);

  useEffect(() => {
    if (dateFilter) {
      setFilteredWorkouts(workouts.filter(w => w.date.includes(dateFilter)));
    } else {
      setFilteredWorkouts(workouts);
    }
  }, [dateFilter, workouts]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

  const getAverageLoad = () => {
    if (filteredWorkouts.length === 0) return 0;
    return Math.round(filteredWorkouts.reduce((sum, w) => sum + w.cargaInterna, 0) / filteredWorkouts.length);
  };

  const getPSEBadgeVariant = (pse: number) => {
    if (pse <= 3) return 'secondary';
    if (pse <= 6) return 'default';
    return 'destructive';
  };

  return (
    <PageLayout title="📈 Histórico de Treinos" subtitle="Acompanhe sua evolução e performance ao longo do tempo">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass border-border/50">
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold font-heading text-primary">{filteredWorkouts.length}</p>
              <p className="text-sm text-muted-foreground">Total de Treinos</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50">
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold font-heading text-primary">{getAverageLoad()}</p>
              <p className="text-sm text-muted-foreground">Carga Média</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50">
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold font-heading text-primary">
                {filteredWorkouts.length > 0 ? Math.round(filteredWorkouts.reduce((s, w) => s + w.pse, 0) / filteredWorkouts.length) : 0}
              </p>
              <p className="text-sm text-muted-foreground">PSE Médio</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50">
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold font-heading text-primary">
                {filteredWorkouts.length > 0 ? Math.round(filteredWorkouts.reduce((s, w) => s + parseInt(w.duration || '0'), 0) / filteredWorkouts.length) : 0} min
              </p>
              <p className="text-sm text-muted-foreground">Duração Média</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="glass border-border/50">
          <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
          <CardContent>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="dateFilter">Filtrar por Período</Label>
              <Input id="dateFilter" type="month" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="glass border-border/50">
          <CardHeader><CardTitle>Histórico Detalhado</CardTitle></CardHeader>
          <CardContent>
            {filteredWorkouts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum treino encontrado</p>
                <p className="text-sm mt-2">{workouts.length === 0 ? "Comece registrando seu primeiro treino!" : "Ajuste os filtros acima"}</p>
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
                          <TableCell className="font-medium">{formatDate(workout.date)}</TableCell>
                          <TableCell>{workout.workout}</TableCell>
                          <TableCell>{workout.duration} min</TableCell>
                          <TableCell>
                            <Badge variant={getPSEBadgeVariant(workout.pse)}>{workout.pse}/10</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{workout.cargaInterna}</TableCell>
                          <TableCell className="max-w-xs truncate">{workout.feedback || "-"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default WorkoutHistory;
