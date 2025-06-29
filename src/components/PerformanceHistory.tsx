
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Fire,
  Target,
  Award,
  BarChart3
} from "lucide-react";

const PerformanceHistory = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const weeklyStats = {
    workouts: 5,
    totalTime: 225, // minutes
    avgPSE: 7.2,
    calories: 2150,
    internalLoad: 3240,
    streak: 12
  };

  const recentWorkouts = [
    {
      date: "2024-12-27",
      name: "Treino 10X - Upper Body",
      duration: 45,
      pse: 8,
      exercises: 6,
      calories: 420,
      internalLoad: 360
    },
    {
      date: "2024-12-26",
      name: "Treino Funcional",
      duration: 35,
      pse: 7,
      exercises: 5,
      calories: 350,
      internalLoad: 245
    },
    {
      date: "2024-12-24",
      name: "Treino 10X - Lower Body",
      duration: 50,
      pse: 7,
      exercises: 7,
      calories: 480,
      internalLoad: 350
    },
    {
      date: "2024-12-23",
      name: "Cardio + Core",
      duration: 30,
      pse: 6,
      exercises: 4,
      calories: 280,
      internalLoad: 180
    },
    {
      date: "2024-12-22",
      name: "Treino de Força",
      duration: 55,
      pse: 8,
      exercises: 6,
      calories: 520,
      internalLoad: 440
    }
  ];

  const achievements = [
    { name: "Sequência de 7 dias", icon: Fire, color: "text-orange-400", earned: true },
    { name: "100 treinos completos", icon: Target, color: "text-blue-400", earned: true },
    { name: "PSE médio ideal", icon: Activity, color: "text-green-400", earned: false },
    { name: "Mestre da consistência", icon: Award, color: "text-purple-400", earned: false }
  ];

  const getPSEColor = (pse: number) => {
    if (pse <= 4) return "text-green-400";
    if (pse <= 7) return "text-yellow-400";
    return "text-red-400";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{weeklyStats.workouts}</p>
            <p className="text-sm text-gray-400">Treinos/Semana</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Fire className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{weeklyStats.streak}</p>
            <p className="text-sm text-gray-400">Dias Seguidos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{Math.floor(weeklyStats.totalTime / 60)}h{weeklyStats.totalTime % 60}m</p>
            <p className="text-sm text-gray-400">Tempo Total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{weeklyStats.avgPSE}</p>
            <p className="text-sm text-gray-400">PSE Médio</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <Card className="bg-black/30 backdrop-blur-sm border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Análise de Performance</CardTitle>
                <CardDescription className="text-gray-400">
                  Acompanhe seu progresso e identifique padrões
                </CardDescription>
              </div>
              <TabsList className="bg-black/30">
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mês</TabsTrigger>
                <TabsTrigger value="year">Ano</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="week" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Métricas da Semana</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Carga Interna</span>
                        <span className="text-white">{weeklyStats.internalLoad} UA</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Calorias Queimadas</span>
                        <span className="text-white">{weeklyStats.calories} kcal</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Meta Semanal</span>
                        <span className="text-white">{weeklyStats.workouts}/5 treinos</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-medium">Tendências</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Frequência</p>
                        <p className="text-sm text-gray-400">vs. semana anterior</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-medium">+20%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Intensidade</p>
                        <p className="text-sm text-gray-400">PSE médio</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="h-4 w-4 text-red-400" />
                        <span className="text-red-400 font-medium">-5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* Recent Workouts */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <span>Treinos Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentWorkouts.map((workout, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <p className="text-white font-bold">{formatDate(workout.date)}</p>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{workout.name}</h4>
                      <p className="text-sm text-gray-400">
                        {workout.exercises} exercícios • {workout.duration} min
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className={`text-lg font-bold ${getPSEColor(workout.pse)}`}>
                      {workout.pse}
                    </p>
                    <p className="text-xs text-gray-400">PSE</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-400">{workout.calories}</p>
                    <p className="text-xs text-gray-400">kcal</p>
                  </div>
                  <Badge variant="outline" className="border-white/20 text-gray-300">
                    {workout.internalLoad} UA
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-400" />
            <span>Conquistas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  achievement.earned ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' : 'bg-white/5'
                }`}
              >
                <achievement.icon className={`h-6 w-6 ${achievement.earned ? achievement.color : 'text-gray-500'}`} />
                <div>
                  <p className={`font-medium ${achievement.earned ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.name}
                  </p>
                  <Badge variant={achievement.earned ? "default" : "secondary"} className="text-xs">
                    {achievement.earned ? "Conquistado" : "Bloqueado"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceHistory;
