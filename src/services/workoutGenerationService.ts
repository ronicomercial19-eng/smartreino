import { completeExerciseDatabase, getExercisesByMultipleCriteria } from '@/data/exerciseDatabase';
import { UserProfile } from '@/data/mockData';

export interface WorkoutGoal {
  type: 'perda-peso' | 'ganho-massa' | 'condicionamento' | 'forca' | 'mobilidade';
  duration: number; // em minutos
  intensity: 'baixa' | 'moderada' | 'alta';
  muscleGroups: string[];
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  exercises: WorkoutExercise[];
  estimatedCalories: number;
  targetPSE: number;
  warmup: WorkoutExercise[];
  cooldown: WorkoutExercise[];
}

export interface WorkoutExercise {
  exercise: any;
  sets: number;
  reps?: number;
  duration?: number; // em segundos
  rest: number; // em segundos
  notes?: string;
}

class WorkoutGenerationService {
  
  // Gerar treino personalizado baseado no perfil e objetivo
  generatePersonalizedWorkout(
    userProfile: UserProfile, 
    goal: WorkoutGoal,
    previousWorkouts: any[] = []
  ): GeneratedWorkout {
    
    const workoutId = this.generateWorkoutId();
    const exercises = this.selectExercises(userProfile, goal, previousWorkouts);
    const warmup = this.generateWarmup(goal.duration);
    const cooldown = this.generateCooldown();
    
    const targetPSE = this.calculateTargetPSE(userProfile, goal);
    const estimatedCalories = this.estimateCalories(userProfile, goal, exercises);
    
    return {
      id: workoutId,
      name: this.generateWorkoutName(goal),
      description: this.generateWorkoutDescription(goal, userProfile),
      duration: goal.duration,
      difficulty: userProfile.level,
      exercises,
      estimatedCalories,
      targetPSE,
      warmup,
      cooldown
    };
  }

  private selectExercises(
    userProfile: UserProfile, 
    goal: WorkoutGoal, 
    previousWorkouts: any[]
  ): WorkoutExercise[] {
    
    const workoutExercises: WorkoutExercise[] = [];
    const usedExercises = this.getRecentlyUsedExercises(previousWorkouts);
    
    // Distribuir tempo entre grupos musculares
    const timePerMuscleGroup = Math.floor((goal.duration - 10) / goal.muscleGroups.length); // -10min para aquecimento/volta à calma
    
    goal.muscleGroups.forEach(muscleGroup => {
      const availableExercises = getExercisesByMultipleCriteria({
        muscleGroups: [muscleGroup],
        difficulty: userProfile.level === 'iniciante' ? 'Iniciante' : 
                   userProfile.level === 'intermediario' ? 'Intermediário' : 'Avançado'
      }).filter(ex => !usedExercises.includes(ex.name));
      
      // Selecionar 2-3 exercícios por grupo muscular
      const selectedExercises = availableExercises
        .sort(() => 0.5 - Math.random())
        .slice(0, goal.intensity === 'alta' ? 3 : 2);
      
      selectedExercises.forEach(exercise => {
        const workoutExercise = this.createWorkoutExercise(exercise, userProfile, goal);
        workoutExercises.push(workoutExercise);
      });
    });
    
    return workoutExercises;
  }

  private createWorkoutExercise(exercise: any, userProfile: UserProfile, goal: WorkoutGoal): WorkoutExercise {
    let sets = 3;
    let reps = 12;
    let duration: number | undefined;
    let rest = 60;
    
    // Ajustar baseado no objetivo
    switch (goal.type) {
      case 'forca':
        sets = 4;
        reps = 6;
        rest = 90;
        break;
      case 'perda-peso':
        sets = 3;
        reps = 15;
        rest = 45;
        break;
      case 'condicionamento':
        sets = 4;
        duration = 45;
        rest = 30;
        break;
      case 'mobilidade':
        sets = 2;
        duration = 30;
        rest = 15;
        break;
    }
    
    // Ajustar baseado no nível
    if (userProfile.level === 'iniciante') {
      sets = Math.max(2, sets - 1);
      rest += 15;
    } else if (userProfile.level === 'avancado') {
      sets += 1;
      rest -= 15;
    }
    
    return {
      exercise,
      sets,
      reps: duration ? undefined : reps,
      duration,
      rest,
      notes: this.generateExerciseNotes(exercise, userProfile)
    };
  }

  private generateWarmup(workoutDuration: number): WorkoutExercise[] {
    const warmupExercises = [
      'Marcha Estacionária',
      'Círculos com Braços',
      'Rotação de Quadril',
      'Agachamento Livre Leve',
      'Flexão de Braço no Joelho'
    ];
    
    const warmupDuration = Math.min(5, Math.floor(workoutDuration * 0.15));
    
    return warmupExercises.slice(0, 3).map(name => ({
      exercise: { name, category: 'mobilidade' },
      sets: 1,
      duration: warmupDuration * 20, // 20s por exercício
      rest: 10,
      notes: 'Movimento controlado e suave'
    }));
  }

  private generateCooldown(): WorkoutExercise[] {
    return [
      {
        exercise: { name: 'Caminhada Leve', category: 'cardio' },
        sets: 1,
        duration: 120,
        rest: 0,
        notes: 'Diminua gradualmente o ritmo'
      },
      {
        exercise: { name: 'Alongamento Geral', category: 'mobilidade' },
        sets: 1,
        duration: 180,
        rest: 0,
        notes: 'Foque nos músculos trabalhados'
      }
    ];
  }

  private calculateTargetPSE(userProfile: UserProfile, goal: WorkoutGoal): number {
    let basePSE = 6;
    
    // Ajustar baseado na intensidade
    switch (goal.intensity) {
      case 'baixa': basePSE = 4; break;
      case 'moderada': basePSE = 6; break;
      case 'alta': basePSE = 8; break;
    }
    
    // Ajustar baseado no nível
    if (userProfile.level === 'iniciante') {
      basePSE = Math.max(3, basePSE - 1);
    } else if (userProfile.level === 'avancado') {
      basePSE = Math.min(9, basePSE + 1);
    }
    
    return basePSE;
  }

  private estimateCalories(userProfile: UserProfile, goal: WorkoutGoal, exercises: WorkoutExercise[]): number {
    // Estimativa baseada no tipo de treino e duração
    let caloriesPerMinute = 8; // Base
    
    switch (goal.type) {
      case 'condicionamento':
      case 'perda-peso':
        caloriesPerMinute = 12;
        break;
      case 'forca':
        caloriesPerMinute = 6;
        break;
      case 'ganho-massa':
        caloriesPerMinute = 8;
        break;
      case 'mobilidade':
        caloriesPerMinute = 4;
        break;
    }
    
    // Ajustar baseado na intensidade
    switch (goal.intensity) {
      case 'baixa': caloriesPerMinute *= 0.8; break;
      case 'alta': caloriesPerMinute *= 1.3; break;
    }
    
    return Math.round(goal.duration * caloriesPerMinute);
  }

  private generateWorkoutName(goal: WorkoutGoal): string {
    const typeNames = {
      'perda-peso': 'Queima Calorias',
      'ganho-massa': 'Hipertrofia',
      'condicionamento': 'Resistência',
      'forca': 'Força',
      'mobilidade': 'Mobilidade'
    };
    
    const intensityNames = {
      'baixa': 'Suave',
      'moderada': 'Moderado',
      'alta': 'Intenso'
    };
    
    return `${typeNames[goal.type]} ${intensityNames[goal.intensity]} - ${goal.duration}min`;
  }

  private generateWorkoutDescription(goal: WorkoutGoal, userProfile: UserProfile): string {
    const descriptions = {
      'perda-peso': `Treino focado em queima de calorias com exercícios dinâmicos e intervalos curtos. Ideal para ${userProfile.level}s que buscam definição.`,
      'ganho-massa': `Treino de hipertrofia com foco em volume e tensão muscular. Exercícios selecionados para maximizar o ganho de massa.`,
      'condicionamento': `Treino metabólico para melhorar resistência cardiovascular e muscular. Combine força e cardio eficientemente.`,
      'forca': `Treino de força com cargas progressivas. Foque na técnica e progressão gradual para ${userProfile.level}s.`,
      'mobilidade': `Treino de mobilidade e flexibilidade. Melhore sua amplitude de movimento e prevenção de lesões.`
    };
    
    return descriptions[goal.type];
  }

  private generateExerciseNotes(exercise: any, userProfile: UserProfile): string {
    const levelNotes = {
      'iniciante': 'Foque na técnica. Pare se sentir dor.',
      'intermediario': 'Mantenha boa forma. Aumente carga gradualmente.',
      'avancado': 'Desafie-se mantendo técnica perfeita.'
    };
    
    return levelNotes[userProfile.level as keyof typeof levelNotes] || '';
  }

  private getRecentlyUsedExercises(previousWorkouts: any[]): string[] {
    // Pegar exercícios dos últimos 3 treinos para variar
    return previousWorkouts
      .slice(0, 3)
      .flatMap(workout => workout.exercises || [])
      .map((ex: any) => ex.name || ex.exercise?.name)
      .filter(Boolean);
  }

  private generateWorkoutId(): string {
    return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Sugerir próximo treino baseado no histórico
  suggestNextWorkout(
    userProfile: UserProfile, 
    recentWorkouts: any[]
  ): WorkoutGoal {
    
    // Analisar padrões nos últimos treinos
    const lastWorkoutTypes = recentWorkouts.slice(0, 5).map(w => w.type || 'condicionamento');
    const avgPSE = recentWorkouts.length > 0 
      ? recentWorkouts.slice(0, 3).reduce((sum, w) => sum + (w.pse || 6), 0) / 3 
      : 6;
    
    // Definir tipo baseado no objetivo e variação
    let suggestedType: WorkoutGoal['type'] = 'condicionamento';
    
    if (userProfile.objective === 'perda-peso') {
      suggestedType = lastWorkoutTypes.includes('condicionamento') ? 'forca' : 'perda-peso';
    } else if (userProfile.objective === 'ganho-massa') {
      suggestedType = lastWorkoutTypes.includes('forca') ? 'condicionamento' : 'ganho-massa';
    }
    
    // Ajustar intensidade baseada no PSE recente
    let intensity: WorkoutGoal['intensity'] = 'moderada';
    if (avgPSE > 8) {
      intensity = 'baixa'; // Recuperação
    } else if (avgPSE < 5) {
      intensity = 'alta'; // Aumentar desafio
    }
    
    // Selecionar grupos musculares para variar
    const recentMuscles = recentWorkouts
      .slice(0, 2)
      .flatMap(w => w.muscleGroups || []);
    
    const allMuscles = ['Peitoral', 'Dorsais', 'Quadríceps', 'Isquiotibiais', 'Deltoide', 'Bíceps', 'Tríceps'];
    const suggestedMuscles = allMuscles
      .filter(m => !recentMuscles.includes(m))
      .slice(0, 3);
    
    if (suggestedMuscles.length === 0) {
      // Se todos foram usados recentemente, selecionar aleatoriamente
      suggestedMuscles.push(...allMuscles.sort(() => 0.5 - Math.random()).slice(0, 2));
    }
    
    return {
      type: suggestedType,
      duration: 45, // Duração padrão
      intensity,
      muscleGroups: suggestedMuscles
    };
  }

  // Gerar variações de um treino existente
  generateWorkoutVariations(baseWorkout: GeneratedWorkout): GeneratedWorkout[] {
    const variations: GeneratedWorkout[] = [];
    
    // Variação 1: Aumentar intensidade
    const highIntensity = {
      ...baseWorkout,
      id: this.generateWorkoutId(),
      name: baseWorkout.name.replace('Moderado', 'Intenso'),
      targetPSE: Math.min(9, baseWorkout.targetPSE + 1),
      exercises: baseWorkout.exercises.map(ex => ({
        ...ex,
        sets: ex.sets + 1,
        rest: ex.rest - 10
      }))
    };
    variations.push(highIntensity);
    
    // Variação 2: Versão mais longa
    const extended = {
      ...baseWorkout,
      id: this.generateWorkoutId(),
      name: baseWorkout.name.replace(/\d+min/, `${baseWorkout.duration + 15}min`),
      duration: baseWorkout.duration + 15,
      exercises: [
        ...baseWorkout.exercises,
        ...baseWorkout.exercises.slice(0, 2).map(ex => ({
          ...ex,
          exercise: { ...ex.exercise, name: ex.exercise.name + ' (Extra)' }
        }))
      ]
    };
    variations.push(extended);
    
    return variations;
  }
}

export const workoutGenerationService = new WorkoutGenerationService();
export { WorkoutGenerationService };
