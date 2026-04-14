/**
 * StudentAICoach - Chat IA Coach para o aluno (usa streaming real-time)
 */

import RealTimeAIChat from "@/components/RealTimeAIChat";

interface StudentAICoachProps {
  alunoNome: string;
  alunoObjetivo: string;
  planoAtivo: any;
  athleteId?: string;
}

export function StudentAICoach({ alunoNome, athleteId }: StudentAICoachProps) {
  return (
    <RealTimeAIChat
      athleteId={athleteId}
      athleteName={alunoNome}
    />
  );
}
