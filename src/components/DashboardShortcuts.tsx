
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Database,
  Upload,
  BookOpen,
  MessageSquare,
  Users,
  BarChart3,
  TrendingUp,
  Clock,
  Target
} from "lucide-react";

const shortcuts = [
  {
    title: "Modelos de Treino",
    description: "Visualizar e gerenciar modelos de treino",
    icon: Dumbbell,
    route: "/workout-models",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    stats: "24 Modelos",
  },
  {
    title: "Base de Dados",
    description: "Acessar base completa de modelos",
    icon: Database,
    route: "/workout-models-database",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    stats: "156 Registros",
  },
  {
    title: "Upload Periodização",
    description: "Carregar novos planos de periodização",
    icon: Upload,
    route: "/periodization-upload",
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
    stats: "12 Uploads",
  },
  {
    title: "Exercícios",
    description: "Biblioteca completa de exercícios",
    icon: BookOpen,
    route: "/exercises",
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    stats: "489 Exercícios",
  },
  {
    title: "Chat IA",
    description: "Assistente inteligente para treinos",
    icon: MessageSquare,
    route: "/ai-chat",
    color: "bg-pink-500/10 text-pink-600 border-pink-200",
    stats: "IA Ativa",
  },
  {
    title: "Gestão de Alunos",
    description: "Administrar perfis de alunos",
    icon: Users,
    route: "/admin-students",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
    stats: "43 Alunos",
  },
];

const statsCards = [
  {
    title: "Treinos Ativos",
    value: "127",
    change: "+12%",
    trend: "up",
    icon: Target,
    color: "text-emerald-600",
  },
  {
    title: "Alunos Online",
    value: "34",
    change: "+5%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Média Semanal",
    value: "4.2",
    change: "+0.3",
    trend: "up",
    icon: TrendingUp,
    color: "text-orange-600",
  },
  {
    title: "Tempo Médio",
    value: "52min",
    change: "-3min",
    trend: "down",
    icon: Clock,
    color: "text-purple-600",
  },
];

export function DashboardShortcuts() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="glass border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <BarChart3 className="mr-1 h-3 w-3" />
                  <span className={stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span className="ml-1">vs. semana anterior</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold font-heading mb-4">Ações Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((shortcut) => {
            const IconComponent = shortcut.icon;
            return (
              <Card
                key={shortcut.title}
                className="card-hover glass border-border/50 cursor-pointer transition-all duration-300"
                onClick={() => navigate(shortcut.route)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${shortcut.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {shortcut.stats}
                    </Badge>
                  </div>
                  <CardTitle className="font-heading">{shortcut.title}</CardTitle>
                  <CardDescription>{shortcut.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full btn-glow"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(shortcut.route);
                    }}
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DashboardShortcuts;
