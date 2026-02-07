/**
 * StudentInterface - Dashboard completo do aluno SmartReino
 * Abas: Meu Treino | Chat IA | Histórico | Meu Progresso
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Dumbbell, MessageCircle, Calendar, TrendingUp, 
  User, LogOut, Target, Activity 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { StudentWorkoutView } from '@/components/student/StudentWorkoutView';
import { StudentTrainingLog } from '@/components/student/StudentTrainingLog';
import { StudentProgressChart } from '@/components/student/StudentProgressChart';
import { StudentAICoach } from '@/components/student/StudentAICoach';

interface AlunoData {
  id: string;
  nome: string;
  email: string;
  objetivo: string;
  nivel_experiencia: string | null;
  peso_atual: number | null;
  altura_cm: number | null;
  frequencia_semanal: number | null;
  status: string | null;
}

interface PlanoAtivo {
  id: string;
  nome_plano: string;
  objetivo: string;
  estrutura_treino: any;
  status: string;
  semana_atual: number | null;
  duracao_semanas: number | null;
}

interface HistoricoEntry {
  id: string;
  data_treino: string;
  pse_sessao: number | null;
  duracao_minutos: number | null;
  notas_aluno: string | null;
  dia_treino: number | null;
  semana_treino: number | null;
  volume_total_kg: number | null;
}

export default function StudentInterface() {
  const [aluno, setAluno] = useState<AlunoData | null>(null);
  const [planoAtivo, setPlanoAtivo] = useState<PlanoAtivo | null>(null);
  const [historico, setHistorico] = useState<HistoricoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('treino');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast({ title: "Sessão expirada", description: "Faça login novamente.", variant: "destructive" });
        navigate('/login');
        return;
      }

      // Buscar aluno pela tabela correta (alunos pelo email)
      const { data: alunoData, error: alunoError } = await supabase
        .from('alunos')
        .select('id, nome, email, objetivo, nivel_experiencia, peso_atual, altura_cm, frequencia_semanal, status')
        .eq('email', user.email)
        .maybeSingle();

      if (alunoError) throw alunoError;

      if (!alunoData) {
        setLoading(false);
        return; // Mostrar estado vazio
      }

      setAluno(alunoData);

      // Buscar plano ativo e histórico em paralelo
      const [planoRes, historicoRes] = await Promise.all([
        supabase
          .from('planos_treino_aluno')
          .select('id, nome_plano, objetivo, estrutura_treino, status, semana_atual, duracao_semanas')
          .eq('aluno_id', alunoData.id)
          .eq('status', 'ativo')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('historico_treinos_realizados')
          .select('id, data_treino, pse_sessao, duracao_minutos, notas_aluno, dia_treino, semana_treino, volume_total_kg')
          .eq('aluno_id', alunoData.id)
          .order('data_treino', { ascending: false })
          .limit(50),
      ]);

      if (planoRes.data) setPlanoAtivo(planoRes.data);
      if (historicoRes.data) setHistorico(historicoRes.data);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleStartWorkout = (dayIndex: number) => {
    toast({ title: "Treino iniciado! 💪", description: "Marque os exercícios conforme for completando." });
  };

  // Preparar dados do plano para o componente de treino
  const workoutPlanData = planoAtivo?.estrutura_treino 
    ? {
        nome: planoAtivo.nome_plano || 'Meu Treino',
        objetivo: planoAtivo.objetivo || aluno?.objetivo || '',
        nivel: aluno?.nivel_experiencia || 'Intermediário',
        estrutura_semanal: Array.isArray(planoAtivo.estrutura_treino) 
          ? planoAtivo.estrutura_treino 
          : planoAtivo.estrutura_treino?.estrutura_semanal || [],
      }
    : null;

  // Saudação baseada na hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-lg font-bold">9</span>
            </div>
            <div>
              <h1 className="text-lg font-bold font-heading">SmartReino</h1>
              <p className="text-xs text-muted-foreground">Área do Aluno</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {aluno && (
              <Badge variant="outline" className="hidden sm:flex">
                <User className="h-3 w-3 mr-1" />
                {aluno.nome}
              </Badge>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sair</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Saudação */}
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
        ) : aluno ? (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold font-heading">
              {getGreeting()}, <span className="text-primary">{aluno.nome.split(' ')[0]}</span>! 👋
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className="bg-primary/20 text-primary border-primary/50">
                <Target className="h-3 w-3 mr-1" />
                {aluno.objetivo}
              </Badge>
              {aluno.nivel_experiencia && (
                <Badge variant="outline">{aluno.nivel_experiencia}</Badge>
              )}
              {planoAtivo && (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                  Plano Ativo
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <Card className="glass border-border/50 animate-fade-in">
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Perfil não encontrado</h3>
              <p className="text-muted-foreground">
                Seu email ainda não foi cadastrado como aluno. Entre em contato com seu professor para configurar seu acesso.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tabs principais */}
        {(aluno || loading) && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-card">
              <TabsTrigger value="treino" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Dumbbell className="h-4 w-4 mr-1 hidden sm:inline" />
                <span className="text-xs sm:text-sm">Meu Treino</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageCircle className="h-4 w-4 mr-1 hidden sm:inline" />
                <span className="text-xs sm:text-sm">Chat IA</span>
              </TabsTrigger>
              <TabsTrigger value="historico" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="h-4 w-4 mr-1 hidden sm:inline" />
                <span className="text-xs sm:text-sm">Histórico</span>
              </TabsTrigger>
              <TabsTrigger value="progresso" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="h-4 w-4 mr-1 hidden sm:inline" />
                <span className="text-xs sm:text-sm">Progresso</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="treino" className="mt-4">
              <StudentWorkoutView
                plan={workoutPlanData}
                loading={loading}
                onStartWorkout={handleStartWorkout}
              />
            </TabsContent>

            <TabsContent value="chat" className="mt-4">
              {aluno && (
                <StudentAICoach
                  alunoNome={aluno.nome}
                  alunoObjetivo={aluno.objetivo}
                  planoAtivo={planoAtivo?.estrutura_treino}
                />
              )}
            </TabsContent>

            <TabsContent value="historico" className="mt-4">
              {aluno && (
                <StudentTrainingLog
                  alunoId={aluno.id}
                  planoId={planoAtivo?.id}
                  historico={historico}
                  loading={loading}
                  onLogSaved={loadStudentData}
                />
              )}
            </TabsContent>

            <TabsContent value="progresso" className="mt-4">
              <StudentProgressChart
                historico={historico}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Perfil resumido */}
        {aluno && !loading && (
          <Card className="glass border-border/50 animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Meu Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {aluno.peso_atual && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold text-primary">{aluno.peso_atual} kg</p>
                    <p className="text-xs text-muted-foreground">Peso</p>
                  </div>
                )}
                {aluno.altura_cm && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold text-primary">{aluno.altura_cm} cm</p>
                    <p className="text-xs text-muted-foreground">Altura</p>
                  </div>
                )}
                {aluno.frequencia_semanal && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold text-primary">{aluno.frequencia_semanal}x</p>
                    <p className="text-xs text-muted-foreground">Freq. Semanal</p>
                  </div>
                )}
                {aluno.peso_atual && aluno.altura_cm && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold text-primary">
                      {(aluno.peso_atual / ((aluno.altura_cm / 100) ** 2)).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">IMC</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
