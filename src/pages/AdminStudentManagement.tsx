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
import { toast } from "@/components/ui/use-toast";
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
  Dumbbell
} from "lucide-react";
import { StudentPeriodizationService } from "@/services/studentPeriodizationService";

interface Student {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  level: string;
  objective: string;
}

const AdminStudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id' | 'created_at'>>({
    full_name: '',
    email: '',
    phone: '',
    level: 'iniciante',
    objective: 'hipertrofia'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar alunos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de alunos.",
          variant: "destructive"
        });
        return;
      }

      setStudents(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao carregar os alunos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewStudent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudent.full_name || !newStudent.email) {
      toast({
        title: "Dados Incompletos",
        description: "Por favor, preencha o nome e o email do aluno.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .insert(newStudent)
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar aluno:', error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o aluno.",
          variant: "destructive"
        });
        return;
      }

      setStudents(prev => [data, ...prev]);
      setNewStudent({
        full_name: '',
        email: '',
        phone: '',
        level: 'iniciante',
        objective: 'hipertrofia'
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
                      value={newStudent.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
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
                      value={newStudent.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Telefone do aluno"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nível</Label>
                    <Select 
                      value={newStudent.level} 
                      onValueChange={(value) => handleInputChange('level', value)}
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
                    value={newStudent.objective} 
                    onValueChange={(value) => handleInputChange('objective', value)}
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

                <div className="flex justify-end">
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
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{student.level}</TableCell>
                      <TableCell>{student.objective}</TableCell>
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
                                variant: "warning",
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
