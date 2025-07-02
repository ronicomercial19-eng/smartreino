
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { initializeMockData, mockUserProfiles } from "@/data/mockData";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email && password) {
      // Buscar perfil existente ou criar um novo
      const existingProfile = mockUserProfiles.find(profile => profile.email === email);
      
      const userProfile = existingProfile || {
        id: Date.now().toString(),
        email,
        loggedIn: true,
        name: email.split('@')[0] || "Usuário",
        level: "intermediario" as const,
        objective: "Melhoria da forma física",
        age: 25
      };

      // Inicializa dados mock para demonstração
      initializeMockData();
      
      localStorage.setItem("user", JSON.stringify(userProfile));
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo ${userProfile.name}!`,
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Erro no login",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
    }
  };

  const handleDemoLogin = () => {
    // Login de demonstração com perfil completo
    initializeMockData();
    
    const demoUser = {
      id: "demo-user",
      email: "demo@10xtraining.com", 
      loggedIn: true,
      name: "Usuário Demo",
      level: "intermediario",
      objective: "Teste da aplicação",
      age: 25
    };
    
    localStorage.setItem("user", JSON.stringify(demoUser));
    
    toast({
      title: "Modo demonstração ativado!",
      description: "Explore todas as funcionalidades com dados de exemplo",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">
            Sistema de Treino 10X
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
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Entrar
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
          >
            🚀 Entrar no Modo Demonstração
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
