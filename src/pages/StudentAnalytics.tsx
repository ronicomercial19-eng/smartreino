import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/shared/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { AlunosService, type Aluno } from '@/services/alunosService';
import { ArrowLeft, TrendingUp, Calendar, Activity, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StudentAnalytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    const loadStudent = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await AlunosService.buscarAlunoPorId(id);
        setAluno(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar aluno',
          description: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <PageLayout title="Analytics">
        <LoadingSpinner text="Carregando dados..." />
      </PageLayout>
    );
  }

  if (!aluno) {
    return (
      <PageLayout title="Aluno não encontrado">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Aluno não encontrado</p>
            <Button onClick={() => navigate(-1)} className="mt-4">Voltar</Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Mock data - will be replaced with real data
  const progressData = [
    { week: 'Sem 1', peso: 75, pse: 6.5 },
    { week: 'Sem 2', peso: 74.8, pse: 7.0 },
    { week: 'Sem 3', peso: 74.5, pse: 7.2 },
    { week: 'Sem 4', peso: 74.2, pse: 7.5 },
  ];

  const workoutFrequency = [
    { dia: 'Seg', treinos: 1 },
    { dia: 'Ter', treinos: 1 },
    { dia: 'Qua', treinos: 0 },
    { dia: 'Qui', treinos: 1 },
    { dia: 'Sex', treinos: 1 },
    { dia: 'Sáb', treinos: 0 },
    { dia: 'Dom', treinos: 0 },
  ];

  return (
    <PageLayout title={`Analytics - ${aluno.nome}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Treinos Realizados</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">neste período</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aderência</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">80%</div>
              <p className="text-xs text-muted-foreground">Meta: 75%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PSE Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7.1</div>
              <p className="text-xs text-muted-foreground">+0.3 vs anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sequência Atual</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">semanas consecutivas</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Peso e PSE</CardTitle>
            <CardDescription>Acompanhamento semanal do progresso</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="peso" stroke="hsl(var(--primary))" name="Peso (kg)" />
                <Line yAxisId="right" type="monotone" dataKey="pse" stroke="hsl(var(--secondary))" name="PSE" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Frequency Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Frequência Semanal</CardTitle>
            <CardDescription>Treinos realizados por dia da semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workoutFrequency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="treinos" fill="hsl(var(--primary))" name="Treinos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
