import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Save, Check, AlertCircle, User, Target, Calendar, 
  Activity, Shield, Bell, Palette, Globe
} from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { userSettingsSchema, UserSettingsData } from "@/schemas/userProfileSchema";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { logger } from "@/utils/logger";

export default function UserSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { handleError, asyncHandler } = useErrorHandler();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    height: '',
    weight: '',
    primaryGoal: '',
    experienceLevel: '',
    trainingEnvironment: '',
    injuriesLimitations: '',
    // Preferences
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    theme: 'system',
    notifications: {
      workouts: true,
      progress: true,
      achievements: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'private',
      shareProgress: false,
      dataAnalytics: true
    }
  });

  const loadProfile = asyncHandler(async () => {
    logger.info('Carregando configurações do usuário');
    const userProfile = await authService.getCurrentUserProfile();
    
    if (userProfile) {
      setProfile(userProfile);
      setFormData(prev => ({
        ...prev,
        name: userProfile.name || '',
        email: userProfile.email || '',
        age: userProfile.age?.toString() || '',
        primaryGoal: userProfile.primaryGoal || '',
        experienceLevel: userProfile.experienceLevel || ''
      }));
    }
  }, 'Carregar configurações');

  useEffect(() => {
    loadProfile().finally(() => setLoading(false));
  }, []);

  const handleSave = asyncHandler(async (section: string) => {
    logger.info(`Salvando seção: ${section}`);
    
    if (section === 'profile') {
      // Validar dados do perfil
      const result = userSettingsSchema.safeParse(formData);
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach(error => {
          errors[error.path[0] as string] = error.message;
        });
        setValidationErrors(errors);
        throw new Error('Dados inválidos. Verifique os campos destacados.');
      }
      
      setValidationErrors({});
      setSaving(true);
      
      await authService.updateUserProfile({
        name: formData.name,
        age: parseInt(formData.age) || undefined,
        primaryGoal: formData.primaryGoal,
        experienceLevel: formData.experienceLevel
      });
    }
    
    toast({
      title: "Configurações salvas",
      description: "Suas alterações foram salvas com sucesso.",
    });
  }, 'Salvar configurações');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro de validação quando o usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData(prev => {
      const sectionData = prev[section as keyof typeof prev] as any;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value
        }
      };
    });
  };

  const finalHandleSave = async (section: string) => {
    try {
      await handleSave(section);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Configurações">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  const sections = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'goals', label: 'Objetivos', icon: Target },
    { id: 'preferences', label: 'Preferências', icon: Palette },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'about', label: 'Sobre', icon: Globe }
  ];

  return (
    <PageLayout 
      title="Configurações"
      subtitle="Gerencie sua conta e preferências de treinamento"
    >

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seções</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeSection === section.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="md:col-span-2">
          {activeSection === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                      className={validationErrors.name ? 'border-destructive' : ''}
                    />
                    {validationErrors.name && (
                      <p className="text-xs text-destructive">{validationErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="175"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="70"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <Button onClick={() => finalHandleSave('profile')} disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Salvando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Salvar Alterações
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'goals' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objetivos de Treinamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryGoal">Objetivo Principal</Label>
                  <Select value={formData.primaryGoal} onValueChange={(value) => handleInputChange('primaryGoal', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                      <SelectItem value="perda-peso">Perda de Peso</SelectItem>
                      <SelectItem value="forca">Ganho de Força</SelectItem>
                      <SelectItem value="resistencia">Resistência</SelectItem>
                      <SelectItem value="condicionamento">Condicionamento Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Nível de Experiência</Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainingEnvironment">Ambiente de Treino</Label>
                  <Select value={formData.trainingEnvironment} onValueChange={(value) => handleInputChange('trainingEnvironment', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Onde você treina?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academia">Academia</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="parque">Parque/Ar Livre</SelectItem>
                      <SelectItem value="misto">Misto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="injuries">Lesões ou Limitações</Label>
                  <Textarea
                    id="injuries"
                    value={formData.injuriesLimitations}
                    onChange={(e) => handleInputChange('injuriesLimitations', e.target.value)}
                    placeholder="Descreva qualquer lesão ou limitação que devemos considerar..."
                    rows={3}
                  />
                </div>

                <Button onClick={() => finalHandleSave('goals')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Objetivos
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lembretes de Treino</p>
                      <p className="text-sm text-muted-foreground">Receba notificações para seus treinos agendados</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.workouts}
                      onChange={(e) => handleNestedChange('notifications', 'workouts', e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Relatórios de Progresso</p>
                      <p className="text-sm text-muted-foreground">Receba resumos semanais do seu progresso</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.progress}
                      onChange={(e) => handleNestedChange('notifications', 'progress', e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Conquistas</p>
                      <p className="text-sm text-muted-foreground">Seja notificado quando alcançar novos marcos</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.achievements}
                      onChange={(e) => handleNestedChange('notifications', 'achievements', e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing</p>
                      <p className="text-sm text-muted-foreground">Receba dicas e novidades sobre treinos</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.marketing}
                      onChange={(e) => handleNestedChange('notifications', 'marketing', e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </div>
                </div>

                <Button onClick={() => finalHandleSave('notifications')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === 'about' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Sobre o TrainSync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Versão 2.0.1
                  </Badge>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">TrainSync Pro</h3>
                    <p className="text-muted-foreground">
                      Plataforma avançada de gerenciamento de treinos com inteligência artificial.
                    </p>
                  </div>

                  <div className="bg-muted rounded-lg p-6 space-y-3">
                    <h4 className="font-medium">Funcionalidades Implementadas</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Gerenciamento de estudantes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Modelos de treino personalizados</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Análise de periodização</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Analytics avançados</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Sistema de autenticação</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Políticas de segurança RLS</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>© 2024 TrainSync. Desenvolvido com React, TypeScript e Supabase.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}