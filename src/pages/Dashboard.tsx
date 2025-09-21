import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardShortcuts from "@/components/DashboardShortcuts";
import PerformanceHistory from "@/components/PerformanceHistory";
import { PageLayout } from "@/components/shared";
import { Calendar, TrendingUp, Users, Clock } from "lucide-react";

export default function Dashboard() {
  return (
    <PageLayout
      title="📊 Dashboard"
      subtitle="Acompanhe seu progresso e performance dos treinos"
    >
      <div className="space-y-6 animate-fade-in">

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Treinos
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-primary">124</div>
              <p className="text-xs text-muted-foreground">
                +20.1% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                PSE Médio
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-primary">7.8</div>
              <p className="text-xs text-muted-foreground">
                +0.3 pontos esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Carga Total
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-primary">2,450kg</div>
              <p className="text-xs text-muted-foreground">
                +15.2% em relação à semana passada
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Consistência
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-primary">85%</div>
              <p className="text-xs text-muted-foreground">
                Meta: 80% dos treinos programados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progresso Semanal */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-heading text-foreground">Progresso Semanal</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sua evolução durante esta semana de treinos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Meta Semanal</span>
                <span className="text-sm text-muted-foreground">4/5 treinos</span>
              </div>
              <Progress value={80} className="w-full" />
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold font-heading text-primary">4</p>
                  <p className="text-xs text-muted-foreground">Treinos Completos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-heading text-primary">180</p>
                  <p className="text-xs text-muted-foreground">Minutos Ativos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-heading text-primary">7.5</p>
                  <p className="text-xs text-muted-foreground">PSE Médio</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de 2 Colunas */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Atalhos Rápidos */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-foreground">Ações Rápidas</CardTitle>
              <CardDescription className="text-muted-foreground">
                Acesso direto às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardShortcuts />
            </CardContent>
          </Card>

          {/* Histórico Recente */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-foreground">Histórico de Performance</CardTitle>
              <CardDescription className="text-muted-foreground">
                Últimos treinos realizados e evolução
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceHistory />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}