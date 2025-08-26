
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { 
  Settings, 
  FileText, 
  Calendar, 
  Target, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Brain,
  Zap,
  Cpu,
  BarChart3,
  Activity,
  Clock,
  Users,
  UserPlus,
  Dumbbell,
  Upload
} from "lucide-react";
import { StudentPeriodizationService } from "@/services/studentPeriodizationService";
import { StudentsService, Student as ServiceStudent, NewStudentInput } from "@/services/studentsService";

// Interface local que mapeia os campos do banco para o componente
interface DisplayStudent {
  id: string;
  created_at: string;
  nome: string; // campo do banco
  email: string;
  telefone: string;
  nivel_experiencia: string; // campo do banco
  objetivo: string;
}

const AdminStudentManagement = () => {
  const [students, setStudents] = useState<DisplayStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState<NewStudentInput>({
    nome: '',
    email: '',
    objetivo: 'hipertrofia',
    telefone: '',
    nivel_experiencia: 'iniciante'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await StudentsService.getAllStudents();
      
      // Mapear os dados do serviço para a interface local
      const displayStudents: DisplayStudent[] = data.map(student => ({
        id: student.id,
        created_at: student.created_at,
        nome: student.nome,
        email: student.email,
        telefone: student.telefone || '',
        nivel_experiencia: student.nivel_experiencia || 'iniciante',
        objetivo: student.objetivo
      }));

      setStudents(displayStudents);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de alunos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof NewStudentInput, value: string) => {
    setNewStudent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudent.nome || !newStudent.email) {
      toast({
        title: "Dados Incompletos",
        description: "Por favor, preencha o nome e o email do aluno.",
        variant: "destructive"
      });
      return;
    }

    try {
      const createdStudent = await StudentsService.createStudent(newStudent);
      
      // Mapear o novo aluno para a interface local
      const displayStudent: DisplayStudent = {
        id: createdStudent.id,
        created_at: createdStudent.created_at,
        nome: createdStudent.nome,
        email: createdStudent.email,
        telefone: createdStudent.telefone || '',
        nivel_experiencia: createdStudent.nivel_experiencia || 'iniciante',
        objetivo: createdStudent.objetivo
      };

      setStudents(prev => [displayStudent, ...prev]);
      setNewStudent({
        nome: '',
        email: '',
        objetivo: 'hipertrofia',
        telefone: '',
        nivel_experiencia: 'iniciante'
      });
      setShowAddForm(false);

      toast({
        title: "Sucesso",
        description: "Aluno adicionado com sucesso!",
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao adicionar o aluno.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-16 bg-gradient-to-b from-primary to-orange-600 rounded-full"></div>
              <div>
                <h1 className="text-5xl font-bold gradient-text mb-2 flex items-center space-x-4">
                  <Users className="h-12 w-12 text-primary" />
                  <span>Gestão de Alunos</span>
                </h1>
                <p className="text-muted-foreground text-xl">
                  Gerencie alunos, periodizações e modelos de treino com inteligência artificial
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/periodization-upload')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Periodização
              </Button>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Aluno
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
              <Cpu className="h-4 w-4 mr-2" />
              IA Powered
            </Badge>
            <Badge className="bg-muted/50 text-muted-foreground border-muted">
              <BarChart3 className="h-4 w-4 mr-2" />
              Periodização
            </Badge>
            <Badge className="bg-muted/50 text-muted-foreground border-muted">
              <FileText className="h-4 w-4 mr-2" />
              Histórico
            </Badge>
            <Badge className="bg-muted/50 text-muted-foreground border-muted">
              <Activity className="h-4 w-4 mr-2" />
              Analytics Real-time
            </Badge>
          </div>
        </div>

        {/* Add Student Form */}
        {showAddForm && (
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-card-foreground">
                <UserPlus className="h-5 w-5 text-primary" />
                <span>Adicionar Novo Aluno</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={newStudent.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Nome completo do aluno"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Email do aluno"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={newStudent.telefone || ''}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="Telefone do aluno"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nível</Label>
                    <Select 
                      value={newStudent.nivel_experiencia || 'iniciante'} 
                      onValueChange={(value) => handleInputChange('nivel_experiencia', value)}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Objetivo</Label>
                  <Select 
                    value={newStudent.objetivo} 
                    onValueChange={(value) => handleInputChange('objetivo', value)}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Selecione o objetivo" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                      <SelectItem value="forca">Força</SelectItem>
                      <SelectItem value="resistencia">Resistência</SelectItem>
                      <SelectItem value="perda-peso">Perda de Peso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Adicionar Aluno
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Students Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-card-foreground">
              <Users className="h-5 w-5 text-primary" />
              <span>Lista de Alunos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Clock className="h-6 w-6 text-muted-foreground animate-pulse mx-auto mb-2" />
                <p className="text-muted-foreground">Carregando alunos...</p>
              </div>
            ) : students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Objetivo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.nome}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.telefone}</TableCell>
                      <TableCell>{student.nivel_experiencia}</TableCell>
                      <TableCell>{student.objetivo}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            const hasPeriodization = await StudentPeriodizationService.hasStudentPeriodization(student.id);
                            if (hasPeriodization) {
                              navigate(`/periodization-upload?studentId=${student.id}`);
                            } else {
                              toast({
                                title: "Aluno sem periodização",
                                description: "Este aluno ainda não possui uma periodização atribuída. Deseja criar uma agora?",
                                action: (
                                  <Button variant="link" onClick={() => navigate(`/periodization-upload?studentId=${student.id}`)}>
                                    Criar Periodização
                                  </Button>
                                ),
                              });
                            }
                          }}
                        >
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhum aluno cadastrado ainda.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStudentManagement;
