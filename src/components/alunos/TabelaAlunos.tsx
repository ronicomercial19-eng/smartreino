/**
 * Tabela de alunos — fonte canônica (vw_alunos_canonical)
 * Colunas: ID, Objetivo, Nível, Status
 */

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2, Send, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EnviarTreinoDialog } from './EnviarTreinoDialog';
import { type Aluno } from '@/services/alunosService';
import { useNavigate } from 'react-router-dom';

interface TabelaAlunosProps {
  alunos: Aluno[];
  onExcluir: (id: string) => void;
  onAtualizar: () => void;
}

export function TabelaAlunos({ alunos, onExcluir }: TabelaAlunosProps) {
  const navigate = useNavigate();
  const [alunoExcluindo, setAlunoExcluindo] = useState<string | null>(null);
  const [alunoEnviandoTreino, setAlunoEnviandoTreino] = useState<Aluno | null>(null);
  const [semPeriodizacao, setSemPeriodizacao] = useState<Set<string>>(new Set());

  // Verifica quais alunos NÃO têm periodização ativa (in_progress/active)
  useEffect(() => {
    const athleteIds = alunos.map((a) => a.athlete_id).filter((id): id is string => !!id);
    if (athleteIds.length === 0) {
      setSemPeriodizacao(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('athlete_periodizations')
          .select('athlete_id')
          .in('athlete_id', athleteIds)
          .in('status', ['in_progress', 'active']);
        if (cancelled || error) return;
        const comPeriodizacao = new Set((data ?? []).map((r: { athlete_id: string }) => r.athlete_id));
        setSemPeriodizacao(new Set(athleteIds.filter((id) => !comPeriodizacao.has(id))));
      } catch {
        // falha silenciosa: indicador simplesmente não aparece
      }
    })();
    return () => { cancelled = true; };
  }, [alunos]);

  const handleExcluir = () => {
    if (alunoExcluindo) {
      onExcluir(alunoExcluindo);
      setAlunoExcluindo(null);
    }
  };

  const handleVisualizar = (aluno: Aluno) => {
    navigate(`/aluno/${aluno.athlete_id ?? aluno.id}`);
  };

  if (alunos.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">
          Nenhum aluno encontrado na fonte canônica (vw_alunos_canonical).
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Verifique a sincronização FitPro ↔ SmartTreino.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID do Aluno</TableHead>
              <TableHead>Objetivo</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alunos.map((aluno) => (
              <TableRow key={aluno.id}>
                <TableCell className="font-mono text-xs">{aluno.id}</TableCell>
                <TableCell>{aluno.objetivo}</TableCell>
                <TableCell>
                  <Badge variant="outline">{aluno.nivel_experiencia || 'N/A'}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={aluno.status === 'ativo' ? 'default' : 'secondary'}>
                      {aluno.status}
                    </Badge>
                    {aluno.athlete_id && semPeriodizacao.has(aluno.athlete_id) && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => navigate(`/periodization-upload?aluno=${aluno.athlete_id}`)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-2 py-0.5 text-[11px] text-destructive/90 transition-colors hover:bg-destructive/10"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-destructive/70" />
                              Sem periodização
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Atribua uma periodização para continuar o fluxo
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background z-50">
                      <DropdownMenuItem
                        onClick={() => handleVisualizar(aluno)}
                        disabled={!aluno.athlete_id && !aluno.id}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setAlunoEnviandoTreino(aluno)}
                        disabled={!aluno.athlete_id}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Treino
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

      {alunoEnviandoTreino && (
        <EnviarTreinoDialog
          aluno={alunoEnviandoTreino}
          open={!!alunoEnviandoTreino}
          onOpenChange={() => setAlunoEnviandoTreino(null)}
        />
      )}

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
