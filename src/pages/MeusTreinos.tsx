import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/AppLayout";
import { User, Dumbbell, Calendar, Target, Activity, Weight, Ruler, Plus } from "lucide-react";
import { generatedPlansService } from "@/services/generatedPlansService";
import { simpleModelsService } from "@/services/simpleModelsService";
import { AlunosService, type Aluno } from "@/services/alunosService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import PerformanceHistory from "@/components/PerformanceHistory";

export default function MeusTreinos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useUserProfile();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Aluno[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [studentWorkouts, setStudentWorkouts] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    // Se vier de outra página com aluno pré-selecionado
    if (location.state?.selectedStudentId) {
      setSelectedStudentId(location.state.selectedStudentId);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentWorkouts();
    } else {
      setStudentWorkouts([]);
    }
  }, [selectedStudentId]);

  const loadStudents = async () => {
    if (!userProfile?.id) return;
    
    try {
      setLoadingStudents(true);
      const data = await AlunosService.listarAlunos();
      setStudents(data);
      
      // Se só tiver um aluno, seleciona automaticamente
      if (data.length === 1) {
        setSelectedStudentId(data[0].id);
      }
    } catch (error) {
      logger.error('Erro ao carregar alunos', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de alunos.",
        variant: "destructive",
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadStudentWorkouts = async () => {
    if (!selectedStudentId) return;
    
    try {
      setLoadingWorkouts(true);
      logger.info(`Carregando treinos do aluno: ${selectedStudentId}`);
      
      const plans = await generatedPlansService.getByStudent(selectedStudentId);
      
      const workoutsWithDetails = await Promise.all(
        plans.map(async (plan) => {
          try {
            const model = await simpleModelsService.getById(plan.modelo_id);
            return { ...plan, model };
          } catch (error) {
            logger.error('Erro ao carregar modelo', error);
            return { ...plan, model: null };
          }
        })
      );
      
      setStudentWorkouts(workoutsWithDetails.filter(w => w.model));
      
    } catch (error) {
      logger.error('Erro ao carregar treinos do aluno', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os treinos deste aluno.",
        variant: "destructive",
      });
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const calcularIdade = (dataNascimento?: string) => {
    if (!dataNascimento) return 'N/A';
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const calcularIMC = (peso?: number, altura?: number) => {
    if (!peso || !altura) return null;
    const alturaMetros = altura / 100;
    return (peso / (alturaMetros * alturaMetros)).toFixed(2);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const imc = selectedStudent ? calcularIMC(selectedStudent.peso_atual, selectedStudent.altura_cm) : null;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-heading gradient-text">
              💪 Área de Treinos dos Alunos
            </h1>
            <p className="text-muted-foreground">
              Gerencie e visualize os treinos aplicados aos seus alunos
            </p>
          </div>
          <Button onClick={() => navigate('/workout-models')} className="btn-glow">
            <Plus className="h-4 w-4 mr-2" />
            Gerar Novo Treino
          </Button>
        </div>

        {/* Seleção de Aluno */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Selecionar Aluno
            </CardTitle>
            <CardDescription>
              Escolha um aluno para visualizar seus treinos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStudents ? (
              <LoadingSpinner text="Carregando alunos..." />
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Nenhum aluno cadastrado</p>
                <Button onClick={() => navigate('/gerenciamento-alunos')}>
                  Cadastrar Primeiro Aluno
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="student-select">Aluno</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.nome} - {student.objetivo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Perfil do Aluno Selecionado */}
        {selectedStudent && (
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Perfil do Aluno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Dados Pessoais */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">Dados Pessoais</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Nome</p>
                      <p className="font-medium">{selectedStudent.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm">{selectedStudent.email}</p>
                    </div>
                    {selectedStudent.data_nascimento && (
                      <div>
                        <p className="text-xs text-muted-foreground">Idade</p>
                        <p className="font-medium">{calcularIdade(selectedStudent.data_nascimento)} anos</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dados Físicos */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">Dados Físicos</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Peso</p>
                        <p className="font-medium">{selectedStudent.peso_atual ? `${selectedStudent.peso_atual} kg` : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Altura</p>
                        <p className="font-medium">{selectedStudent.altura_cm ? `${selectedStudent.altura_cm} cm` : 'N/A'}</p>
                      </div>
                    </div>
                    {imc && (
                      <div>
                        <p className="text-xs text-muted-foreground">IMC</p>
                        <p className="font-medium">{imc}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dados de Treino */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">Informações de Treino</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Objetivo</p>
                      <Badge className="mt-1">{selectedStudent.objetivo}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nível</p>
                      <Badge variant="outline" className="mt-1 capitalize">{selectedStudent.nivel_experiencia}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Frequência</p>
                      <p className="font-medium">{selectedStudent.frequencia_semanal}x/semana</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedStudent.restricoes_medicas && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Restrições Médicas</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedStudent.restricoes_medicas}</p>
                  </div>
                </>
              )}

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/aluno/${selectedStudent.id}`)}
                  className="flex-1"
                >
                  Ver Detalhes Completos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Treinos do Aluno */}
        {selectedStudentId && (
          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Treinos Aplicados
                  </CardTitle>
                  <CardDescription>
                    Planos de treino gerados para este aluno
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingWorkouts ? (
                <LoadingSpinner text="Carregando treinos..." />
              ) : studentWorkouts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Nenhum treino gerado ainda</p>
                  <Button onClick={() => navigate('/workout-models', { state: { selectedStudentId } })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Gerar Primeiro Treino
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentWorkouts.map((workout) => (
                    <Card key={workout.id} className="border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{workout.model?.nome || 'Treino Personalizado'}</h4>
                              <Badge variant="outline">{workout.model?.objetivo}</Badge>
                            </div>
                            {workout.model?.descricao && (
                              <p className="text-sm text-muted-foreground">{workout.model.descricao}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {workout.model?.duracao_em_semanas} semanas
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {workout.model?.nivel}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/workout-details/${workout.id}`, { 
                              state: { workout, studentId: selectedStudentId } 
                            })}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Performance History */}
        {selectedStudentId && (
          <PerformanceHistory studentId={selectedStudentId} />
        )}
      </div>
    </AppLayout>
  );
}
