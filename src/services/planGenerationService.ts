
import { completeExerciseDatabase } from '@/data/exerciseDatabase';

// Interfaces baseadas na estrutura da base de dados
export interface Student {
  id: string;
  email: string;
  name: string;
  role: "aluno";
  adminId: string;
  createdAt: string;
}

export interface ExerciseDB {
  name: string;
  focus: string[];
  type: string;
  equipment: string;
  difficulty?: string;
  category?: string;
}

export interface GeneratedPlan {
  id: string;
  studentId: string;
  periodizationType: string;
  weeks: WeekPlan[];
  createdAt: string;
  generatedBy: string;
}

export interface WeekPlan {
  weekNumber: number;
  phase: string;
  focus: string;
  workouts: DayWorkout[];
}

export interface DayWorkout {
  day: string;
  exercises: SelectedExercise[];
  duration: number;
  intensity: string;
  focus: string[];
}

export interface SelectedExercise {
  exercise: ExerciseDB;
  sets: number;
  reps: string;
  rest: string;
  load?: string;
  notes?: string;
}

export interface PeriodizationTemplate {
  name: string;
  totalWeeks: number;
  phases: Phase[];
}

interface Phase {
  name: string;
  weekRange: [number, number];
  focus: string[];
  intensity: 'Baixa' | 'Moderada' | 'Alta';
  volume: 'Baixo' | 'Moderado' | 'Alto';
  workoutsPerWeek: number;
}

class PlanGenerationService {
  private usedExercises: Set<string> = new Set();
  
  // Templates de periodização
  private periodizationTemplates: Record<string, PeriodizationTemplate> = {
    "blocos": {
      name: "Periodização em Blocos",
      totalWeeks: 24,
      phases: [
        {
          name: "Adaptação Anatômica",
          weekRange: [1, 4],
          focus: ["Técnica", "Resistência Muscular", "Mobilidade"],
          intensity: "Baixa",
          volume: "Moderado",
          workoutsPerWeek: 3
        },
        {
          name: "Bloco de Força",
          weekRange: [5, 12],
          focus: ["Força Máxima", "Coordenação"],
          intensity: "Alta",
          volume: "Moderado",
          workoutsPerWeek: 4
        },
        {
          name: "Bloco de Potência",
          weekRange: [13, 20],
          focus: ["Potência", "Velocidade", "Coordenação"],
          intensity: "Alta",
          volume: "Baixo",
          workoutsPerWeek: 4
        },
        {
          name: "Tapering",
          weekRange: [21, 24],
          focus: ["Manutenção", "Recuperação"],
          intensity: "Moderada",
          volume: "Baixo",
          workoutsPerWeek: 3
        }
      ]
    },
    "linear": {
      name: "Periodização Linear",
      totalWeeks: 24,
      phases: [
        {
          name: "Base",
          weekRange: [1, 8],
          focus: ["Resistência", "Técnica"],
          intensity: "Baixa",
          volume: "Alto",
          workoutsPerWeek: 4
        },
        {
          name: "Força",
          weekRange: [9, 16],
          focus: ["Força", "Hipertrofia"],
          intensity: "Moderada",
          volume: "Moderado",
          workoutsPerWeek: 4
        },
        {
          name: "Potência",
          weekRange: [17, 24],
          focus: ["Potência", "Especificidade"],
          intensity: "Alta",
          volume: "Baixo",
          workoutsPerWeek: 3
        }
      ]
    }
  };

  // Mapear focos para grupos musculares
  private focusToMuscleGroups: Record<string, string[]> = {
    "Cadeia Posterior": ["Isquiotibiais", "Glúteos", "Dorsais"],
    "Cadeia Anterior": ["Quadríceps", "Peitoral", "Deltoide Anterior"],
    "Core": ["Abdominais", "Core"],
    "Membros Superiores": ["Peitoral", "Dorsais", "Deltoide", "Bíceps", "Tríceps"],
    "Membros Inferiores": ["Quadríceps", "Isquiotibiais", "Glúteos", "Panturrilha"],
    "Força Máxima": ["Quadríceps", "Dorsais", "Peitoral"],
    "Potência": ["Corpo Inteiro"],
    "Resistência": ["Corpo Inteiro"],
    "Técnica": ["Corpo Inteiro"],
    "Mobilidade": ["Mobilidade"]
  };

  // Gerar plano completo de 24 semanas
  generateCompletePlan(
    student: Student, 
    periodizationType: string = "blocos",
    adminId: string
  ): GeneratedPlan {
    console.log(`🏋️ Iniciando geração do plano para ${student.name}`);
    
    const template = this.periodizationTemplates[periodizationType];
    if (!template) {
      throw new Error(`Template de periodização '${periodizationType}' não encontrado`);
    }

    // Resetar exercícios usados para nova geração
    this.usedExercises.clear();
    
    const weeks: WeekPlan[] = [];
    
    // Gerar cada semana baseada no template
    for (let weekNumber = 1; weekNumber <= template.totalWeeks; weekNumber++) {
      const currentPhase = this.getCurrentPhase(weekNumber, template.phases);
      const weekPlan = this.generateWeekPlan(weekNumber, currentPhase);
      weeks.push(weekPlan);
    }

    const plan: GeneratedPlan = {
      id: `plan_${student.id}_${Date.now()}`,
      studentId: student.id,
      periodizationType: template.name,
      weeks,
      createdAt: new Date().toISOString(),
      generatedBy: adminId
    };

    console.log(`✅ Plano de ${template.totalWeeks} semanas gerado com sucesso!`);
    return plan;
  }

  // Determinar fase atual baseada no número da semana
  private getCurrentPhase(weekNumber: number, phases: Phase[]): Phase {
    for (const phase of phases) {
      if (weekNumber >= phase.weekRange[0] && weekNumber <= phase.weekRange[1]) {
        return phase;
      }
    }
    return phases[0]; // Fallback para primeira fase
  }

  // Gerar plano de uma semana
  private generateWeekPlan(weekNumber: number, phase: Phase): WeekPlan {
    const workoutDays = this.getWorkoutDays(phase.workoutsPerWeek);
    const workouts: DayWorkout[] = [];

    workoutDays.forEach((day, index) => {
      const dailyFocus = this.getDailyFocus(phase.focus, index, phase.workoutsPerWeek);
      const workout = this.generateDayWorkout(day, dailyFocus, phase);
      workouts.push(workout);
    });

    return {
      weekNumber,
      phase: phase.name,
      focus: phase.focus.join(", "),
      workouts
    };
  }

  // Definir dias da semana para treino
  private getWorkoutDays(workoutsPerWeek: number): string[] {
    const allDays = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
    
    const patterns: Record<number, string[]> = {
      3: ["Segunda-feira", "Quarta-feira", "Sexta-feira"],
      4: ["Segunda-feira", "Terça-feira", "Quinta-feira", "Sexta-feira"],
      5: ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"],
      6: ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]
    };

    return patterns[workoutsPerWeek] || patterns[3];
  }

  // Definir foco do dia baseado na fase
  private getDailyFocus(phaseFocus: string[], dayIndex: number, totalDays: number): string[] {
    // Distribuir focos pelos dias da semana
    if (totalDays === 3) {
      const focusDistribution = [
        ["Membros Superiores"],
        ["Membros Inferiores"],
        ["Corpo Inteiro"]
      ];
      return focusDistribution[dayIndex] || ["Corpo Inteiro"];
    }
    
    if (totalDays === 4) {
      const focusDistribution = [
        ["Cadeia Anterior"],
        ["Cadeia Posterior"],
        ["Membros Superiores"],
        ["Core", "Mobilidade"]
      ];
      return focusDistribution[dayIndex] || ["Corpo Inteiro"];
    }

    // Fallback para distribuição simples
    return phaseFocus.slice(0, 2);
  }

  // Gerar treino de um dia
  private generateDayWorkout(day: string, dailyFocus: string[], phase: Phase): DayWorkout {
    const targetMuscleGroups = this.getMuscleGroupsFromFocus(dailyFocus);
    const exercises = this.selectExercisesForDay(targetMuscleGroups, phase);
    
    // Calcular duração baseada no volume e quantidade de exercícios
    const baseDuration = 30;
    const durationMultiplier = phase.volume === "Alto" ? 1.5 : phase.volume === "Moderado" ? 1.2 : 1;
    const duration = Math.round((baseDuration + exercises.length * 8) * durationMultiplier);

    return {
      day,
      exercises,
      duration,
      intensity: phase.intensity,
      focus: dailyFocus
    };
  }

  // Converter focos em grupos musculares
  private getMuscleGroupsFromFocus(focuses: string[]): string[] {
    const muscleGroups: Set<string> = new Set();
    
    focuses.forEach(focus => {
      const groups = this.focusToMuscleGroups[focus] || [focus];
      groups.forEach(group => muscleGroups.add(group));
    });

    return Array.from(muscleGroups);
  }

  // Selecionar exercícios para o dia
  private selectExercisesForDay(targetMuscleGroups: string[], phase: Phase): SelectedExercise[] {
    const selectedExercises: SelectedExercise[] = [];
    const exercisesPerMuscleGroup = Math.max(1, Math.floor(6 / targetMuscleGroups.length));

    targetMuscleGroups.forEach(muscleGroup => {
      const availableExercises = this.getExercisesByMuscleGroup(muscleGroup);
      const filteredExercises = availableExercises.filter(ex => !this.usedExercises.has(ex.name));
      
      // Se não há exercícios não usados, resetar parcialmente
      const exercisesToUse = filteredExercises.length > 0 ? filteredExercises : availableExercises;
      
      // Selecionar exercícios aleatoriamente
      const shuffled = [...exercisesToUse].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, exercisesPerMuscleGroup);

      selected.forEach(exercise => {
        const selectedExercise = this.createSelectedExercise(exercise, phase);
        selectedExercises.push(selectedExercise);
        this.usedExercises.add(exercise.name);
      });
    });

    // Garantir pelo menos 4 exercícios por treino
    while (selectedExercises.length < 4 && selectedExercises.length < completeExerciseDatabase.length) {
      const remainingExercises = completeExerciseDatabase.filter(ex => 
        !selectedExercises.some(sel => sel.exercise.name === ex.name)
      );
      
      if (remainingExercises.length === 0) break;
      
      const randomExercise = remainingExercises[Math.floor(Math.random() * remainingExercises.length)];
      const selectedExercise = this.createSelectedExercise(randomExercise, phase);
      selectedExercises.push(selectedExercise);
    }

    return selectedExercises.slice(0, 8); // Máximo 8 exercícios por treino
  }

  // Buscar exercícios por grupo muscular
  private getExercisesByMuscleGroup(muscleGroup: string): ExerciseDB[] {
    return completeExerciseDatabase.filter(exercise => {
      // Verificar se o exercício trabalha o grupo muscular desejado
      if (Array.isArray(exercise.primaryMuscles)) {
        return exercise.primaryMuscles.some((muscle: string) => 
          muscle.toLowerCase().includes(muscleGroup.toLowerCase()) ||
          muscleGroup.toLowerCase().includes(muscle.toLowerCase())
        );
      }
      
      if (exercise.category) {
        return exercise.category.toLowerCase().includes(muscleGroup.toLowerCase()) ||
               muscleGroup.toLowerCase().includes(exercise.category.toLowerCase());
      }
      
      return false;
    }).map(ex => ({
      name: ex.name,
      focus: Array.isArray(ex.primaryMuscles) ? ex.primaryMuscles : [ex.category || "Geral"],
      type: ex.category || "Composto",
      equipment: ex.equipment || "Livre"
    }));
  }

  // Criar exercício selecionado com parâmetros
  private createSelectedExercise(exercise: ExerciseDB, phase: Phase): SelectedExercise {
    const parameters = this.getExerciseParameters(phase);
    
    return {
      exercise,
      sets: parameters.sets,
      reps: parameters.reps,
      rest: parameters.rest,
      load: parameters.load,
      notes: this.generateExerciseNotes(exercise, phase)
    };
  }

  // Definir parâmetros do exercício baseado na fase
  private getExerciseParameters(phase: Phase): {
    sets: number;
    reps: string;
    rest: string;
    load: string;
  } {
    const phaseParams = {
      "Adaptação Anatômica": {
        sets: 2,
        reps: "15-20",
        rest: "60s",
        load: "50-60%"
      },
      "Bloco de Força": {
        sets: 4,
        reps: "4-6",
        rest: "180s",
        load: "85-95%"
      },
      "Bloco de Potência": {
        sets: 5,
        reps: "3-5",
        rest: "180s",
        load: "70-85%"
      },
      "Base": {
        sets: 3,
        reps: "12-15",
        rest: "90s",
        load: "65-75%"
      },
      "Força": {
        sets: 4,
        reps: "6-8",
        rest: "120s",
        load: "80-90%"
      },
      "Potência": {
        sets: 4,
        reps: "3-5",
        rest: "180s",
        load: "70-85%"
      }
    };

    return phaseParams[phase.name as keyof typeof phaseParams] || phaseParams["Base"];
  }

  // Gerar notas para o exercício
  private generateExerciseNotes(exercise: ExerciseDB, phase: Phase): string {
    const notes = [
      "Foque na técnica perfeita",
      "Controle a fase excêntrica",
      "Mantenha tensão constante",
      "Respiração controlada"
    ];

    if (phase.name.includes("Força")) {
      notes.push("Carga máxima com segurança");
    }
    
    if (phase.name.includes("Potência")) {
      notes.push("Explosividade na fase concêntrica");
    }

    return notes[Math.floor(Math.random() * notes.length)];
  }

  // Método para ajustar exercício específico (para o editor)
  replaceExercise(
    plan: GeneratedPlan, 
    weekNumber: number, 
    dayIndex: number, 
    exerciseIndex: number, 
    newExercise: ExerciseDB
  ): GeneratedPlan {
    const updatedPlan = { ...plan };
    const week = updatedPlan.weeks.find(w => w.weekNumber === weekNumber);
    
    if (week && week.workouts[dayIndex] && week.workouts[dayIndex].exercises[exerciseIndex]) {
      const currentPhase = this.getCurrentPhase(weekNumber, this.periodizationTemplates["blocos"].phases);
      const newSelectedExercise = this.createSelectedExercise(newExercise, currentPhase);
      
      week.workouts[dayIndex].exercises[exerciseIndex] = newSelectedExercise;
    }

    return updatedPlan;
  }
}

export const planGenerationService = new PlanGenerationService();
