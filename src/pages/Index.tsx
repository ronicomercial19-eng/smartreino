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
  Flame, 
  MessageCircle, 
  Target, 
  Timer, 
  TrendingUp,
  Zap,
  Sparkles,
  ChevronRight
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/10 border-b border-white/5">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl blur opacity-20"></div>
                <div className="relative bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-3 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Treino 10X
                </h1>
                <p className="text-sm text-slate-400 font-medium">Powered by IA</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-sm font-medium">Online</span>
              </div>
              <Avatar className="ring-2 ring-white/10">
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Enhanced Navigation */}
          <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-sm border border-white/10 p-1 rounded-2xl">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl"
            >
              <Activity className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="workout" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl"
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Treino</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai-chat" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl"
            >
              <Brain className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">IA Coach</span>
            </TabsTrigger>
            <TabsTrigger 
              value="exercises" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl"
            >
              <Target className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exercícios</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:shadow-lg transition-all duration-300 rounded-xl"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab with Enhanced Design */}
          <TabsContent value="dashboard" className="mt-8 space-y-8">
            {/* AI Suggestion Card - More Sophisticated */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20"></div>
              <Card className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                <CardHeader className="pb-4 relative">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg font-semibold">IA Personal Trainer</CardTitle>
                      <CardDescription className="text-slate-400">Recomendação personalizada</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-slate-200 leading-relaxed mb-4">{aiSuggestion}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Conversar com IA
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Today's Workout - Redesigned */}
            <Card className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xl">Treino de Hoje</span>
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                      Recomendado pela IA baseado no seu histórico
                    </CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-white font-medium">
                    <Flame className="h-3 w-3 mr-1" />
                    10X
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl p-4 mb-2">
                      <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        {todayWorkout.exercises}
                      </p>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Exercícios</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-4 mb-2">
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {todayWorkout.duration}
                      </p>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Duração</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-4 mb-2">
                      <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        7-8
                      </p>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">PSE Alvo</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 mb-2">
                      <p className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        {todayWorkout.focus}
                      </p>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Foco</p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setActiveTab("workout")}
                >
                  <Timer className="h-5 w-5 mr-2" />
                  Iniciar Treino
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Progress and Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weekly Progress - Enhanced */}
              <Card className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Progresso Semanal</CardTitle>
                  <CardDescription className="text-slate-400">
                    Acompanhe sua evolução
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-400">Treinos realizados</span>
                      <span className="text-white font-semibold">{weeklyProgress.workouts}/{weeklyProgress.target}</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={(weeklyProgress.workouts / weeklyProgress.target) * 100} 
                        className="h-3 bg-slate-800 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
                      <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {weeklyProgress.calories}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">Calorias</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl p-4 border border-red-500/20">
                      <p className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                        {weeklyProgress.internalLoad}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">Carga Interna</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions - More Elegant */}
              <Card className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Ações Rápidas</CardTitle>
                  <CardDescription className="text-slate-400">
                    Acesso direto às principais funcionalidades
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-300 rounded-xl py-6"
                    onClick={() => setActiveTab("ai-chat")}
                  >
                    <MessageCircle className="h-5 w-5 mr-3" />
                    <span className="flex-1 text-left">Conversar com IA</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-300 rounded-xl py-6"
                    onClick={() => setActiveTab("exercises")}
                  >
                    <Target className="h-5 w-5 mr-3" />
                    <span className="flex-1 text-left">Biblioteca de Exercícios</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-300 rounded-xl py-6"
                    onClick={() => setActiveTab("history")}
                  >
                    <TrendingUp className="h-5 w-5 mr-3" />
                    <span className="flex-1 text-left">Analisar Performance</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="workout" className="mt-8">
            <WorkoutLogger />
          </TabsContent>

          <TabsContent value="ai-chat" className="mt-8">
            <AIChat />
          </TabsContent>

          <TabsContent value="exercises" className="mt-8">
            <ExerciseLibrary />
          </TabsContent>

          <TabsContent value="history" className="mt-8">
            <PerformanceHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
