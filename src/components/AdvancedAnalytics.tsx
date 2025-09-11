import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Target, Calendar, Award, 
  Activity, Heart, Zap, Clock, Users 
} from "lucide-react";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

// Mock analytics data - replace with real API calls
const generateMockAnalytics = () => {
  const weeklyData = Array.from({ length: 12 }, (_, i) => ({
    week: `Sem ${i + 1}`,
    volume: Math.floor(Math.random() * 5000) + 3000,
    intensity: Math.floor(Math.random() * 3) + 7,
    pse: Math.floor(Math.random() * 3) + 6,
    frequency: Math.floor(Math.random() * 3) + 3
  }));

  const monthlyProgress = Array.from({ length: 6 }, (_, i) => ({
    month: `Mês ${i + 1}`,
    performance: Math.floor(Math.random() * 20) + 70,
    adherence: Math.floor(Math.random() * 15) + 80,
    satisfaction: Math.floor(Math.random() * 10) + 85
  }));

  const exerciseTypes = [
    { name: 'Força', value: 40, color: '#3b82f6' },
    { name: 'Cardio', value: 25, color: '#ef4444' },
    { name: 'Flexibilidade', value: 20, color: '#10b981' },
    { name: 'Resistência', value: 15, color: '#f59e0b' }
  ];

  const performanceMetrics = {
    totalWorkouts: 48,
    averageIntensity: 7.8,
    weeklyFrequency: 4.2,
    adherenceRate: 89,
    progressTrend: 'increasing',
    currentPhase: 'Hipertrofia',
    nextMilestone: 'Avaliação Física'
  };

  return {
    weeklyData,
    monthlyProgress,
    exerciseTypes,
    performanceMetrics
  };
};

export default function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('3months');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get user profile
        const profile = await authService.getCurrentUserProfile();
        setUserProfile(profile);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock analytics
        const mockData = generateMockAnalytics();
        setAnalytics(mockData);
        
      } catch (error) {
        console.error('Erro ao carregar analytics:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados analíticos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange, toast]);

  const exportData = () => {
    toast({
      title: "Exportando dados",
      description: "Seus relatórios serão enviados por email em alguns minutos.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dados não disponíveis</h3>
            <p className="text-muted-foreground text-center">
              Não foi possível carregar os dados analíticos. Tente novamente mais tarde.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { weeklyData, monthlyProgress, exerciseTypes, performanceMetrics } = analytics;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Avançados</h1>
          <p className="text-muted-foreground mt-2">
            Análise detalhada do seu progresso e performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Último mês</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Treinos</p>
                <p className="text-2xl font-bold text-foreground">{performanceMetrics.totalWorkouts}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+12% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Intensidade Média</p>
                <p className="text-2xl font-bold text-foreground">{performanceMetrics.averageIntensity}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">PSE médio por treino</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Aderência</p>
                <p className="text-2xl font-bold text-foreground">{performanceMetrics.adherenceRate}%</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="text-xs">
                {performanceMetrics.adherenceRate >= 85 ? 'Excelente' : 'Bom'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Frequência Semanal</p>
                <p className="text-2xl font-bold text-foreground">{performanceMetrics.weeklyFrequency}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">treinos por semana</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Intensidade Semanal (PSE)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="pse" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Frequência Cardíaca de Treino
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="intensity" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Volume de Treino Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolução do Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Performance"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="adherence" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Aderência"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="satisfaction" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="Satisfação"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Distribuição por Tipo de Exercício
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={exerciseTypes}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {exerciseTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Desempenho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fase Atual</span>
                  <Badge variant="outline">{performanceMetrics.currentPhase}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Próximo Marco</span>
                  <span className="text-sm text-muted-foreground">{performanceMetrics.nextMilestone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tendência de Progresso</span>
                  <div className="flex items-center gap-1">
                    {performanceMetrics.progressTrend === 'increasing' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm capitalize">{performanceMetrics.progressTrend}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}