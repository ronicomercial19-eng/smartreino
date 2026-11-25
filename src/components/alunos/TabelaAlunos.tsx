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
import { MoreVertical, Trash2, Send, Eye, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
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

  // Alertas de limitação/dor declarados no onboarding, pendentes de revisão
  type AlertaOnboarding = { id: string; raw_text: string; current_pain: boolean };
  const [alertasOnboarding, setAlertasOnboarding] = useState<Map<string, AlertaOnboarding>>(new Map());
  const [alertaAberto, setAlertaAberto] = useState<{ aluno: Aluno; alerta: AlertaOnboarding } | null>(null);
  const [revisando, setRevisando] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await (supabase.rpc as any)('fn_listar_alertas_onboarding', { p_status: 'pending' });
        if (cancelled || error) return;
        const map = new Map<string, AlertaOnboarding>();
        for (const r of (data ?? []) as Array<{ id: string; athlete_id: string; raw_text: string | null; current_pain: boolean | null }>) {
          if (r.athlete_id && !map.has(r.athlete_id)) {
            map.set(r.athlete_id, { id: r.id, raw_text: r.raw_text ?? '', current_pain: !!r.current_pain });
          }
        }
        setAlertasOnboarding(map);
      } catch {
        // falha silenciosa
      }
    })();
    return () => { cancelled = true; };
  }, [alunos]);

  const handleRevisarAlerta = async (status: 'reviewed' | 'dismissed') => {
    if (!alertaAberto) return;
    setRevisando(true);
    try {
      const { error } = await (supabase.rpc as any)('fn_revisar_alerta_onboarding', {
        p_alert_id: alertaAberto.alerta.id, p_status: status, p_note: null,
      });
      if (error) throw error;
      const athleteId = alertaAberto.aluno.athlete_id;
      setAlertasOnboarding((prev) => {
        const next = new Map(prev);
        if (athleteId) next.delete(athleteId);
        return next;
      });
      setAlertaAberto(null);
      toast.success(status === 'reviewed' ? 'Alerta marcado como revisado' : 'Alerta dispensado');
    } catch (e: any) {
      toast.error('Não foi possível atualizar o alerta: ' + (e?.message ?? 'erro desconhecido'));
    } finally {
      setRevisando(false);
    }
  };

  const truncar = (t: string, n = 140) => (t.length > n ? t.slice(0, n) + '…' : t);

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
                    {aluno.athlete_id && alertasOnboarding.has(aluno.athlete_id) && (() => {
                      const alerta = alertasOnboarding.get(aluno.athlete_id!)!;
                      return (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => setAlertaAberto({ aluno, alerta })}
                                className={
                                  alerta.current_pain
                                    ? 'inline-flex items-center gap-1.5 rounded-full border border-destructive/70 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/20'
                                    : 'inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-2 py-0.5 text-[11px] text-destructive/90 transition-colors hover:bg-destructive/10'
                                }
                              >
                                {alerta.current_pain
                                  ? <AlertTriangle className="h-3 w-3" />
                                  : <span className="h-1.5 w-1.5 rounded-full bg-destructive/70" />}
                                Revisar limitação
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              {alerta.current_pain && <p className="font-medium mb-1">Dor atual declarada</p>}
                              <p>{truncar(alerta.raw_text || 'Sem texto declarado')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })()}
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

      <AlertDialog open={!!alertaAberto} onOpenChange={(o) => { if (!o && !revisando) setAlertaAberto(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revisar limitação — {alertaAberto?.aluno.nome ?? alertaAberto?.aluno.id}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                {alertaAberto?.alerta.current_pain && (
                  <p className="text-destructive font-medium">O aluno declarou dor atual.</p>
                )}
                <p className="whitespace-pre-wrap">{alertaAberto?.alerta.raw_text || 'Sem texto declarado.'}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" disabled={revisando} onClick={() => handleRevisarAlerta('dismissed')}>
              Dispensar
            </Button>
            <Button disabled={revisando} onClick={() => handleRevisarAlerta('reviewed')}>
              Marcar como revisado
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
