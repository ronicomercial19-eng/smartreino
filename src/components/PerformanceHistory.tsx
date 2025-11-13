
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  Flame,
  Target,
  Award,
  BarChart3,
  Calendar,
  Zap
} from "lucide-react";

interface PerformanceHistoryProps {
  studentId?: string;
}

const PerformanceHistory = ({ studentId }: PerformanceHistoryProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [loading, setLoading] = useState(false);

  const [performanceData, setPerformanceData] = useState([
    { period: "Semana 1", workouts: 0, avgPSE: 0, totalTime: 0, calories: 0 },
    { period: "Semana 2", workouts: 0, avgPSE: 0, totalTime: 0, calories: 0 },
    { period: "Semana 3", workouts: 0, avgPSE: 0, totalTime: 0, calories: 0 },
    { period: "Semana 4", workouts: 0, avgPSE: 0, totalTime: 0, calories: 0 }
  ]);

  const [monthlyStats, setMonthlyStats] = useState({
    totalWorkouts: 0,
    avgPSE: 0,
    totalTime: 0,
    totalCalories: 0,
    streak: 0,
    improvement: 0
  });

  const achievements = [
    { name: "Sequência de 7 dias", icon: Flame, color: "text-orange-400", earned: false },
    { name: "100 treinos completos", icon: Target, color: "text-blue-400", earned: false },
    { name: "PSE médio ideal", icon: Activity, color: "text-green-400", earned: false },
    { name: "Mestre da consistência", icon: Award, color: "text-purple-400", earned: false }
  ];

  useEffect(() => {
    if (studentId) {
      loadStudentPerformance();
    }
  }, [studentId]);

  const loadStudentPerformance = async () => {
    // TODO: Implementar busca real de dados do aluno no banco
    // Por enquanto, mantém dados zerados até implementar registro de treinos
    setLoading(true);
    try {
      // Aqui virá a query ao Supabase para buscar treinos realizados do aluno
      // const { data } = await supabase.from('workout_logs').select('*').eq('student_id', studentId);
    } catch (error) {
      console.error('Erro ao carregar performance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!studentId) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Selecione um aluno para visualizar a evolução da performance</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <Card className="glass border-border/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Carregando dados de performance...</p>
          </CardContent>
        </Card>
      ) : (
        <>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{monthlyStats.totalWorkouts}</p>
            <p className="text-sm text-gray-400">Treinos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{monthlyStats.avgPSE}</p>
            <p className="text-sm text-gray-400">PSE Médio</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{Math.floor(monthlyStats.totalTime / 60)}h</p>
            <p className="text-sm text-gray-400">Tempo Total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{monthlyStats.streak}</p>
            <p className="text-sm text-gray-400">Dias Seguidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Evolução da Performance</CardTitle>
              <CardDescription className="text-gray-400">
                Acompanhe seu progresso ao longo do tempo
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold">+{monthlyStats.improvement}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <TabsList className="grid w-full grid-cols-3 bg-black/30">
              <TabsTrigger value="week" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500">
                Semana
              </TabsTrigger>
              <TabsTrigger value="month" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500">
                Mês
              </TabsTrigger>
              <TabsTrigger value="year" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500">
                Ano
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {performanceData.map((week, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{week.period}</span>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-blue-400">{week.workouts} treinos</span>
                    <span className="text-purple-400">PSE {week.avgPSE}</span>
                    <span className="text-orange-400">{week.calories} cal</span>
                  </div>
                </div>
                <Progress value={(week.workouts / 7) * 100} className="h-2" />
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
          <CardDescription className="text-gray-400">
            Seus marcos e objetivos alcançados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${
                  achievement.earned 
                    ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
                <div className="flex-1">
                  <p className="text-white font-medium">{achievement.name}</p>
                  <Badge variant={achievement.earned ? "default" : "secondary"}>
                    {achievement.earned ? "Conquistado" : "Em progresso"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            <span>Resumo da Semana</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-400">{monthlyStats.totalCalories}</p>
              <p className="text-sm text-gray-400">Calorias Queimadas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{(monthlyStats.totalTime / 60).toFixed(1)}h</p>
              <p className="text-sm text-gray-400">Tempo de Exercício</p>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Meta Semanal</span>
              <span className="text-white">4/5 treinos</span>
            </div>
            <Progress value={80} className="h-2" />
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
};

export default PerformanceHistory;
