import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/shared/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StudentSelector } from '@/components/analytics/StudentSelector';
import { AIRecommendationPanel } from '@/components/analytics/AIRecommendationPanel';
import { useToast } from '@/hooks/use-toast';
import { AlunosService, type Aluno } from '@/services/alunosService';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, TrendingUp, Calendar, Activity, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StudentAnalytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [students, setStudents] = useState<Aluno[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState(id || '');
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [period, setPeriod] = useState('30');
  const [realData, setRealData] = useState<any>({
    workouts: [],
    evaluations: [],
    metrics: null
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await AlunosService.listarAlunos();
      setStudents(data);
      if (id) {
        setSelectedStudentId(id);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar alunos',
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async (studentId: string) => {
    try {
      setLoadingData(true);
      
      const studentData = await AlunosService.buscarAlunoPorId(studentId);
      setAluno(studentData);

      // Buscar treinos realizados
      const { data: workouts } = await supabase
        .from('historico_treinos_realizados')
        .select('*')
        .eq('aluno_id', studentId)
        .order('data_treino', { ascending: false });

      // Buscar avaliações físicas
      const { data: evaluations } = await supabase
        .from('avaliacoes_unificadas')
        .select('*')
        .eq('aluno_id', studentId)
        .order('data_avaliacao', { ascending: false });

      setRealData({
        workouts: workouts || [],
        evaluations: evaluations || [],
        metrics: {
          totalWorkouts: workouts?.length || 0,
          averagePSE: workouts?.reduce((acc: number, w: any) => acc + (w.pse_sessao || 0), 0) / (workouts?.length || 1),
          adherence: 80 // Calcular baseado em treinos planejados vs realizados
        }
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoadingData(false);
    }
  };

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
    <PageLayout title={aluno ? `Analytics - ${aluno.nome}` : "Analytics"}>
      <div className="space-y-6">
        {/* Seletor de Aluno (se não vier ID na URL) */}
        {!id && (
          <StudentSelector
            students={students}
            selectedStudent={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            loading={loading}
          />
        )}

        {!selectedStudentId && !id && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Selecione um aluno para visualizar analytics</p>
            </CardContent>
          </Card>
        )}

        {selectedStudentId && aluno && (
          <>
            {/* Header */}
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Treinos Realizados</CardTitle>
                  <Activity className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realData.metrics?.totalWorkouts || 0}</div>
                  <p className="text-xs text-muted-foreground">total registrado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aderência</CardTitle>
                  <Target className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realData.metrics?.adherence || 0}%</div>
                  <p className="text-xs text-muted-foreground">dos treinos planejados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">PSE Média</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realData.metrics?.averagePSE?.toFixed(1) || 0}</div>
                  <p className="text-xs text-muted-foreground">percepção de esforço</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realData.evaluations?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">registradas</p>
                </CardContent>
              </Card>
            </div>

            {/* Recomendações IA */}
            <AIRecommendationPanel
              studentId={selectedStudentId}
              studentData={aluno}
              onApplyRecommendations={() => {
                toast({
                  title: "Implementação Futura",
                  description: "Funcionalidade de aplicação automática será implementada"
                });
              }}
            />

            {/* Progress Chart */}
            {realData.evaluations && realData.evaluations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Evolução de Peso</CardTitle>
                  <CardDescription>Histórico de avaliações físicas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={realData.evaluations.slice(0, 10).reverse().map((ev: any) => ({
                      data: new Date(ev.data_avaliacao).toLocaleDateString(),
                      peso: ev.peso
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" name="Peso (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Frequency Chart */}
            {realData.workouts && realData.workouts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Treinos</CardTitle>
                  <CardDescription>Últimos treinos realizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {realData.workouts.slice(0, 5).map((workout: any) => (
                      <div key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{new Date(workout.data_treino).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {workout.duracao_minutos}min • PSE: {workout.pse_sessao || 'N/A'}
                          </p>
                        </div>
                        <Badge variant="outline">{workout.volume_total_kg || 0}kg</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
