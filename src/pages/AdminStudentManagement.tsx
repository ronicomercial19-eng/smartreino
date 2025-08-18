
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Eye, FileText, Calendar, Settings } from "lucide-react";
import { StudentsService, Student } from '@/services/studentsService';
import { StudentPeriodizationService } from '@/services/studentPeriodizationService';
import { StudentModelsService } from '@/services/studentModelsService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminStudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentPeriodizations, setStudentPeriodizations] = useState<Record<string, any[]>>({});
  const [studentModels, setStudentModels] = useState<Record<string, any[]>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newStudent, setNewStudent] = useState({
    nome: '',
    email: '',
    objetivo: '',
    telefone: '',
    nivel_experiencia: 'iniciante',
    observacoes: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await StudentsService.getAllStudents();
      setStudents(studentsData);

      // Load periodizations and models for each student
      const periodizationsMap: Record<string, any[]> = {};
      const modelsMap: Record<string, any[]> = {};

      for (const student of studentsData) {
        try {
          const [periodizations, models] = await Promise.all([
            StudentPeriodizationService.getStudentPeriodizations(student.id),
            StudentModelsService.getStudentSelectedModels(student.id)
          ]);
          periodizationsMap[student.id] = periodizations;
          modelsMap[student.id] = models;
        } catch (error) {
          console.error(`Erro ao carregar dados do aluno ${student.id}:`, error);
        }
      }

      setStudentPeriodizations(periodizationsMap);
      setStudentModels(modelsMap);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar lista de alunos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    try {
      if (!newStudent.nome || !newStudent.email || !newStudent.objetivo) {
        toast({
          title: "Erro",
          description: "Nome, email e objetivo são obrigatórios",
          variant: "destructive"
        });
        return;
      }

      console.log('🧪 Enviando novo aluno:', newStudent);

      await StudentsService.createStudent({
        nome: newStudent.nome,
        email: newStudent.email,
        objetivo: newStudent.objetivo,
        telefone: newStudent.telefone || undefined,
        nivel_experiencia: newStudent.nivel_experiencia || undefined,
        observacoes: newStudent.observacoes || undefined,
      });

      toast({
        title: "Sucesso",
        description: "Aluno adicionado com sucesso",
      });

      setIsAddDialogOpen(false);
      setNewStudent({
        nome: '',
        email: '',
        objetivo: '',
        telefone: '',
        nivel_experiencia: 'iniciante',
        observacoes: ''
      });
      loadStudents();
    } catch (error: any) {
      console.error('Erro ao adicionar aluno:', error);
      const message = error?.message || 'Falha ao adicionar aluno';
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
    }
  };

  const hasStudentPeriodization = (studentId: string): boolean => {
    return (studentPeriodizations[studentId]?.length || 0) > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Users className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            Gestão de Alunos
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus alunos, periodizações e modelos de treino.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Aluno</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo aluno.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={newStudent.nome}
                    onChange={(e) => setNewStudent({...newStudent, nome: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivo">Objetivo *</Label>
                <Input
                  id="objetivo"
                  value={newStudent.objetivo}
                  onChange={(e) => setNewStudent({...newStudent, objetivo: e.target.value})}
                  placeholder="Ex: Hipertrofia, Emagrecimento, Força..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={newStudent.telefone}
                    onChange={(e) => setNewStudent({...newStudent, telefone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nivel">Nível de Experiência</Label>
                  <Select value={newStudent.nivel_experiencia} onValueChange={(value) => setNewStudent({...newStudent, nivel_experiencia: value})}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={newStudent.observacoes}
                  onChange={(e) => setNewStudent({...newStudent, observacoes: e.target.value})}
                  placeholder="Lesões, restrições, observações importantes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddStudent}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Aluno
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => (
          <Card key={student.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  {student.nome}
                </CardTitle>
                <Badge variant={student.ativo ? "default" : "secondary"}>
                  {student.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <CardDescription>
                {student.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-1">
                <p><strong>Objetivo:</strong> {student.objetivo}</p>
                <p><strong>Nível:</strong> {student.nivel_experiencia}</p>
                {student.telefone && <p><strong>Telefone:</strong> {student.telefone}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {(studentPeriodizations[student.id]?.length || 0)} periodização(ões)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">
                    {(studentModels[student.id]?.length || 0)} modelo(s) atribuído(s)
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/student-interface', { state: { studentId: student.id } })}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Perfil
                </Button>
                
                {hasStudentPeriodization(student.id) ? (
                  <Button 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Recurso em Desenvolvimento",
                        description: "Geração de planos será implementada em breve",
                      });
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Gerar Plano
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/periodizacao/upload')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Periodização
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {students.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum aluno cadastrado
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece adicionando seu primeiro aluno ao sistema.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Aluno
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
