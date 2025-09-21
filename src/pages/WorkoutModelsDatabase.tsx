import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Download, Eye, BarChart3, Dumbbell } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { workoutModelsService } from '@/services/workoutModelsService';
import { useToast } from '@/hooks/use-toast';
import { periodizationNewService, type PeriodizacaoSemanal } from '@/services/periodizationNewService';
import { trainingStructuresService } from '@/services/trainingStructuresService';
import { generatedPlansService } from '@/services/generatedPlansService';
import { simpleModelsService } from '@/services/simpleModelsService';
import { workoutGenerationService } from '@/services/workoutGenerationService';
import ModelosTreinoCard, { ModeloTreino } from '@/components/ModelosTreinoCard';
import { useUserProfile } from '@/hooks/useUserProfile';
// Recharts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

type DistinctValues = {
  levels: string[];
  phases: string[];
  stimulusTypes: string[];
} | null;

export default function WorkoutModelsDatabase() {
  const [models, setModels] = useState<any[]>([]);
  const [filteredModels, setFilteredModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [distinctValues, setDistinctValues] = useState<DistinctValues>(null);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  // NOVO: estados para Analytics Semanal
  const [studentId, setStudentId] = useState('');
  const [weeklyData, setWeeklyData] = useState<PeriodizacaoSemanal[] | null>(null);
  const [metric, setMetric] = useState<'carga_prevista' | 'carga_real' | 'diferenca'>('carga_prevista');

  // NOVO: Volume semanal (séries) por modelo
  const [modelIdForVolume, setModelIdForVolume] = useState('');
  const [totalSetsPerWeek, setTotalSetsPerWeek] = useState<number | null>(null);
  const [weeksForVolume, setWeeksForVolume] = useState<number>(4); // fallback caso não tenha dados da periodização

  // NOVO: Associações (planos -> modelos) e "Meus treinos"
  const [myPlans, setMyPlans] = useState<any[] | null>(null);
  const [associatedModel, setAssociatedModel] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [modelosSimples, setModelosSimples] = useState<any[]>([]);
  const { userProfile } = useUserProfile();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (userProfile?.id) {
      setSelectedStudent(userProfile.id);
    }
  }, [userProfile]);

  // Reaplicar filtros sempre que os critérios mudarem
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedLevel, selectedPhase]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('➡️ Carregando modelos, estatísticas e valores distintos...');
      const [modelsData, statsData, distinct, simplesData] = await Promise.all([
        workoutModelsService.getAllWorkoutModels(),
        workoutModelsService.getWorkoutStatistics(),
        workoutModelsService.getDistinctValues(),
        simpleModelsService.getById("").catch(() => []) // Carregar modelos personalizados
      ]);

      setModels(modelsData || []);
      setFilteredModels(modelsData || []);
      setStats(statsData);
      setDistinctValues(distinct);
      setModelosSimples(Array.isArray(simplesData) ? simplesData : []);
      // Dados carregados com sucesso
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados da base de modelos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGerarModelo = async (modelo: ModeloTreino) => {
    if (!selectedStudent) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      const canGenerate = await workoutGenerationService.validarPermissaoGeracao(selectedStudent);
      if (!canGenerate) {
        toast({
          title: "Erro",
          description: "Você não tem permissão para gerar modelos",
          variant: "destructive"
        });
        return;
      }

      const result = await workoutGenerationService.gerarModelo({
        estudante_id: selectedStudent,
        objetivo: modelo.objetivo || 'hipertrofia',
        nivel: modelo.nivel || 'intermediario',
        periodizacao: modelo.periodizacao || {}
      });

      toast({
        title: "Sucesso",
        description: `Modelo gerado com sucesso! ID: ${result.modelo_id}`,
      });

      // Recarregar dados
      loadData();
      
    } catch (error: any) {
      console.error('Erro ao gerar modelo:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao gerar modelo de treino",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditarModelo = (modelo: ModeloTreino) => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de edição será implementada em breve",
    });
  };

  // Converter modelos para interface unificada
  const convertToModeloTreino = (models: any[]): ModeloTreino[] => {
    return models.map(model => ({
      id: model.id,
      nome: model.name || model.nome || 'Modelo sem nome',
      descricao: model.description || model.descricao,
      objetivo: model.goal || model.objetivo,
      nivel: model.level || model.nivel,
      duracao_em_semanas: model.duration_weeks || model.duracao_em_semanas,
      estudante_id: model.estudante_id,
      tag: model.tag
    }));
  };

  const applyFilters = async () => {
    try {
      setFiltering(true);
      console.log('🎛️ Aplicando filtros no Supabase:', {
        level: selectedLevel === 'all' ? undefined : selectedLevel,
        periodization_phase: selectedPhase === 'all' ? undefined : selectedPhase,
        search: searchTerm || undefined,
      });

      const filtered = await workoutModelsService.getFilteredModels({
        level: selectedLevel === 'all' ? undefined : selectedLevel,
        periodization_phase: selectedPhase === 'all' ? undefined : selectedPhase,
        search: searchTerm || undefined,
      });

      setFilteredModels(filtered || []);
      // Filtros aplicados com sucesso
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
      toast({
        title: "Erro nos filtros",
        description: "Não foi possível aplicar os filtros. Mostrando dados atuais.",
        variant: "destructive",
      });
    } finally {
      setFiltering(false);
    }
  };

  const handleExport = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo preparados para download..."
    });
  };

  const showingInfo = useMemo(() => {
    return `Mostrando ${filteredModels.length} de ${models.length} modelos`;
  }, [filteredModels.length, models.length]);

  // NOVO: buscar periodização semanal via RPC
  const handleLoadWeeklyAnalytics = async () => {
    if (!studentId) {
      toast({ title: "Informe o ID do estudante", description: "Cole o UUID do estudante para carregar a análise.", variant: "destructive" });
      return;
    }
    try {
      const data = await periodizationNewService.getByStudent(studentId);
      setWeeklyData(data);
      // Se tivermos semanas, ajustar weeksForVolume para igualar
      if (data && data.length > 0) {
        const maxWeek = Math.max(...data.map(d => d.semana));
        setWeeksForVolume(maxWeek);
      }
      toast({ title: "Análise carregada", description: "Dados semanais obtidos com sucesso." });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Não foi possível carregar a análise semanal.", variant: "destructive" });
    }
  };

  // NOVO: calcular intensidade média (%) por semana a partir da weeklyData
  const intensitySeries = useMemo(() => {
    if (!weeklyData) return [];
    return weeklyData.map(w => {
      const prev = Number(w.carga_prevista || 0);
      const real = Number(w.carga_real || 0);
      const perc = prev > 0 ? (real / prev) * 100 : 0;
      return { semana: w.semana, intensidade_percent: Number(perc.toFixed(1)) };
    });
  }, [weeklyData]);

  // NOVO: carregar total de séries semanais para um modelo específico
  const handleLoadWeeklyVolume = async () => {
    if (!modelIdForVolume) {
      toast({ title: "Informe o ID do modelo", description: "Cole o UUID do modelo para calcular o volume semanal.", variant: "destructive" });
      return;
    }
    try {
      const total = await trainingStructuresService.getWeeklySetsTotalByModel(modelIdForVolume);
      setTotalSetsPerWeek(total);
      toast({ title: "Volume calculado", description: `Total de séries por semana: ${total}` });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Não foi possível calcular o volume semanal.", variant: "destructive" });
    }
  };

  // NOVO: carregar "Meus treinos" (planos do estudante) e associar modelo
  const handleLoadMyWorkouts = async () => {
    if (!studentId) {
      toast({ title: "Informe o ID do estudante", description: "Cole o UUID do estudante para listar seus treinos.", variant: "destructive" });
      return;
    }
    try {
      const plans = await generatedPlansService.getByStudent(studentId);
      setMyPlans(plans);
      if (plans && plans[0]?.modelo_id) {
        const model = await simpleModelsService.getById(plans[0].modelo_id);
        setAssociatedModel(model);
      } else {
        setAssociatedModel(null);
      }
      toast({ title: "Meus treinos", description: `${plans?.length || 0} plano(s) encontrado(s).` });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Não foi possível carregar seus treinos.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-pulse-orange">
            <BarChart3 className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">Carregando base de dados...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-heading gradient-text">
              Base de Dados - Modelos de Treino
            </h1>
            <p className="text-muted-foreground">
              Explore e analise todos os modelos de treino disponíveis.
            </p>
          </div>
          <Button onClick={handleExport} className="btn-glow">
            <Download className="mr-2 h-4 w-4" />
            Exportar Dados
          </Button>
        </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Modelos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-primary">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Níveis Únicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-emerald-600">
                {Object.keys(stats.byLevel || {}).length}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fases de Periodização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-blue-600">
                {Object.keys(stats.byPhase || {}).length}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tipos de Estímulo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-orange-600">
                {Object.keys(stats.byStimulusType || {}).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, objetivo ou metodologia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus-ring"
              />
            </div>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="focus-ring">
                <SelectValue placeholder="Filtrar por nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                {distinctValues?.levels?.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger className="focus-ring">
                <SelectValue placeholder="Filtrar por fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fases</SelectItem>
                {distinctValues?.phases?.map((ph) => (
                  <SelectItem key={ph} value={ph}>{ph}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            {filtering ? 'Filtrando...' : showingInfo}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="grid">Visualização em Grade</TabsTrigger>
          <TabsTrigger value="list">Visualização em Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {convertToModeloTreino(filteredModels).map((modelo) => (
              <ModelosTreinoCard
                key={modelo.id}
                modelo={modelo}
                onEditar={handleEditarModelo}
                onGerar={handleGerarModelo}
                isOwner={!!selectedStudent}
                isLoading={isGenerating}
              />
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Modelos Personalizados
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {convertToModeloTreino(modelosSimples).map((modelo) => (
                <ModelosTreinoCard
                  key={modelo.id}
                  modelo={modelo}
                  onEditar={handleEditarModelo}
                  onGerar={handleGerarModelo}
                  isOwner={!!selectedStudent}
                  isLoading={isGenerating}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-2">
            {filteredModels.map((model) => (
              <Card key={model.id} className="glass border-border/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold">{model.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {model.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {model.periodization_phase}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {model.general_objective}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="btn-glow">
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* NOVO: Seção de Analytics Semanal */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Semanal (Periodização)
          </CardTitle>
          <CardDescription>
            Selecione o estudante, escolha a métrica e visualize os gráficos. Também mostramos volume semanal (séries) por modelo e intensidade média (%).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Estudante ID (UUID)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="ex: 9f4d1c2a-...."
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="focus-ring"
                />
                <Button onClick={handleLoadWeeklyAnalytics} className="btn-glow">Carregar</Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Métrica</label>
              <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
                <SelectTrigger className="focus-ring">
                  <SelectValue placeholder="Escolha a métrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carga_prevista">Carga Prevista</SelectItem>
                  <SelectItem value="carga_real">Carga Real</SelectItem>
                  <SelectItem value="diferenca">Diferença</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Ações</label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleLoadMyWorkouts} className="flex-1">Meus treinos</Button>
              </div>
            </div>
          </div>

          {/* Gráfico da métrica selecionada */}
          {weeklyData && weeklyData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={metric} name={metric.replace('_', ' ')} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Carregue um estudante para ver os gráficos.</p>
          )}

          {/* Intensidade média (%) por semana */}
          {intensitySeries.length > 0 && (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={intensitySeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="intensidade_percent" name="Intensidade média (%)" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Volume semanal (séries) por modelo */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Modelo ID (UUID)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="ex: 1f2e3d4c-...."
                  value={modelIdForVolume}
                  onChange={(e) => setModelIdForVolume(e.target.value)}
                  className="focus-ring"
                />
                <Button onClick={handleLoadWeeklyVolume} className="btn-glow">Calcular</Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Semanas (fallback)</label>
              <Input
                type="number"
                min={1}
                value={weeksForVolume}
                onChange={(e) => setWeeksForVolume(Number(e.target.value || 1))}
                className="focus-ring"
              />
            </div>
          </div>

          {totalSetsPerWeek !== null && (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Array.from({ length: weeksForVolume }, (_, i) => ({
                    semana: i + 1,
                    series: totalSetsPerWeek,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="series" name="Séries/semana" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Associações: análise <-> modelo via plano */}
          {myPlans && (
            <div className="space-y-2">
              <h4 className="font-semibold font-heading">Associações</h4>
              <p className="text-sm text-muted-foreground">
                {myPlans.length === 0
                  ? "Nenhum plano encontrado para este estudante."
                  : `Foram encontrados ${myPlans.length} plano(s) para este estudante.`}
              </p>
              {associatedModel && (
                <div className="text-sm">
                  <span className="font-medium">Modelo associado (primeiro plano):</span>{" "}
                  {associatedModel.nome} ({associatedModel.duracao_em_semanas || "?"} semanas)
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* NOVO: Meus treinos - listagem simples baseada nos planos carregados */}
      {myPlans && myPlans.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-heading">Meus Treinos</CardTitle>
            <CardDescription>Planos vinculados ao estudante informado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {myPlans.map((p) => (
              <div key={p.id} className="flex items-center justify-between border rounded-md p-3">
                <div className="text-sm">
                  <div><span className="font-medium">Plano:</span> {p.id}</div>
                  <div><span className="font-medium">Modelo:</span> {p.modelo_id}</div>
                  <div className="text-muted-foreground">Criado em: {new Date(p.criado_em).toLocaleString()}</div>
                </div>
                {associatedModel?.id === p.modelo_id && (
                  <Badge variant="secondary" className="text-xs">Associado</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {filteredModels.length === 0 && (
        <Card className="glass border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold font-heading mb-2">
              Nenhum modelo encontrado
            </h3>
            <p className="text-muted-foreground text-center">
              Tente ajustar os filtros ou termos de busca para encontrar modelos.
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </AppLayout>
  );
}
