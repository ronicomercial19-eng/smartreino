/**
 * Estatísticas Detalhadas
 * Relatórios avançados com dados reais e análises
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/shared/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StudentSelector } from "@/components/analytics/StudentSelector";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { AlunosService, type Aluno } from "@/services/alunosService";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  TrendingUp, 
  Scale, 
  Activity, 
  FileText,
  Download
} from "lucide-react";

export default function AdvancedStatistics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [students, setStudents] = useState<Aluno[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState(id || "");
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [statsData, setStatsData] = useState<any>({
    evaluations: [],
    workouts: [],
    summary: null
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      loadStatisticsData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await AlunosService.listarAlunos();
      setStudents(data);
      if (id) setSelectedStudentId(id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar alunos",
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatisticsData = async (studentId: string) => {
    try {
      setLoadingData(true);

      const studentData = await AlunosService.buscarAlunoPorId(studentId);
      setAluno(studentData);

      // Buscar todas as avaliações
      const { data: evaluations } = await supabase
        .from("avaliacoes_unificadas")
        .select("*")
        .eq("aluno_id", studentId)
        .order("data_avaliacao", { ascending: true });

      // Buscar todos os treinos
      const { data: workouts } = await supabase
        .from("historico_treinos_realizados")
        .select("*")
        .eq("aluno_id", studentId)
        .order("data_treino", { ascending: true });

      // Calcular estatísticas resumidas
      const summary = {
        totalWorkouts: workouts?.length || 0,
        totalVolume: workouts?.reduce((acc: number, w: any) => acc + (w.volume_total_kg || 0), 0) || 0,
        averageDuration: workouts?.reduce((acc: number, w: any) => acc + (w.duracao_minutos || 0), 0) / (workouts?.length || 1) || 0,
        weightChange: evaluations && evaluations.length >= 2 
          ? (evaluations[evaluations.length - 1].peso || 0) - (evaluations[0].peso || 0) 
          : 0
      };

      setStatsData({
        evaluations: evaluations || [],
        workouts: workouts || [],
        summary
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar estatísticas",
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const generatePDFReport = () => {
    toast({
      title: "Exportação de PDF",
      description: "Funcionalidade será implementada em breve"
    });
  };

  if (loading) {
    return (
      <PageLayout title="Estatísticas Detalhadas">
        <LoadingSpinner text="Carregando..." />
      </PageLayout>
    );
  }

  return (
    <PageLayout title={aluno ? `Estatísticas - ${aluno.nome}` : "Estatísticas Detalhadas"}>
      <div className="space-y-6">
        {/* Seletor de Aluno */}
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
              <p className="text-muted-foreground">
                Selecione um aluno para visualizar as estatísticas detalhadas
              </p>
            </CardContent>
          </Card>
        )}

        {selectedStudentId && aluno && (
          <>
            {/* Header com Ações */}
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button onClick={generatePDFReport} className="btn-glow">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>

            {loadingData ? (
              <LoadingSpinner text="Carregando estatísticas..." />
            ) : (
              <Tabs defaultValue="resumo" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="evolucao">Evolução</TabsTrigger>
                  <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
                  <TabsTrigger value="relatorio">Relatório</TabsTrigger>
                </TabsList>

                {/* Tab: Resumo */}
                <TabsContent value="resumo" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Treinos</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{statsData.summary?.totalWorkouts || 0}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{statsData.summary?.totalVolume?.toFixed(0) || 0}kg</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{statsData.summary?.averageDuration?.toFixed(0) || 0}min</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Variação de Peso</CardTitle>
                        <Scale className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${statsData.summary?.weightChange > 0 ? 'text-red-500' : statsData.summary?.weightChange < 0 ? 'text-green-500' : ''}`}>
                          {statsData.summary?.weightChange > 0 ? '+' : ''}{statsData.summary?.weightChange?.toFixed(1) || 0}kg
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Avaliações Recentes</CardTitle>
                      <CardDescription>Histórico de medidas e peso</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {statsData.evaluations.length > 0 ? (
                        <div className="space-y-3">
                          {statsData.evaluations.slice(-5).reverse().map((ev: any) => (
                            <div key={ev.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <p className="font-medium">{new Date(ev.data_avaliacao).toLocaleDateString()}</p>
                                <p className="text-xs text-muted-foreground">
                                  Peso: {ev.peso || 'N/A'}kg • IMC: {ev.imc?.toFixed(1) || 'N/A'}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {ev.percentual_gordura ? `${ev.percentual_gordura}% BF` : 'Sem BF'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground">Nenhuma avaliação registrada</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Evolução */}
                <TabsContent value="evolucao">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gráficos de Evolução</CardTitle>
                      <CardDescription>Em desenvolvimento - Gráficos de linha e progressão</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-muted-foreground py-8">
                        Funcionalidade de gráficos detalhados será implementada em breve
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Comparativo */}
                <TabsContent value="comparativo">
                  <Card>
                    <CardHeader>
                      <CardTitle>Análise Comparativa</CardTitle>
                      <CardDescription>Antes vs Depois</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-muted-foreground py-8">
                        Funcionalidade de comparação será implementada em breve
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Relatório */}
                <TabsContent value="relatorio">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Relatório Completo
                      </CardTitle>
                      <CardDescription>Geração de relatório PDF com análise IA</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-6 border border-border/50 rounded-lg bg-muted/30 text-center space-y-4">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">
                          O relatório completo incluirá:
                        </p>
                        <ul className="text-sm text-left space-y-2 max-w-md mx-auto">
                          <li>✓ Resumo executivo de progresso</li>
                          <li>✓ Gráficos de evolução de medidas</li>
                          <li>✓ Análise de aderência ao treino</li>
                          <li>✓ Recomendações personalizadas da IA</li>
                          <li>✓ Fotos de progresso (se disponíveis)</li>
                        </ul>
                        <Button onClick={generatePDFReport} className="btn-glow">
                          <Download className="h-4 w-4 mr-2" />
                          Gerar Relatório PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
