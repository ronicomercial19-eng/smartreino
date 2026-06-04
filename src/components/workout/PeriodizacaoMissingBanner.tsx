import { AlertTriangle, ExternalLink, Bell } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { notificarFaltaPeriodizacao } from "@/services/fitproDelivery";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Props {
  alunoId: string;
  className?: string;
}

export function PeriodizacaoMissingBanner({ alunoId, className }: Props) {
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const notify = async () => {
    setSending(true);
    try {
      await notificarFaltaPeriodizacao(alunoId);
      toast({
        title: "Notificação criada",
        description: "Professor será avisado para cadastrar a periodização.",
      });
    } catch (e: any) {
      toast({
        title: "Falha ao notificar",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Periodização ausente</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Este aluno ainda não possui periodização ativa no SmartPeriodizer.
          O SmartTreino só gera treinos com periodização vinculada.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/periodization-upload?aluno=${alunoId}`)}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Cadastrar no SmartPeriodizer
          </Button>
          <Button size="sm" variant="ghost" onClick={notify} disabled={sending} className="gap-2">
            <Bell className="h-4 w-4" />
            Notificar professor
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
