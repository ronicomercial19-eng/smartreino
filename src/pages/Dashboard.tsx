
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Dados simulados para o gráfico de carga interna
  const weeklyData = [
    { day: "Seg", carga: 180 },
    { day: "Ter", carga: 220 },
    { day: "Qua", carga: 160 },
    { day: "Qui", carga: 280 },
    { day: "Sex", carga: 240 },
    { day: "Sab", carga: 320 },
    { day: "Dom", carga: 150 },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard - Sistema 10X
          </h1>
          <p className="text-gray-600">
            Bem-vindo de volta! Vamos treinar hoje?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Sugestão de Treino do Dia */}
          <Card className="col-span-full md:col-span-2">
            <CardHeader>
              <CardTitle className="text-blue-600">🎯 Sugestão de Treino Hoje</CardTitle>
              <CardDescription>Baseado na sua evolução e descanso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Treino 10X - Força e Resistência
                </h3>
                <p className="text-blue-700">
                  Sua carga interna está equilibrada. Recomendamos um treino intenso 
                  focado em membros superiores com 4 exercícios, 10 séries cada.
                </p>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/workout-register")}
              >
                Iniciar Treino Agora
              </Button>
            </CardContent>
          </Card>

          {/* Cards de Estatísticas */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Treinos Esta Semana</p>
                    <p className="text-2xl font-bold text-blue-600">5</p>
                  </div>
                  <div className="text-3xl">💪</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Carga Média Semanal</p>
                    <p className="text-2xl font-bold text-green-600">223</p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gráfico de Carga Interna */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Carga Interna Semanal</CardTitle>
            <CardDescription>
              Acompanhe sua intensidade de treino (PSE × Tempo)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="carga" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => navigate("/workout-register")}
          >
            <span className="text-2xl">📝</span>
            <span>Registrar Treino</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => navigate("/exercises")}
          >
            <span className="text-2xl">🏋️</span>
            <span>Exercícios</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => navigate("/workout-history")}
          >
            <span className="text-2xl">📈</span>
            <span>Histórico</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => navigate("/ai-chat")}
          >
            <span className="text-2xl">🤖</span>
            <span>Chat IA</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
