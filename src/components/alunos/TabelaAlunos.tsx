/**
 * Tabela para exibição de alunos com ações
 */

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Send, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FormularioAluno } from './FormularioAluno';
import { EnviarTreinoDialog } from './EnviarTreinoDialog';
import { type Aluno } from '@/services/alunosService';
import { useNavigate } from 'react-router-dom';

interface TabelaAlunosProps {
  alunos: Aluno[];
  onExcluir: (id: string) => void;
  onAtualizar: () => void;
}

export function TabelaAlunos({ alunos, onExcluir, onAtualizar }: TabelaAlunosProps) {
  const navigate = useNavigate();
  const [alunoEditando, setAlunoEditando] = useState<Aluno | null>(null);
  const [alunoExcluindo, setAlunoExcluindo] = useState<string | null>(null);
  const [alunoEnviandoTreino, setAlunoEnviandoTreino] = useState<Aluno | null>(null);

  const handleEditar = (aluno: Aluno) => {
    setAlunoEditando(aluno);
  };

  const handleExcluir = () => {
    if (alunoExcluindo) {
      onExcluir(alunoExcluindo);
      setAlunoExcluindo(null);
    }
  };

  const handleVisualizar = (aluno: Aluno) => {
    navigate(`/aluno/${aluno.id}`);
  };

  if (alunos.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">Nenhum aluno cadastrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Objetivo</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alunos.map((aluno) => (
              <TableRow key={aluno.id}>
                <TableCell className="font-medium">{aluno.nome}</TableCell>
                <TableCell>{aluno.email}</TableCell>
                <TableCell>{aluno.objetivo}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {aluno.nivel_experiencia || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={aluno.status === 'ativo' ? 'default' : 'secondary'}>
                    {aluno.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleVisualizar(aluno)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAlunoEnviandoTreino(aluno)}>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Treino
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditar(aluno)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setAlunoExcluindo(aluno.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={!!alunoEditando} onOpenChange={() => setAlunoEditando(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
            <DialogDescription>
              Atualize os dados do aluno
            </DialogDescription>
          </DialogHeader>
          {alunoEditando && (
            <FormularioAluno 
              aluno={alunoEditando}
              onSuccess={() => {
                setAlunoEditando(null);
                onAtualizar();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Enviar Treino */}
      {alunoEnviandoTreino && (
        <EnviarTreinoDialog
          aluno={alunoEnviandoTreino}
          open={!!alunoEnviandoTreino}
          onOpenChange={() => setAlunoEnviandoTreino(null)}
        />
      )}

      {/* Alert de Exclusão */}
      <AlertDialog open={!!alunoExcluindo} onOpenChange={() => setAlunoExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
