import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageLayout } from '@/components/shared/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { WorkoutAIService } from '@/services/workoutAIService';
import { Sparkles, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Aluno } from '@/services/alunosService';

interface SavedPeriodization {
  id: string;
  plan_name: string;
  model_id: string;
  customizations: any;
  status: string;
}

export default function GenerateWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const aluno = location.state?.aluno as Aluno | undefined;

  const [loading, setLoading] = useState(false);
  const [objetivo, setObjetivo] = useState(aluno?.objetivo || '');
  const [nivel, setNivel] = useState(aluno?.nivel_experiencia || '');
  const [frequencia, setFrequencia] = useState(aluno?.frequencia_semanal?.toString() || '');
  const [ambiente, setAmbiente] = useState(aluno?.ambiente_treino || '');
  const [restricoes, setRestricoes] = useState(aluno?.restricoes_medicas || '');
  const [periodizations, setPeriodizations] = useState<SavedPeriodization[]>([]);
  const [selectedPeriodization, setSelectedPeriodization] = useState('');

  // Load saved periodizations
  useEffect(() => {
    const loadPeriodizations = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data } = await (supabase as any)
        .from('saved_periodizations')
        .select('id, plan_name, model_id, customizations, status')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (data) setPeriodizations(data);
    };
    loadPeriodizations();
  }, []);

  if (!aluno) {
    return (
      <PageLayout title="Erro">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Aluno não selecionado</p>
            <Button onClick={() => navigate('/gerenciamento-alunos')}>
              Voltar para Gestão de Alunos
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const handleGenerate = async () => {
    if (!objetivo || !nivel || !frequencia) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha objetivo, nível e frequência semanal'
      });
      return;
    }

    setLoading(true);
    try {
      // Build periodization context if selected
      let periodizationContext = '';
      if (selectedPeriodization) {
        const period = periodizations.find(p => p.id === selectedPeriodization);
        if (period) {
          periodizationContext = `\nContexto da Periodização Ativa: ${period.plan_name}\nCustomizações: ${JSON.stringify(period.customizations || {})}`;
        }
      }

      const plan = await WorkoutAIService.generateWorkout({
        studentId: aluno.id,
        objetivo,
        nivel,
        frequenciaSemanal: parseInt(frequencia),
        restricoes: restricoes + periodizationContext,
        ambiente
      });

      toast({
        title: 'Treino gerado com sucesso! 🎉',
        description: 'O plano foi criado e está disponível para visualização'
      });

      navigate(`/workout-plan/${plan.id}`);
    } catch (error) {
      console.error('Error generating workout:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar treino',
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Gerar Treino com IA">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Geração Inteligente de Treino
            </CardTitle>
            <CardDescription>
              Configure os parâmetros para gerar um treino personalizado para{' '}
              <span className="font-semibold text-foreground">{aluno.nome}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Periodização */}
            {periodizations.length > 0 && (
              <div className="space-y-2 p-4 rounded-lg border border-primary/20 bg-primary/5">
                <Label htmlFor="periodizacao" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Importar Periodização (opcional)
                </Label>
                <Select value={selectedPeriodization} onValueChange={setSelectedPeriodization}>
                  <SelectTrigger id="periodizacao">
                    <SelectValue placeholder="Selecionar periodização salva..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem periodização</SelectItem>
                    {periodizations.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.plan_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">O contexto da periodização será usado para guiar a geração do treino</p>
              </div>
            )}

            {/* Objetivo */}
            <div className="space-y-2">
              <Label htmlFor="objetivo">Objetivo Principal *</Label>
              <Select value={objetivo} onValueChange={setObjetivo}>
                <SelectTrigger id="objetivo">
                  <SelectValue placeholder="Selecione o objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                  <SelectItem value="forca">Força</SelectItem>
                  <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                  <SelectItem value="condicionamento">Condicionamento</SelectItem>
                  <SelectItem value="performance_atletica">Performance Atlética</SelectItem>
                  <SelectItem value="reabilitacao">Reabilitação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nível */}
            <div className="space-y-2">
              <Label htmlFor="nivel">Nível de Experiência *</Label>
              <Select value={nivel} onValueChange={setNivel}>
                <SelectTrigger id="nivel">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frequência */}
            <div className="space-y-2">
              <Label htmlFor="frequencia">Frequência Semanal *</Label>
              <Select value={frequencia} onValueChange={setFrequencia}>
                <SelectTrigger id="frequencia">
                  <SelectValue placeholder="Dias por semana" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2x por semana</SelectItem>
                  <SelectItem value="3">3x por semana</SelectItem>
                  <SelectItem value="4">4x por semana</SelectItem>
                  <SelectItem value="5">5x por semana</SelectItem>
                  <SelectItem value="6">6x por semana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ambiente */}
            <div className="space-y-2">
              <Label htmlFor="ambiente">Ambiente de Treino</Label>
              <Select value={ambiente} onValueChange={setAmbiente}>
                <SelectTrigger id="ambiente">
                  <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academia">Academia Completa</SelectItem>
                  <SelectItem value="casa">Casa (equipamento mínimo)</SelectItem>
                  <SelectItem value="parque">Parque/Ar Livre</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Restrições */}
            <div className="space-y-2">
              <Label htmlFor="restricoes">Restrições Médicas ou Observações</Label>
              <Textarea
                id="restricoes"
                value={restricoes}
                onChange={(e) => setRestricoes(e.target.value)}
                placeholder="Ex: Lesão no ombro direito, evitar exercícios de impacto..."
                rows={4}
              />
            </div>

            {/* Info do Aluno */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-foreground">Dados do Aluno:</p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <p>Peso: {aluno.peso_atual || 'N/A'} kg</p>
                <p>Altura: {aluno.altura_cm || 'N/A'} cm</p>
              </div>
            </div>

            {/* Botão de Gerar */}
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando treino...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Treino com IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
