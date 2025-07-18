import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserContext } from "@/hooks/useUserContext";
import { contextualAI } from "@/services/contextualAIService";
import { getWorkoutStats, getRecentWorkouts, getUserAISuggestions } from "@/data/mockData";
import { Brain, TrendingUp, Zap, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userProfile, loading } = useUserProfile();
  const { userContext } = useUserContext();
  const [workoutStats, setWorkoutStats] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);

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
      return;
    }

    if (userProfile) {
      // Carregar estatísticas específicas do usuário
      const stats = getWorkoutStats(userProfile.id);
      const recent = getRecentWorkouts(5, userProfile.id);
      const suggestions = getUserAISuggestions(userProfile.id);
      
      setWorkoutStats(stats);
      setRecentWorkouts(recent);
      setAiSuggestions(suggestions);
    }
  }, [navigate, userProfile]);

  // Gerar análise contextual quando userContext estiver disponível
  useEffect(() => {
    if (userContext) {
      const analysis = contextualAI.analyzeUser(userContext);
      setAiAnalysis(analysis);
    }
  }, [userContext]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'motivated': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'progressing': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'plateaued': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'struggling': return 'bg-red-500/20 text-red-600 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getStateEmoji = (state: string) => {
    switch (state) {
      case 'motivated': return '🔥';
      case 'progressing': return '📈';
      case 'plateaued': return '⚖️';
      case 'struggling': return '💪';
      default: return '🎯';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Olá, {userProfile.name}! 👋
              </h1>
              <p className="text-gray-600">
                {workoutStats 
                  ? `${workoutStats.totalWorkouts} treinos realizados • PSE médio: ${workoutStats.averagePSE}`
                  : "Vamos começar sua jornada fitness?"
                }
              </p>
            </div>
            {aiAnalysis && (
              <Badge className={getStateColor(aiAnalysis.userState)}>
                {getStateEmoji(aiAnalysis.userState)} {aiAnalysis.userState}
              </Badge>
            )}
          </div>
        </div>

        {/* Análise da IA Contextual */}
        {aiAnalysis && (
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-600 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Análise Inteligente
              </CardTitle>
              <CardDescription>
                Insights personalizados baseados no seu histórico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">💬 Mensagem Motivacional</h4>
                  <p className="text-purple-700 text-sm">{aiAnalysis.motivationalMessage}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">🎯 Próximo Treino Sugerido</h4>
                  <p className="text-purple-700 text-sm">{aiAnalysis.nextWorkoutSuggestion}</p>
                </div>
              </div>
              
              {aiAnalysis.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-sm text-orange-800">{aiAnalysis.warnings[0]}</span>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <Button 
                  onClick={() => navigate("/ai-chat")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Chat Contextual
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Sugestão de Treino do Dia */}
          <Card className="col-span-full md:col-span-2">
            <CardHeader>
              <CardTitle className="text-blue-600">🎯 Sugestão de Treino Hoje</CardTitle>
              <CardDescription>
                Baseado no seu perfil: {userProfile.level} • {userProfile.objective}
                {aiAnalysis && ` • Estado: ${aiAnalysis.userState}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  {aiAnalysis ? aiAnalysis.nextWorkoutSuggestion.split(':')[0] : 
                   userProfile.level === 'iniciante' 
                    ? 'Treino Corporal - Fundamentos'
                    : userProfile.level === 'intermediario'
                    ? 'Treino 10X - Força e Resistência'
                    : 'Treino 10X - Alta Intensidade'
                  }
                </h3>
                <p className="text-blue-700">
                  {aiAnalysis ? 
                    aiAnalysis.nextWorkoutSuggestion.includes(':') ? 
                      aiAnalysis.nextWorkoutSuggestion.split(':').slice(1).join(':').trim() :
                      aiAnalysis.nextWorkoutSuggestion
                    : userProfile.level === 'iniciante'
                    ? 'Vamos começar com movimentos básicos para construir uma base sólida.'
                    : workoutStats?.averageLoad && workoutStats.averageLoad > 300
                    ? 'Sua carga está alta. Que tal um treino de recuperação ativa hoje?'
                    : 'Você está progredindo bem! Vamos intensificar o treino hoje.'
                  }
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
                    <p className="text-2xl font-bold text-blue-600">
                      {userContext?.performanceMetrics.weeklyFrequency || recentWorkouts.filter(w => {
                        const workoutDate = new Date(w.date);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return workoutDate >= weekAgo;
                      }).length}
                    </p>
                  </div>
                  <div className="text-3xl">💪</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">PSE Médio</p>
                    <p className="text-2xl font-bold text-green-600">
                      {userContext?.performanceMetrics.averagePSE.toFixed(1) || workoutStats?.averagePSE || 0}
                    </p>
                  </div>
                  <div className="text-3xl">
                    {userContext?.performanceMetrics.progressTrend === 'improving' ? '📈' : 
                     userContext?.performanceMetrics.progressTrend === 'declining' ? '📉' : '📊'}
                  </div>
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

        {/* Recomendações da IA Contextual */}
        {aiAnalysis && aiAnalysis.recommendations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-purple-600 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recomendações Personalizadas
              </CardTitle>
              <CardDescription>
                Sugestões baseadas na análise do seu progresso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiAnalysis.recommendations.slice(0, 3).map((recommendation, index) => (
                  <div key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="flex items-start">
                      <Zap className="h-4 w-4 text-purple-600 mr-2 mt-0.5" />
                      <p className="text-sm text-purple-800">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ações Rápidas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🚀 Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente todas as funcionalidades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Treino */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
                onClick={() => navigate("/workout-register")}
              >
                <span className="text-2xl">📝</span>
                <span className="text-sm font-medium">Registrar Treino</span>
              </Button>
              
              {/* Periodização */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 hover:from-orange-100 hover:to-red-100"
                onClick={() => navigate("/periodization-upload")}
              >
                <span className="text-2xl">📊</span>
                <span className="text-sm font-medium">Periodização</span>
              </Button>
              
              {/* Modelos de Treino */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-green-50 to-teal-50 border-green-200 hover:from-green-100 hover:to-teal-100"
                onClick={() => navigate("/workout-models")}
              >
                <span className="text-2xl">🎯</span>
                <span className="text-sm font-medium">Modelos</span>
              </Button>
              
              {/* Banco de Modelos */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 hover:from-yellow-100 hover:to-amber-100"
                onClick={() => navigate("/workout-models-database")}
              >
                <span className="text-2xl">🗄️</span>
                <span className="text-sm font-medium">Banco Modelos</span>
              </Button>
              
              {/* Exercícios */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200 hover:from-pink-100 hover:to-rose-100"
                onClick={() => navigate("/exercises")}
              >
                <span className="text-2xl">🏋️</span>
                <span className="text-sm font-medium">Exercícios</span>
              </Button>
              
              {/* Histórico */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 hover:from-cyan-100 hover:to-blue-100"
                onClick={() => navigate("/workout-history")}
              >
                <span className="text-2xl">📈</span>
                <span className="text-sm font-medium">Histórico</span>
              </Button>
              
              {/* Chat IA */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
                onClick={() => navigate("/ai-chat")}
              >
                <span className="text-2xl">🤖</span>
                <span className="text-sm font-medium">Chat IA</span>
              </Button>
              
              {/* Configuração IA */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 hover:from-slate-100 hover:to-gray-100"
                onClick={() => navigate("/ai-config")}
              >
                <span className="text-2xl">⚙️</span>
                <span className="text-sm font-medium">Config IA</span>
              </Button>
              
              {/* Gestão de Alunos */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 hover:from-indigo-100 hover:to-purple-100"
                onClick={() => navigate("/admin-students")}
              >
                <span className="text-2xl">👥</span>
                <span className="text-sm font-medium">Gestão Alunos</span>
              </Button>
              
              {/* Interface do Aluno */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 hover:from-emerald-100 hover:to-green-100"
                onClick={() => navigate("/student-interface")}
              >
                <span className="text-2xl">🎓</span>
                <span className="text-sm font-medium">Interface Aluno</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
