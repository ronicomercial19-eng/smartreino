
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageLayout } from "@/components/shared/PageLayout";
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

const AIConfig = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem("ai-settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof AISettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <PageLayout title="⚙️ Configurações de IA" subtitle="Personalize como a inteligência artificial funciona">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funcionalidades Principais */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5" />
                Funcionalidades Principais
              </CardTitle>
              <CardDescription>Ative ou desative as principais funcionalidades de IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Chat com IA</Label>
                  <p className="text-xs text-muted-foreground">Assistente inteligente para dúvidas</p>
                </div>
                <Switch checked={settings.chatbotEnabled} onCheckedChange={(v) => handleSettingChange('chatbotEnabled', v)} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Geração de Treinos</Label>
                  <p className="text-xs text-muted-foreground">Treinos personalizados automáticos</p>
                </div>
                <Switch checked={settings.workoutGenerationEnabled} onCheckedChange={(v) => handleSettingChange('workoutGenerationEnabled', v)} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Análise Contextual</Label>
                  <p className="text-xs text-muted-foreground">Insights baseados no seu progresso</p>
                </div>
                <Switch checked={settings.contextualAnalysisEnabled} onCheckedChange={(v) => handleSettingChange('contextualAnalysisEnabled', v)} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Mensagens Motivacionais</Label>
                  <p className="text-xs text-muted-foreground">Incentivos personalizados</p>
                </div>
                <Switch checked={settings.motivationalMessagesEnabled} onCheckedChange={(v) => handleSettingChange('motivationalMessagesEnabled', v)} />
              </div>
            </CardContent>
          </Card>

          {/* Personalização */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Target className="h-5 w-5" />
                Personalização
              </CardTitle>
              <CardDescription>Ajuste como a IA se comunica e gera conteúdo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Intensidade Preferida: {settings.intensityPreference}/10
                </Label>
                <Slider value={[settings.intensityPreference]} onValueChange={(v) => handleSettingChange('intensityPreference', v[0])} max={10} min={1} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Suave</span><span>Moderado</span><span>Intenso</span>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium mb-2 block">Estilo de Resposta</Label>
                <Select value={settings.responseStyle} onValueChange={(v: any) => handleSettingChange('responseStyle', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Select value={settings.workoutComplexity} onValueChange={(v: any) => handleSettingChange('workoutComplexity', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simples">Simples e Direto</SelectItem>
                    <SelectItem value="intermediario">Equilibrado</SelectItem>
                    <SelectItem value="avancado">Complexo e Detalhado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Análises */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Activity className="h-5 w-5" />
                Análises e Insights
              </CardTitle>
              <CardDescription>Configure a frequência e tipo de análises</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Frequência de Análise</Label>
                <Select value={settings.analysisFrequency} onValueChange={(v: any) => handleSettingChange('analysisFrequency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Semanal (Baixa)</SelectItem>
                    <SelectItem value="moderada">A cada 3 dias (Moderada)</SelectItem>
                    <SelectItem value="alta">Diária (Alta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <MessageSquare className="h-5 w-5" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {['Chat IA', 'Treinos IA', 'Análises', 'Contexto'].map((name) => (
                  <div key={name} className="bg-muted/50 p-3 rounded-lg border border-border">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Operacional</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8 p-4 bg-card rounded-lg border border-border">
          <div className="flex gap-3">
            <Button variant="outline" onClick={resetToDefaults}>Restaurar Padrões</Button>
            <Button variant="outline" onClick={() => navigate("/ai-chat")}>Testar Chat IA</Button>
          </div>
          <Button onClick={saveSettings} disabled={!hasChanges}>
            {hasChanges ? "Salvar Alterações" : "Configurações Salvas"}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default AIConfig;
