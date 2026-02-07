/**
 * StudentTrainingLog - Formulário de registro de treino realizado
 * PSE (1-10), duração, notas pessoais
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ClipboardCheck, Clock, Activity, MessageSquare, 
  Calendar, Info, CheckCircle2, TrendingUp 
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrainingLogEntry {
  id: string;
  data_treino: string;
  pse_sessao: number | null;
  duracao_minutos: number | null;
  notas_aluno: string | null;
  dia_treino: number | null;
  semana_treino: number | null;
  volume_total_kg: number | null;
}

interface StudentTrainingLogProps {
  alunoId: string;
  planoId?: string;
  historico: TrainingLogEntry[];
  loading: boolean;
  onLogSaved: () => void;
}

const PSE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Muito leve', color: 'text-green-400' },
  2: { label: 'Leve', color: 'text-green-500' },
  3: { label: 'Moderado', color: 'text-green-600' },
  4: { label: 'Moderado+', color: 'text-yellow-400' },
  5: { label: 'Difícil', color: 'text-yellow-500' },
  6: { label: 'Difícil+', color: 'text-yellow-600' },
  7: { label: 'Muito difícil', color: 'text-orange-500' },
  8: { label: 'Extremo', color: 'text-orange-600' },
  9: { label: 'Máximo', color: 'text-red-500' },
  10: { label: 'Exaustão total', color: 'text-red-600' },
};

export function StudentTrainingLog({ alunoId, planoId, historico, loading, onLogSaved }: StudentTrainingLogProps) {
  const [pse, setPse] = useState(5);
  const [duracao, setDuracao] = useState('');
  const [notas, setNotas] = useState('');
  const [volumeTotal, setVolumeTotal] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!duracao) {
      toast({ title: "Campo obrigatório", description: "Informe a duração do treino.", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('historico_treinos_realizados')
        .insert({
          aluno_id: alunoId,
          plano_treino_id: planoId || null,
          data_treino: new Date().toISOString().split('T')[0],
          pse_sessao: pse,
          duracao_minutos: parseInt(duracao),
          notas_aluno: notas || null,
          volume_total_kg: volumeTotal ? parseFloat(volumeTotal) : null,
          exercicios_realizados: {},
        });

      if (error) throw error;

      toast({ title: "Treino registrado! 💪", description: "Seu treino foi salvo com sucesso." });
      setPse(5);
      setDuracao('');
      setNotas('');
      setVolumeTotal('');
      setShowForm(false);
      onLogSaved();
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      toast({ title: "Erro ao salvar", description: "Tente novamente em alguns segundos.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Botão novo registro */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="btn-glow w-full sm:w-auto">
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Registrar Treino de Hoje
        </Button>
      )}

      {/* Formulário */}
      {showForm && (
        <Card className="glass border-primary/30 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Registrar Treino
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* PSE */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="font-medium">PSE (Percepção Subjetiva de Esforço)</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Escala de 1 a 10 para indicar o quão intenso foi seu treino. 1 = muito leve, 10 = exaustão total.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Slider
                value={[pse]}
                onValueChange={(v) => setPse(v[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <span className={`text-2xl font-bold ${PSE_LABELS[pse]?.color || ''}`}>{pse}</span>
                <Badge variant="outline" className={PSE_LABELS[pse]?.color || ''}>
                  {PSE_LABELS[pse]?.label || ''}
                </Badge>
              </div>
            </div>

            {/* Duração e Volume */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Duração (min) *
                </Label>
                <Input
                  type="number"
                  placeholder="Ex: 60"
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Activity className="h-4 w-4" /> Volume Total (kg)
                </Label>
                <Input
                  type="number"
                  placeholder="Ex: 5000"
                  value={volumeTotal}
                  onChange={(e) => setVolumeTotal(e.target.value)}
                />
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" /> Notas Pessoais
              </Label>
              <Textarea
                placeholder="Como você se sentiu? Algo diferente hoje? Dor ou desconforto?"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
              />
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? 'Salvando...' : 'Salvar Registro'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico de Treinos
        </h3>
        
        {historico.length === 0 ? (
          <Card className="glass border-border/50">
            <CardContent className="py-8 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum treino registrado ainda.</p>
              <p className="text-sm text-muted-foreground">Complete seu primeiro treino e registre aqui!</p>
            </CardContent>
          </Card>
        ) : (
          historico.map((entry) => (
            <Card key={entry.id} className="glass border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {format(new Date(entry.data_treino), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {entry.pse_sessao && (
                        <Badge variant="outline" className={PSE_LABELS[entry.pse_sessao]?.color || ''}>
                          PSE: {entry.pse_sessao}
                        </Badge>
                      )}
                      {entry.duracao_minutos && (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {entry.duracao_minutos} min
                        </Badge>
                      )}
                      {entry.volume_total_kg && (
                        <Badge variant="outline">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {entry.volume_total_kg} kg
                        </Badge>
                      )}
                    </div>
                    {entry.notas_aluno && (
                      <p className="text-sm text-muted-foreground italic mt-1">"{entry.notas_aluno}"</p>
                    )}
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
