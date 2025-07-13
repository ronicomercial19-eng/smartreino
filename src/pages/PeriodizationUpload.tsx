
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
  Zap
} from "lucide-react";

const PeriodizationUpload = () => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
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

      console.log('Starting AI analysis with data:', formData);
      
      const analysis = await grokAIService.analyzePeriodization(formData);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      console.log('Analysis result:', analysis);
      setAnalysisResult(analysis);
      
      toast({
        title: "🤖 Análise IA Concluída!",
        description: `${analysis.recommendedModels.length} modelos personalizados foram gerados para você.`,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-500" />
            <span>🤖 Upload de Periodização com IA</span>
          </h1>
          <p className="text-gray-600">
            Configure a periodização e receba recomendações personalizadas geradas por IA
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário de Configuração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span>Configuração de Periodização</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="objetivo">Objetivo Principal *</Label>
                  <Select 
                    value={formData.objetivo} 
                    onValueChange={(value) => handleInputChange("objetivo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perda-peso">Perda de Peso</SelectItem>
                      <SelectItem value="ganho-massa">Ganho de Massa</SelectItem>
                      <SelectItem value="forca">Força</SelectItem>
                      <SelectItem value="condicionamento">Condicionamento</SelectItem>
                      <SelectItem value="mobilidade">Mobilidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivel">Nível do Aluno *</Label>
                  <Select 
                    value={formData.nivel} 
                    onValueChange={(value) => handleInputChange("nivel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempo_disponivel">Tempo Disponível (min)</Label>
                  <Input
                    id="tempo_disponivel"
                    type="number"
                    placeholder="Ex: 45"
                    value={formData.tempo_disponivel}
                    onChange={(e) => handleInputChange("tempo_disponivel", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periodizacao">Tipo de Periodização</Label>
                  <Select 
                    value={formData.periodizacao} 
                    onValueChange={(value) => handleInputChange("periodizacao", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a periodização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blocos">Periodização em Blocos</SelectItem>
                      <SelectItem value="linear">Periodização Linear</SelectItem>
                      <SelectItem value="ondulada">Periodização Ondulatória</SelectItem>
                      <SelectItem value="conjugada">Método Conjugado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restricoes">Restrições/Observações</Label>
                  <Textarea
                    id="restricoes"
                    placeholder="Ex: Lesão no joelho direito, evitar impacto..."
                    value={formData.restricoes}
                    onChange={(e) => handleInputChange("restricoes", e.target.value)}
                    rows={3}
                  />
                </div>

                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
                      <span className="text-sm font-medium">Analisando com IA...</span>
                    </div>
                    <Progress value={analysisProgress} className="w-full" />
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

          {/* Resultado da Análise */}
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Análise de Periodização IA</span>
                  <Badge variant="secondary" className="ml-2">
                    {Math.round((analysisResult.confidence || 0.8) * 100)}% confiança
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-50">
                    Fase Atual: {analysisResult.currentPhase}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span>Modelos Gerados por IA ({analysisResult.recommendedModels?.length || 0})</span>
                  </h4>
                  
                  {analysisResult.recommendedModels && analysisResult.recommendedModels.length > 0 ? (
                    <div className="space-y-3">
                      {analysisResult.recommendedModels.slice(0, 4).map((model: any, index: number) => (
                        <div key={model.id || index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h5 className="font-medium text-gray-900">{model.name}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {model.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {model.muscleGroups?.slice(0, 3).map((muscle: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {muscle}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                                <span>⏱️ {model.duration}min</span>
                                <span>💪 PSE {model.targetPSE}</span>
                                <span>📊 {model.phase}</span>
                              </div>
                              {model.aiReasoning && (
                                <p className="text-xs text-blue-600 italic bg-blue-50 p-2 rounded">
                                  {model.aiReasoning}
                                </p>
                              )}
                            </div>
                            <Badge variant="default" className="ml-2 bg-green-100 text-green-800">
                              {model.recommendationScore}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhum modelo específico foi gerado para estes parâmetros.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>Sugestões de Periodização IA</span>
                  </h4>
                  {analysisResult.periodizationSuggestions && (
                    <ul className="space-y-2 text-sm text-gray-700">
                      {analysisResult.periodizationSuggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                          <span className="text-green-500 mt-1 text-xs">🤖</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upload de Arquivo (Funcionalidade Futura) */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-purple-500" />
              <span>Upload de Arquivo de Periodização</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Funcionalidade em Desenvolvimento
              </h3>
              <p className="text-gray-600 mb-4">
                Em breve você poderá fazer upload de planilhas de periodização em Excel ou CSV.
              </p>
              <Button variant="outline" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PeriodizationUpload;
