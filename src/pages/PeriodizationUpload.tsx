
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
  Activity
} from "lucide-react";

const PeriodizationUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "manual">("file");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [recommendedModels, setRecommendedModels] = useState<any[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Verificar tipos de arquivo suportados
      const supportedTypes = ['.txt', '.pdf', '.doc', '.docx'];
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (supportedTypes.includes(fileExtension)) {
        setFile(selectedFile);
        toast({
          title: "Arquivo Carregado!",
          description: `${selectedFile.name} foi carregado com sucesso.`,
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
    if (!file && !manualText.trim()) {
      toast({
        title: "Conteúdo Necessário",
        description: "Por favor, faça upload de um arquivo ou insira o texto da periodização.",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      let periodizationContent = manualText;

      // Se for arquivo, simular extração de texto
      if (file && uploadMode === "file") {
        // Em uma implementação real, você usaria uma biblioteca para extrair texto
        periodizationContent = `Periodização extraída do arquivo: ${file.name}`;
      }

      // Analisar periodização
      const analysis = await periodizationAnalysisService.analyzePeriodization(periodizationContent);
      setAnalysisResult(analysis);

      // Gerar recomendações de modelos
      const models = await periodizationAnalysisService.recommendWorkoutModels(analysis);
      setRecommendedModels(models);

      toast({
        title: "Análise Concluída!",
        description: `Periodização analisada e ${models.length} modelos recomendados.`,
      });

    } catch (error) {
      toast({
        title: "Erro na Análise",
        description: "Ocorreu um erro ao analisar a periodização. Tente novamente.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const acceptRecommendedModel = async (model: any) => {
    // Salvar modelo aceito
    const acceptedModels = JSON.parse(localStorage.getItem("acceptedWorkoutModels") || "[]");
    const modelToSave = {
      ...model,
      acceptedAt: new Date().toISOString(),
      periodizationId: analysisResult?.id
    };
    
    acceptedModels.push(modelToSave);
    localStorage.setItem("acceptedWorkoutModels", JSON.stringify(acceptedModels));

    toast({
      title: "Modelo Aceito!",
      description: `O modelo "${model.name}" foi adicionado ao seu plano.`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "bg-red-100 text-red-800";
      case "media": return "bg-yellow-100 text-yellow-800";
      case "baixa": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
            Faça upload da sua periodização e receba modelos de treino personalizados
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
                            {(file.size / 1024).toFixed(1)} KB
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
                        placeholder="Cole aqui o conteúdo da sua periodização..."
                        rows={8}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                <Button 
                  onClick={analyzePeriodization}
                  disabled={isAnalyzing || (!file && !manualText.trim())}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analisar Periodização
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="font-medium">Analisando Periodização...</span>
                    </div>
                    <Progress value={65} className="w-full" />
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>✓ Processando conteúdo</p>
                      <p>✓ Identificando fases</p>
                      <p className="animate-pulse">🔄 Gerando recomendações...</p>
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
                          <p className="text-sm text-gray-600">Duração</p>
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

                    {analysisResult.phases && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Fases Identificadas:</p>
                        <div className="space-y-2">
                          {analysisResult.phases.map((phase: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="font-medium">{phase.name}</span>
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
                        <span>Modelos Recomendados</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recommendedModels.map((model, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{model.name}</h4>
                              <p className="text-sm text-gray-600">{model.description}</p>
                            </div>
                            <Badge className={getPriorityColor(model.recommendationScore)}>
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
                              <span>{model.phase}</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-1">Justificativa da IA:</p>
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
                            Aceitar Modelo
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
                  <p className="text-gray-500">
                    Faça upload da sua periodização para receber recomendações personalizadas
                  </p>
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
