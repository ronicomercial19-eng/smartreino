/**
 * Página principal de gerenciamento de alunos
 * Funcionalidades: Listar, Adicionar, Editar, Excluir, Enviar Treino
 */

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/shared/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlunosService, type Aluno } from '@/services/alunosService';
import { Plus, Search, Users, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormularioAluno } from '@/components/alunos/FormularioAluno';
import { TabelaAlunos } from '@/components/alunos/TabelaAlunos';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function GerenciamentoAlunos() {
  const { toast } = useToast();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunosFiltrados, setAlunosFiltrados] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    porObjetivo: {} as Record<string, number>
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    filtrarAlunos();
  }, [searchTerm, alunos]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [alunosData, stats] = await Promise.all([
        AlunosService.listarAlunos(),
        AlunosService.obterEstatisticas()
      ]);
      
      setAlunos(alunosData);
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar alunos",
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    } finally {
      setLoading(false);
    }
  };

  const filtrarAlunos = () => {
    if (!searchTerm.trim()) {
      setAlunosFiltrados(alunos);
      return;
    }

    const termo = searchTerm.toLowerCase();
    const filtrados = alunos.filter(aluno => 
      aluno.nome.toLowerCase().includes(termo) ||
      aluno.email.toLowerCase().includes(termo) ||
      aluno.objetivo.toLowerCase().includes(termo)
    );
    
    setAlunosFiltrados(filtrados);
  };

  const handleAlunoAdicionado = () => {
    setDialogAberto(false);
    carregarDados();
    toast({
      title: "✅ Aluno cadastrado",
      description: "Aluno adicionado com sucesso ao sistema"
    });
  };

  const handleExcluirAluno = async (id: string) => {
    try {
      await AlunosService.excluirAluno(id);
      carregarDados();
      toast({
        title: "✅ Aluno removido",
        description: "Aluno marcado como inativo"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir aluno",
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Gerenciamento de Alunos"
      subtitle="Cadastre, gerencie e acompanhe seus alunos"
      actions={
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
              <DialogDescription>
                Preencha os dados do aluno para criar o cadastro
              </DialogDescription>
            </DialogHeader>
            <FormularioAluno onSuccess={handleAlunoAdicionado} />
          </DialogContent>
        </Dialog>
      }
    >
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.ativos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Atividade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.total > 0 
                ? Math.round((estatisticas.ativos / estatisticas.total) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Alunos ativos no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objetivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {Object.entries(estatisticas.porObjetivo).map(([objetivo, count]) => (
                <Badge key={objetivo} variant="secondary" className="text-xs">
                  {objetivo}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou objetivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabela de Alunos */}
      <TabelaAlunos 
        alunos={alunosFiltrados} 
        onExcluir={handleExcluirAluno}
        onAtualizar={carregarDados}
      />
    </PageLayout>
  );
}
