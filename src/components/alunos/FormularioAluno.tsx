/**
 * Formulário para cadastro e edição de alunos
 * Nome + Telefone + 15 perguntas de treino clicáveis
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlunosService, type NovoAlunoInput, type Aluno } from '@/services/alunosService';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Target, Dumbbell, Calendar, MapPin, Clock, AlertTriangle, 
  Activity, Heart, Weight, Zap, HeartPulse, Wrench, Users, Sun, Timer
} from 'lucide-react';

interface FormularioAlunoProps {
  aluno?: Aluno;
  onSuccess: () => void;
}

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
  { value: 2, label: '2x/sem' },
  { value: 3, label: '3x/sem' },
  { value: 4, label: '4x/sem' },
  { value: 5, label: '5x/sem' },
  { value: 6, label: '6x/sem' },
];

const AMBIENTES = [
  { value: 'academia', label: 'Academia' },
  { value: 'casa', label: 'Casa' },
  { value: 'ar_livre', label: 'Ar Livre' },
  { value: 'hibrido', label: 'Híbrido' },
];

const TEMPOS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
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
  { value: 1, label: '1 mês' },
  { value: 3, label: '3 meses' },
  { value: 6, label: '6 meses' },
  { value: 12, label: '12 meses' },
];

interface ChipSelectorProps {
  options: { value: string | number; label: string; icon?: any }[];
  value: string | number | undefined;
  onChange: (val: any) => void;
}

function ChipSelector({ options, value, onChange }: ChipSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = String(value) === String(opt.value);
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

export function FormularioAluno({ aluno, onSuccess }: FormularioAlunoProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<NovoAlunoInput>>({
    nome: aluno?.nome || '',
    email: aluno?.email || '',
    telefone: aluno?.telefone || '',
    objetivo: aluno?.objetivo || 'hipertrofia',
    nivel_experiencia: aluno?.nivel_experiencia || 'iniciante',
    frequencia_semanal: aluno?.frequencia_semanal || 3,
    ambiente_treino: aluno?.ambiente_treino || 'academia',
    tempo_disponivel_min: aluno?.tempo_disponivel_min || 60,
    historico_lesoes: aluno?.historico_lesoes || 'nenhuma',
    foco_muscular: aluno?.foco_muscular || 'corpo_todo',
    condicionamento_cardio: aluno?.condicionamento_cardio || 'medio',
    experiencia_pesos_livres: aluno?.experiencia_pesos_livres || 'basico',
    preferencia_intensidade: aluno?.preferencia_intensidade || 'curto_intenso',
    preferencia_cardio: aluno?.preferencia_cardio || 'integrado',
    preferencia_equipamento: aluno?.preferencia_equipamento || 'ambos',
    treina_sozinho: aluno?.treina_sozinho ?? true,
    horario_preferido: aluno?.horario_preferido || 'manha',
    meta_tempo_meses: aluno?.meta_tempo_meses || 3,
    observacoes: aluno?.observacoes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome) {
      toast({ variant: "destructive", title: "Campo obrigatório", description: "Preencha o nome do aluno" });
      return;
    }

    try {
      setLoading(true);
      
      if (aluno) {
        await AlunosService.atualizarAluno(aluno.id, formData as NovoAlunoInput);
        toast({ title: "✅ Aluno atualizado", description: "Dados atualizados com sucesso" });
      } else {
        await AlunosService.criarAluno(formData as NovoAlunoInput);
      }
      
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof NovoAlunoInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <Input id="nome" value={formData.nome} onChange={(e) => updateField('nome', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="telefone">Telefone/WhatsApp</Label>
            <Input id="telefone" value={formData.telefone} onChange={(e) => updateField('telefone', e.target.value)} placeholder="(11) 99999-9999" />
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
            <ChipSelector options={OBJETIVOS} value={formData.objetivo} onChange={(v) => updateField('objetivo', v)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Activity className="h-3.5 w-3.5" /> 2. Nível de Experiência</Label>
            <ChipSelector options={NIVEIS} value={formData.nivel_experiencia} onChange={(v) => updateField('nivel_experiencia', v)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Calendar className="h-3.5 w-3.5" /> 3. Frequência Semanal</Label>
            <ChipSelector options={FREQUENCIAS} value={formData.frequencia_semanal} onChange={(v) => updateField('frequencia_semanal', v)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><MapPin className="h-3.5 w-3.5" /> 4. Ambiente de Treino</Label>
            <ChipSelector options={AMBIENTES} value={formData.ambiente_treino} onChange={(v) => updateField('ambiente_treino', v)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Clock className="h-3.5 w-3.5" /> 5. Tempo Disponível por Sessão</Label>
            <ChipSelector options={TEMPOS} value={formData.tempo_disponivel_min} onChange={(v) => updateField('tempo_disponivel_min', v)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><AlertTriangle className="h-3.5 w-3.5" /> 6. Histórico de Lesões</Label>
            <ChipSelector options={LESOES} value={formData.historico_lesoes} onChange={(v) => updateField('historico_lesoes', v)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Dumbbell className="h-3.5 w-3.5" /> 7. Foco Muscular Prioritário</Label>
            <ChipSelector options={FOCOS} value={formData.foco_muscular} onChange={(v) => updateField('foco_muscular', v)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><HeartPulse className="h-3.5 w-3.5" /> 8. Condicionamento Cardiovascular</Label>
            <ChipSelector options={CONDICIONAMENTO} value={formData.condicionamento_cardio} onChange={(v) => updateField('condicionamento_cardio', v)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Weight className="h-3.5 w-3.5" /> 9. Experiência com Pesos Livres</Label>
            <ChipSelector options={EXP_PESOS} value={formData.experiencia_pesos_livres} onChange={(v) => updateField('experiencia_pesos_livres', v)} />
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
            <ChipSelector options={INTENSIDADE} value={formData.preferencia_intensidade} onChange={(v) => updateField('preferencia_intensidade', v)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><HeartPulse className="h-3.5 w-3.5" /> 2. Cardio</Label>
            <ChipSelector options={PREF_CARDIO} value={formData.preferencia_cardio} onChange={(v) => updateField('preferencia_cardio', v)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Wrench className="h-3.5 w-3.5" /> 3. Equipamento Preferido</Label>
            <ChipSelector options={PREF_EQUIP} value={formData.preferencia_equipamento} onChange={(v) => updateField('preferencia_equipamento', v)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Users className="h-3.5 w-3.5" /> 4. Treina Sozinho?</Label>
            <ChipSelector 
              options={[{ value: 'true', label: 'Sozinho' }, { value: 'false', label: 'Com Parceiro' }]} 
              value={String(formData.treina_sozinho)} 
              onChange={(v) => updateField('treina_sozinho', v === 'true')} 
            />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Sun className="h-3.5 w-3.5" /> 5. Horário Preferido</Label>
            <ChipSelector options={HORARIOS} value={formData.horario_preferido} onChange={(v) => updateField('horario_preferido', v)} />
          </div>
          <div>
            <Label className="flex items-center gap-1.5 mb-2"><Timer className="h-3.5 w-3.5" /> 6. Meta de Tempo</Label>
            <ChipSelector options={METAS_TEMPO} value={formData.meta_tempo_meses} onChange={(v) => updateField('meta_tempo_meses', v)} />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <Label htmlFor="observacoes">Observações Adicionais</Label>
        <Textarea id="observacoes" value={formData.observacoes} onChange={(e) => updateField('observacoes', e.target.value)} placeholder="Informações extras relevantes" />
      </div>

      <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-4">
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? 'Salvando...' : aluno ? 'Atualizar' : 'Cadastrar Aluno'}
        </Button>
      </div>
    </form>
  );
}
