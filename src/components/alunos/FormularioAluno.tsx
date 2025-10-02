/**
 * Formulário para cadastro e edição de alunos
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlunosService, type NovoAlunoInput, type Aluno } from '@/services/alunosService';
import { useToast } from '@/hooks/use-toast';

interface FormularioAlunoProps {
  aluno?: Aluno;
  onSuccess: () => void;
}

export function FormularioAluno({ aluno, onSuccess }: FormularioAlunoProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<NovoAlunoInput>>({
    nome: aluno?.nome || '',
    email: aluno?.email || '',
    telefone: aluno?.telefone || '',
    genero: aluno?.genero || '',
    objetivo: aluno?.objetivo || '',
    nivel_experiencia: aluno?.nivel_experiencia || 'iniciante',
    ambiente_treino: aluno?.ambiente_treino || 'academia',
    frequencia_semanal: aluno?.frequencia_semanal || 3,
    peso_atual: aluno?.peso_atual,
    altura_cm: aluno?.altura_cm,
    restricoes_medicas: aluno?.restricoes_medicas || '',
    observacoes: aluno?.observacoes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.objetivo) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha nome, email e objetivo"
      });
      return;
    }

    try {
      setLoading(true);
      
      if (aluno) {
        await AlunosService.atualizarAluno(aluno.id, formData as NovoAlunoInput);
        toast({
          title: "✅ Aluno atualizado",
          description: "Dados atualizados com sucesso"
        });
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => updateField('nome', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => updateField('telefone', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="genero">Gênero</Label>
          <Select value={formData.genero} onValueChange={(v) => updateField('genero', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="feminino">Feminino</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="objetivo">Objetivo *</Label>
          <Input
            id="objetivo"
            value={formData.objetivo}
            onChange={(e) => updateField('objetivo', e.target.value)}
            placeholder="Ex: Hipertrofia, Emagrecimento"
            required
          />
        </div>

        <div>
          <Label htmlFor="nivel">Nível de Experiência</Label>
          <Select value={formData.nivel_experiencia} onValueChange={(v) => updateField('nivel_experiencia', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="iniciante">Iniciante</SelectItem>
              <SelectItem value="intermediario">Intermediário</SelectItem>
              <SelectItem value="avancado">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="ambiente">Ambiente de Treino</Label>
          <Select value={formData.ambiente_treino} onValueChange={(v) => updateField('ambiente_treino', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="academia">Academia</SelectItem>
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="hibrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="frequencia">Frequência Semanal</Label>
          <Input
            id="frequencia"
            type="number"
            min="1"
            max="7"
            value={formData.frequencia_semanal}
            onChange={(e) => updateField('frequencia_semanal', parseInt(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="peso">Peso (kg)</Label>
          <Input
            id="peso"
            type="number"
            step="0.1"
            value={formData.peso_atual || ''}
            onChange={(e) => updateField('peso_atual', parseFloat(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="altura">Altura (cm)</Label>
          <Input
            id="altura"
            type="number"
            value={formData.altura_cm || ''}
            onChange={(e) => updateField('altura_cm', parseInt(e.target.value))}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="restricoes">Restrições Médicas</Label>
          <Textarea
            id="restricoes"
            value={formData.restricoes_medicas}
            onChange={(e) => updateField('restricoes_medicas', e.target.value)}
            placeholder="Lesões, problemas de saúde, etc."
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => updateField('observacoes', e.target.value)}
            placeholder="Informações adicionais relevantes"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : aluno ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}
