/**
 * SmartReino Quiz - 9 perguntas clicáveis para gerar treino via IA
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target, Dumbbell, Calendar, MapPin, Clock, AlertTriangle, 
  Activity, HeartPulse, Weight, Sparkles, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SmartReinoQuizProps {
  alunoId: string;
  alunoNome: string;
  onWorkoutGenerated: () => void;
}

interface QuizQuestion {
  id: string;
  title: string;
  icon: any;
  options: { value: string; label: string; emoji?: string }[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'objetivo',
    title: 'Qual seu objetivo principal?',
    icon: Target,
    options: [
      { value: 'hipertrofia', label: 'Hipertrofia', emoji: '💪' },
      { value: 'emagrecimento', label: 'Emagrecimento', emoji: '🔥' },
      { value: 'forca', label: 'Força', emoji: '🏋️' },
      { value: 'condicionamento', label: 'Condicionamento', emoji: '🫁' },
      { value: 'saude', label: 'Saúde Geral', emoji: '❤️' },
      { value: 'reabilitacao', label: 'Reabilitação', emoji: '🩹' },
    ],
  },
  {
    id: 'nivel',
    title: 'Qual seu nível de experiência?',
    icon: Activity,
    options: [
      { value: 'iniciante', label: 'Iniciante', emoji: '🌱' },
      { value: 'intermediario', label: 'Intermediário', emoji: '📈' },
      { value: 'avancado', label: 'Avançado', emoji: '🏆' },
    ],
  },
  {
    id: 'frequencia',
    title: 'Quantas vezes por semana?',
    icon: Calendar,
    options: [
      { value: '2', label: '2x/semana', emoji: '2️⃣' },
      { value: '3', label: '3x/semana', emoji: '3️⃣' },
      { value: '4', label: '4x/semana', emoji: '4️⃣' },
      { value: '5', label: '5x/semana', emoji: '5️⃣' },
      { value: '6', label: '6x/semana', emoji: '6️⃣' },
    ],
  },
  {
    id: 'ambiente',
    title: 'Onde você treina?',
    icon: MapPin,
    options: [
      { value: 'academia', label: 'Academia', emoji: '🏢' },
      { value: 'casa', label: 'Em Casa', emoji: '🏠' },
      { value: 'ar_livre', label: 'Ar Livre', emoji: '🌳' },
      { value: 'hibrido', label: 'Híbrido', emoji: '🔄' },
    ],
  },
  {
    id: 'tempo',
    title: 'Tempo disponível por sessão?',
    icon: Clock,
    options: [
      { value: '30', label: '30 minutos', emoji: '⚡' },
      { value: '45', label: '45 minutos', emoji: '⏰' },
      { value: '60', label: '60 minutos', emoji: '🕐' },
      { value: '90', label: '90 minutos', emoji: '🕑' },
    ],
  },
  {
    id: 'lesoes',
    title: 'Algum histórico de lesão?',
    icon: AlertTriangle,
    options: [
      { value: 'nenhuma', label: 'Nenhuma', emoji: '✅' },
      { value: 'ombro', label: 'Ombro', emoji: '🦾' },
      { value: 'joelho', label: 'Joelho', emoji: '🦵' },
      { value: 'lombar', label: 'Lombar', emoji: '🔙' },
      { value: 'outro', label: 'Outro', emoji: '⚠️' },
    ],
  },
  {
    id: 'foco',
    title: 'Foco muscular prioritário?',
    icon: Dumbbell,
    options: [
      { value: 'superior', label: 'Membros Superiores', emoji: '💪' },
      { value: 'inferior', label: 'Membros Inferiores', emoji: '🦵' },
      { value: 'core', label: 'Core/Abdômen', emoji: '🎯' },
      { value: 'corpo_todo', label: 'Corpo Todo', emoji: '🏋️' },
    ],
  },
  {
    id: 'cardio',
    title: 'Nível de condicionamento cardiovascular?',
    icon: HeartPulse,
    options: [
      { value: 'baixo', label: 'Baixo', emoji: '🐢' },
      { value: 'medio', label: 'Médio', emoji: '🚶' },
      { value: 'alto', label: 'Alto', emoji: '🏃' },
    ],
  },
  {
    id: 'pesos',
    title: 'Experiência com pesos livres?',
    icon: Weight,
    options: [
      { value: 'nunca', label: 'Nunca usei', emoji: '🆕' },
      { value: 'basico', label: 'Básico', emoji: '📖' },
      { value: 'confortavel', label: 'Confortável', emoji: '😌' },
      { value: 'avancado', label: 'Avançado', emoji: '🔥' },
    ],
  },
];

export function SmartReinoQuiz({ alunoId, alunoNome, onWorkoutGenerated }: SmartReinoQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const { toast } = useToast();

  const totalSteps = QUESTIONS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentQuestion = QUESTIONS[currentStep];

  const selectAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    // Auto-advance after selection
    setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setShowSummary(true);
      }
    }, 300);
  };

  const goBack = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateWorkout = async () => {
    try {
      setGenerating(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({ title: 'Sessão expirada', description: 'Faça login novamente.', variant: 'destructive' });
        return;
      }

      const response = await supabase.functions.invoke('generate-workout', {
        body: {
          studentId: alunoId,
          objetivo: answers.objetivo,
          nivel: answers.nivel,
          frequenciaSemanal: parseInt(answers.frequencia),
          ambiente: answers.ambiente,
          quizAnswers: answers,
        },
      });

      if (response.error) throw new Error(response.error.message);
      
      const result = response.data;
      if (!result?.success) throw new Error(result?.error || 'Erro ao gerar treino');

      toast({ title: '🎉 Treino Gerado!', description: 'Seu plano personalizado está pronto!' });
      onWorkoutGenerated();
    } catch (error) {
      console.error('Erro ao gerar treino:', error);
      toast({
        title: 'Erro ao gerar treino',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <Card className="border-primary/30 bg-card">
        <CardContent className="py-16 text-center space-y-4">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-primary/40 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-bold">Gerando seu treino personalizado...</h3>
          <p className="text-muted-foreground">A IA está criando o plano ideal para {alunoNome}</p>
          <p className="text-xs text-muted-foreground">Isso pode levar alguns segundos</p>
        </CardContent>
      </Card>
    );
  }

  if (showSummary) {
    return (
      <Card className="border-primary/30 bg-card animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Resumo das Respostas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUESTIONS.map((q) => (
              <div key={q.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <q.icon className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{q.title}</p>
                  <p className="text-sm font-medium">
                    {q.options.find(o => o.value === answers[q.id])?.label || '-'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={goBack} className="flex-1">
              <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            <Button onClick={generateWorkout} className="flex-1 bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4 mr-1" /> Gerar Meu Treino
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-card animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {currentStep + 1} de {totalSteps}
          </Badge>
          {currentStep > 0 && (
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <currentQuestion.icon className="h-10 w-10 text-primary mx-auto" />
          <h3 className="text-xl font-bold">{currentQuestion.title}</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => selectAnswer(option.value)}
                className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-[1.02] ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <span className="text-2xl block mb-1">{option.emoji}</span>
                <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
