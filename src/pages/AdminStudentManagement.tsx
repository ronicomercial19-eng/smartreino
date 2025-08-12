
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, FileText, Upload, UserPlus, Calendar, Target } from "lucide-react";
import { StudentsService, Student } from '@/services/studentsService';
import { StudentPeriodizationService } from '@/services/studentPeriodizationService';
import { StudentModelsService } from '@/services/studentModelsService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminStudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentModels, setStudentModels] = useState<any[]>([]);
  const [studentPeriodizations, setStudentPeriodizations] = useState<any[]>([]);
  const [newStudent, setNewStudent] = useState({
    nome: '',
    email: '',
    objetivo: '',
    telefone: '',
    nivel_experiencia: 'iniciante'
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await StudentsService.getAllStudents();
      setStudents(studentsData);
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

  const handleCreateStudent = async () => {
    if (!newStudent.nome || !newStudent.email || !newStudent.objetivo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, email e objetivo",
        variant: "destructive"
      });
      return;
    }

    try {
      const currentUser = (await import('@/integrations/supabase/client')).supabase.auth.getUser();
      const professorId = (await currentUser).data.user?.id;
      
      if (!professorId) {
        throw new Error('Usuário não autenticado');
      }

      await StudentsService.createStudent({
        ...newStudent,
        professor_id: professorId,
        ativo: true
      });

      toast({
        title: "Sucesso",
        description: "Aluno criado com sucesso"
      });

      setIsCreateDialogOpen(false);
      setNewStudent({
        nome: '',
        email: '',
        objetivo: '',
        telefone: '',
        nivel_experiencia: 'iniciante'
      });
      loadStudents();
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar aluno",
        variant: "destructive"
      });
    }
  };

  const handleViewStudent = async (student: Student) => {
    try {
      setSelectedStudent(student);
      const [models, periodizations] = await Promise.all([
        StudentModelsService.getStudentSelectedModels(student.id),
        StudentPeriodizationService.getStudentPeriodizations(student.id)
      ]);
      setStudentModels(models);
      setStudentPeriodizations(periodizations);
    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do aluno",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePlan = async (student: Student) => {
    const hasPeriodization = await StudentPeriodizationService.hasStudentPeriodization(student.id);
    
    if (!hasPeriodization) {
      toast({
        title: "Periodização necessária",
        description: "Este aluno precisa ter uma periodização antes de gerar um plano de treino",
        variant: "destructive"
      });
      return;
    }

    // Aqui implementaremos a geração do plano posteriormente
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de geração de plano será implementada em breve"
    });
  };

  const handleAddPeriodization = (student: Student, type: 'upload' | 'manual') => {
    if (type === 'upload') {
      navigate('/periodizacao/upload', { state: { studentId: student.id } });
    } else {
      // Modal para periodização manual será implementado
      toast({
        title: "Em desenvolvimento",
        description: "Periodização manual será implementada em breve"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-pulse-orange">
            <Users className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading gradient-text">
            Gestão de Alunos
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus alunos, periodizações e planos de treino.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-glow">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Aluno</DialogTitle>
              <DialogDescription>
                Preencha as informações básicas do novo aluno.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={newStudent.nome}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome completo do aluno"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivo">Objetivo *</Label>
                <Textarea
                  id="objetivo"
                  value={newStudent.objetivo}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, objetivo: e.target.value }))}
                  placeholder="Qual o objetivo do aluno?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={newStudent.telefone}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nivel">Nível de Experiência</Label>
                <Select 
                  value={newStudent.nivel_experiencia} 
                  onValueChange={(value) => setNewStudent(prev => ({ ...prev, nivel_experiencia: value }))}
                >
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateStudent} className="btn-glow">
                  Criar Aluno
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => (
          <Card key={student.id} className="glass border-border/50 card-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-heading text-lg">
                    {student.nome}
                  </CardTitle>
                  <CardDescription>
                    {student.email}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {student.nivel_experiencia}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p><strong>Objetivo:</strong> {student.objetivo}</p>
                {student.telefone && (
                  <p><strong>Telefone:</strong> {student.telefone}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewStudent(student)}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Perfil
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleGeneratePlan(student)}
                  className="flex-1 btn-glow"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Gerar Plano
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddPeriodization(student, 'upload')}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddPeriodization(student, 'manual')}
                  className="flex-1"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Manual
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Perfil de {selectedStudent.nome}</DialogTitle>
              <DialogDescription>
                Informações detalhadas e recursos atribuídos ao aluno.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Email:</strong> {selectedStudent.email}
                </div>
                <div>
                  <strong>Telefone:</strong> {selectedStudent.telefone || 'Não informado'}
                </div>
                <div>
                  <strong>Nível:</strong> {selectedStudent.nivel_experiencia}
                </div>
                <div>
                  <strong>Objetivo:</strong> {selectedStudent.objetivo}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Modelos Atribuídos</h4>
                {studentModels.length > 0 ? (
                  <div className="space-y-2">
                    {studentModels.map((model) => (
                      <div key={model.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <p className="font-medium">{model.model_name}</p>
                          <p className="text-sm text-muted-foreground">{model.stimulus_type} - {model.level}</p>
                        </div>
                        <Badge variant="outline">{model.stimulus_type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum modelo atribuído</p>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Periodizações</h4>
                {studentPeriodizations.length > 0 ? (
                  <div className="space-y-2">
                    {studentPeriodizations.map((periodization) => (
                      <div key={periodization.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <p className="font-medium">{periodization.plan_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {periodization.periodization_type} - {periodization.macrocycle_duration_weeks} semanas
                          </p>
                        </div>
                        <Badge variant="outline">Fase {periodization.current_phase}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma periodização atribuída</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
