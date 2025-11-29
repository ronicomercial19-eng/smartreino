/**
 * Seletor de Aluno para Analytics e Estatísticas
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { type Aluno } from "@/services/alunosService";

interface StudentSelectorProps {
  students: Aluno[];
  selectedStudent: string;
  onSelectStudent: (studentId: string) => void;
  loading?: boolean;
}

export function StudentSelector({
  students,
  selectedStudent,
  onSelectStudent,
  loading = false
}: StudentSelectorProps) {
  const student = students.find((s) => s.id === selectedStudent);

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Selecionar Aluno
        </CardTitle>
        <CardDescription>
          Escolha o aluno para visualizar analytics e estatísticas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student-analytics">Aluno</Label>
          <Select value={selectedStudent} onValueChange={onSelectStudent} disabled={loading}>
            <SelectTrigger id="student-analytics">
              <SelectValue placeholder={loading ? "Carregando..." : "Selecione um aluno"} />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome} - {s.objetivo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {student && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Perfil do Aluno</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Objetivo:</span>{" "}
                <Badge variant="outline" className="ml-1">{student.objetivo}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Nível:</span>{" "}
                <Badge variant="outline" className="ml-1 capitalize">{student.nivel_experiencia}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Frequência:</span>{" "}
                {student.frequencia_semanal}x/semana
              </div>
              <div>
                <span className="text-muted-foreground">Ambiente:</span>{" "}
                {student.ambiente_treino}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
