
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Award,
  Zap,
  Clock,
  BarChart3 
} from "lucide-react";
import { useEffect, useState } from "react";
import { getWorkoutStats, getRecentWorkouts } from "@/data/mockData";
import { useAIService } from "@/services/aiService";

const AdvancedStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const { analyzePerformance } = useAIService();

  useEffect(() => {
    const workoutStats = getWorkoutStats();
    const performanceTrends = analyzePerformance();
    
    setStats(workoutStats);
    setTrends(performanceTrends);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Treinos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalWorkouts}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                Este mês
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Total</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalDuration}min</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                ~{Math.round(stats.totalDuration / 60)}h de treino
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PSE Médio</p>
                <p className="text-2xl font-bold text-orange-600">{stats.averagePSE}/10</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4">
              <Progress value={stats.averagePSE * 10} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Carga Média</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageLoad}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4">
              <Progress 
                value={Math.min((stats.averageLoad / 500) * 100, 100)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendências de Performance */}
      {trends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Análise de Tendências</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Carga Interna</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(trends.loadTrend)}
                    <span className={`text-sm font-semibold ${getTrendColor(trends.loadTrend)}`}>
                      {trends.loadChange > 0 ? '+' : ''}{trends.loadChange}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={Math.abs(trends.loadChange)} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  Comparado aos últimos 5 treinos
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Percepção de Esforço</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(trends.pseTrend)}
                    <span className={`text-sm font-semibold ${getTrendColor(trends.pseTrend)}`}>
                      {trends.pseChange > 0 ? '+' : ''}{trends.pseChange}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={Math.abs(trends.pseChange)} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  Intensidade percebida recente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conquistas e Marcos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Conquistas Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.totalWorkouts >= 10 && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">10</span>
                </div>
                <div>
                  <p className="font-medium">Primeira Dezena!</p>
                  <p className="text-sm text-gray-600">Completou 10 treinos</p>
                </div>
              </div>
            )}
            
            {stats.averagePSE >= 8 && (
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Alta Intensidade</p>
                  <p className="text-sm text-gray-600">PSE médio acima de 8</p>
                </div>
              </div>
            )}
            
            {stats.totalDuration >= 300 && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Maratonista</p>
                  <p className="text-sm text-gray-600">Mais de 5 horas de treino</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedStats;
