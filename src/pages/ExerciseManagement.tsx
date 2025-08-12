
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Dumbbell, Filter, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  target_muscles: string[];
  phase?: string;
  goal?: string;
  equipment?: string;
  difficulty_level?: string;
  video_url?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export default function ExerciseManagement() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    target_muscles: [] as string[],
    equipment: '',
    difficulty_level: 'Básico',
    video_url: '',
    instructions: ''
  });
  const { toast } = useToast();

  const muscleGroups = [
    'Peitoral', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 
    'Posterior', 'Glúteos', 'Panturrilha', 'Core', 'Trapézio', 'Antebraço'
  ];

  const difficultyLevels = ['Básico', 'Intermediário', 'Avançado'];

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exercises, searchTerm, selectedMuscle, selectedDifficulty]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando exercícios...');
      
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Erro ao carregar exercícios:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} exercícios carregados`);
      setExercises(data || []);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar exercícios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = exercises;

    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.target_muscles.some(muscle => 
          muscle.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedMuscle) {
      filtered = filtered.filter(exercise =>
        exercise.target_muscles.includes(selectedMuscle)
      );
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(exercise =>
        exercise.difficulty_level === selectedDifficulty
      );
    }

    setFilteredExercises(filtered);
  };

  const handleCreateExercise = async () => {
    if (!newExercise.name || newExercise.target_muscles.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e músculos alvo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('➕ Criando novo exercício:', newExercise.name);
      
      const { error } = await supabase
        .from('exercises')
        .insert([newExercise]);

      if (error) {
        console.error('❌ Erro ao criar exercício:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Exercício criado com sucesso"
      });

      setIsCreateDialogOpen(false);
      setNewExercise({
        name: '',
        description: '',
        target_muscles: [],
        equipment: '',
        difficulty_level: 'Básico',
        video_url: '',
        instructions: ''
      });
      loadExercises();
    } catch (error) {
      console.error('Erro ao criar exercício:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar exercício",
        variant: "destructive"
      });
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setNewExercise({
      name: exercise.name,
      description: exercise.description || '',
      target_muscles: exercise.target_muscles,
      equipment: exercise.equipment || '',
      difficulty_level: exercise.difficulty_level || 'Básico',
      video_url: exercise.video_url || '',
      instructions: exercise.instructions || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateExercise = async () => {
    if (!selectedExercise || !newExercise.name || newExercise.target_muscles.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e músculos alvo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔄 Atualizando exercício:', selectedExercise.id);
      
      const { error } = await supabase
        .from('exercises')
        .update(newExercise)
        .eq('id', selectedExercise.id);

      if (error) {
        console.error('❌ Erro ao atualizar exercício:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Exercício atualizado com sucesso"
      });

      setIsEditDialogOpen(false);
      setSelectedExercise(null);
      setNewExercise({
        name: '',
        description: '',
        target_muscles: [],
        equipment: '',
        difficulty_level: 'Básico',
        video_url: '',
        instructions: ''
      });
      loadExercises();
    } catch (error) {
      console.error('Erro ao atualizar exercício:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar exercício",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      console.log('🗑️ Excluindo exercício:', exerciseId);
      
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) {
        console.error('❌ Erro ao excluir exercício:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Exercício excluído com sucesso"
      });

      loadExercises();
    } catch (error) {
      console.error('Erro ao excluir exercício:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir exercício",
        variant: "destructive"
      });
    }
  };

  const toggleMuscleSelection = (muscle: string) => {
    setNewExercise(prev => ({
      ...prev,
      target_muscles: prev.target_muscles.includes(muscle)
        ? prev.target_muscles.filter(m => m !== muscle)
        : [...prev.target_muscles, muscle]
    }));
  };

  const ExerciseForm = ({ onSubmit, submitText }: { onSubmit: () => void; submitText: string }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Exercício *</Label>
        <Input
          id="name"
          value={newExercise.name}
          onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Supino Reto"
        />
      </div>

      <div className="space-y-2">
        <Label>Músculos Alvo *</Label>
        <div className="grid grid-cols-3 gap-2">
          {muscleGroups.map((muscle) => (
            <Button
              key={muscle}
              variant={newExercise.target_muscles.includes(muscle) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMuscleSelection(muscle)}
              className="text-xs"
            >
              {muscle}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={newExercise.description}
          onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Breve descrição do exercício"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="equipment">Equipamento</Label>
          <Input
            id="equipment"
            value={newExercise.equipment}
            onChange={(e) => setNewExercise(prev => ({ ...prev, equipment: e.target.value }))}
            placeholder="Ex: Barra, Halteres"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Dificuldade</Label>
          <Select 
            value={newExercise.difficulty_level} 
            onValueChange={(value) => setNewExercise(prev => ({ ...prev, difficulty_level: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficultyLevels.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="video_url">URL do Vídeo</Label>
        <Input
          id="video_url"
          value={newExercise.video_url}
          onChange={(e) => setNewExercise(prev => ({ ...prev, video_url: e.target.value }))}
          placeholder="https://youtube.com/..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instruções de Execução</Label>
        <Textarea
          id="instructions"
          value={newExercise.instructions}
          onChange={(e) => setNewExercise(prev => ({ ...prev, instructions: e.target.value }))}
          placeholder="Passo a passo para execução correta"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
        }}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} className="btn-glow">
          <Save className="mr-2 h-4 w-4" />
          {submitText}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-pulse-orange">
            <Dumbbell className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">Carregando exercícios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading gradient-text">
            Gerenciamento de Exercícios
          </h1>
          <p className="text-muted-foreground">
            Gerencie todos os exercícios da sua base de dados.
          </p>
        </div>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="todos">Todos Exercícios</TabsTrigger>
          <TabsTrigger value="criar">Criar Novo</TabsTrigger>
          <TabsTrigger value="procurar">Procurar</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          {/* Filtros */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar exercícios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedMuscle} onValueChange={setSelectedMuscle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por músculo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os músculos</SelectItem>
                    {muscleGroups.map((muscle) => (
                      <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as dificuldades</SelectItem>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                Mostrando {filteredExercises.length} de {exercises.length} exercícios
              </div>
            </CardContent>
          </Card>

          {/* Lista de Exercícios */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="glass border-border/50 card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-heading text-lg">
                      {exercise.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {exercise.difficulty_level}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {exercise.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {exercise.target_muscles.map((muscle) => (
                      <Badge key={muscle} variant="outline" className="text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>

                  {exercise.equipment && (
                    <p className="text-sm"><strong>Equipamento:</strong> {exercise.equipment}</p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditExercise(exercise)}
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <Card className="glass border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold font-heading mb-2">
                  Nenhum exercício encontrado
                </h3>
                <p className="text-muted-foreground text-center">
                  Tente ajustar os filtros ou criar um novo exercício.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="criar" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Plus className="h-5 w-5" />
                Criar Novo Exercício
              </CardTitle>
              <CardDescription>
                Adicione um novo exercício à base de dados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExerciseForm onSubmit={handleCreateExercise} submitText="Criar Exercício" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procurar" className="space-y-4">
          {/* Content will be the same as "todos" tab but focused on search */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Search className="h-5 w-5" />
                Procurar Exercícios
              </CardTitle>
              <CardDescription>
                Use filtros avançados para encontrar exercícios específicos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Same filter content as in "todos" tab */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar exercícios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedMuscle} onValueChange={setSelectedMuscle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por músculo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os músculos</SelectItem>
                    {muscleGroups.map((muscle) => (
                      <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as dificuldades</SelectItem>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results in a more condensed list format for search */}
          <div className="space-y-2">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="glass border-border/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold">{exercise.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {exercise.difficulty_level}
                      </Badge>
                      <div className="flex gap-1">
                        {exercise.target_muscles.slice(0, 2).map((muscle) => (
                          <Badge key={muscle} variant="outline" className="text-xs">
                            {muscle}
                          </Badge>
                        ))}
                        {exercise.target_muscles.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{exercise.target_muscles.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {exercise.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditExercise(exercise)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para editar exercício */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Exercício</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias no exercício.
            </DialogDescription>
          </DialogHeader>
          <ExerciseForm onSubmit={handleUpdateExercise} submitText="Salvar Alterações" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
