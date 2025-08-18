
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { User, Mail, Phone, Calendar, Ruler, Weight, Target, Activity } from "lucide-react";

interface UserProfile {
  id?: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: string;
  experience_level?: string;
  primary_goal?: string;
  training_environment?: string;
  injuries_limitations?: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile>({
    user_id: '',
    name: '',
    email: '',
    phone: '',
    age: undefined,
    height: undefined,
    weight: undefined,
    gender: '',
    experience_level: 'iniciante',
    primary_goal: '',
    training_environment: 'academia',
    injuries_limitations: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles_extended')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu perfil.",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        // Criar perfil inicial com dados do auth
        setProfile(prev => ({
          ...prev,
          user_id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profileData = {
        ...profile,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles_extended')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) {
        console.error('Erro ao salvar perfil:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar seu perfil.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Carregando perfil...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center space-x-3">
            <User className="h-10 w-10 text-primary" />
            <span>Meu Perfil</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie suas informações pessoais e preferências de treino
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Informações Pessoais */}
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
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={profile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Idade</Label>
                  <Input
                    type="number"
                    min="10"
                    max="100"
                    value={profile.age || ''}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
                    placeholder="25"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gênero</Label>
                  <Select 
                    value={profile.gender || ''} 
                    onValueChange={(value) => handleInputChange('gender', value)}
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
                    onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || '')}
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
                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || '')}
                    placeholder="70.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferências de Treino */}
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
                  onValueChange={(value) => handleInputChange('experience_level', value)}
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
                  onValueChange={(value) => handleInputChange('primary_goal', value)}
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
                  onValueChange={(value) => handleInputChange('training_environment', value)}
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
            onClick={handleSave}
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
      </div>
    </div>
  );
};

export default Profile;
