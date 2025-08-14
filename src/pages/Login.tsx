
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro no login",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo!`,
        });
        
        // O redirecionamento será feito automaticamente pelo App.tsx
        // através do useEffect que monitora o estado de autenticação
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Erro ao fazer login. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    
    try {
      // Criar um usuário demo ou fazer login com credenciais demo
      const demoEmail = "demo@trainsync.com";
      const demoPassword = "demo123456";
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error) {
        // Se o usuário demo não existe, vamos criá-lo
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (signUpData.user) {
          toast({
            title: "Usuário demo criado!",
            description: "Fazendo login automaticamente...",
          });
        }
      }

      toast({
        title: "Modo demonstração ativado!",
        description: "Explore todas as funcionalidades com dados de exemplo",
      });
    } catch (error: any) {
      console.error('Erro no login demo:', error);
      toast({
        title: "Erro no modo demo",
        description: error.message || "Erro ao ativar modo demonstração",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">
            TrainSync
          </CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          
          {/* Botão de Demonstração */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou</span>
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            {loading ? "Ativando..." : "🚀 Entrar no Modo Demonstração"}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
