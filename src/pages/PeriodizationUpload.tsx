import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import PeriodizationPasteArea from "@/components/PeriodizationPasteArea";
import PeriodizationAnalysisResults from "@/components/PeriodizationAnalysisResults";
import FullPlanView from "@/components/workout/FullPlanView";
import { grokAIService } from "@/services/grokAIService";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";
import { supabaseUntyped } from "@/integrations/supabase/untypedClient";
import {
  Settings, FileText, Target, TrendingUp, Brain, Zap, Cpu, BarChart3,
  Activity, Clock, Users, Dumbbell, UserCheck, Link as LinkIcon, Layers, Loader2
} from "lucide-react";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  objetivo: string;
  nivel_experiencia: string;
}

interface PeriodizationModel {
  id: string;
  title: string;
  goal: string;
  duration: string;
  description: string;
}

interface SavedPlan {
  id: string;
  nome_plano: string;
  objetivo: string;
  duracao_semanas: number;
  frequencia_semanal: number;
  estrutura_treino: any;
  tipo_periodizacao: string;
  fase_atual: string;
  semana_atual: number;
  status: string;
  created_at: string;
  aluno_id: string;
}

const PeriodizationUpload = () => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [pastedData, setPastedData] = useState("");
  const [activeTab, setActiveTab] = useState("configuracao");

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>("");
  const [loadingAlunos, setLoadingAlunos] = useState(true);

  const [periodizationModels, setPeriodizationModels] = useState<PeriodizationModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [loadingModels, setLoadingModels] = useState(true);

  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);

  const [formData, setFormData] = useState({
    objetivo: "",
    nivel: "",
    tempo_disponivel: "",
    restricoes: "",
    periodizacao: "",
    grupo_prioritario: "",
    dias_semana: "",
    lesoes: ""
  });

  useEffect(() => {
    loadAlunos();
    loadPeriodizationModels();
  }, []);

  const loadAlunos = async () => {
    try {
      setLoadingAlunos(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, email, objetivo, nivel_experiencia')
        .eq('professor_id', user.id)
        .order('nome');
      if (error) throw error;
      setAlunos(data || []);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setLoadingAlunos(false);
    }
  };

  const loadPeriodizationModels = async () => {
    try {
      setLoadingModels(true);
      const { data, error } = await supabaseUntyped
        .from('periodization_models')
        .select('id, title, goal, duration, description')
        .order('title');
      if (error) throw error;
      setPeriodizationModels(data || []);
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const loadSavedPlans = async () => {
    try {
      setLoadingPlans(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabaseUntyped
        .from('planos_treino_aluno')
        .select('*')
        .eq('professor_id', user.id)
        .not('estrutura_treino->macrociclo', 'is', null)
        .order('created_at', { ascending: false });

      if (selectedAlunoId) {
        query = query.eq('aluno_id', selectedAlunoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSavedPlans((data || []) as SavedPlan[]);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (activeTab === "treinos") {
      loadSavedPlans();
    }
  }, [activeTab, selectedAlunoId]);

  const handleAlunoSelect = (alunoId: string) => {
    setSelectedAlunoId(alunoId);
    const aluno = alunos.find(a => a.id === alunoId);
    if (aluno) {
      setFormData(prev => ({
        ...prev,
        objetivo: aluno.objetivo || prev.objetivo,
        nivel: aluno.nivel_experiencia || prev.nivel
      }));
      toast({ title: "Aluno selecionado", description: `Dados de ${aluno.nome} carregados.` });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.objetivo || !formData.nivel) {
      toast({ title: "Dados Incompletos", description: "Preencha objetivo e nível.", variant: "destructive" });
      return;
    }
    await analyzeWithAI();
  };

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    try {
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) { clearInterval(progressInterval); return 90; }
          return prev + 10;
        });
      }, 200);

      const combinedData = { ...formData, periodizacao_texto: pastedData };
      const analysis = await grokAIService.analyzePeriodization(combinedData);

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const enhancedAnalysis = {
        ...analysis,
        confidence: Math.round((analysis.confidence || 0.8) * 100),
        totalDuration: "12 semanas",
        mainObjective: formData.objetivo || "Desenvolvimento Geral"
      };

      setAnalysisResult(enhancedAnalysis);
      toast({ title: "🤖 Análise IA Concluída!", description: `Confiança: ${enhancedAnalysis.confidence}%` });
    } catch (error) {
      logger.error('Erro durante análise');
      toast({ title: "Erro na Análise", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisProgress(0), 2000);
    }
  };

  const handleGenerateFullPlan = async () => {
    if (!selectedAlunoId) {
      toast({ title: "Selecione um aluno", description: "Vincule um aluno antes de gerar o plano completo.", variant: "destructive" });
      return;
    }
    if (!formData.objetivo || !formData.nivel) {
      toast({ title: "Dados Incompletos", description: "Preencha objetivo e nível.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGenerateProgress(0);

    const progressInterval = setInterval(() => {
      setGenerateProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return 90; }
        return prev + 5;
      });
    }, 1000);

    try {
      const { data, error } = await supabase.functions.invoke('generate-full-plan', {
        body: {
          studentId: selectedAlunoId,
          periodizationModelId: selectedModelId || undefined,
          periodizationText: pastedData || undefined,
          formData: {
            objetivo: formData.objetivo,
            nivel: formData.nivel,
            frequencia_semanal: parseInt(formData.dias_semana) || 4,
          }
        }
      });

      clearInterval(progressInterval);
      setGenerateProgress(100);

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Erro desconhecido');

      setSelectedPlan(data.plan);
      setActiveTab("treinos");

      toast({
        title: "🎉 Plano Completo Gerado!",
        description: `${data.summary?.total_semanas} semanas · ${data.summary?.total_mesociclos} mesociclos criados.`,
      });

      loadSavedPlans();
    } catch (error: any) {
      console.error('Erro ao gerar plano:', error);
      toast({
        title: "Erro na Geração",
        description: error?.message || "Falha ao gerar plano completo.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerateProgress(0), 2000);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePeriodizationData = (data: string) => {
    setPastedData(data);
    if (formData.objetivo && formData.nivel) {
      setTimeout(() => analyzeWithAI(), 500);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading gradient-text flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Geração de Plano Periodizado
          </h1>
          <p className="text-muted-foreground">
            Selecione modelo de periodização, vincule ao aluno e gere treinos completos com IA
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
            <Cpu className="h-4 w-4 mr-2" /> IA Powered
          </Badge>
          <Badge className="bg-muted/50 text-muted-foreground border-muted">
            <Layers className="h-4 w-4 mr-2" /> Macro/Meso/Micro
          </Badge>
          <Badge className="bg-muted/50 text-muted-foreground border-muted">
            <BarChart3 className="h-4 w-4 mr-2" /> {periodizationModels.length} modelos
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger value="configuracao" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="h-4 w-4 mr-2" /> Configuração
            </TabsTrigger>
            <TabsTrigger value="treinos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Dumbbell className="h-4 w-4 mr-2" /> Planos Gerados
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="h-4 w-4 mr-2" /> Análise IA
            </TabsTrigger>
          </TabsList>

          {/* ===== CONFIGURAÇÃO ===== */}
          <TabsContent value="configuracao" className="space-y-6">
            {/* Student Selector */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-card-foreground">
                  <div className="w-1 h-8 bg-primary rounded-full" />
                  <UserCheck className="h-6 w-6 text-primary" />
                  <span>Vincular Aluno *</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Select value={selectedAlunoId} onValueChange={handleAlunoSelect}>
                    <SelectTrigger className="flex-1 bg-input border-border text-foreground">
                      <SelectValue placeholder={loadingAlunos ? "Carregando..." : "Selecione um aluno"} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {alunos.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{a.nome}</span>
                            {a.objetivo && <Badge variant="outline" className="text-xs ml-2">{a.objetivo}</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAlunoId && (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                      <LinkIcon className="h-3 w-3 mr-1" /> Vinculado
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Config Form */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-card-foreground">
                    <div className="w-1 h-8 bg-primary rounded-full" />
                    <Target className="h-6 w-6 text-primary" />
                    <span>Configuração do Plano</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Objetivo Principal *</Label>
                        <Select value={formData.objetivo} onValueChange={v => handleInputChange("objetivo", v)}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Objetivo" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="hipertrofia">🏋️ Hipertrofia</SelectItem>
                            <SelectItem value="forca">💪 Força</SelectItem>
                            <SelectItem value="potencia">⚡ Potência</SelectItem>
                            <SelectItem value="resistencia">🏃 Resistência</SelectItem>
                            <SelectItem value="emagrecimento">🔥 Emagrecimento</SelectItem>
                            <SelectItem value="saude">❤️ Saúde Geral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Nível *</Label>
                        <Select value={formData.nivel} onValueChange={v => handleInputChange("nivel", v)}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Nível" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="iniciante">🌱 Iniciante</SelectItem>
                            <SelectItem value="intermediario">🚀 Intermediário</SelectItem>
                            <SelectItem value="avancado">🏆 Avançado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Dias por Semana</Label>
                        <Select value={formData.dias_semana} onValueChange={v => handleInputChange("dias_semana", v)}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Frequência" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="2">2x/semana</SelectItem>
                            <SelectItem value="3">3x/semana</SelectItem>
                            <SelectItem value="4">4x/semana</SelectItem>
                            <SelectItem value="5">5x/semana</SelectItem>
                            <SelectItem value="6">6x/semana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Modelo de Periodização</Label>
                        <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder={loadingModels ? "Carregando..." : `${periodizationModels.length} modelos disponíveis`} />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border max-h-60">
                            <SelectItem value="auto">🤖 IA escolhe automaticamente</SelectItem>
                            {periodizationModels.map(m => (
                              <SelectItem key={m.id} value={m.id}>
                                <div className="flex items-center gap-2">
                                  <span>{m.title}</span>
                                  <Badge variant="outline" className="text-[10px]">{m.duration}</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Lesões / Restrições</Label>
                      <Textarea
                        placeholder="Descreva lesões ou limitações..."
                        value={formData.lesoes}
                        onChange={e => handleInputChange("lesoes", e.target.value)}
                        rows={2}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Analysis Progress */}
                    {isAnalyzing && (
                      <div className="space-y-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-primary animate-pulse" />
                          <span className="font-medium text-foreground">Analisando periodização...</span>
                        </div>
                        <Progress value={analysisProgress} className="w-full" />
                      </div>
                    )}

                    {/* Generate Progress */}
                    {isGenerating && (
                      <div className="space-y-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                          <span className="font-medium text-foreground">Gerando plano completo com IA...</span>
                        </div>
                        <Progress value={generateProgress} className="w-full" />
                        <p className="text-xs text-muted-foreground">
                          Criando exercícios para cada dia de cada semana. Isso pode levar até 30 segundos.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        variant="outline"
                        className="flex-1"
                        disabled={isAnalyzing || isGenerating}
                      >
                        {isAnalyzing ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analisando...</>
                        ) : (
                          <><Brain className="h-4 w-4 mr-2" /> Analisar Periodização</>
                        )}
                      </Button>

                      <Button
                        type="button"
                        onClick={handleGenerateFullPlan}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold btn-glow"
                        disabled={isAnalyzing || isGenerating || !selectedAlunoId}
                      >
                        {isGenerating ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando...</>
                        ) : (
                          <><Zap className="h-4 w-4 mr-2" /> Gerar Plano Completo</>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Paste Area */}
              <PeriodizationPasteArea onPeriodizationData={handlePeriodizationData} />
            </div>
          </TabsContent>

          {/* ===== PLANOS GERADOS ===== */}
          <TabsContent value="treinos" className="space-y-6">
            {selectedPlan?.estrutura_treino?.macrociclo ? (
              <FullPlanView
                plan={selectedPlan.estrutura_treino}
                currentWeek={selectedPlan.semana_atual || 1}
                planName={selectedPlan.nome_plano}
              />
            ) : (
              <>
                {loadingPlans ? (
                  <Card className="bg-card border-border">
                    <CardContent className="py-12 text-center">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-muted-foreground">Carregando planos...</p>
                    </CardContent>
                  </Card>
                ) : savedPlans.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Planos Periodizados Gerados</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {savedPlans.map(plan => (
                        <Card
                          key={plan.id}
                          className="bg-card border-border cursor-pointer hover:border-primary/50 transition-all"
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-card-foreground">{plan.nome_plano}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {plan.duracao_semanas} semanas · {plan.frequencia_semanal}x/sem
                                </p>
                              </div>
                              <Badge className={plan.status === 'ativo' ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}>
                                {plan.status}
                              </Badge>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {plan.tipo_periodizacao && (
                                <Badge variant="outline" className="text-[10px]">
                                  <Layers className="h-3 w-3 mr-1" /> {plan.tipo_periodizacao}
                                </Badge>
                              )}
                              {plan.fase_atual && (
                                <Badge variant="outline" className="text-[10px]">
                                  {plan.fase_atual}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Criado em {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="py-12 text-center">
                      <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold font-heading mb-2 text-foreground">Nenhum plano periodizado</h3>
                      <p className="text-muted-foreground mb-4">
                        Configure os dados na aba "Configuração" e clique em "Gerar Plano Completo"
                      </p>
                      <Button onClick={() => setActiveTab("configuracao")} className="btn-glow">
                        <Target className="h-4 w-4 mr-2" /> Ir para Configuração
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {selectedPlan && (
              <Button variant="outline" onClick={() => setSelectedPlan(null)} className="mt-2">
                ← Voltar para lista
              </Button>
            )}
          </TabsContent>

          {/* ===== ANÁLISE IA ===== */}
          <TabsContent value="analytics" className="space-y-6">
            {analysisResult ? (
              <PeriodizationAnalysisResults
                analysisData={analysisResult}
                onGeneratePDF={() => toast({ title: "📄 Em desenvolvimento" })}
                onGenerateLink={() => toast({ title: "🔗 Em desenvolvimento" })}
              />
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Nenhuma análise realizada</h3>
                  <p className="text-muted-foreground mb-4">
                    Use "Analisar Periodização" na aba Configuração para ver insights da IA
                  </p>
                  <Button onClick={() => setActiveTab("configuracao")} variant="outline">
                    <Brain className="h-4 w-4 mr-2" /> Ir para Configuração
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PeriodizationUpload;
