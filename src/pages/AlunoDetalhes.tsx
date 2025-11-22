/**
 * Página de detalhes do aluno com histórico de treinos
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlunosService, type Aluno } from '@/services/alunosService';
import { PageLayout } from '@/components/shared/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Dumbbell, Mail, Phone, User, Weight, Ruler, Activity } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

export default function AlunoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarAluno = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await AlunosService.buscarAlunoPorId(id);
        setAluno(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar aluno",
          description: error instanceof Error ? error.message : "Erro desconhecido"
        });
        navigate('/admin-students');
      } finally {
        setLoading(false);
      }
    };

    carregarAluno();
  }, [id, navigate, toast]);

  const calcularIdade = (dataNascimento?: string) => {
    if (!dataNascimento) return 'N/A';
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const calcularIMC = (peso?: number, altura?: number) => {
    if (!peso || !altura) return null;
    const alturaMetros = altura / 100;
    return (peso / (alturaMetros * alturaMetros)).toFixed(2);
  };

  const formatarData = (data?: string) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <PageLayout title="Detalhes do Aluno">
        <LoadingSpinner text="Carregando dados do aluno..." />
      </PageLayout>
    );
  }

  if (!aluno) {
    return (
      <PageLayout title="Aluno não encontrado">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Aluno não encontrado</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate('/admin-students')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const imc = calcularIMC(aluno.peso_atual, aluno.altura_cm);

  return (
    <PageLayout title="Detalhes do Aluno">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate('/admin-students')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Badge variant={aluno.status === 'ativo' ? 'default' : 'secondary'}>
            {aluno.status}
          </Badge>
        </div>

        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome Completo</p>
              <p className="font-medium">{aluno.nome}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{aluno.email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{aluno.telefone || 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gênero</p>
              <p className="font-medium capitalize">{aluno.genero || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Nascimento</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{formatarData(aluno.data_nascimento)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Idade</p>
              <p className="font-medium">{calcularIdade(aluno.data_nascimento)} anos</p>
            </div>
          </CardContent>
        </Card>

        {/* Dados Físicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Dados Físicos
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Peso</p>
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-lg">{aluno.peso_atual ? `${aluno.peso_atual} kg` : 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Altura</p>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-lg">{aluno.altura_cm ? `${aluno.altura_cm} cm` : 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IMC</p>
              <p className="font-medium text-lg">{imc || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Dados de Treino */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Informações de Treino
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Objetivo Principal</p>
              <Badge className="mt-1">{aluno.objetivo}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nível de Experiência</p>
              <Badge variant="outline" className="mt-1 capitalize">
                {aluno.nivel_experiencia}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ambiente de Treino</p>
              <p className="font-medium capitalize">{aluno.ambiente_treino || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Frequência Semanal</p>
              <p className="font-medium">{aluno.frequencia_semanal || 'N/A'} vezes/semana</p>
            </div>
          </CardContent>
        </Card>

        {/* Restrições e Observações */}
        {(aluno.restricoes_medicas || aluno.observacoes) && (
          <Card>
            <CardHeader>
              <CardTitle>Restrições e Observações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aluno.restricoes_medicas && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Restrições Médicas</p>
                  <p className="text-sm whitespace-pre-wrap">{aluno.restricoes_medicas}</p>
                </div>
              )}
              {aluno.restricoes_medicas && aluno.observacoes && <Separator />}
              {aluno.observacoes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Observações</p>
                  <p className="text-sm whitespace-pre-wrap">{aluno.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Histórico de Treinos */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Treinos</CardTitle>
            <CardDescription>
              Treinos associados a este aluno
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum treino associado ainda</p>
              <div className="flex gap-3 justify-center mt-4">
                <Button onClick={() => navigate('/generate-workout', { state: { aluno } })}>
                  Gerar Primeiro Treino
                </Button>
                <Button variant="outline" onClick={() => navigate(`/student-analytics/${aluno.id}`)}>
                  Ver Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Cadastro */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Cadastro</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Data de Cadastro</p>
              <p className="font-medium">{formatarData(aluno.data_cadastro)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Última Atualização</p>
              <p className="font-medium">{formatarData(aluno.ultima_atualizacao)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
