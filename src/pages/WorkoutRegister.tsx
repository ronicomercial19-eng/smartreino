
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import Navigation from "@/components/Navigation";
import { toast } from "@/components/ui/use-toast";

const WorkoutRegister = () => {
  const [workoutData, setWorkoutData] = useState({
    workout: "",
    date: new Date().toISOString().split('T')[0],
    duration: "",
    pse: [5],
    feedback: "",
  });
  const navigate = useNavigate();

  // Treinos pré-definidos
  const workouts = [
    "10X - Membros Superiores",
    "10X - Membros Inferiores",
    "10X - Corpo Inteiro",
    "Corporal - Upper",
    "Corporal - Lower",
    "Misto - Força e Cardio",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calcular carga interna
    const cargaInterna = parseInt(workoutData.duration) * workoutData.pse[0];
    
    // Simular salvamento no localStorage
    const workoutRecord = {
      ...workoutData,
      pse: workoutData.pse[0],
      cargaInterna,
      id: Date.now(),
    };
    
    const existingWorkouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    existingWorkouts.push(workoutRecord);
    localStorage.setItem("workouts", JSON.stringify(existingWorkouts));
    
    toast({
      title: "Treino registrado com sucesso!",
      description: `Carga interna calculada: ${cargaInterna}`,
    });
    
    // Verificar se precisa gerar sugestão de descanso
    if (cargaInterna > 300) {
      const suggestion = {
        date: new Date().toISOString(),
        suggestion: "Recomendamos um dia de descanso ou treino leve",
        reason: `Sua carga interna foi alta (${cargaInterna}). É importante dar tempo para recuperação.`,
      };
      
      const existingSuggestions = JSON.parse(localStorage.getItem("aiSuggestions") || "[]");
      existingSuggestions.push(suggestion);
      localStorage.setItem("aiSuggestions", JSON.stringify(existingSuggestions));
      
      toast({
        title: "💡 Sugestão da IA",
        description: "Nova recomendação baseada na sua carga interna!",
      });
    }
    
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">
              📝 Registrar Treino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workout">Tipo de Treino</Label>
                  <Select onValueChange={(value) => setWorkoutData({...workoutData, workout: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o treino" />
                    </SelectTrigger>
                    <SelectContent>
                      {workouts.map((workout) => (
                        <SelectItem key={workout} value={workout}>
                          {workout}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data do Treino</Label>
                  <Input
                    id="date"
                    type="date"
                    value={workoutData.date}
                    onChange={(e) => setWorkoutData({...workoutData, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={workoutData.duration}
                  onChange={(e) => setWorkoutData({...workoutData, duration: e.target.value})}
                  placeholder="Ex: 45"
                  required
                />
              </div>

              <div className="space-y-4">
                <Label>Percepção Subjetiva de Esforço (PSE)</Label>
                <div className="px-4">
                  <Slider
                    value={workoutData.pse}
                    onValueChange={(value) => setWorkoutData({...workoutData, pse: value})}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>1 - Muito Fácil</span>
                    <span className="font-semibold text-blue-600">
                      {workoutData.pse[0]}/10
                    </span>
                    <span>10 - Máximo</span>
                  </div>
                </div>
              </div>

              {workoutData.duration && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Carga Interna Calculada
                  </h3>
                  <p className="text-blue-700">
                    {parseInt(workoutData.duration || "0") * workoutData.pse[0]} 
                    <span className="text-sm ml-2">
                      ({workoutData.duration} min × PSE {workoutData.pse[0]})
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback / Observações</Label>
                <Textarea
                  id="feedback"
                  value={workoutData.feedback}
                  onChange={(e) => setWorkoutData({...workoutData, feedback: e.target.value})}
                  placeholder="Como foi o treino? Alguma observação importante..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Registrar Treino
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutRegister;
