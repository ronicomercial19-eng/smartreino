
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import { toast } from "@/components/ui/use-toast";
import { 
  Calendar as CalendarIcon, 
  Dumbbell, 
  Clock, 
  Target, 
  Bell,
  CheckCircle,
  Play,
  MessageCircle
} from "lucide-react";

interface TrainingPlan {
  id: string;
  studentId: string;
  periodizationType: string;
  weeks: WeekPlan[];
  createdAt: string;
}

interface WeekPlan {
  weekNumber: number;
  focus: string;
  workouts: DayWorkout[];
}

interface DayWorkout {
  day: string;
  exercises: Exercise[];
  duration: number;
  intensity: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  focus: string[];
}

interface Notification {
  id: string;
  studentId: string;
  whatsappNumber: string;
  scheduledAt: string;
  message: string;
  status: "pendente" | "enviado";
}

const StudentInterface = () => {
  const [studentPlan, setStudentPlan] = useState<TrainingPlan | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationForm, setNotificationForm] = useState({
    time: "",
    whatsappNumber: "",
    message: "Lembrete: Hora do seu treino! 💪"
  });

  // Simular carregamento do plano do aluno
  useEffect(() => {
    const mockPlan: TrainingPlan = {
      id: "plan_1",
      studentId: "student_1",
      periodizationType: "Periodização em Blocos",
      createdAt: "2024-01-15",
      weeks: [
        {
          weekNumber: 1,
          focus: "Adaptação Anatômica",
          workouts: [
            {
              day: "Segunda-feira",
              duration: 45,
              intensity: "Moderada",
              exercises: [
                {
                  name: "Agachamento com Barra",
                  sets: 3,
                  reps: "12-15",
                  rest: "60s",
                  focus: ["Quadríceps", "Glúteos"]
                },
                {
                  name: "Supino Reto com Halteres",
                  sets: 3,
                  reps: "10-12", 
                  rest: "60s",
                  focus: ["Peitoral", "Tríceps"]
                },
                {
                  name: "Remada Curvada",
                  sets: 3,
                  reps: "12-15",
                  rest: "60s",
                  focus: ["Dorsais", "Bíceps"]
                }
              ]
            },
            {
              day: "Quarta-feira",
              duration: 40,
              intensity: "Baixa",
              exercises: [
                {
                  name: "Leg Press 45°",
                  sets: 3,
                  reps: "15-20",
                  rest: "45s",
                  focus: ["Quadríceps", "Glúteos"]
                },
                {
                  name: "Desenvolvimento com Halteres",
                  sets: 3,
                  reps: "12-15",
                  rest: "45s",
                  focus: ["Deltoide"]
                }
              ]
            },
            {
              day: "Sexta-feira", 
              duration: 50,
              intensity: "Moderada",
              exercises: [
                {
                  name: "Levantamento Terra",
                  sets: 3,
                  reps: "8-10",
                  rest: "90s",
                  focus: ["Cadeia Posterior", "Core"]
                },
                {
                  name: "Flexão de Braços",
                  sets: 3,
                  reps: "10-15",
                  rest: "60s",
                  focus: ["Peitoral", "Tríceps"]
                }
              ]
            }
          ]
        }
        // Mais semanas seriam adicionadas aqui...
      ]
    };
    
    setStudentPlan(mockPlan);
  }, []);

  const handleScheduleNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !notificationForm.time || !notificationForm.whatsappNumber) {
      toast({
        title: "Dados Incompletos",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    try {
      const notification: Notification = {
        id: `notif_${Date.now()}`,
        studentId: "student_1", // ID do aluno logado
        whatsappNumber: notificationForm.whatsappNumber,
        scheduledAt: `${selectedDate.toISOString().split('T')[0]}T${notificationForm.time}`,
        message: notificationForm.message,
        status: "pendente"
      };

      setNotifications(prev => [...prev, notification]);
      
      toast({
        title: "Lembrete Agendado!",
        description: `Notificação marcada para ${selectedDate.toLocaleDateString('pt-PT')} às ${notificationForm.time}`,
      });

      // Limpar formulário
      setNotificationForm(prev => ({
        ...prev,
        time: ""
      }));

    } catch (error) {
      toast({
        title: "Erro ao Agendar",
        description: "Ocorreu um erro ao agendar o lembrete.",
        variant: "destructive"
      });
    }
  };

  const currentWeek = studentPlan?.weeks.find(w => w.weekNumber === selectedWeek);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏋️ Meu Plano de Treino
          </h1>
          <p className="text-gray-600">
            Acompanhe seu programa personalizado de 24 semanas
          </p>
        </div>

        {!studentPlan ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Nenhum Plano Disponível
              </h3>
              <p className="text-gray-500">
                Entre em contato com seu personal trainer para gerar seu plano personalizado.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="plan" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="plan" className="flex items-center space-x-2">
                <Dumbbell className="h-4 w-4" />
                <span>Plano de Treino</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Lembretes</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Progresso</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {studentPlan.periodizationType}
                  </h2>
                  <p className="text-gray-600">
                    Criado em {new Date(studentPlan.createdAt).toLocaleDateString('pt-PT')}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  Semana {selectedWeek} de 24
                </Badge>
              </div>

              {/* Seletor de Semana */}
              <Card>
                <CardHeader>
                  <CardTitle>Selecionar Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((week) => (
                      <Button
                        key={week}
                        variant={selectedWeek === week ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedWeek(week)}
                      >
                        {week}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" disabled>
                      ...
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Treinos da Semana */}
              {currentWeek && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Semana {currentWeek.weekNumber}: {currentWeek.focus}</span>
                      <Badge variant="outline">{currentWeek.workouts.length} treinos</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {currentWeek.workouts.map((workout, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-lg">{workout.day}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{workout.duration}min</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={
                                workout.intensity === "Alta" ? "border-red-200 text-red-700" :
                                workout.intensity === "Moderada" ? "border-yellow-200 text-yellow-700" :
                                "border-green-200 text-green-700"
                              }
                            >
                              {workout.intensity}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {workout.exercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{exercise.name}</h4>
                                <div className="flex flex-wrap gap-1">
                                  {exercise.focus.map((focus, focusIndex) => (
                                    <Badge key={focusIndex} variant="secondary" className="text-xs">
                                      {focus}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Séries:</span> {exercise.sets}
                                </div>
                                <div>
                                  <span className="font-medium">Reps:</span> {exercise.reps}
                                </div>
                                <div>
                                  <span className="font-medium">Descanso:</span> {exercise.rest}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-between">
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar Treino
                          </Button>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar Concluído
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Agendar Lembrete</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                    
                    <form onSubmit={handleScheduleNotification} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="time">Horário</Label>
                        <Input
                          id="time"
                          type="time"
                          value={notificationForm.time}
                          onChange={(e) => setNotificationForm(prev => ({ ...prev, time: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp (com código país)</Label>
                        <Input
                          id="whatsapp"
                          type="tel"
                          placeholder="+351 912 345 678"
                          value={notificationForm.whatsappNumber}
                          onChange={(e) => setNotificationForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Mensagem</Label>
                        <Input
                          id="message"
                          type="text"
                          value={notificationForm.message}
                          onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full">
                        <Bell className="h-4 w-4 mr-2" />
                        Agendar Lembrete
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lembretes Agendados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum lembrete agendado</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((notification) => (
                          <div key={notification.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">
                                  {new Date(notification.scheduledAt).toLocaleDateString('pt-PT')} às{' '}
                                  {new Date(notification.scheduledAt).toLocaleTimeString('pt-PT', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.whatsappNumber}</p>
                              </div>
                              <Badge 
                                variant={notification.status === "enviado" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {notification.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Acompanhamento de Progresso
                  </h3>
                  <p className="text-gray-500">
                    Funcionalidade em desenvolvimento. Em breve você poderá acompanhar seu progresso detalhado.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default StudentInterface;
