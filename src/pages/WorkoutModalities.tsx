
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Dumbbell, Users, CheckCircle } from "lucide-react";
import { StudentModelsService, WorkoutModality } from '@/services/studentModelsService';
import { StudentsService, Student } from '@/services/studentsService';
import { workoutModelsService, WorkoutModel } from '@/services/workoutModelsService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function WorkoutModalities() {
  const [modalities, setModalities] = useState<WorkoutModality[]>([]);
  const [selectedModality, setSelectedModality] = useState<string | null>(null);
  const [models, setModels] = useState<WorkoutModel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<WorkoutModel | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modalitiesData, studentsData] = await Promise.all([
        StudentModelsService.getWorkoutModalities(),
        StudentsService.getAllStudents()
      ]);
      setModalities(modalitiesData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar modalidades e alunos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalityClick = async (modality: string) => {
    try {
      setSelectedModality(modality);
      const modelsData = await workoutModelsService.getModelsByStimulusType(modality);
      setModels(modelsData);
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar modelos da modalidade",
        variant: "destructive"
      });
    }
  };

  const handleAssignModel = (model: WorkoutModel) => {
    setSelectedModel(model);
    setIsAssignDialogOpen(true);
  };

  const confirmAssignment = async () => {
    if (!selectedModel || !selectedStudent) return;

    try {
      setAssignLoading(true);
      await StudentModelsService.assignModelToStudent(selectedStudent, selectedModel.id, notes);
      
      toast({
        title: "Sucesso",
        description: "Modelo atribuído ao aluno com sucesso",
      });

      setIsAssignDialogOpen(false);
      setSelectedStudent('');
      setNotes('');
      setSelectedModel(null);
    } catch (error) {
      console.error('Erro ao atribuir modelo:', error);
      toast({
        title: "Erro",
        description: "Falha ao atribuir modelo ao aluno",
        variant: "destructive"
      });
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Dumbbell className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">Carregando modalidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {selectedModality && (
          <Button variant="outline" onClick={() => setSelectedModality(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar às Modalidades
          </Button>
        )}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {selectedModality ? `Modelos de ${selectedModality}` : 'Modalidades de Treino'}
          </h1>
          <p className="text-muted-foreground">
            {selectedModality 
              ? `Selecione um modelo de ${selectedModality} para atribuir aos alunos`
              : 'Selecione uma modalidade para ver os modelos disponíveis'
            }
          </p>
        </div>
      </div>

      {!selectedModality ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modalities.map((modality) => (
            <Card 
              key={modality.modality} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleModalityClick(modality.modality)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {modality.modality}
                  </CardTitle>
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <CardDescription>
                  {modality.model_count} modelo(s) disponível(is)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {modality.levels_available.map((level) => (
                    <Badge key={level} variant="secondary" className="text-xs">
                      {level}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <Card key={model.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {model.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {model.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {model.periodization_phase}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {model.general_objective}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p><strong>Metodologia:</strong> {model.method_description}</p>
                  <p><strong>Semana:</strong> {model.week_number}</p>
                </div>

                <Button 
                  onClick={() => handleAssignModel(model)}
                  className="w-full"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Atribuir a Aluno
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Atribuir Modelo a Aluno</DialogTitle>
            <DialogDescription>
              Selecione o aluno que receberá este modelo de treino.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-select">Aluno</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.nome} - {student.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações sobre este modelo para o aluno..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={confirmAssignment}
                disabled={!selectedStudent || assignLoading}
              >
                {assignLoading ? (
                  "Atribuindo..."
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Atribuir Modelo
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
