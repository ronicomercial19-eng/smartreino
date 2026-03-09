import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/AppLayout";
import { AlunosService, type Aluno } from "@/services/alunosService";
import { WorkoutAIService } from "@/services/workoutAIService";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { 
  Dumbbell, Heart, TrendingUp, Zap, Activity,
  Play, RefreshCw, User, Loader2, CheckCircle2
} from "lucide-react";

const workoutCategories = [
  { id: "forca", name: "Força", icon: Dumbbell, description: "Desenvolver força máxima e potência muscular" },
  { id: "condicionamento", name: "Condicionamento", icon: Heart, description: "Melhorar resistência cardiovascular e stamina" },
  { id: "hipertrofia", name: "Hipertrofia", icon: TrendingUp, description: "Maximizar ganho de massa muscular" },
  { id: "emagrecimento", name: "Perda de Peso", icon: Zap, description: "Otimizar queima calórica e composição corporal" },
  { id: "mobilidade", name: "Mobilidade", icon: Activity, description: "Aumentar flexibilidade e amplitude de movimento" },
];

const WorkoutModels = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState("hipertrofia");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [students, setStudents] = useState<Aluno[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    loadStudents();
  }, []);

  // Pre-select student if coming from another page
  useEffect(() => {
    if (location.state?.selectedStudentId) {
      setSelectedStudent(location.state.selectedStudentId);
    }
  }, [location.state]);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await AlunosService.listarAlunos();
      setStudents(data);
      if (data.length === 1) setSelectedStudent(data[0].id);
      if (data.length === 0) {
        toast({ title: "Nenhum aluno encontrado", description: "Cadastre alunos primeiro antes de gerar treinos" });
      }
    } catch (error) {
      logger.error('[WorkoutModels] Erro ao carregar alunos:', error);
      toast({ title: "Erro ao Carregar Alunos", description: error instanceof Error ? error.message : "Erro desconhecido", variant: "destructive" });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleGenerateWorkout = async () => {
    if (!selectedStudent) {
      toast({ title: "Atenção", description: "Selecione um aluno primeiro", variant: "destructive" });
      return;
    }

    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress while waiting for AI
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 8, 90));
    }, 1500);

    try {
      logger.info(`[WorkoutModels] Gerando plano completo via IA para ${student.nome} - objetivo: ${selectedCategory}`);

      const plan = await WorkoutAIService.generateWorkout({
        studentId: selectedStudent,
        objetivo: selectedCategory,
        nivel: student.nivel_experiencia || 'intermediario',
        frequenciaSemanal: student.frequencia_semanal || 3,
        ambiente: student.ambiente_treino || 'academia',
        restricoes: student.restricoes_medicas || '',
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      toast({
        title: "✅ Plano Gerado com Sucesso!",
        description: `Plano de ${selectedCategory} completo para ${student.nome} com exercícios detalhados`,
      });

      // Navigate to the generated plan
      setTimeout(() => {
        navigate(`/workout-plan/${plan.id}`, { state: { studentId: selectedStudent } });
      }, 800);

    } catch (error) {
      logger.error('[WorkoutModels] Erro ao gerar treino via IA:', error);
      toast({
        title: "Erro na Geração",
        description: error instanceof Error ? error.message : "Erro ao gerar plano de treino",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);
  const currentCategory = workoutCategories.find(c => c.id === selectedCategory);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading gradient-text">
            🏋️ Gerar Treino com IA
          </h1>
          <p className="text-muted-foreground">
            Gere planos completos e personalizados com exercícios, séries e repetições
          </p>
        </div>

        {/* Student Selection */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Selecionar Aluno
            </CardTitle>
            <CardDescription>Escolha o aluno para gerar o treino personalizado via IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-select">Aluno</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={loadingStudents}>
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
                <h4 className="font-semibold text-sm">Dados do Aluno</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
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
                    {selectedStudentData.ambiente_treino || 'academia'}
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

        {/* Category Selection */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="glass grid w-full grid-cols-5">
            {workoutCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} disabled={isGenerating}>
                <category.icon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {workoutCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <Card className="glass border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-heading text-foreground">
                        Treino de {category.name}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                    <category.icon className="h-10 w-10 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Generation Progress */}
                  {isGenerating && (
                    <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Gerando plano completo com IA...
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        A IA está criando exercícios, séries e repetições personalizados para o perfil do aluno
                      </p>
                    </div>
                  )}

                  {generationProgress === 100 && !isGenerating && (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg text-primary text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Plano gerado! Redirecionando...
                    </div>
                  )}

                  <Button 
                    onClick={handleGenerateWorkout}
                    disabled={isGenerating || !selectedStudent}
                    className="w-full btn-glow"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Gerando Plano Completo...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Gerar Plano de Treino Completo
                      </>
                    )}
                  </Button>

                  {!selectedStudent && (
                    <p className="text-sm text-muted-foreground text-center">
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
