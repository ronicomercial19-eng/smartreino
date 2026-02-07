/**
 * StudentProgressChart - Gráficos de evolução do aluno
 * PSE, frequência semanal e volume total
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Activity, Calendar, BarChart3 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { format, subDays, startOfWeek, eachWeekOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoricoEntry {
  id: string;
  data_treino: string;
  pse_sessao: number | null;
  duracao_minutos: number | null;
  volume_total_kg: number | null;
}

interface StudentProgressChartProps {
  historico: HistoricoEntry[];
  loading: boolean;
}

export function StudentProgressChart({ historico, loading }: StudentProgressChartProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full" />)}
      </div>
    );
  }

  if (historico.length === 0) {
    return (
      <Card className="glass border-border/50 animate-fade-in">
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sem dados de progresso</h3>
          <p className="text-muted-foreground">
            Registre seus treinos para ver gráficos de evolução aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para PSE ao longo do tempo
  const pseData = historico
    .filter(h => h.pse_sessao != null)
    .sort((a, b) => new Date(a.data_treino).getTime() - new Date(b.data_treino).getTime())
    .map(h => ({
      data: format(new Date(h.data_treino), 'dd/MM', { locale: ptBR }),
      pse: h.pse_sessao,
    }));

  // Frequência semanal
  const now = new Date();
  const start = subDays(now, 56); // 8 semanas
  const weeks = eachWeekOfInterval({ start, end: now }, { weekStartsOn: 1 });
  const frequenciaData = weeks.map(weekStart => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = historico.filter(h => {
      const d = new Date(h.data_treino);
      return d >= weekStart && d < weekEnd;
    }).length;
    return {
      semana: format(weekStart, 'dd/MM', { locale: ptBR }),
      treinos: count,
    };
  });

  // Volume total por sessão
  const volumeData = historico
    .filter(h => h.volume_total_kg != null)
    .sort((a, b) => new Date(a.data_treino).getTime() - new Date(b.data_treino).getTime())
    .map(h => ({
      data: format(new Date(h.data_treino), 'dd/MM', { locale: ptBR }),
      volume: h.volume_total_kg,
    }));

  // Métricas resumidas
  const avgPse = historico.filter(h => h.pse_sessao).reduce((sum, h) => sum + (h.pse_sessao || 0), 0) / 
    (historico.filter(h => h.pse_sessao).length || 1);
  const totalSessions = historico.length;
  const avgDuration = historico.filter(h => h.duracao_minutos).reduce((sum, h) => sum + (h.duracao_minutos || 0), 0) /
    (historico.filter(h => h.duracao_minutos).length || 1);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass border-border/50">
          <CardContent className="pt-4 pb-3 text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-primary">{avgPse.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">PSE Médio</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-4 pb-3 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-primary">{totalSessions}</p>
            <p className="text-xs text-muted-foreground">Total Sessões</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-4 pb-3 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-primary">{avgDuration.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Duração Média (min)</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-4 pb-3 text-center">
            <BarChart3 className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-primary">
              {frequenciaData.length > 0 ? frequenciaData[frequenciaData.length - 1].treinos : 0}
            </p>
            <p className="text-xs text-muted-foreground">Treinos esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* PSE ao longo do tempo */}
        {pseData.length > 0 && (
          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                PSE ao Longo do Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={pseData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="pse" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Frequência semanal */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Frequência Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={frequenciaData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="treinos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volume total */}
        {volumeData.length > 0 && (
          <Card className="glass border-border/50 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Volume Total por Sessão (kg)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="volume" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
