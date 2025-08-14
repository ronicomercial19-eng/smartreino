
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, Search, Edit, Trash2 } from "lucide-react";
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
}

export default function ExerciseManagement() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    target_muscles: [] as string[],
    phase: '',
    goal: '',
    equipment: '',
    difficulty_level: 'Básico',
    video_url: '',
    instructions: ''
  });

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

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

  const filterExercises = () => {
    if (!searchTerm) {
      setFilteredExercises(exercises);
      return;
    }

    const filtered = exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.target_muscles.some(muscle => 
        muscle.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      exercise.equipment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.difficulty_level?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredExercises(filtered);
  };

  const handleAddExercise = async () => {
    try {
      if (!newExercise.name || newExercise.target_muscles.length === 0) {
        toast({
          title: "Erro",
          description: "Nome e músculos alvo são obrigatórios",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('exercises')
        .insert([newExercise]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Exercício adicionado com sucesso",
      });

      setIsAddDialogOpen(false);
      setNewExercise({
        name: '',
        description: '',
        target_muscles: [],
        phase: '',
        goal: '',
        equipment: '',
        difficulty_level: 'Básico',
        video_url: '',
        instructions: ''
      });
      loadExercises();
    } catch (error) {
      console.error('Erro ao adicionar exercício:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar exercício",
        variant: "destructive"
      });
    }
  };

  const handleAddMuscle = (muscle: string) => {
    if (muscle && !newExercise.target_muscles.includes(muscle)) {
      setNewExercise({
        ...newExercise,
        target_muscles: [...newExercise.target_muscles, muscle]
      });
    }
  };

  const handleRemoveMuscle = (muscle: string) => {
    setNewExercise({
      ...newExercise,
      target_muscles: newExercise.target_muscles.filter(m => m !== muscle)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Dumbbell className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">Carregando exercícios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            Gestão de Exercícios
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua biblioteca de exercícios.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Exercício
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Exercício</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo exercício.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Exercício *</Label>
                <Input
                  id="name"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                  placeholder="Ex: Agachamento Livre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newExercise.description}
                  onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
                  placeholder="Descrição do exercício..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Músculos Alvo *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite um músculo e pressione Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddMuscle((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {newExercise.target_muscles.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveMuscle(muscle)}>
                      {muscle} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipamento</Label>
                  <Input
                    id="equipment"
                    value={newExercise.equipment}
                    onChange={(e) => setNewExercise({...newExercise, equipment: e.target.value})}
                    placeholder="Ex: Barra, Halteres, Peso Corporal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Dificuldade</Label>
                  <Select value={newExercise.difficulty_level} onValueChange={(value) => setNewExercise({...newExercise, difficulty_level: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Básico">Básico</SelectItem>
                      <SelectItem value="Intermediário">Intermediário</SelectItem>
                      <SelectItem value="Avançado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">URL do Vídeo</Label>
                <Input
                  id="video_url"
                  value={newExercise.video_url}
                  onChange={(e) => setNewExercise({...newExercise, video_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instruções</Label>
                <Textarea
                  id="instructions"
                  value={newExercise.instructions}
                  onChange={(e) => setNewExercise({...newExercise, instructions: e.target.value})}
                  placeholder="Instruções detalhadas de execução..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddExercise}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos os Exercícios</TabsTrigger>
          <TabsTrigger value="search">Buscar</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <Card key={exercise.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  {exercise.description && (
                    <CardDescription className="line-clamp-2">
                      {exercise.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {exercise.target_muscles.map((muscle) => (
                      <Badge key={muscle} variant="secondary" className="text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                  
                  {exercise.equipment && (
                    <p className="text-sm"><strong>Equipamento:</strong> {exercise.equipment}</p>
                  )}
                  
                  {exercise.difficulty_level && (
                    <Badge variant="outline">{exercise.difficulty_level}</Badge>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, músculo, equipamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  {exercise.description && (
                    <CardDescription className="line-clamp-2">
                      {exercise.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {exercise.target_muscles.map((muscle) => (
                      <Badge key={muscle} variant="secondary" className="text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                  
                  {exercise.equipment && (
                    <p className="text-sm"><strong>Equipamento:</strong> {exercise.equipment}</p>
                  )}
                  
                  {exercise.difficulty_level && (
                    <Badge variant="outline">{exercise.difficulty_level}</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredExercises.length === 0 && searchTerm && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum exercício encontrado
                </h3>
                <p className="text-muted-foreground text-center">
                  Tente ajustar os termos de busca.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {exercises.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum exercício cadastrado
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece adicionando exercícios à sua biblioteca.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Exercício
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
