import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import { CheckCircle2, Circle, Clock, Target, TrendingUp, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Phase {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'ALTA' | 'MÉDIA' | 'BAIXA';
  items: string[];
}

export default function RoadmapView() {
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: "fase1",
      title: "✅ Fase 1: Fundação",
      status: "completed",
      priority: "ALTA",
      items: [
        "Estrutura base do projeto (React + Vite + TypeScript + Tailwind)",
        "Integração com Supabase (banco de dados + autenticação)",
        "Sistema de autenticação para personal trainers",
        "Tabelas principais criadas",
        "Design system implementado",
        "Layout responsivo com sidebar e navegação"
      ]
    },
    {
      id: "fase2",
      title: "✅ Fase 2: Gestão de Alunos",
      status: "completed",
      priority: "ALTA",
      items: [
        "Cadastro completo de alunos com validações",
        "Lista de alunos com filtros e busca",
        "Página de detalhes do aluno",
        "Cálculo automático de IMC",
        "Histórico de lesões e restrições médicas",
        "Botão 'Gerar Primeiro Treino'"
      ]
    },
    {
      id: "fase3",
      title: "✅ Fase 3: Sistema de Treinos com IA",
      status: "completed",
      priority: "ALTA",
      items: [
        "Edge function generate-workout implementada",
        "Seleção de aluno em Modelos corrigida",
        "Template visual 9FIT criado",
        "Chat IA para modificação de treinos",
        "WorkoutDisplayTemplate com design preto/laranja",
        "Integração completa com Lovable AI"
      ]
    },
    {
      id: "fase4",
      title: "✅ Fase 4: Analytics e Estatísticas",
      status: "completed",
      priority: "ALTA",
      items: [
        "StudentAnalytics com dados reais implementado",
        "AdvancedStatistics com tabs criado",
        "AIRecommendationPanel com sugestões de treino",
        "StudentSelector reutilizável",
        "Métricas reais de treinos e avaliações",
        "Edge function generate-recommendations"
      ]
    },
    {
      id: "fase5",
      title: "🎓 Fase 5: Análise de Periodização com IA",
      status: "pending",
      priority: "MÉDIA",
      items: [
        "Melhorar interface de upload de periodização",
        "Parser inteligente de texto (IA)",
        "Extrair estrutura de treino",
        "Identificar fases e progressões",
        "Sugerir otimizações baseadas em ciência",
        "Associar periodização a alunos"
      ]
    },
    {
      id: "fase6",
      title: "🔧 Fase 6: Refinamentos e Otimizações",
      status: "pending",
      priority: "BAIXA",
      items: [
        "Animações e transições suaves",
        "Loading states em todas as ações",
        "Mensagens de erro amigáveis",
        "Tooltips e ajudas contextuais",
        "Testes de responsividade em mobile",
        "Dark mode otimizado"
      ]
    }
  ]);

  const getStatusIcon = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Concluída</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">Em Progresso</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const getPriorityBadge = (priority: Phase['priority']) => {
    switch (priority) {
      case 'ALTA':
        return <Badge variant="destructive">Alta Prioridade</Badge>;
      case 'MÉDIA':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">Média Prioridade</Badge>;
      case 'BAIXA':
        return <Badge variant="outline">Baixa Prioridade</Badge>;
    }
  };

  const completedPhases = phases.filter(p => p.status === 'completed').length;
  const totalPhases = phases.length;
  const progressPercentage = (completedPhases / totalPhases) * 100;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading gradient-text">
            🗺️ Roadmap do Sistema
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o progresso de desenvolvimento e as próximas funcionalidades
          </p>
        </div>

        {/* Progresso Geral */}
        <Card className="glass border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progresso Geral
                </CardTitle>
                <CardDescription>
                  {completedPhases} de {totalPhases} fases concluídas
                </CardDescription>
              </div>
              <div className="text-3xl font-bold text-primary">
                {progressPercentage.toFixed(0)}%
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fases */}
        <div className="space-y-4">
          {phases.map((phase, index) => (
            <Card 
              key={phase.id} 
              className={`glass border-border/50 transition-all duration-300 ${
                phase.status === 'in-progress' ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(phase.status)}
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg">{phase.title}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(phase.status)}
                        {getPriorityBadge(phase.priority)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {phase.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <div className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                        phase.status === 'completed' ? 'bg-green-500' : 'bg-muted-foreground'
                      }`} />
                      <span className={phase.status === 'completed' ? 'text-muted-foreground' : ''}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Próximos Passos */}
        <Card className="glass border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              🎯 Próximos Passos Imediatos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                <span>Ativar Lovable AI Gateway - Para geração de treinos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                <span>Implementar seleção de aluno em Modelos de Treino</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                <span>Transformar "Meus Treinos" em área de gestão de treinos dos alunos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
                <span>Criar edge function de geração de treinos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">5</span>
                <span>Implementar visualização de treinos gerados</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Métricas de Sucesso */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              📊 Métricas de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Tempo de cadastro de aluno</span>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/50">{'< 2min ✓'}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Tempo de geração de treino</span>
                <Badge variant="outline">{'< 10s'}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Taxa de sucesso na geração</span>
                <Badge variant="outline">{"> 95%"}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Uptime do sistema</span>
                <Badge variant="outline">{"> 99%"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
