
// Dados simulados para teste da aplicação
export interface WorkoutRecord {
  id: number;
  workout: string;
  date: string;
  duration: string;
  pse: number;
  cargaInterna: number;
  feedback: string;
  userId?: string;
}

export interface AISuggestion {
  id: number;
  date: string;
  suggestion: string;
  reason: string;
  type: 'recovery' | 'progression' | 'balance' | 'motivation' | 'warning';
  userId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  objective: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  joinDate: string;
  totalWorkouts: number;
  averagePSE: number;
  averageLoad: number;
  favoriteWorkout: string;
  weeklyGoal: number;
  currentStreak: number;
  weight?: number;
  height?: number;
  preferences?: {
    workoutTypes: string[];
    availableDays: string[];
    sessionDuration: number;
  };
}

export const mockWorkouts: WorkoutRecord[] = [
  {
    id: 1,
    workout: "10X - Membros Superiores",
    date: "2024-01-15",
    duration: "45",
    pse: 8,
    cargaInterna: 360,
    feedback: "Treino muito intenso, senti bastante o peito e tríceps. Boa queimação muscular.",
    userId: "demo-user"
  },
  {
    id: 2,
    workout: "10X - Membros Inferiores",
    date: "2024-01-17",
    duration: "50",
    pse: 9,
    cargaInterna: 450,
    feedback: "Treino pesado de pernas. Agachamentos desafiadores, senti tremor muscular.",
    userId: "demo-user"
  },
  {
    id: 3,
    workout: "Corporal - Upper",
    date: "2024-01-20",
    duration: "35",
    pse: 6,
    cargaInterna: 210,
    feedback: "Treino mais leve, foco na técnica. Bom para recuperação ativa.",
    userId: "demo-user"
  },
  {
    id: 4,
    workout: "10X - Corpo Inteiro",
    date: "2024-01-22",
    duration: "55",
    pse: 9,
    cargaInterna: 495,
    feedback: "Treino completo muito desafiador. Burpees foram o ponto alto da sessão.",
    userId: "demo-user"
  },
  {
    id: 5,
    workout: "Misto - Força e Cardio",
    date: "2024-01-25",
    duration: "40",
    pse: 7,
    cargaInterna: 280,
    feedback: "Boa combinação de força e cardio. Senti o coração acelerar bastante.",
    userId: "demo-user"
  },
  {
    id: 6,
    workout: "10X - Membros Superiores",
    date: "2024-01-27",
    duration: "42",
    pse: 8,
    cargaInterna: 336,
    feedback: "Melhorei as repetições das flexões em relação ao treino anterior.",
    userId: "demo-user"
  },
  {
    id: 7,
    workout: "Corporal - Lower",
    date: "2024-01-29",
    duration: "38",
    pse: 7,
    cargaInterna: 266,
    feedback: "Foco em mobilidade de quadril. Afundos ficaram mais fluidos.",
    userId: "demo-user"
  },
  {
    id: 8,
    workout: "10X - Corpo Inteiro",
    date: "2024-02-01",
    duration: "48",
    pse: 8,
    cargaInterna: 384,
    feedback: "Consegui manter intensidade alta por mais tempo. Evolução clara!",
    userId: "demo-user"
  }
];

export const mockAISuggestions: AISuggestion[] = [
  {
    id: 1,
    date: "2024-01-23",
    suggestion: "Recomendamos um dia de descanso ou treino leve",
    reason: "Sua carga interna foi alta (495). É importante dar tempo para recuperação.",
    type: "recovery",
    userId: "demo-user"
  },
  {
    id: 2,
    date: "2024-01-28",
    suggestion: "Considere aumentar a intensidade gradualmente",
    reason: "Seus últimos treinos mostram boa adaptação. Tempo de progredir!",
    type: "progression",
    userId: "demo-user"
  },
  {
    id: 3,
    date: "2024-02-02",
    suggestion: "Adicione exercícios de mobilidade",
    reason: "Notei que você tem focado muito em força. Mobilidade ajudará na recuperação.",
    type: "balance",
    userId: "demo-user"
  },
  {
    id: 4,
    date: "2024-02-05",
    suggestion: "Parabéns pela consistência!",
    reason: "Você manteve uma frequência excelente. Continue assim para resultados ótimos.",
    type: "motivation",
    userId: "demo-user"
  }
];

export const mockUserProfiles: UserProfile[] = [
  {
    id: "demo-user",
    name: "Usuário Demo",
    email: "demo@10xtraining.com",
    age: 25,
    objective: "Teste da aplicação",
    level: "intermediario",
    joinDate: "2024-01-10",
    totalWorkouts: mockWorkouts.length,
    averagePSE: 7.6,
    averageLoad: 336,
    favoriteWorkout: "10X - Corpo Inteiro",
    weeklyGoal: 4,
    currentStreak: 12,
    weight: 75,
    height: 175,
    preferences: {
      workoutTypes: ["10X", "Corporal"],
      availableDays: ["Segunda", "Quarta", "Sexta"],
      sessionDuration: 45
    }
  },
  {
    id: "joao-silva",
    name: "João Silva",
    email: "joao.silva@email.com",
    age: 28,
    objective: "Ganhar massa muscular e força",
    level: "intermediario",
    joinDate: "2024-01-10",
    totalWorkouts: 0,
    averagePSE: 0,
    averageLoad: 0,
    favoriteWorkout: "",
    weeklyGoal: 4,
    currentStreak: 0,
    weight: 80,
    height: 180,
    preferences: {
      workoutTypes: ["10X", "Força"],
      availableDays: ["Segunda", "Terça", "Quinta", "Sábado"],
      sessionDuration: 60
    }
  }
];

export const mockPerformanceData = [
  { date: "2024-01-15", carga: 360, pse: 8, duracao: 45, userId: "demo-user" },
  { date: "2024-01-17", carga: 450, pse: 9, duracao: 50, userId: "demo-user" },
  { date: "2024-01-20", carga: 210, pse: 6, duracao: 35, userId: "demo-user" },
  { date: "2024-01-22", carga: 495, pse: 9, duracao: 55, userId: "demo-user" },
  { date: "2024-01-25", carga: 280, pse: 7, duracao: 40, userId: "demo-user" },
  { date: "2024-01-27", carga: 336, pse: 8, duracao: 42, userId: "demo-user" },
  { date: "2024-01-29", carga: 266, pse: 7, duracao: 38, userId: "demo-user" },
  { date: "2024-02-01", carga: 384, pse: 8, duracao: 48, userId: "demo-user" }
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
  
  if (!localStorage.getItem("userProfiles")) {
    localStorage.setItem("userProfiles", JSON.stringify(mockUserProfiles));
  }
  
  if (!localStorage.getItem("performanceData")) {
    localStorage.setItem("performanceData", JSON.stringify(mockPerformanceData));
  }
};

// Funções auxiliares para trabalhar com os dados
export const getCurrentUserProfile = (): UserProfile | null => {
  const user = localStorage.getItem("user");
  if (!user) return null;
  
  const userData = JSON.parse(user);
  const profiles = JSON.parse(localStorage.getItem("userProfiles") || "[]");
  
  return profiles.find((profile: UserProfile) => 
    profile.email === userData.email || profile.id === "demo-user"
  ) || null;
};

export const updateUserProfile = (updatedProfile: UserProfile) => {
  const profiles = JSON.parse(localStorage.getItem("userProfiles") || "[]");
  const profileIndex = profiles.findIndex((p: UserProfile) => p.id === updatedProfile.id);
  
  if (profileIndex >= 0) {
    profiles[profileIndex] = updatedProfile;
  } else {
    profiles.push(updatedProfile);
  }
  
  localStorage.setItem("userProfiles", JSON.stringify(profiles));
};

export const getUserWorkouts = (userId: string): WorkoutRecord[] => {
  const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
  return workouts.filter((workout: WorkoutRecord) => 
    workout.userId === userId || userId === "demo-user"
  );
};

export const getWorkoutStats = (userId?: string) => {
  let workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
  
  if (userId) {
    workouts = workouts.filter((w: WorkoutRecord) => w.userId === userId);
  }
  
  if (workouts.length === 0) return null;
  
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum: number, w: WorkoutRecord) => sum + parseInt(w.duration), 0);
  const averagePSE = Math.round(workouts.reduce((sum: number, w: WorkoutRecord) => sum + w.pse, 0) / totalWorkouts * 10) / 10;
  const averageLoad = Math.round(workouts.reduce((sum: number, w: WorkoutRecord) => sum + w.cargaInterna, 0) / totalWorkouts);
  
  return {
    totalWorkouts,
    totalDuration,
    averagePSE,
    averageLoad
  };
};

export const getRecentWorkouts = (limit: number = 5, userId?: string): WorkoutRecord[] => {
  let workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
  
  if (userId) {
    workouts = workouts.filter((workout: WorkoutRecord) => workout.userId === userId);
  }
  
  return workouts
    .sort((a: WorkoutRecord, b: WorkoutRecord) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const getWorkoutsByPeriod = (days: number = 30, userId?: string): WorkoutRecord[] => {
  let workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  if (userId) {
    workouts = workouts.filter((workout: WorkoutRecord) => workout.userId === userId);
  }
  
  return workouts.filter((workout: WorkoutRecord) => new Date(workout.date) >= cutoffDate);
};

export const getUserAISuggestions = (userId: string): AISuggestion[] => {
  const suggestions = JSON.parse(localStorage.getItem("aiSuggestions") || "[]");
  return suggestions.filter((suggestion: AISuggestion) => 
    suggestion.userId === userId || userId === "demo-user"
  );
};
