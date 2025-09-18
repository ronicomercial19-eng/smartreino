import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import PeriodizationPasteArea from "@/components/PeriodizationPasteArea";
import PeriodizationAnalysisResults from "@/components/PeriodizationAnalysisResults";
import ExerciseSelection from "@/components/ExerciseSelection";
import { grokAIService } from "@/services/grokAIService";
import { toast } from "@/components/ui/use-toast";
import { 
  Settings, 
  FileText, 
  Calendar, 
  Target, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Brain,
  Zap,
  Cpu,
  BarChart3,
  Activity,
  Clock,
  Users,
  Dumbbell
} from "lucide-react";

const PeriodizationUpload = () => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [pastedData, setPastedData] = useState("");
  const [activeTab, setActiveTab] = useState("configuracao");
  const [showExerciseSelection, setShowExerciseSelection] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    objetivo: "",
    nivel: "",
    tempo_disponivel: "",
    restricoes: "",
    periodizacao: "",
    grupo_prioritario: "",
    dias_semana: "",
    variabilidade: "sim",
    complexidade: "basico",
    equipamentos: "",
    lesoes: ""
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.objetivo || !formData.nivel) {
      toast({
        title: "Dados Incompletos",
        description: "Por favor, preencha pelo menos o objetivo e nível do aluno.",
        variant: "destructive"
      });
      return;
    }

    await analyzeWithAI();
  };

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('Starting AI analysis with data:', { ...formData, pastedData });
      
      const combinedData = {
        ...formData,
        periodizacao_texto: pastedData
      };
      
      const analysis = await grokAIService.analyzePeriodization(combinedData);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      console.log('Analysis result:', analysis);
      
      // Enhanced analysis with mock data structure
      const enhancedAnalysis = {
        ...analysis,
        blocks: analysis.recommendedModels?.map((model: any, index: number) => ({
          name: model.name,
          duration: `${model.duration} min`,
          focus: model.description,
          intensity: Math.min(10, model.targetPSE || 7),
          volume: Math.floor(Math.random() * 3) + 7
        })) || [],
        weeklyPlan: Array.from({ length: 12 }, (_, i) => ({
          week: i + 1,
          day3_focus: `Treino ${['A', 'B', 'C'][i % 3]}`,
          day4_focus: `Treino ${['B', 'C', 'A'][i % 3]}`,
          load: Math.floor(Math.random() * 4) + 6
        })),
        macroChartData: {
          volume: Array.from({ length: 12 }, () => Math.floor(Math.random() * 4) + 6),
          intensity: Array.from({ length: 12 }, () => Math.floor(Math.random() * 4) + 6)
        },
        confidence: Math.round((analysis.confidence || 0.8) * 100),
        totalDuration: "12 semanas",
        mainObjective: formData.objetivo || "Desenvolvimento Geral"
      };
      
      setAnalysisResult(enhancedAnalysis);
      setShowExerciseSelection(true);
      setActiveTab("treinos");
      
      toast({
        title: "🤖 Análise IA Concluída!",
        description: `Periodização analisada com ${enhancedAnalysis.confidence}% de confiança. Agora selecione os exercícios.`,
      });
    } catch (error) {
      console.error('Error during analysis:', error);
      toast({
        title: "Erro na Análise",
        description: "Ocorreu um erro durante a análise. Tentando análise local...",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisProgress(0), 2000);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePeriodizationData = (data: string) => {
    setPastedData(data);
    // Auto-analyze if we have basic form data
    if (formData.objetivo && formData.nivel) {
      setTimeout(() => analyzeWithAI(), 500);
    }
  };

  const handleExercisesSelected = (exercises: any[]) => {
    setSelectedExercises(exercises);
    setShowExerciseSelection(false);
    
    // Update analysis result with selected exercises
    setAnalysisResult(prev => ({
      ...prev,
      selectedExercises: exercises
    }));

    toast({
      title: "✅ Exercícios Selecionados",
      description: `${exercises.length} exercícios adicionados ao treino personalizado.`,
    });
  };

  const handleGeneratePDF = () => {
    toast({
      title: "📄 Gerando PDF...",
      description: "Relatório está sendo preparado para download.",
    });
    // TODO: Implement PDF generation
  };

  const handleGenerateLink = () => {
    const shareableLink = `https://smartreino.ai/report/${Date.now()}`;
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: "🔗 Link Copiado!",
      description: "Link compartilhável copiado para área de transferência.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="container mx-auto px-4">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading gradient-text flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            TrainSync Smart Training
          </h1>
          <p className="text-muted-foreground">
            Configure, analise e gere treinos profissionais com IA
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
          <Cpu className="h-4 w-4 mr-2" />
          IA Powered
        </Badge>
        <Badge className="bg-muted/50 text-muted-foreground border-muted">
          <BarChart3 className="h-4 w-4 mr-2" />
          Análise Avançada
        </Badge>
        <Badge className="bg-muted/50 text-muted-foreground border-muted">
          <FileText className="h-4 w-4 mr-2" />
          Relatórios PDF
        </Badge>
        <Badge className="bg-muted/50 text-muted-foreground border-muted">
          <Activity className="h-4 w-4 mr-2" />
          Analytics Real-time
        </Badge>
      </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
            <TabsTrigger 
              value="configuracao" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configuração
            </TabsTrigger>
            <TabsTrigger 
              value="treinos" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              Meus Treinos
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="relatorios" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="configuracao" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Enhanced Configuration Form */}
              <Card className="bg-card border-border card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-card-foreground">
                    <div className="w-1 h-8 bg-primary rounded-full"></div>
                    <Target className="h-6 w-6 text-primary" />
                    <span>Escolha o Modelo de Treino</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Objetivo Principal *</Label>
                        <Select 
                          value={formData.objetivo} 
                          onValueChange={(value) => handleInputChange("objetivo", value)}
                        >
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Selecione o objetivo" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="hipertrofia">🏋️ Hipertrofia</SelectItem>
                            <SelectItem value="forca">💪 Força</SelectItem>
                            <SelectItem value="potencia">⚡ Potência</SelectItem>
                            <SelectItem value="resistencia">🏃 Resistência Muscular</SelectItem>
                            <SelectItem value="perda-peso">🔥 Perda de Peso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Nível de Experiência *</Label>
                        <Select 
                          value={formData.nivel} 
                          onValueChange={(value) => handleInputChange("nivel", value)}
                        >
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Selecione o nível" />
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
                        <Label className="text-muted-foreground">Grupo Prioritário</Label>
                        <Input
                          placeholder="Ex: Pernas, Braços, Core..."
                          value={formData.grupo_prioritario}
                          onChange={(e) => handleInputChange("grupo_prioritario", e.target.value)}
                          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Dias por Semana</Label>
                        <Input
                          type="number"
                          min="1"
                          max="7"
                          placeholder="3-6 dias"
                          value={formData.dias_semana}
                          onChange={(e) => handleInputChange("dias_semana", e.target.value)}
                          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Variabilidade de Exercícios</Label>
                        <Select 
                          value={formData.variabilidade} 
                          onValueChange={(value) => handleInputChange("variabilidade", value)}
                        >
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="sim">✅ Sim, quero variar</SelectItem>
                            <SelectItem value="nao">❌ Não, manter constante</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Complexidade</Label>
                        <Select 
                          value={formData.complexidade} 
                          onValueChange={(value) => handleInputChange("complexidade", value)}
                        >
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="basico">🟢 Prefiro simples</SelectItem>
                            <SelectItem value="avancado">🔴 Quero avançado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Limitações/Lesões</Label>
                      <Textarea
                        placeholder="Descreva qualquer lesão, dor ou limitação física..."
                        value={formData.lesoes}
                        onChange={(e) => handleInputChange("lesoes", e.target.value)}
                        rows={3}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {isAnalyzing && (
                      <div className="space-y-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-primary animate-pulse" />
                          <span className="font-medium text-foreground">Gerando treino com IA...</span>
                        </div>
                        <Progress value={analysisProgress} className="w-full progress-glow" />
                        <p className="text-sm text-muted-foreground">
                          Analisando suas preferências e criando o treino personalizado...
                        </p>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-lg btn-glow"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3"></div>
                          Analisando com IA...
                        </>
                      ) : (
                        <>
                          <Brain className="h-5 w-5 mr-3" />
                          Gerar Treino Inteligente
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Enhanced Paste Area */}
              <PeriodizationPasteArea onPeriodizationData={handlePeriodizationData} />
            </div>
          </TabsContent>

          {/* Treinos Tab with Exercise Selection */}
          <TabsContent value="treinos" className="space-y-6">
            {showExerciseSelection && analysisResult ? (
              <ExerciseSelection
                analysisData={analysisResult}
                onExercisesSelected={handleExercisesSelected}
              />
            ) : analysisResult ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-card-foreground">
                    <Dumbbell className="h-6 w-6 text-primary" />
                    <span>Treino Gerado com Sucesso</span>
                    {selectedExercises.length > 0 && (
                      <Badge className="bg-green-500/20 text-green-600">
                        {selectedExercises.length} exercícios selecionados
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PeriodizationAnalysisResults
                    analysisData={analysisResult}
                    onGeneratePDF={handleGeneratePDF}
                    onGenerateLink={handleGenerateLink}
                  />
                  
                  {selectedExercises.length === 0 && (
                    <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-orange-600">Selecione os Exercícios</h3>
                          <p className="text-sm text-muted-foreground">
                            Complete seu treino selecionando exercícios específicos.
                          </p>
                        </div>
                        <Button 
                          onClick={() => setShowExerciseSelection(true)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Selecionar Exercícios
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-card-foreground">
                    <Dumbbell className="h-6 w-6 text-primary" />
                    <span>Meus Treinos Gerados</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">
                      Nenhum treino gerado ainda. Configure e gere seu primeiro treino!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-card-foreground">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span>Analytics Semanal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Gráficos e estatísticas em desenvolvimento...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-card-foreground">
                  <FileText className="h-6 w-6 text-primary" />
                  <span>Relatório Geral</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-4">
                    Relatórios completos e exportação em PDF disponível após gerar treinos.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={handleGeneratePDF}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={!analysisResult}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button 
                      onClick={handleGenerateLink}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10"
                      disabled={!analysisResult}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Compartilhar Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PeriodizationUpload;
