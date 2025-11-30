/**
 * Preview do Admin antes de Enviar Treino
 * Permite visualizar e editar antes de finalizar
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkoutDisplayTemplate } from "./WorkoutDisplayTemplate";
import { WorkoutPDFExport } from "./WorkoutPDFExport";
import { Eye, Send, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface WorkoutAdminPreviewProps {
  plan: any;
  studentName: string;
  onSend?: () => void;
}

export function WorkoutAdminPreview({ plan, studentName, onSend }: WorkoutAdminPreviewProps) {
  const [open, setOpen] = useState(false);

  const handleSend = () => {
    if (onSend) {
      onSend();
    }
    toast({
      title: "Treino Enviado!",
      description: `Treino enviado para ${studentName} com sucesso.`
    });
    setOpen(false);
  };

  // Converter o plano para o formato do template
  const templatePlan = {
    nome: plan.nome_plano || "Treino Personalizado",
    objetivo: plan.objetivo || "Hipertrofia",
    nivel: plan.nivel || "Intermediário",
    estudante: studentName,
    estrutura_semanal: plan.plano_completo?.estrutura_semanal || plan.plano_completo?.weekly_structure || []
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview & Enviar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Preview do Treino - {studentName}</DialogTitle>
          <DialogDescription>
            Visualize como o aluno verá o treino antes de enviar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {templatePlan.estrutura_semanal.length > 0 ? (
            <WorkoutDisplayTemplate plan={templatePlan} />
          ) : (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
              <p>Nenhuma estrutura de treino encontrada</p>
              <p className="text-sm mt-2">Gere um treino primeiro para visualizar o preview</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <WorkoutPDFExport 
            plan={templatePlan} 
            fileName={`treino-${studentName.toLowerCase().replace(/\s+/g, '-')}.html`}
          />
          <Button variant="outline" onClick={() => setOpen(false)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button onClick={handleSend} className="btn-glow">
            <Send className="h-4 w-4 mr-2" />
            Enviar para Aluno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
