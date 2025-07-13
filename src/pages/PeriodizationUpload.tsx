
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
import { periodizationAnalysisService } from "@/services/periodizationAnalysisService";
import { toast } from "@/components/ui/use-toast";
import { 
  Upload, 
  FileText, 
  Calendar, 
  Target, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from "lucide-react";

const PeriodizationUpload = () => {
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simular análise de periodização
      const analysis = periodizationAnalysisService.analyzePeriodization(formData);
      setAnalysisResult(analysis);
      
      toast({
        title: "Análise Concluída!",
        description: "A periodização foi analisada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na Análise",
        description: "Ocorreu um erro ao analisar a periodização.",
      });
    } finally {
      setIsAnalyzing(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Upload de Periodização
          </h1>
          <p className="text-gray-600">
            Faça upload ou configure a periodização dos seus alunos
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
                  <Label htmlFor="objetivo">Objetivo Principal</Label>
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
                  <Label htmlFor="nivel">Nível do Aluno</Label>
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

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analisando...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analisar Periodização
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
                  <span>Análise de Periodização</span>
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
                    <span>Modelos Recomendados</span>
                  </h4>
                  
                  {analysisResult.recommendedModels && analysisResult.recommendedModels.length > 0 ? (
                    <div className="space-y-2">
                      {analysisResult.recommendedModels.slice(0, 3).map((model: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{model.name}</h5>
                              <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                              {model.aiReasoning && (
                                <p className="text-xs text-blue-600 mt-2 italic">
                                  💡 {model.aiReasoning}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="ml-2">
                              {model.recommendationScore}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhum modelo específico recomendado para estes parâmetros.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Sugestões de Periodização</h4>
                  {analysisResult.periodizationSuggestions && (
                    <ul className="space-y-1 text-sm text-gray-700">
                      {analysisResult.periodizationSuggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
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
