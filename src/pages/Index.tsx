import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Activity, 
  Brain, 
  Calendar, 
  Dumbbell, 
  Fire, 
  MessageCircle, 
  Target, 
  Timer, 
  TrendingUp,
  Zap
} from "lucide-react";
import WorkoutLogger from "@/components/WorkoutLogger";
import AIChat from "@/components/AIChat";
import ExerciseLibrary from "@/components/ExerciseLibrary";
import PerformanceHistory from "@/components/PerformanceHistory";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const todayWorkout = {
    name: "Treino 10X - Upper Body",
    duration: "45 min",
    exercises: 8,
    focus: "Força e Resistência"
  };

  const weeklyProgress = {
    workouts: 4,
    target: 5,
    calories: 1850,
    internalLoad: 2400
  };

  const aiSuggestion = "Com base na sua carga interna dos últimos 3 dias (PSE médio: 7.2), sugiro um treino moderado hoje. Foque na técnica e mantenha PSE entre 6-7. 💪";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Treino 10X</h1>
                <p className="text-sm text-gray-300">Powered by IA</p>
              </div>
            </div>
            <Avatar>
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                JD
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/30 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500">
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="workout" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500">
              <Dumbbell className="h-4 w-4 mr-2" />
              Treino
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500">
              <Brain className="h-4 w-4 mr-2" />
              IA Coach
            </TabsTrigger>
            <TabsTrigger value="exercises" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500">
              <Target className="h-4 w-4 mr-2" />
              Exercícios
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500">
              <TrendingUp className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            {/* AI Suggestion Card */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-white">Sugestão do Personal IA</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 leading-relaxed">{aiSuggestion}</p>
              </CardContent>
            </Card>

            {/* Today's Workout */}
            <Card className="bg-black/30 backdrop-blur-sm border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-orange-400" />
                      <span>Treino de Hoje</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Recomendado pela IA baseado no seu histórico
                    </CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500">
                    <Fire className="h-3 w-3 mr-1" />
                    10X
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{todayWorkout.exercises}</p>
                    <p className="text-sm text-gray-400">Exercícios</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{todayWorkout.duration}</p>
                    <p className="text-sm text-gray-400">Duração</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-400">7-8</p>
                    <p className="text-sm text-gray-400">PSE Alvo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-yellow-400">{todayWorkout.focus}</p>
                    <p className="text-sm text-gray-400">Foco</p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  onClick={() => setActiveTab("workout")}
                >
                  <Timer className="h-4 w-4 mr-2" />
                  Iniciar Treino
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-black/30 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Progresso Semanal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Treinos realizados</span>
                      <span className="text-white">{weeklyProgress.workouts}/{weeklyProgress.target}</span>
                    </div>
                    <Progress 
                      value={(weeklyProgress.workouts / weeklyProgress.target) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-orange-400">{weeklyProgress.calories}</p>
                      <p className="text-xs text-gray-400">Calorias</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-red-400">{weeklyProgress.internalLoad}</p>
                      <p className="text-xs text-gray-400">Carga Interna</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => setActiveTab("ai-chat")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Conversar com IA
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => setActiveTab("exercises")}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Ver Exercícios
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => setActiveTab("history")}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analisar Performance
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="workout" className="mt-6">
            <WorkoutLogger />
          </TabsContent>

          <TabsContent value="ai-chat" className="mt-6">
            <AIChat />
          </TabsContent>

          <TabsContent value="exercises" className="mt-6">
            <ExerciseLibrary />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <PerformanceHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
