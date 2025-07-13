import { expandedExerciseDatabase, Exercise } from '../data/expandedExerciseDatabase';
import { newExerciseDatabase } from '../data/newExerciseDatabase';
import { userExerciseDatabase } from '../data/userExerciseDatabase';

// Combine all exercise databases
const allExercises: Exercise[] = [
  ...expandedExerciseDatabase,
  ...newExerciseDatabase,
  ...userExerciseDatabase
];

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  focus: string;
  weeks: WeekPlan[];
  createdAt: string;
}

export interface WeekPlan {
  weekNumber: number;
  focus: string;
  workouts: WorkoutSession[];
}

export interface WorkoutSession {
  day: number;
  name: string;
  type: string;
  exercises: Exercise[];
  notes?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  experience: 'Iniciante' | 'Intermediário' | 'Avançado';
  goals: string[];
  availableDays: number;
  timePerSession: number;
  equipment: string[];
  limitations?: string[];
}

// Periodization phases
const periodizationPhases = [
  "Adaptação Inicial",
  "Desenvolvimento de Força",
  "Intensificação",
  "Pico e Recovery"
];

// Training cycles
const trainingCycles = [
  "Força",
  "Hipertrofia",
  "Resistência",
  "Potência"
];

// Helper function to convert Exercise to compatible format
const adaptExercise = (exercise: Exercise): Exercise => {
  return {
    ...exercise,
    // Ensure all required properties are present
    targetMuscles: exercise.targetMuscles || [],
    muscleGroup: exercise.muscleGroup || [],
    instructions: exercise.instructions || [],
    benefits: exercise.benefits || [],
    variations: exercise.variations || [],
    tips: exercise.tips || [],
    commonMistakes: exercise.commonMistakes || []
  };
};

// Updated exercise selection functions
const selectExercisesByMuscleGroup = (muscleGroup: string, count: number = 2): Exercise[] => {
  const filteredExercises = allExercises.filter(exercise => 
    exercise.muscleGroup.some(group => 
      group.toLowerCase().includes(muscleGroup.toLowerCase())
    )
  );
  
  return shuffleArray(filteredExercises).slice(0, count).map(adaptExercise);
};

const selectExercisesByCategory = (category: string, count: number = 3): Exercise[] => {
  const filteredExercises = allExercises.filter(exercise => 
    exercise.category === category
  );
  
  return shuffleArray(filteredExercises).slice(0, count).map(adaptExercise);
};

const selectCompoundExercises = (count: number = 2): Exercise[] => {
  const compoundExercises = allExercises.filter(exercise => 
    exercise.targetMuscles.length > 1 || 
    exercise.muscleGroup.some(group => group.includes('Corpo Inteiro'))
  );
  
  return shuffleArray(compoundExercises).slice(0, count).map(adaptExercise);
};

// Shuffle array function
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Updated workout generation functions
const generateUpperBodyWorkout = (): Exercise[] => {
  const exercises: Exercise[] = [];
  
  // Add compound movements
  exercises.push(...selectExercisesByMuscleGroup('Peitoral', 1));
  exercises.push(...selectExercisesByMuscleGroup('Dorsais', 1));
  
  // Add isolation exercises
  exercises.push(...selectExercisesByMuscleGroup('Bíceps', 1));
  exercises.push(...selectExercisesByMuscleGroup('Tríceps', 1));
  exercises.push(...selectExercisesByMuscleGroup('Deltoides', 1));
  
  return exercises;
};

const generateLowerBodyWorkout = (): Exercise[] => {
  const exercises: Exercise[] = [];
  
  // Add compound movements
  exercises.push(...selectExercisesByMuscleGroup('Quadríceps', 1));
  exercises.push(...selectExercisesByMuscleGroup('Glúteos', 1));
  
  // Add isolation exercises
  exercises.push(...selectExercisesByMuscleGroup('Isquiotibiais', 1));
  exercises.push(...selectExercisesByMuscleGroup('Panturrilha', 1));
  exercises.push(...selectExercisesByMuscleGroup('Abdutores', 1));
  
  return exercises;
};

const generateFullBodyWorkout = (): Exercise[] => {
  const exercises: Exercise[] = [];
  
  // Add compound movements that work multiple muscle groups
  exercises.push(...selectCompoundExercises(2));
  exercises.push(...selectExercisesByMuscleGroup('Peitoral', 1));
  exercises.push(...selectExercisesByMuscleGroup('Dorsais', 1));
  exercises.push(...selectExercisesByMuscleGroup('Quadríceps', 1));
  exercises.push(...selectExercisesByMuscleGroup('Glúteos', 1));
  
  return exercises;
};

const generateCardioWorkout = (): Exercise[] => {
  return selectExercisesByCategory('cardio', 4);
};

const generateStrengthWorkout = (): Exercise[] => {
  const exercises: Exercise[] = [];
  
  exercises.push(...selectExercisesByCategory('forca', 3));
  exercises.push(...selectCompoundExercises(2));
  
  return exercises;
};

const generatePhase1Workouts = (profile: StudentProfile): WorkoutSession[] => {
  const workouts: WorkoutSession[] = [];
  
  for (let day = 1; day <= profile.availableDays; day++) {
    if (day % 3 === 1) {
      workouts.push({
        day,
        name: "Treino A - Corpo Superior",
        type: "Força",
        exercises: generateUpperBodyWorkout()
      });
    } else if (day % 3 === 2) {
      workouts.push({
        day,
        name: "Treino B - Corpo Inferior", 
        type: "Força",
        exercises: generateLowerBodyWorkout()
      });
    } else {
      workouts.push({
        day,
        name: "Treino C - Cardio",
        type: "Cardio",
        exercises: generateCardioWorkout()
      });
    }
  }
  
  return workouts;
};

const generatePhase2Workouts = (profile: StudentProfile): WorkoutSession[] => {
  const workouts: WorkoutSession[] = [];
  
  for (let day = 1; day <= profile.availableDays; day++) {
    if (day % 2 === 1) {
      workouts.push({
        day,
        name: "Treino A - Força Superior",
        type: "Força",
        exercises: generateUpperBodyWorkout()
      });
    } else {
      workouts.push({
        day,
        name: "Treino B - Força Inferior",
        type: "Força", 
        exercises: generateLowerBodyWorkout()
      });
    }
  }
  
  return workouts;
};

const generatePhase3Workouts = (profile: StudentProfile): WorkoutSession[] => {
  const workouts: WorkoutSession[] = [];
  
  for (let day = 1; day <= profile.availableDays; day++) {
    workouts.push({
      day,
      name: `Treino ${day} - Corpo Completo`,
      type: "Funcional",
      exercises: generateFullBodyWorkout()
    });
  }
  
  return workouts;
};

const generatePhase4Workouts = (profile: StudentProfile): WorkoutSession[] => {
  const workouts: WorkoutSession[] = [];
  
  for (let day = 1; day <= profile.availableDays; day++) {
    if (day % 2 === 1) {
      workouts.push({
        day,
        name: "Treino Intenso - Força",
        type: "Força",
        exercises: generateStrengthWorkout()
      });
    } else {
      workouts.push({
        day,
        name: "Treino Recovery - Cardio",
        type: "Cardio",
        exercises: generateCardioWorkout()
      });
    }
  }
  
  return workouts;
};

export const generateWorkoutPlan = (profile: StudentProfile): WorkoutPlan => {
  const weeks: WeekPlan[] = [];
  
  // Generate 24 weeks divided into 4 phases of 6 weeks each
  for (let week = 1; week <= 24; week++) {
    let weekPlan: WeekPlan;
    
    if (week <= 6) {
      // Phase 1: Adaptação (weeks 1-6)
      weekPlan = {
        weekNumber: week,
        focus: "Adaptação Inicial",
        workouts: generatePhase1Workouts(profile)
      };
    } else if (week <= 12) {
      // Phase 2: Desenvolvimento (weeks 7-12)
      weekPlan = {
        weekNumber: week,
        focus: "Desenvolvimento de Força",
        workouts: generatePhase2Workouts(profile)
      };
    } else if (week <= 18) {
      // Phase 3: Intensificação (weeks 13-18)
      weekPlan = {
        weekNumber: week,
        focus: "Intensificação",
        workouts: generatePhase3Workouts(profile)
      };
    } else {
      // Phase 4: Pico/Recovery (weeks 19-24)
      weekPlan = {
        weekNumber: week,
        focus: "Pico e Recovery",
        workouts: generatePhase4Workouts(profile)
      };
    }
    
    weeks.push(weekPlan);
  }
  
  return {
    id: `plan_${Date.now()}`,
    name: `Plano Personalizado - ${profile.name}`,
    description: `Plano de treino de 24 semanas personalizado para ${profile.experience}`,
    duration: "24 semanas",
    difficulty: profile.experience,
    focus: profile.goals.join(", "),
    weeks,
    createdAt: new Date().toISOString()
  };
};
