/**
 * Formulário para cadastro e edição de alunos
 * Nome + Telefone + 15 perguntas de treino clicáveis
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlunosService, type NovoAlunoInput, type Aluno } from '@/services/alunosService';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { 
  Target, Dumbbell, Calendar, MapPin, Clock, AlertTriangle, 
  Activity, Heart, Weight, Zap, HeartPulse, Wrench, Users, Sun, Timer
} from 'lucide-react';

interface FormularioAlunoProps {
  aluno?: Aluno;
  onSuccess: () => void;
}

// ── Option constants ──

const OBJETIVOS = [
  { value: 'hipertrofia', label: 'Hipertrofia', icon: Dumbbell },
  { value: 'emagrecimento', label: 'Emagrecimento', icon: Zap },
  { value: 'forca', label: 'Força', icon: Weight },
  { value: 'condicionamento', label: 'Condicionamento', icon: HeartPulse },
  { value: 'saude', label: 'Saúde', icon: Heart },
  { value: 'reabilitacao', label: 'Reabilitação', icon: Activity },
];

const NIVEIS = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
];

const FREQUENCIAS = [
  { value: '2', label: '2x/sem' },
  { value: '3', label: '3x/sem' },
  { value: '4', label: '4x/sem' },
  { value: '5', label: '5x/sem' },
  { value: '6', label: '6x/sem' },
];

const AMBIENTES = [
  { value: 'academia', label: 'Academia' },
  { value: 'casa', label: 'Casa' },
  { value: 'ar_livre', label: 'Ar Livre' },
  { value: 'hibrido', label: 'Híbrido' },
];

const TEMPOS = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
  { value: '90', label: '90 min' },
];

const LESOES = [
  { value: 'nenhuma', label: 'Nenhuma' },
  { value: 'ombro', label: 'Ombro' },
  { value: 'joelho', label: 'Joelho' },
  { value: 'lombar', label: 'Lombar' },
  { value: 'outro', label: 'Outro' },
];

const FOCOS = [
  { value: 'superior', label: 'Superior' },
  { value: 'inferior', label: 'Inferior' },
  { value: 'core', label: 'Core' },
  { value: 'corpo_todo', label: 'Corpo Todo' },
];

const CONDICIONAMENTO = [
  { value: 'baixo', label: 'Baixo' },
  { value: 'medio', label: 'Médio' },
  { value: 'alto', label: 'Alto' },
];

const EXP_PESOS = [
  { value: 'nunca', label: 'Nunca' },
  { value: 'basico', label: 'Básico' },
  { value: 'confortavel', label: 'Confortável' },
  { value: 'avancado', label: 'Avançado' },
];

const INTENSIDADE = [
  { value: 'curto_intenso', label: 'Curtos e Intensos' },
  { value: 'longo_moderado', label: 'Longos e Moderados' },
];

const PREF_CARDIO = [
  { value: 'integrado', label: 'Integrado ao treino' },
  { value: 'separado', label: 'Separado' },
];

const PREF_EQUIP = [
  { value: 'maquinas', label: 'Máquinas' },
  { value: 'pesos_livres', label: 'Pesos Livres' },
  { value: 'ambos', label: 'Ambos' },
];

const HORARIOS = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
];

const METAS_TEMPO = [
  { value: '1', label: '1 mês' },
  { value: '3', label: '3 meses' },
  { value: '6', label: '6 meses' },
  { value: '12', label: '12 meses' },
];

// ── Chip selector ──

interface ChipSelectorProps {
  options: { value: string; label: string; icon?: any }[];
  value: string | undefined;
  onChange: (val: string) => void;
}

function ChipSelector({ options, value, onChange }: ChipSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-1.5 ${
              isSelected
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:border-primary/50'
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Form state (all strings for simplicity, convert on submit) ──

interface FormState {
  nome: string;
  telefone: string;
  objetivo: string;
  nivel_experiencia: string;
  frequencia_semanal: string;
  ambiente_treino: string;
  tempo_disponivel_min: string;
  historico_lesoes: string;
  foco_muscular: string;
  condicionamento_cardio: string;
  experiencia_pesos_livres: string;
  preferencia_intensidade: string;
  preferencia_cardio: string;
  preferencia_equipamento: string;
  treina_sozinho: string;
  horario_preferido: string;
  meta_tempo_meses: string;
  observacoes: string;
}

function buildInitialState(aluno?: Aluno): FormState {
  return {
    nome: aluno?.nome ?? '',
    telefone: aluno?.telefone ?? '',
    objetivo: aluno?.objetivo ?? 'hipertrofia',
    nivel_experiencia: aluno?.nivel_experiencia ?? 'iniciante',
    frequencia_semanal: String(aluno?.frequencia_semanal ?? 3),
    ambiente_treino: aluno?.ambiente_treino ?? 'academia',
    tempo_disponivel_min: String(aluno?.tempo_disponivel_min ?? 60),
    historico_lesoes: aluno?.historico_lesoes ?? 'nenhuma',
    foco_muscular: aluno?.foco_muscular ?? 'corpo_todo',
    condicionamento_cardio: aluno?.condicionamento_cardio ?? 'medio',
    experiencia_pesos_livres: aluno?.experiencia_pesos_livres ?? 'basico',
    preferencia_intensidade: aluno?.preferencia_intensidade ?? 'curto_intenso',
    preferencia_cardio: aluno?.preferencia_cardio ?? 'integrado',
    preferencia_equipamento: aluno?.preferencia_equipamento ?? 'ambos',
    treina_sozinho: String(aluno?.treina_sozinho ?? true),
    horario_preferido: aluno?.horario_preferido ?? 'manha',
    meta_tempo_meses: String(aluno?.meta_tempo_meses ?? 3),
    observacoes: aluno?.observacoes ?? '',
  };
}

// ── Main component ──

export function FormularioAluno({ aluno, onSuccess }: FormularioAlunoProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(() => buildInitialState(aluno));

  const set = (field: keyof FormState) => (val: string) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      toast({ variant: "destructive", title: "Campo obrigatório", description: "Preencha o nome do aluno" });
      return;
    }

    setLoading(true);

    try {
      const input: NovoAlunoInput = {
        nome: form.nome.trim(),
        email: '', // auto-generated by service
        telefone: form.telefone || undefined,
        objetivo: form.objetivo,
        nivel_experiencia: form.nivel_experiencia,
        frequencia_semanal: Number(form.frequencia_semanal),
        ambiente_treino: form.ambiente_treino,
        tempo_disponivel_min: Number(form.tempo_disponivel_min),
        historico_lesoes: form.historico_lesoes,
        foco_muscular: form.foco_muscular,
        condicionamento_cardio: form.condicionamento_cardio,
        experiencia_pesos_livres: form.experiencia_pesos_livres,
        preferencia_intensidade: form.preferencia_intensidade,
        preferencia_cardio: form.preferencia_cardio,
        preferencia_equipamento: form.preferencia_equipamento,
        treina_sozinho: form.treina_sozinho === 'true',
        horario_preferido: form.horario_preferido,
        meta_tempo_meses: Number(form.meta_tempo_meses),
        observacoes: form.observacoes || undefined,
      };

      if (aluno) {
        await AlunosService.atualizarAluno(aluno.id, input);
        toast({ title: "✅ Aluno atualizado", description: "Dados atualizados com sucesso" });
      } else {
        await AlunosService.criarAluno(input);
        toast({ title: "✅ Aluno cadastrado", description: "Aluno adicionado com sucesso ao sistema" });
      }

      onSuccess();
    } catch (error) {
      console.error('[FormularioAluno] Erro:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar aluno",
        description: error instanceof Error ? error.message : "Erro desconhecido. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Dados Pessoais */}
      <div>
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
          <Users className="h-4 w-4" /> Dados Pessoais
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => set('nome')(e.target.value)}
              required
              placeholder="Nome do aluno"
            />
          </div>
          <div>
            <Label htmlFor="telefone">Telefone/WhatsApp</Label>
            <Input
              id="telefone"
              value={form.telefone}
              onChange={(e) => set('telefone')(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* 9 Perguntas de Treino */}
      <div>
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4">
          <Dumbbell className="h-4 w-4" /> Perfil de Treino (9 perguntas)
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Target className="h-3.5 w-3.5" /> 1. Objetivo Principal</Label>
            <ChipSelector options={OBJETIVOS} value={form.objetivo} onChange={set('objetivo')} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Activity className="h-3.5 w-3.5" /> 2. Nível de Experiência</Label>
            <ChipSelector options={NIVEIS} value={form.nivel_experiencia} onChange={set('nivel_experiencia')} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Calendar className="h-3.5 w-3.5" /> 3. Frequência Semanal</Label>
            <ChipSelector options={FREQUENCIAS} value={form.frequencia_semanal} onChange={set('frequencia_semanal')} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><MapPin className="h-3.5 w-3.5" /> 4. Ambiente de Treino</Label>
            <ChipSelector options={AMBIENTES} value={form.ambiente_treino} onChange={set('ambiente_treino')} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Clock className="h-3.5 w-3.5" /> 5. Tempo Disponível por Sessão</Label>
            <ChipSelector options={TEMPOS} value={form.tempo_disponivel_min} onChange={set('tempo_disponivel_min')} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><AlertTriangle className="h-3.5 w-3.5" /> 6. Histórico de Lesões</Label>
            <ChipSelector options={LESOES} value={form.historico_lesoes} onChange={set('historico_lesoes')} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Dumbbell className="h-3.5 w-3.5" /> 7. Foco Muscular Prioritário</Label>
            <ChipSelector options={FOCOS} value={form.foco_muscular} onChange={set('foco_muscular')} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><HeartPulse className="h-3.5 w-3.5" /> 8. Condicionamento Cardiovascular</Label>
            <ChipSelector options={CONDICIONAMENTO} value={form.condicionamento_cardio} onChange={set('condicionamento_cardio')} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Weight className="h-3.5 w-3.5" /> 9. Experiência com Pesos Livres</Label>
            <ChipSelector options={EXP_PESOS} value={form.experiencia_pesos_livres} onChange={set('experiencia_pesos_livres')} />
          </div>
        </div>
      </div>

      <Separator />

      {/* 6 Perguntas de Preferência */}
      <div>
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4">
          <Wrench className="h-4 w-4" /> Preferências de Treino (6 perguntas)
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Zap className="h-3.5 w-3.5" /> 1. Intensidade Preferida</Label>
            <ChipSelector options={INTENSIDADE} value={form.preferencia_intensidade} onChange={set('preferencia_intensidade')} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><HeartPulse className="h-3.5 w-3.5" /> 2. Cardio</Label>
            <ChipSelector options={PREF_CARDIO} value={form.preferencia_cardio} onChange={set('preferencia_cardio')} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Wrench className="h-3.5 w-3.5" /> 3. Equipamento Preferido</Label>
            <ChipSelector options={PREF_EQUIP} value={form.preferencia_equipamento} onChange={set('preferencia_equipamento')} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Users className="h-3.5 w-3.5" /> 4. Treina Sozinho?</Label>
            <ChipSelector 
              options={[{ value: 'true', label: 'Sozinho' }, { value: 'false', label: 'Com Parceiro' }]} 
              value={form.treina_sozinho} 
              onChange={set('treina_sozinho')} 
            />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Sun className="h-3.5 w-3.5" /> 5. Horário Preferido</Label>
            <ChipSelector options={HORARIOS} value={form.horario_preferido} onChange={set('horario_preferido')} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Timer className="h-3.5 w-3.5" /> 6. Meta de Tempo</Label>
            <ChipSelector options={METAS_TEMPO} value={form.meta_tempo_meses} onChange={set('meta_tempo_meses')} />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <Label htmlFor="observacoes">Observações Adicionais</Label>
        <Textarea
          id="observacoes"
          value={form.observacoes}
          onChange={(e) => set('observacoes')(e.target.value)}
          placeholder="Informações extras relevantes"
        />
      </div>

      <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-4">
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? 'Salvando...' : aluno ? 'Atualizar' : 'Cadastrar Aluno'}
        </Button>
      </div>
    </form>
  );
}
