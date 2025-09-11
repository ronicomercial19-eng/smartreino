
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Brain, Settings, Zap, Target, MessageSquare, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AISettings {
  chatbotEnabled: boolean;
  workoutGenerationEnabled: boolean;
  contextualAnalysisEnabled: boolean;
  motivationalMessagesEnabled: boolean;
  intensityPreference: number;
  responseStyle: 'formal' | 'casual' | 'motivacional';
  workoutComplexity: 'simples' | 'intermediario' | 'avancado';
  analysisFrequency: 'baixa' | 'moderada' | 'alta';
}

const AIConfig = () => {
  const navigate = useNavigate();
  const { userProfile, loading } = useUserProfile();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<AISettings>({
    chatbotEnabled: true,
    workoutGenerationEnabled: true,
    contextualAnalysisEnabled: true,
    motivationalMessagesEnabled: true,
    intensityPreference: 6,
    responseStyle: 'motivacional',
    workoutComplexity: 'intermediario',
    analysisFrequency: 'moderada'
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    // Carregar configurações salvas
    const savedSettings = localStorage.getItem("ai-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [navigate]);

  const handleSettingChange = (key: keyof AISettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem("ai-settings", JSON.stringify(settings));
    setHasChanges(false);
    toast({
      title: "Configurações Salvas! ✅",
      description: "Suas preferências de IA foram atualizadas com sucesso.",
    });
  };

  const resetToDefaults = () => {
    const defaultSettings: AISettings = {
      chatbotEnabled: true,
      workoutGenerationEnabled: true,
      contextualAnalysisEnabled: true,
      motivationalMessagesEnabled: true,
      intensityPreference: 6,
      responseStyle: 'motivacional',
      workoutComplexity: 'intermediario',
      analysisFrequency: 'moderada'
    };
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Brain className="h-8 w-8 mr-3 text-purple-600" />
                Configurações de IA
              </h1>
              <p className="text-gray-600">
                Personalize como a inteligência artificial funciona para você
              </p>
            </div>
            <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <Settings className="h-4 w-4 mr-1" />
              {userProfile?.level || 'intermediario'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funcionalidades Principais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Funcionalidades Principais
              </CardTitle>
              <CardDescription>
                Ative ou desative as principais funcionalidades de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Chat com IA</Label>
                  <p className="text-xs text-gray-500">Assistente inteligente para dúvidas</p>
                </div>
                <Switch
                  checked={settings.chatbotEnabled}
                  onCheckedChange={(checked) => handleSettingChange('chatbotEnabled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Geração de Treinos</Label>
                  <p className="text-xs text-gray-500">Treinos personalizados automáticos</p>
                </div>
                <Switch
                  checked={settings.workoutGenerationEnabled}
                  onCheckedChange={(checked) => handleSettingChange('workoutGenerationEnabled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Análise Contextual</Label>
                  <p className="text-xs text-gray-500">Insights baseados no seu progresso</p>
                </div>
                <Switch
                  checked={settings.contextualAnalysisEnabled}
                  onCheckedChange={(checked) => handleSettingChange('contextualAnalysisEnabled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Mensagens Motivacionais</Label>
                  <p className="text-xs text-gray-500">Incentivos personalizados</p>
                </div>
                <Switch
                  checked={settings.motivationalMessagesEnabled}
                  onCheckedChange={(checked) => handleSettingChange('motivationalMessagesEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferências de Personalização */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Personalização
              </CardTitle>
              <CardDescription>
                Ajuste como a IA se comunica e gera conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Intensidade Preferida de Treinos: {settings.intensityPreference}/10
                </Label>
                <Slider
                  value={[settings.intensityPreference]}
                  onValueChange={(value) => handleSettingChange('intensityPreference', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Suave</span>
                  <span>Moderado</span>
                  <span>Intenso</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Estilo de Resposta</Label>
                <Select
                  value={settings.responseStyle}
                  onValueChange={(value: 'formal' | 'casual' | 'motivacional') => 
                    handleSettingChange('responseStyle', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal e Técnico</SelectItem>
                    <SelectItem value="casual">Casual e Amigável</SelectItem>
                    <SelectItem value="motivacional">Motivacional e Energético</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Complexidade dos Treinos</Label>
                <Select
                  value={settings.workoutComplexity}
                  onValueChange={(value: 'simples' | 'intermediario' | 'avancado') => 
                    handleSettingChange('workoutComplexity', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simples">Simples e Direto</SelectItem>
                    <SelectItem value="intermediario">Equilibrado</SelectItem>
                    <SelectItem value="avancado">Complexo e Detalhado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Análises e Monitoramento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Análises e Insights
              </CardTitle>
              <CardDescription>
                Configure a frequência e tipo de análises
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Frequência de Análise</Label>
                <Select
                  value={settings.analysisFrequency}
                  onValueChange={(value: 'baixa' | 'moderada' | 'alta') => 
                    handleSettingChange('analysisFrequency', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Semanal (Baixa)</SelectItem>
                    <SelectItem value="moderada">A cada 3 dias (Moderada)</SelectItem>
                    <SelectItem value="alta">Diária (Alta)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Com que frequência você quer receber insights sobre seu progresso
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status e Informações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Status do Sistema
              </CardTitle>
              <CardDescription>
                Informações sobre os serviços de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-800">Chat IA</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Operacional</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-800">Treinos IA</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Operacional</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-800">Análises</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Operacional</p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-blue-800">Contexto</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Aprendendo</p>
                </div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-purple-800 mb-2">💡 Dica de IA</h4>
                <p className="text-xs text-purple-700">
                  A IA aprende com seus padrões de treino. Quanto mais você usar, 
                  mais personalizadas ficarão as sugestões!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center mt-8 p-4 bg-white rounded-lg border">
          <div>
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="mr-3"
            >
              Restaurar Padrões
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/ai-chat")}
            >
              Testar Chat IA
            </Button>
          </div>
          
          <Button 
            onClick={saveSettings}
            disabled={!hasChanges}
            className={hasChanges ? 
              "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" : 
              ""
            }
          >
            {hasChanges ? "Salvar Alterações" : "Configurações Salvas"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIConfig;
