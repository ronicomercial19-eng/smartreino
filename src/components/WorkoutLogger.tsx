
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  CheckCircle2, 
  Clock, 
  Dumbbell, 
  Play, 
  Plus, 
  RotateCcw, 
  Star,
  Timer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WorkoutLogger = () => {
  const { toast } = useToast();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pse, setPse] = useState([7]);
  const [exercises, setExercises] = useState([
    {
      name: "Flexão de Braço",
      sets: 3,
      reps: "10-15",
      rest: "60s",
      completed: false,
      actualReps: [],
      notes: ""
    },
    {
      name: "Agachamento",
      sets: 4,
      reps: "12-20",
      rest: "90s",
      completed: false,
      actualReps: [],
      notes: ""
    },
    {
      name: "Prancha",
      sets: 3,
      reps: "30-60s",
      rest: "60s",
      completed: false,
      actualReps: [],
      notes: ""
    },
    {
      name: "Burpee",
      sets: 3,
      reps: "8-12",
      rest: "120s",
      completed: false,
      actualReps: [],
      notes: ""
    }
  ]);

  const startWorkout = () => {
    setWorkoutStarted(true);
    toast({
      title: "🔥 Treino Iniciado!",
      description: "Vamos com tudo! Foque na técnica e dê o seu melhor.",
    });
  };

  const completeExercise = () => {
    const updatedExercises = [...exercises];
    updatedExercises[currentExercise].completed = true;
    setExercises(updatedExercises);
    
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    }
    
    toast({
      title: "✅ Exercício Concluído!",
      description: `${exercises[currentExercise].name} finalizado com sucesso!`,
    });
  };

  const finishWorkout = () => {
    toast({
      title: "🎉 Treino Finalizado!",
      description: `Parabéns! PSE registrado: ${pse[0]}/10. Continue assim!`,
    });
  };

  const exercise = exercises[currentExercise];
  const completedCount = exercises.filter(ex => ex.completed).length;
  const progressPercentage = (completedCount / exercises.length) * 100;

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center space-x-2">
                <Dumbbell className="h-5 w-5 text-blue-400" />
                <span>Treino 10X - Upper Body</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                {completedCount}/{exercises.length} exercícios concluídos
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-400">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</p>
              <p className="text-sm text-gray-400">Tempo decorrido</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {!workoutStarted ? (
            <Button 
              onClick={startWorkout}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Treino
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {workoutStarted && (
        <>
          {/* Current Exercise */}
          <Card className="bg-black/30 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">{exercise.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    Exercício {currentExercise + 1} de {exercises.length}
                  </CardDescription>
                </div>
                <Badge variant={exercise.completed ? "default" : "secondary"}>
                  {exercise.completed ? "Concluído" : "Em Andamento"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xl font-bold text-blue-400">{exercise.sets}</p>
                  <p className="text-sm text-gray-400">Séries</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xl font-bold text-purple-400">{exercise.reps}</p>
                  <p className="text-sm text-gray-400">Repetições</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xl font-bold text-orange-400">{exercise.rest}</p>
                  <p className="text-sm text-gray-400">Descanso</p>
                </div>
              </div>

              {/* Set Logger */}
              <div className="space-y-3">
                <Label className="text-white">Registrar Séries</Label>
                {Array.from({ length: exercise.sets }, (_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <span className="text-gray-400 w-16">Série {i + 1}:</span>
                    <Input 
                      placeholder="Reps realizadas"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                    <Button size="sm" variant="outline" className="border-white/20 text-white">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Label className="text-white">Observações</Label>
                <Textarea 
                  placeholder="Como foi o exercício? Alguma dificuldade?"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={completeExercise}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Concluir Exercício
                </Button>
                <Button variant="outline" className="border-white/20 text-white">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Exercise List */}
          <Card className="bg-black/30 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Lista de Exercícios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {exercises.map((ex, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    index === currentExercise 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
                      : ex.completed 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {ex.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : index === currentExercise ? (
                      <Timer className="h-5 w-5 text-blue-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="text-white font-medium">{ex.name}</p>
                      <p className="text-sm text-gray-400">{ex.sets} séries × {ex.reps}</p>
                    </div>
                  </div>
                  <Badge variant={ex.completed ? "default" : "secondary"}>
                    {ex.completed ? "✓" : index === currentExercise ? "Atual" : "Aguardando"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* PSE Rating */}
          {completedCount === exercises.length && (
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Star className="h-5 w-5 text-orange-400" />
                  <span>Avaliação do Treino (PSE)</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Como foi a intensidade do seu treino? (1-10)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Muito Fácil</span>
                    <span className="text-white font-bold">PSE: {pse[0]}</span>
                    <span className="text-gray-400">Máximo Esforço</span>
                  </div>
                  <Slider
                    value={pse}
                    onValueChange={setPse}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <Button 
                  onClick={finishWorkout}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Finalizar Treino
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default WorkoutLogger;
