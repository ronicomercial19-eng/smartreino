import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/shared/PageLayout";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { User, Activity } from "lucide-react";
import { userProfileSchema, UserProfileData } from "@/schemas/userProfileSchema";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { logger } from "@/utils/logger";

const Profile = () => {
  const [profile, setProfile] = useState<UserProfileData>({
    name: '',
    email: '',
    phone: '',
    age: undefined,
    height: undefined,
    weight: undefined,
    gender: undefined,
    experience_level: 'iniciante',
    primary_goal: undefined,
    training_environment: 'academia',
    injuries_limitations: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { handleError, asyncHandler } = useErrorHandler();

  useEffect(() => {
    loadProfile().finally(() => setLoading(false));
  }, []);

  const loadProfile = asyncHandler(async () => {
    logger.info('Carregando perfil do usuário');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profiles_extended')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao carregar perfil: ${error.message}`);
    }

    if (data) {
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        age: data.age || undefined,
        height: data.height || undefined,
        weight: data.weight || undefined,
        gender: (data.gender as any) || undefined,
        experience_level: (data.experience_level as any) || 'iniciante',
        primary_goal: (data.primary_goal as any) || undefined,
        training_environment: (data.training_environment as any) || 'academia',
        injuries_limitations: data.injuries_limitations || ''
      });
    } else {
      setProfile(prev => ({
        ...prev,
        email: user.email || '',
        name: user.user_metadata?.name || ''
      }));
    }
  }, 'Carregar perfil');

  const handleSave = asyncHandler(async () => {
    logger.info('Salvando perfil do usuário');
    
    const result = userProfileSchema.safeParse(profile);
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const profileData = {
      ...profile,
      user_id: user.id,
      updated_at: new Date().toISOString()
    } as any;

    const { error } = await supabase
      .from('user_profiles_extended')
      .upsert([profileData], { onConflict: 'user_id' });

    if (error) {
      throw new Error(`Erro ao salvar perfil: ${error.message}`);
    }

    toast({
      title: "Sucesso",
      description: "Perfil atualizado com sucesso!",
    });
  }, 'Salvar perfil');

  const handleInputChange = (field: string, value: string | number | undefined) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const finalHandleSave = async () => {
    try {
      await handleSave();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Meu Perfil">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Meu Perfil"
      subtitle="Gerencie suas informações pessoais e preferências de treino"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Informações Pessoais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome completo"
                className={validationErrors.name ? 'border-destructive' : ''}
              />
              {validationErrors.name && (
                <p className="text-xs text-destructive">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={profile.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className={validationErrors.email ? 'border-destructive' : ''}
              />
              {validationErrors.email && (
                <p className="text-xs text-destructive">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={profile.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                className={validationErrors.phone ? 'border-destructive' : ''}
              />
              {validationErrors.phone && (
                <p className="text-xs text-destructive">{validationErrors.phone}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Idade</Label>
                <Input
                  type="number"
                  min="10"
                  max="100"
                  value={profile.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || undefined)}
                  placeholder="25"
                />
              </div>

              <div className="space-y-2">
                <Label>Gênero</Label>
                <Select 
                  value={profile.gender || ''} 
                  onValueChange={(value) => handleInputChange('gender', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <Input
                  type="number"
                  min="100"
                  max="250"
                  value={profile.height || ''}
                  onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || undefined)}
                  placeholder="175"
                />
              </div>

              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={profile.weight || ''}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || undefined)}
                  placeholder="70.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Preferências de Treino</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nível de Experiência</Label>
              <Select 
                value={profile.experience_level || ''} 
                onValueChange={(value) => handleInputChange('experience_level', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">🌱 Iniciante</SelectItem>
                  <SelectItem value="intermediario">🚀 Intermediário</SelectItem>
                  <SelectItem value="avancado">🏆 Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Objetivo Principal</Label>
              <Select 
                value={profile.primary_goal || ''} 
                onValueChange={(value) => handleInputChange('primary_goal', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hipertrofia">🏋️ Hipertrofia</SelectItem>
                  <SelectItem value="forca">💪 Força</SelectItem>
                  <SelectItem value="potencia">⚡ Potência</SelectItem>
                  <SelectItem value="resistencia">🏃 Resistência</SelectItem>
                  <SelectItem value="perda-peso">🔥 Perda de Peso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ambiente de Treino</Label>
              <Select 
                value={profile.training_environment || ''} 
                onValueChange={(value) => handleInputChange('training_environment', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Onde você treina?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academia">🏢 Academia</SelectItem>
                  <SelectItem value="casa">🏠 Casa</SelectItem>
                  <SelectItem value="ar-livre">🌳 Ar Livre</SelectItem>
                  <SelectItem value="misto">🔄 Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Limitações/Lesões</Label>
              <Textarea
                value={profile.injuries_limitations || ''}
                onChange={(e) => handleInputChange('injuries_limitations', e.target.value)}
                placeholder="Descreva qualquer lesão, limitação ou restrição médica..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={finalHandleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
              Salvando...
            </>
          ) : (
            'Salvar Perfil'
          )}
        </Button>
      </div>
    </PageLayout>
  );
};

export default Profile;