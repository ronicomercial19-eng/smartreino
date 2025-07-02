
// Re-export da versão expandida para manter compatibilidade
export type { Exercise } from './expandedExerciseDatabase';
export { 
  expandedExerciseDatabase as exerciseDatabase,
  getExercisesByCategory,
  getExercisesByMuscleGroup,
  getExercisesByDifficulty,
  getExercisesByEquipment,
  getExerciseStats
} from './expandedExerciseDatabase';

// Combinar com exercícios adicionais
import { expandedExerciseDatabase } from './expandedExerciseDatabase';
import { additionalExercises } from './additionalExercises';

// Banco completo com 200+ exercícios
export const completeExerciseDatabase = [
  ...expandedExerciseDatabase,
  ...additionalExercises
];

// Estatísticas completas
export const getCompleteExerciseStats = () => {
  const total = completeExerciseDatabase.length;
  
  const categories = ['peso-corporal', 'forca', 'cardio', 'core', 'mobilidade', 'funcional', 'pliometrico'];
  const byCategory = categories.reduce((acc, cat) => {
    acc[cat] = completeExerciseDatabase.filter(ex => ex.category === cat).length;
    return acc;
  }, {} as Record<string, number>);
  
  const difficulties = ['Iniciante', 'Intermediário', 'Avançado'];
  const byDifficulty = difficulties.reduce((acc, diff) => {
    acc[diff] = completeExerciseDatabase.filter(ex => ex.difficulty === diff).length;
    return acc;
  }, {} as Record<string, number>);

  const equipments = ['Peso Corporal', 'Halteres', 'Barra', 'Kettlebell', 'Banda Elástica'];
  const byEquipment = equipments.reduce((acc, eq) => {
    acc[eq] = completeExerciseDatabase.filter(ex => 
      ex.equipment.toLowerCase().includes(eq.toLowerCase())
    ).length;
  }, {} as Record<string, number>);

  return { total, byCategory, byDifficulty, byEquipment };
};
