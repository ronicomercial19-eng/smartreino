import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/AppLayout";
import { workoutGenerationService } from "@/services/workoutGenerationService";
import { AlunosService, type Aluno } from "@/services/alunosService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/utils/logger";
import { 
  Dumbbell, 
  Clock, 
  Target, 
  Zap, 
  Heart,
  TrendingUp,
  Activity,
  Play,
  RefreshCw,
  User
} from "lucide-react";

const WorkoutModels = () => {
  const { userProfile } = useUserProfile();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("forca");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [students, setStudents] = useState<Aluno[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [userProfile]);

  const loadStudents = async () => {
    if (!userProfile?.id) return;
    
    try {
      setLoadingStudents(true);
      const data = await AlunosService.listarAlunos();
      setStudents(data);
    } catch (error) {
      logger.error('Erro ao carregar alunos', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de alunos",
        variant: "destructive"
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const workoutCategories = [
    { id: "forca", name: "Força", icon: Dumbbell },
    { id: "condicionamento", name: "Condicionamento", icon: Heart },
    { id: "hipertrofia", name: "Hipertrofia", icon: TrendingUp },
    { id: "perda-peso", name: "Perda de Peso", icon: Zap },
    { id: "mobilidade", name: "Mobilidade", icon: Activity }
  ];

  const generateWorkoutModels = async () => {
    if (!selectedStudent) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione um aluno primeiro",
        variant: "destructive"
      });
      return;
    }

    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;
    
    setIsGenerating(true);
    
    try {
      logger.info('Gerando modelo de treino para aluno');
      
      const result = await workoutGenerationService.gerarModelo({
        estudante_id: selectedStudent,
        objetivo: selectedCategory,
        nivel: student.nivel_experiencia || 'intermediario',
        periodizacao: {}
      });

      setHasGeneratedOnce(true);
      
      toast({
        title: "Treino Gerado com Sucesso!",
        description: `Treino de ${selectedCategory} gerado para ${student.nome}`,
      });

      // Redirecionar para a área de treinos do aluno
      setTimeout(() => {
        navigate('/meus-treinos', { state: { selectedStudentId: selectedStudent } });
      }, 1000);
      
    } catch (error) {
      logger.error('Erro ao gerar modelo de treino', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar modelo de treino",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-heading gradient-text">
              🏋️ Modelos de Treinos
            </h1>
            <p className="text-muted-foreground">
              Gere modelos personalizados baseados nos objetivos do aluno
            </p>
          </div>
        </div>

        {/* Seleção de Aluno */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Selecionar Aluno
            </CardTitle>
            <CardDescription>
              Escolha o aluno para gerar o treino personalizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-select">Aluno</Label>
              <Select 
                value={selectedStudent} 
                onValueChange={setSelectedStudent}
                disabled={loadingStudents}
              >
                <SelectTrigger id="student-select">
                  <SelectValue placeholder={loadingStudents ? "Carregando alunos..." : "Selecione um aluno"} />
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

            {selectedStudentData && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Informações do Aluno</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Objetivo:</span>{" "}
                    <Badge variant="outline" className="ml-1">{selectedStudentData.objetivo}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nível:</span>{" "}
                    <Badge variant="outline" className="ml-1 capitalize">{selectedStudentData.nivel_experiencia}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Frequência:</span>{" "}
                    {selectedStudentData.frequencia_semanal}x/semana
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ambiente:</span>{" "}
                    {selectedStudentData.ambiente_treino}
                  </div>
                </div>
                {selectedStudentData.restricoes_medicas && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground text-xs">Restrições:</span>
                    <p className="text-xs mt-1">{selectedStudentData.restricoes_medicas}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="glass grid w-full grid-cols-5">
            {workoutCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                <category.icon className="h-4 w-4 mr-1" />
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {workoutCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              <Card className="glass border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-heading text-foreground">
                        Treino de {category.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Modelo personalizado focado em {category.name.toLowerCase()}
                      </CardDescription>
                    </div>
                    <category.icon className="h-10 w-10 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={generateWorkoutModels}
                    disabled={isGenerating || !selectedStudent}
                    className="w-full btn-glow"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Gerando Treino com IA...
                      </>
                    ) : hasGeneratedOnce ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Gerar Novo Treino
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Gerar Treino Inteligente
                      </>
                    )}
                  </Button>

                  {!selectedStudent && (
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Selecione um aluno acima para gerar o treino
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default WorkoutModels;
