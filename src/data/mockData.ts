
// Dados simulados para teste da aplicação
export const mockWorkouts = [
  {
    id: 1,
    workout: "10X - Membros Superiores",
    date: "2024-01-15",
    duration: "45",
    pse: 8,
    cargaInterna: 360,
    feedback: "Treino muito intenso, senti bastante o peito e tríceps. Boa queimação muscular."
  },
  {
    id: 2,
    workout: "10X - Membros Inferiores",
    date: "2024-01-17",
    duration: "50",
    pse: 9,
    cargaInterna: 450,
    feedback: "Treino pesado de pernas. Agachamentos desafiadores, senti tremor muscular."
  },
  {
    id: 3,
    workout: "Corporal - Upper",
    date: "2024-01-20",
    duration: "35",
    pse: 6,
    cargaInterna: 210,
    feedback: "Treino mais leve, foco na técnica. Bom para recuperação ativa."
  },
  {
    id: 4,
    workout: "10X - Corpo Inteiro",
    date: "2024-01-22",
    duration: "55",
    pse: 9,
    cargaInterna: 495,
    feedback: "Treino completo muito desafiador. Burpees foram o ponto alto da sessão."
  },
  {
    id: 5,
    workout: "Misto - Força e Cardio",
    date: "2024-01-25",
    duration: "40",
    pse: 7,
    cargaInterna: 280,
    feedback: "Boa combinação de força e cardio. Senti o coração acelerar bastante."
  },
  {
    id: 6,
    workout: "10X - Membros Superiores",
    date: "2024-01-27",
    duration: "42",
    pse: 8,
    cargaInterna: 336,
    feedback: "Melhorei as repetições das flexões em relação ao treino anterior."
  },
  {
    id: 7,
    workout: "Corporal - Lower",
    date: "2024-01-29",
    duration: "38",
    pse: 7,
    cargaInterna: 266,
    feedback: "Foco em mobilidade de quadril. Afundos ficaram mais fluidos."
  },
  {
    id: 8,
    workout: "10X - Corpo Inteiro",
    date: "2024-02-01",
    duration: "48",
    pse: 8,
    cargaInterna: 384,
    feedback: "Consegui manter intensidade alta por mais tempo. Evolução clara!"
  }
];

export const mockAISuggestions = [
  {
    id: 1,
    date: "2024-01-23",
    suggestion: "Recomendamos um dia de descanso ou treino leve",
    reason: "Sua carga interna foi alta (495). É importante dar tempo para recuperação.",
    type: "recovery"
  },
  {
    id: 2,
    date: "2024-01-28",
    suggestion: "Considere aumentar a intensidade gradualmente",
    reason: "Seus últimos treinos mostram boa adaptação. Tempo de progredir!",
    type: "progression"
  },
  {
    id: 3,
    date: "2024-02-02",
    suggestion: "Adicione exercícios de mobilidade",
    reason: "Notei que você tem focado muito em força. Mobilidade ajudará na recuperação.",
    type: "balance"
  },
  {
    id: 4,
    date: "2024-02-05",
    suggestion: "Parabéns pela consistência!",
    reason: "Você manteve uma frequência excelente. Continue assim para resultados ótimos.",
    type: "motivation"
  }
];

export const mockUserProfile = {
  name: "João Silva",
  email: "joao.silva@email.com",
  age: 28,
  objective: "Ganhar massa muscular e força",
  level: "intermediario",
  joinDate: "2024-01-10",
  totalWorkouts: mockWorkouts.length,
  averagePSE: 7.6,
  averageLoad: 336,
  favoriteWorkout: "10X - Corpo Inteiro",
  weeklyGoal: 4,
  currentStreak: 12
};

export const mockPerformanceData = [
  { date: "2024-01-15", carga: 360, pse: 8, duracao: 45 },
  { date: "2024-01-17", carga: 450, pse: 9, duracao: 50 },
  { date: "2024-01-20", carga: 210, pse: 6, duracao: 35 },
  { date: "2024-01-22", carga: 495, pse: 9, duracao: 55 },
  { date: "2024-01-25", carga: 280, pse: 7, duracao: 40 },
  { date: "2024-01-27", carga: 336, pse: 8, duracao: 42 },
  { date: "2024-01-29", carga: 266, pse: 7, duracao: 38 },
  { date: "2024-02-01", carga: 384, pse: 8, duracao: 48 }
];

export const mockWeeklyStats = {
  thisWeek: {
    workouts: 3,
    totalDuration: 125,
    averagePSE: 7.3,
    totalLoad: 980
  },
  lastWeek: {
    workouts: 4,
    totalDuration: 175,
    averagePSE: 7.8,
    totalLoad: 1371
  }
};

// Função para inicializar dados mock no localStorage
export const initializeMockData = () => {
  // Só inicializa se não houver dados existentes
  if (!localStorage.getItem("workouts")) {
    localStorage.setItem("workouts", JSON.stringify(mockWorkouts));
  }
  
  if (!localStorage.getItem("aiSuggestions")) {
    localStorage.setItem("aiSuggestions", JSON.stringify(mockAISuggestions));
  }
  
  if (!localStorage.getItem("userProfile")) {
    localStorage.setItem("userProfile", JSON.stringify(mockUserProfile));
  }
  
  if (!localStorage.getItem("performanceData")) {
    localStorage.setItem("performanceData", JSON.stringify(mockPerformanceData));
  }
};

// Funções auxiliares para trabalhar com os dados
export const getWorkoutStats = () => {
  const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
  
  if (workouts.length === 0) return null;
  
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum: number, w: any) => sum + parseInt(w.duration), 0);
  const averagePSE = Math.round(workouts.reduce((sum: number, w: any) => sum + w.pse, 0) / totalWorkouts * 10) / 10;
  const averageLoad = Math.round(workouts.reduce((sum: number, w: any) => sum + w.cargaInterna, 0) / totalWorkouts);
  
  return {
    totalWorkouts,
    totalDuration,
    averagePSE,
    averageLoad
  };
};

export const getRecentWorkouts = (limit: number = 5) => {
  const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
  return workouts.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
};

export const getWorkoutsByPeriod = (days: number = 30) => {
  const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return workouts.filter((workout: any) => new Date(workout.date) >= cutoffDate);
};
