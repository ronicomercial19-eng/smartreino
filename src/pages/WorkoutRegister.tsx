
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { PageLayout } from "@/components/shared/PageLayout";
import { toast } from "@/components/ui/use-toast";

const workouts = [
  "10X - Membros Superiores",
  "10X - Membros Inferiores",
  "10X - Corpo Inteiro",
  "Corporal - Upper",
  "Corporal - Lower",
  "Misto - Força e Cardio",
];

const WorkoutRegister = () => {
  const [workoutData, setWorkoutData] = useState({
    workout: "",
    date: new Date().toISOString().split('T')[0],
    duration: "",
    pse: [5],
    feedback: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cargaInterna = parseInt(workoutData.duration) * workoutData.pse[0];
    
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
    
    if (cargaInterna > 300) {
      toast({
        title: "💡 Sugestão da IA",
        description: "Carga alta — considere um dia de descanso ou treino leve.",
      });
    }
    
    navigate("/dashboard");
  };

  return (
    <PageLayout title="📝 Registrar Treino" subtitle="Registre seu treino e acompanhe sua carga interna">
      <Card className="max-w-2xl mx-auto glass border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workout">Tipo de Treino</Label>
                <Select onValueChange={(value) => setWorkoutData({...workoutData, workout: value})}>
                  <SelectTrigger><SelectValue placeholder="Selecione o treino" /></SelectTrigger>
                  <SelectContent>
                    {workouts.map((w) => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data do Treino</Label>
                <Input id="date" type="date" value={workoutData.date} onChange={(e) => setWorkoutData({...workoutData, date: e.target.value})} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input id="duration" type="number" value={workoutData.duration} onChange={(e) => setWorkoutData({...workoutData, duration: e.target.value})} placeholder="Ex: 45" required />
            </div>

            <div className="space-y-4">
              <Label>Percepção Subjetiva de Esforço (PSE)</Label>
              <div className="px-4">
                <Slider value={workoutData.pse} onValueChange={(value) => setWorkoutData({...workoutData, pse: value})} max={10} min={1} step={1} />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>1 - Muito Fácil</span>
                  <span className="font-semibold text-primary">{workoutData.pse[0]}/10</span>
                  <span>10 - Máximo</span>
                </div>
              </div>
            </div>

            {workoutData.duration && (
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-foreground mb-1">Carga Interna Calculada</h3>
                <p className="text-primary font-bold text-lg">
                  {parseInt(workoutData.duration || "0") * workoutData.pse[0]}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({workoutData.duration} min × PSE {workoutData.pse[0]})
                  </span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback / Observações</Label>
              <Textarea id="feedback" value={workoutData.feedback} onChange={(e) => setWorkoutData({...workoutData, feedback: e.target.value})} placeholder="Como foi o treino?" rows={4} />
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>Cancelar</Button>
              <Button type="submit" className="flex-1">Registrar Treino</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default WorkoutRegister;
