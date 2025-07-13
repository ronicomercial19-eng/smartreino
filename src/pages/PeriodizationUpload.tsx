
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import PeriodizationPasteArea from "@/components/PeriodizationPasteArea";
import PeriodizationAnalysisResults from "@/components/PeriodizationAnalysisResults";
import { grokAIService } from "@/services/grokAIService";
import { toast } from "@/components/ui/use-toast";
import { 
  Upload, 
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
  BarChart3
} from "lucide-react";

const PeriodizationUpload = () => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [pastedData, setPastedData] = useState("");
  const [formData, setFormData] = useState({
    objetivo: "",
    nivel: "",
    tempo_disponivel: "",
    restricoes: "",
    periodizacao: ""
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
      
      toast({
        title: "🤖 Análise IA Concluída!",
        description: `Periodização analisada com ${enhancedAnalysis.confidence}% de confiança.`,
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
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-2 h-12 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                <Brain className="h-8 w-8 text-orange-500" />
                <span>Análise Inteligente de Periodização</span>
              </h1>
              <p className="text-slate-400 text-lg">
                Configure, analise e gere relatórios profissionais com IA avançada
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              <Cpu className="h-3 w-3 mr-1" />
              IA Powered
            </Badge>
            <Badge className="bg-slate-700 text-slate-300">
              <BarChart3 className="h-3 w-3 mr-1" />
              Análise Avançada
            </Badge>
            <Badge className="bg-slate-700 text-slate-300">
              <FileText className="h-3 w-3 mr-1" />
              PDF Export
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Formulário de Configuração */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                <Target className="h-5 w-5 text-orange-500" />
                <span>Configuração de Periodização</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="objetivo" className="text-slate-300">Objetivo Principal *</Label>
                  <Select 
                    value={formData.objetivo} 
                    onValueChange={(value) => handleInputChange("objetivo", value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o objetivo" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="perda-peso" className="text-white">Perda de Peso</SelectItem>
                      <SelectItem value="ganho-massa" className="text-white">Ganho de Massa</SelectItem>
                      <SelectItem value="forca" className="text-white">Força</SelectItem>
                      <SelectItem value="condicionamento" className="text-white">Condicionamento</SelectItem>
                      <SelectItem value="mobilidade" className="text-white">Mobilidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivel" className="text-slate-300">Nível do Aluno *</Label>
                  <Select 
                    value={formData.nivel} 
                    onValueChange={(value) => handleInputChange("nivel", value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="iniciante" className="text-white">Iniciante</SelectItem>
                      <SelectItem value="intermediario" className="text-white">Intermediário</SelectItem>
                      <SelectItem value="avancado" className="text-white">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempo_disponivel" className="text-slate-300">Tempo Disponível (min)</Label>
                  <Input
                    id="tempo_disponivel"
                    type="number"
                    placeholder="Ex: 45"
                    value={formData.tempo_disponivel}
                    onChange={(e) => handleInputChange("tempo_disponivel", e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periodizacao" className="text-slate-300">Tipo de Periodização</Label>
                  <Select 
                    value={formData.periodizacao} 
                    onValueChange={(value) => handleInputChange("periodizacao", value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione a periodização" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="blocos" className="text-white">Periodização em Blocos</SelectItem>
                      <SelectItem value="linear" className="text-white">Periodização Linear</SelectItem>
                      <SelectItem value="ondulada" className="text-white">Periodização Ondulatória</SelectItem>
                      <SelectItem value="conjugada" className="text-white">Método Conjugado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restricoes" className="text-slate-300">Restrições/Observações</Label>
                  <Textarea
                    id="restricoes"
                    placeholder="Ex: Lesão no joelho direito, evitar impacto..."
                    value={formData.restricoes}
                    onChange={(e) => handleInputChange("restricoes", e.target.value)}
                    rows={3}
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-orange-500 animate-pulse" />
                      <span className="text-sm font-medium text-white">Analisando com IA...</span>
                    </div>
                    <Progress value={analysisProgress} className="w-full bg-slate-700" />
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Analisando com IA...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analisar com IA
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Área de Colagem */}
          <PeriodizationPasteArea onPeriodizationData={handlePeriodizationData} />
        </div>

        {/* Resultados da Análise */}
        {analysisResult && (
          <PeriodizationAnalysisResults
            analysisData={analysisResult}
            onGeneratePDF={handleGeneratePDF}
            onGenerateLink={handleGenerateLink}
          />
        )}
      </div>
    </div>
  );
};

export default PeriodizationUpload;
