/**
 * Dialog para enviar plano de treino para aluno
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlanosTreinoService } from '@/services/planosTreinoService';
import { type Aluno } from '@/services/alunosService';

interface EnviarTreinoDialogProps {
  aluno: Aluno;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnviarTreinoDialog({ aluno, open, onOpenChange }: EnviarTreinoDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_plano: '',
    descricao: '',
    objetivo: aluno.objetivo,
    tipo_periodizacao: 'linear',
    duracao_semanas: 12,
    frequencia_semanal: aluno.frequencia_semanal || 3,
    estrutura_treino: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await PlanosTreinoService.criarPlano({
        aluno_id: aluno.id,
        ...formData
      });

      toast({
        title: "✅ Treino enviado",
        description: `Plano de treino criado para ${aluno.nome}`
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar treino",
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar Plano de Treino</DialogTitle>
          <DialogDescription>
            Criar e enviar plano de treino para {aluno.nome}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome_plano">Nome do Plano *</Label>
            <Input
              id="nome_plano"
              value={formData.nome_plano}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_plano: e.target.value }))}
              placeholder="Ex: Hipertrofia 12 semanas"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o plano de treino..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo de Periodização</Label>
              <Select 
                value={formData.tipo_periodizacao} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_periodizacao: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="ondulada">Ondulada</SelectItem>
                  <SelectItem value="bloco">Bloco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duracao">Duração (semanas)</Label>
              <Input
                id="duracao"
                type="number"
                min="1"
                max="52"
                value={formData.duracao_semanas}
                onChange={(e) => setFormData(prev => ({ ...prev, duracao_semanas: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="frequencia">Frequência Semanal</Label>
              <Input
                id="frequencia"
                type="number"
                min="1"
                max="7"
                value={formData.frequencia_semanal}
                onChange={(e) => setFormData(prev => ({ ...prev, frequencia_semanal: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="objetivo">Objetivo</Label>
              <Input
                id="objetivo"
                value={formData.objetivo}
                onChange={(e) => setFormData(prev => ({ ...prev, objetivo: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Treino'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
