
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { periodizationAnalysisService } from "@/services/periodizationAnalysisService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/components/ui/use-toast";
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Target,
  TrendingUp,
  Activity,
  Loader2
} from "lucide-react";

const PeriodizationUpload = () => {
  const { userProfile } = useUserProfile();
  const [file, setFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "manual">("manual");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [recommendedModels, setRecommendedModels] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const supportedTypes = ['.txt', '.pdf', '.doc', '.docx'];
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (supportedTypes.includes(fileExtension)) {
        setFile(selectedFile);
        
        // Simular leitura do arquivo para texto
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setManualText(content.substring(0, 2000)); // Limitar tamanho
        };
        reader.readAsText(selectedFile);
        
        toast({
          title: "Arquivo Carregado!",
          description: `${selectedFile.name} foi processado com sucesso.`,
        });
      } else {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Por favor, use arquivos .txt, .pdf, .doc ou .docx",
        });
      }
    }
  };

  const analyzePeriodization = async () => {
    if ((!file && !manualText.trim()) || !userProfile) {
      toast({
        title: "Conteúdo Necessário",
        description: "Por favor, insira o conteúdo da periodização e faça login.",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Simular progresso
      const progressSteps = [
        { step: 20, message: "Processando conteúdo..." },
        { step: 40, message: "Identificando fases..." },
        { step: 60, message: "Analisando objetivos..." },
        { step: 80, message: "Gerando recomendações..." },
        { step: 100, message: "Finalizando análise..." }
      ];

      for (const { step, message } of progressSteps) {
        setProgress(step);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      let periodizationContent = manualText.trim();

      // Se for arquivo, usar o conteúdo já extraído
      if (file && uploadMode === "file" && !periodizationContent) {
        periodizationContent = `Conteúdo extraído do arquivo: ${file.name}\n\nDetalhes da periodização serão analisados automaticamente.`;
      }

      console.log('Iniciando análise com conteúdo:', periodizationContent.substring(0, 200));

      // Analisar periodização
      const analysis = await periodizationAnalysisService.analyzePeriodization(
        periodizationContent, 
        userProfile.id
      );
      
      setAnalysisResult(analysis);

      // Gerar recomendações
      const models = await periodizationAnalysisService.recommendWorkoutModels(analysis);
      setRecommendedModels(models);

      toast({
        title: "Análise Concluída!",
        description: `Periodização analisada e ${models.length} modelos únicos gerados para você.`,
      });

    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na Análise",
        description: "Ocorreu um erro ao analisar a periodização. Verifique o conteúdo e tente novamente.",
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const acceptRecommendedModel = async (model: any) => {
    if (!userProfile) return;

    try {
      // Salvar modelo aceito na biblioteca do usuário
      const userModelsKey = `userWorkoutModels_${userProfile.id}`;
      const acceptedModels = JSON.parse(localStorage.getItem(userModelsKey) || "[]");
      
      const modelToSave = {
        ...model,
        acceptedAt: new Date().toISOString(),
        periodizationId: analysisResult?.id,
        status: 'accepted'
      };
      
      // Verificar se já existe
      const exists = acceptedModels.some((existing: any) => existing.id === model.id);
      
      if (!exists) {
        acceptedModels.push(modelToSave);
        localStorage.setItem(userModelsKey, JSON.stringify(acceptedModels));

        toast({
          title: "Modelo Aceito!",
          description: `O modelo "${model.name}" foi adicionado ao seu plano.`,
        });
      } else {
        toast({
          title: "Modelo já aceito",
          description: "Este modelo já está na sua biblioteca.",
        });
      }
    } catch (error) {
      console.error('Erro ao aceitar modelo:', error);
      toast({
        title: "Erro ao Aceitar Modelo",
        description: "Não foi possível salvar o modelo.",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "bg-red-100 text-red-800";
      case "media": return "bg-yellow-100 text-yellow-800";
      case "baixa": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRecommendationColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Upload de Periodização
          </h1>
          <p className="text-gray-600">
            Faça upload da sua periodização e receba modelos de treino únicos e personalizados
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-blue-500" />
                  <span>Upload da Periodização</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode Selection */}
                <div className="flex space-x-2">
                  <Button
                    variant={uploadMode === "file" ? "default" : "outline"}
                    onClick={() => setUploadMode("file")}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Arquivo
                  </Button>
                  <Button
                    variant={uploadMode === "manual" ? "default" : "outline"}
                    onClick={() => setUploadMode("manual")}
                    className="flex-1"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Texto Manual
                  </Button>
                </div>

                {uploadMode === "file" ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Arquivo da Periodização</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos suportados: .txt, .pdf, .doc, .docx
                      </p>
                    </div>

                    {file && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-green-800">{file.name}</p>
                          <p className="text-sm text-green-600">
                            {(file.size / 1024).toFixed(1)} KB - Conteúdo extraído
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="manual-text">Conteúdo da Periodização</Label>
                      <Textarea
                        id="manual-text"
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        placeholder="Cole aqui o conteúdo da sua periodização...

Exemplo:
- Periodização de 12 semanas
- Objetivo: hipertrofia muscular  
- Fase 1 (4 semanas): adaptação anatômica
- Fase 2 (6 semanas): desenvolvimento hipertrófico
- Fase 3 (2 semanas): definição
- Frequência: 4x por semana
- Grupos prioritários: peitoral, dorsais, quadríceps"
                        rows={12}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {manualText.length}/2000 caracteres
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={analyzePeriodization}
                  disabled={isAnalyzing || (!file && !manualText.trim()) || !userProfile}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analisar e Gerar Modelos
                    </>
                  )}
                </Button>

                {!userProfile && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <p className="text-sm text-amber-800">
                        Faça login para gerar modelos personalizados únicos
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                      <span className="font-medium">Processando sua Periodização...</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    <div className="text-sm text-gray-600 space-y-1">
                      {progress >= 20 && <p>✓ Conteúdo processado</p>}
                      {progress >= 40 && <p>✓ Fases identificadas</p>}
                      {progress >= 60 && <p>✓ Objetivos analisados</p>}
                      {progress >= 80 && <p>✓ Modelos sendo gerados...</p>}
                      {progress >= 100 && <p>✓ Análise concluída!</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {analysisResult && (
              <>
                {/* Analysis Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>Análise da Periodização</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Duração Total</p>
                          <p className="font-semibold">{analysisResult.totalWeeks} semanas</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-600">Fases</p>
                          <p className="font-semibold">{analysisResult.phases?.length || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Objetivo Principal:</p>
                      <Badge className="bg-blue-100 text-blue-800">
                        {analysisResult.mainObjective}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Confiança da Análise:</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={analysisResult.confidence} className="flex-1" />
                        <Badge className={getRecommendationColor(analysisResult.confidence)}>
                          {analysisResult.confidence}%
                        </Badge>
                      </div>
                    </div>

                    {analysisResult.phases && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Fases Identificadas:</p>
                        <div className="space-y-2">
                          {analysisResult.phases.map((phase: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium">{phase.name}</span>
                                <p className="text-xs text-gray-600">{phase.duration} semanas - {phase.objective}</p>
                              </div>
                              <Badge className={getPriorityColor(phase.priority)}>
                                {phase.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recommended Models */}
                {recommendedModels.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span>Modelos Únicos Gerados</span>
                        <Badge variant="secondary">{recommendedModels.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recommendedModels.map((model, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{model.name}</h4>
                              <p className="text-sm text-gray-600">{model.description}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {model.phase}
                              </Badge>
                            </div>
                            <Badge className={getRecommendationColor(model.recommendationScore)}>
                              {model.recommendationScore}% compatível
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                            <div className="flex items-center space-x-1">
                              <Activity className="h-3 w-3 text-blue-500" />
                              <span>{model.duration} min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="h-3 w-3 text-purple-500" />
                              <span>PSE {model.targetPSE}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3 text-green-500" />
                              <span>{model.muscleGroups.length} grupos</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-1">Recomendação Personalizada:</p>
                            <p className="text-sm bg-blue-50 p-2 rounded text-blue-800">
                              {model.aiReasoning}
                            </p>
                          </div>

                          <Button 
                            onClick={() => acceptRecommendedModel(model)}
                            className="w-full bg-green-500 hover:bg-green-600"
                            size="sm"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Aceitar e Salvar Modelo
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!analysisResult && !isAnalyzing && (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Aguardando Análise
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Insira o conteúdo da sua periodização para receber modelos únicos e personalizados
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>✓ Análise inteligente por IA</p>
                    <p>✓ Modelos únicos para seu perfil</p>
                    <p>✓ Recomendações personalizadas</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodizationUpload;
