
// Re-export da versão expandida para manter compatibilidade
export type { Exercise } from './expandedExerciseDatabase';
export { 
  expandedExerciseDatabase,
  getExercisesByCategory,
  getExercisesByMuscleGroup,
  getExercisesByDifficulty,
  getExercisesByEquipment,
  getExerciseStats
} from './expandedExerciseDatabase';

// Combinar com exercícios adicionais expandidos
import { expandedExerciseDatabase } from './expandedExerciseDatabase';
import { additionalExercises } from './additionalExercises';
import { imageExerciseDatabase } from './imageExerciseDatabase';

// Banco completo com 300+ exercícios baseado na tabela fornecida + exercícios das imagens
export const completeExerciseDatabase = [
  ...expandedExerciseDatabase,
  ...additionalExercises,
  ...imageExerciseDatabase
];

// Função melhorada para buscar exercícios por grupo muscular específico
export const getExercisesBySpecificMuscle = (muscleGroup: string) => {
  return completeExerciseDatabase.filter(exercise => 
    exercise.muscleGroup.some(muscle => 
      muscle.toLowerCase().includes(muscleGroup.toLowerCase())
    ) ||
    (exercise.targetMuscles && exercise.targetMuscles.some(target =>
      target.toLowerCase().includes(muscleGroup.toLowerCase())
    ))
  );
};

// Função para obter exercícios por múltiplos critérios
export const getExercisesByMultipleCriteria = (criteria: {
  muscleGroups?: string[];
  difficulty?: string;
  equipment?: string;
  category?: string;
}) => {
  return completeExerciseDatabase.filter(exercise => {
    const matchesMuscle = !criteria.muscleGroups || 
      criteria.muscleGroups.some(muscle =>
        exercise.muscleGroup.some(em => em.toLowerCase().includes(muscle.toLowerCase()))
      );
    
    const matchesDifficulty = !criteria.difficulty || 
      exercise.difficulty === criteria.difficulty;
    
    const matchesEquipment = !criteria.equipment || 
      exercise.equipment.toLowerCase().includes(criteria.equipment.toLowerCase());
    
    const matchesCategory = !criteria.category || 
      exercise.category === criteria.category;
    
    return matchesMuscle && matchesDifficulty && matchesEquipment && matchesCategory;
  });
};

// Estatísticas completas expandidas
export const getCompleteExerciseStats = () => {
  const total = completeExerciseDatabase.length;
  
  // Categorias expandidas
  const categories = [
    'peso-corporal', 'forca', 'cardio', 'core', 
    'mobilidade', 'funcional', 'pliometrico'
  ];
  const byCategory = categories.reduce((acc, cat) => {
    acc[cat] = completeExerciseDatabase.filter(ex => ex.category === cat).length;
    return acc;
  }, {} as Record<string, number>);
  
  // Dificuldades
  const difficulties = ['Iniciante', 'Intermediário', 'Avançado'];
  const byDifficulty = difficulties.reduce((acc, diff) => {
    acc[diff] = completeExerciseDatabase.filter(ex => ex.difficulty === diff).length;
    return acc;
  }, {} as Record<string, number>);

  // Equipamentos mais comuns
  const equipments = [
    'Peso Corporal', 'Halteres', 'Barra', 'Kettlebell', 
    'Banda Elástica', 'Smith Machine', 'Máquina', 'Polia'
  ];
  const byEquipment = equipments.reduce((acc, eq) => {
    acc[eq] = completeExerciseDatabase.filter(ex => 
      ex.equipment.toLowerCase().includes(eq.toLowerCase())
    ).length;
    return acc;
  }, {} as Record<string, number>);

  // Grupos musculares principais baseados na tabela fornecida
  const muscleGroups = [
    'Panturrilha', 'Quadríceps', 'Isquiotibiais', 'Glúteos', 
    'Abdominal', 'Dorsais', 'Peitoral', 'Bíceps', 'Tríceps', 
    'Deltoide'
  ];
  const byMuscleGroup = muscleGroups.reduce((acc, muscle) => {
    acc[muscle] = getExercisesBySpecificMuscle(muscle).length;
    return acc;
  }, {} as Record<string, number>);

  return { 
    total, 
    byCategory, 
    byDifficulty, 
    byEquipment, 
    byMuscleGroup 
  };
};

// Função para criar treino balanceado usando a nova base expandida
export const createBalancedWorkout = (targetMuscles: string[], difficulty: string = 'Intermediário') => {
  const selectedExercises: typeof completeExerciseDatabase = [];
  
  targetMuscles.forEach(muscle => {
    const muscleExercises = getExercisesByMultipleCriteria({
      muscleGroups: [muscle],
      difficulty
    });
    
    if (muscleExercises.length > 0) {
      // Seleciona 1-2 exercícios aleatórios para cada grupo muscular
      const randomExercises = muscleExercises
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.random() > 0.5 ? 2 : 1);
      
      selectedExercises.push(...randomExercises);
    }
  });
  
  return selectedExercises;
};

// Função para recomendar exercícios com base no histórico
export const recommendExercises = (previousExercises: string[], targetMuscle: string) => {
  const availableExercises = getExercisesBySpecificMuscle(targetMuscle);
  
  return availableExercises
    .filter(exercise => !previousExercises.includes(exercise.name))
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
};
