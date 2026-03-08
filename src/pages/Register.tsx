
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    objective: "",
    level: "",
    accountType: "" as "professor" | "student" | "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountType) {
      toast({
        title: "Erro no cadastro",
        description: "Selecione o tipo de conta",
        variant: "destructive",
      });
      return;
    }

    if (!Object.entries(formData).every(([_, value]) => value !== "")) {
      toast({
        title: "Erro no cadastro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name: formData.name,
            age: parseInt(formData.age),
            objective: formData.objective,
            level: formData.level,
            user_type: formData.accountType,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Insert role into user_roles table
        const roleToInsert = formData.accountType === 'professor' ? 'professor' : 'user';
        const { error: roleError } = await supabase
          .from('user_roles' as any)
          .upsert({
            user_id: data.user.id,
            role: roleToInsert,
          }, { onConflict: 'user_id,role' });

        if (roleError) {
          console.error('Erro ao inserir role:', roleError);
        }

        // Create extended profile
        const { error: profileError } = await supabase
          .from('user_profiles_extended')
          .insert({
            user_id: data.user.id,
            name: formData.name,
            email: formData.email,
            age: parseInt(formData.age),
            primary_goal: formData.objective,
            experience_level: formData.level,
            user_type: formData.accountType,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        toast({
          title: "Cadastro realizado com sucesso!",
          description: formData.accountType === 'professor' 
            ? "Bem-vindo, Professor! Você já pode gerenciar seus alunos."
            : "Bem-vindo! Acesse seus treinos na interface do aluno.",
        });
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-zinc-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 glass">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
            <span className="text-white text-2xl font-bold font-heading">9</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold font-heading gradient-text">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Cadastre-se para começar seus treinos
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="accountType">Tipo de Conta</Label>
              <Select 
                onValueChange={(value) => handleInputChange("accountType", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professor">
                    👨‍🏫 Professor / Personal Trainer
                  </SelectItem>
                  <SelectItem value="student">
                    🏋️ Aluno
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Seu nome completo"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Crie uma senha"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                placeholder="Sua idade"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo</Label>
              <Input
                id="objective"
                value={formData.objective}
                onChange={(e) => handleInputChange("objective", e.target.value)}
                placeholder="Ex: Ganhar massa, Emagrecer..."
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Nível de Experiência</Label>
              <Select 
                onValueChange={(value) => handleInputChange("level", value)}
                disabled={loading}
              >
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
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Faça login aqui
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
