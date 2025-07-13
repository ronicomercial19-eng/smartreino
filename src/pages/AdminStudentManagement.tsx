
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import { toast } from "@/components/ui/use-toast";
import { 
  Users, 
  UserPlus, 
  Dumbbell, 
  Calendar, 
  Settings,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

interface Student {
  id: string;
  email: string;
  name: string;
  role: "aluno";
  adminId: string;
  createdAt: string;
  hasPlan: boolean;
  lastActivity?: string;
}

const AdminStudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    email: "",
    name: "",
  });

  // Simular carregamento de alunos (futuramente será da base de dados)
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: "student_1",
        email: "joao.silva@email.com",
        name: "João Silva",
        role: "aluno",
        adminId: "admin_1",
        createdAt: "2024-01-15",
        hasPlan: true,
        lastActivity: "2024-01-20"
      },
      {
        id: "student_2", 
        email: "maria.santos@email.com",
        name: "Maria Santos",
        role: "aluno",
        adminId: "admin_1",
        createdAt: "2024-01-10",
        hasPlan: false
      },
      {
        id: "student_3",
        email: "pedro.costa@email.com", 
        name: "Pedro Costa",
        role: "aluno",
        adminId: "admin_1",
        createdAt: "2024-01-08",
        hasPlan: true,
        lastActivity: "2024-01-18"
      }
    ];
    setStudents(mockStudents);
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudent.email || !newStudent.name) {
      toast({
        title: "Dados Incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsAddingStudent(true);

    try {
      // Simular criação na base de dados
      const student: Student = {
        id: `student_${Date.now()}`,
        email: newStudent.email,
        name: newStudent.name,
        role: "aluno",
        adminId: "admin_1", // ID do admin logado
        createdAt: new Date().toISOString().split('T')[0],
        hasPlan: false
      };

      setStudents(prev => [...prev, student]);
      setNewStudent({ email: "", name: "" });
      
      toast({
        title: "Aluno Adicionado!",
        description: `${student.name} foi adicionado com sucesso.`,
      });

    } catch (error) {
      toast({
        title: "Erro ao Adicionar Aluno",
        description: "Ocorreu um erro ao adicionar o aluno. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleGeneratePlan = async (studentId: string, studentName: string) => {
    toast({
      title: "Gerando Plano...",
      description: `Iniciando geração do plano para ${studentName}`,
    });

    try {
      // Simular geração do plano (futuramente será o script de geração)
      setTimeout(() => {
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId 
              ? { ...student, hasPlan: true }
              : student
          )
        );
        
        toast({
          title: "Plano Gerado!",
          description: `Plano de 24 semanas gerado para ${studentName}`,
        });
      }, 2000);

    } catch (error) {
      toast({
        title: "Erro na Geração",
        description: "Ocorreu um erro ao gerar o plano.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👥 Gestão de Alunos
          </h1>
          <p className="text-gray-600">
            Gerencie seus alunos e seus planos de treino
          </p>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Meus Alunos</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Estatísticas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-blue-50">
                  {students.length} Alunos Registados
                </Badge>
                <Badge variant="outline" className="bg-green-50">
                  {students.filter(s => s.hasPlan).length} Com Planos
                </Badge>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Aluno
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Aluno</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Ex: João Silva"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="joao@email.com"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isAddingStudent}>
                      {isAddingStudent ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adicionando...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar Aluno
                        </>
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Alunos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Data Registro</TableHead>
                      <TableHead>Status do Plano</TableHead>
                      <TableHead>Última Ativ.</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{new Date(student.createdAt).toLocaleDateString('pt-PT')}</TableCell>
                        <TableCell>
                          {student.hasPlan ? (
                            <Badge className="bg-green-100 text-green-800">
                              Plano Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              Sem Plano
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.lastActivity 
                            ? new Date(student.lastActivity).toLocaleDateString('pt-PT')
                            : "—"
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {!student.hasPlan && (
                              <Button
                                size="sm"
                                onClick={() => handleGeneratePlan(student.id, student.name)}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                <Dumbbell className="h-3 w-3 mr-1" />
                                Gerar Plano
                              </Button>
                            )}
                            {student.hasPlan && (
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Ver Plano
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.length}</div>
                  <p className="text-xs text-gray-600">Registados este mês</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.filter(s => s.hasPlan).length}</div>
                  <p className="text-xs text-gray-600">
                    {Math.round((students.filter(s => s.hasPlan).length / students.length) * 100)}% dos alunos
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.filter(s => s.lastActivity).length}</div>
                  <p className="text-xs text-gray-600">Últimos 7 dias</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminStudentManagement;
