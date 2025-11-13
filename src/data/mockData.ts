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

// Todos os dados mock foram removidos - usar apenas dados reais do banco
export const mockWorkouts: WorkoutRecord[] = [];
export const mockAISuggestions: AISuggestion[] = [];
export const mockUserProfiles: UserProfile[] = [];
export const mockPerformanceData: any[] = [];

export const mockWeeklyStats = {
  thisWeek: {
    workouts: 0,
    totalDuration: 0,
    averagePSE: 0,
    totalLoad: 0
  },
  lastWeek: {
    workouts: 0,
    totalDuration: 0,
    averagePSE: 0,
    totalLoad: 0
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