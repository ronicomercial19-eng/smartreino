
import { Exercise } from './expandedExerciseDatabase';

// Novos exercícios de membros superiores, inferiores e corpo inteiro
export const newExerciseDatabase: Exercise[] = [
  // ===== MEMBROS SUPERIORES =====
  {
    id: 200,
    name: "Tempore Peitoral",
    category: "forca",
    muscleGroup: ["Peitoral Superior"],
    targetMuscles: ["Peitoral Superior"],
    difficulty: "Iniciante",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Exercício para peitoral superior com foco em membros superiores",
    equipment: "Kettlebell",
    instructions: [
      "Posicione-se com kettlebell adequadamente",
      "Execute movimento para peitoral superior",
      "Mantenha controle durante o exercício",
      "Foque na contração muscular"
    ],
    benefits: ["Desenvolve peitoral superior", "Fortalece membros superiores", "Melhora definição"],
    variations: ["Com diferentes pesos", "Diferentes ângulos"],
    tips: ["Mantenha forma correta", "Controle o peso", "Respiração adequada"],
    commonMistakes: ["Peso excessivo", "Movimento descontrolado"]
  },

  {
    id: 201,
    name: "Harum Peitoral",
    category: "peso-corporal",
    muscleGroup: ["Peitoral"],
    targetMuscles: ["Peitoral Maior"],
    difficulty: "Iniciante",
    duration: "3 séries × 15-20 reps",
    sets: "3",
    reps: "15-20",
    restTime: "45s",
    description: "Exercício para peitoral com foco em membros superiores",
    equipment: "Peso Corporal",
    instructions: [
      "Posição inicial adequada",
      "Execute movimento de peitoral",
      "Use apenas peso corporal",
      "Mantenha alinhamento"
    ],
    benefits: ["Fortalece peitoral", "Não requer equipamentos", "Funcional"],
    variations: ["Diferentes posições", "Com pause"],
    tips: ["Forma perfeita", "Progressão gradual", "Core ativo"],
    commonMistakes: ["Postura inadequada", "Movimento incompleto"]
  },

  {
    id: 202,
    name: "Deserunt Tríceps Avançado",
    category: "forca",
    muscleGroup: ["Tríceps"],
    targetMuscles: ["Tríceps Braquial"],
    difficulty: "Iniciante",
    duration: "3 séries × 10-12 reps",
    sets: "3",
    reps: "10-12",
    restTime: "60s",
    description: "Exercício para tríceps com foco em membros superiores",
    equipment: "Kettlebell",
    instructions: [
      "Configure kettlebell adequadamente",
      "Execute extensão de tríceps",
      "Mantenha cotovelos fixos",
      "Controle total do movimento"
    ],
    benefits: ["Desenvolve tríceps", "Melhora força dos braços", "Definição muscular"],
    variations: ["Unilateral", "Bilateral"],
    tips: ["Cotovelos estáveis", "Amplitude completa", "Não usar impulso"],
    commonMistakes: ["Movimento dos cotovelos", "Compensação com ombros"]
  },

  {
    id: 203,
    name: "Quae Deltoides",
    category: "forca",
    muscleGroup: ["Deltoides"],
    targetMuscles: ["Deltoide Médio"],
    difficulty: "Avançado",
    duration: "3 séries × 8-10 reps",
    sets: "3",
    reps: "8-10",
    restTime: "90s",
    description: "Exercício para deltoides médio com foco em membros superiores",
    equipment: "Máquina",
    instructions: [
      "Ajuste máquina corretamente",
      "Execute elevação lateral",
      "Foque no deltoide médio",
      "Movimento controlado"
    ],
    benefits: ["Desenvolve ombros", "Largura dos ombros", "Força específica"],
    variations: ["Diferentes ângulos", "Velocidades variadas"],
    tips: ["Não usar impulso", "Amplitude controlada", "Contração no topo"],
    commonMistakes: ["Peso excessivo", "Movimento compensatório"]
  },

  {
    id: 204,
    name: "Ratione Trapézio",
    category: "peso-corporal",
    muscleGroup: ["Trapézio"],
    targetMuscles: ["Trapézio"],
    difficulty: "Iniciante",
    duration: "3 séries × 15-20 reps",
    sets: "3",
    reps: "15-20",
    restTime: "45s",
    description: "Exercício para trapézio com foco em membros superiores",
    equipment: "Peso Corporal",
    instructions: [
      "Posição inicial adequada",
      "Execute elevação de ombros",
      "Contraia trapézio",
      "Movimento lento e controlado"
    ],
    benefits: ["Fortalece trapézio", "Melhora postura", "Reduz tensão"],
    variations: ["Com pause", "Diferentes amplitudes"],
    tips: ["Foque na contração", "Não force pescoço", "Respire adequadamente"],
    commonMistakes: ["Movimento muito rápido", "Tensão no pescoço"]
  },

  // ===== MEMBROS INFERIORES =====
  {
    id: 205,
    name: "Culpa Glúteos com Halteres",
    category: "forca",
    muscleGroup: ["Glúteos"],
    targetMuscles: ["Glúteo Máximo"],
    difficulty: "Avançado",
    duration: "3 séries × 8-12 reps",
    sets: "3",
    reps: "8-12",
    restTime: "90s",
    description: "Exercício para glúteos com foco em membros inferiores",
    equipment: "Halteres",
    instructions: [
      "Posicione halteres adequadamente",
      "Execute movimento de glúteos",
      "Mantenha tensão constante",
      "Foque na ativação dos glúteos"
    ],
    benefits: ["Desenvolve glúteos", "Melhora força posterior", "Definição"],
    variations: ["Unilateral", "Bilateral"],
    tips: ["Ativação consciente", "Amplitude completa", "Controle excêntrico"],
    commonMistakes: ["Compensação lombar", "Peso inadequado"]
  },

  {
    id: 206,
    name: "Exercitationem Panturrilha Avançado",
    category: "forca",
    muscleGroup: ["Panturrilha"],
    targetMuscles: ["Gastrocnêmio", "Sóleo"],
    difficulty: "Avançado",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Exercício para panturrilha com foco em membros inferiores",
    equipment: "Barra",
    instructions: [
      "Configure barra adequadamente",
      "Execute elevação de panturrilha",
      "Amplitude máxima",
      "Contração no topo"
    ],
    benefits: ["Desenvolve panturrilhas", "Melhora propulsão", "Força específica"],
    variations: ["Uma perna", "Diferentes posições"],
    tips: ["Amplitude completa", "Pausa no topo", "Descida controlada"],
    commonMistakes: ["Movimento parcial", "Muito peso"]
  },

  {
    id: 207,
    name: "Corporis Abdutores com Halteres",
    category: "forca",
    muscleGroup: ["Abdutores"],
    targetMuscles: ["Glúteo Médio"],
    difficulty: "Intermediário",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Exercício para abdutores com foco em membros inferiores",
    equipment: "Bola Medicinal",
    instructions: [
      "Posicione bola medicinal",
      "Execute abdução do quadril",
      "Mantenha estabilidade",
      "Foque nos abdutores"
    ],
    benefits: ["Fortalece abdutores", "Melhora estabilidade", "Previne lesões"],
    variations: ["Diferentes posições", "Com resistência"],
    tips: ["Movimento isolado", "Controle total", "Sem compensação"],
    commonMistakes: ["Movimento do tronco", "Compensação excessiva"]
  },

  {
    id: 208,
    name: "Commodi Isquiotibiais na Máquina",
    category: "forca",
    muscleGroup: ["Isquiotibiais"],
    targetMuscles: ["Isquiotibiais"],
    difficulty: "Iniciante",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Exercício para isquiotibiais com foco em membros inferiores",
    equipment: "Kettlebell",
    instructions: [
      "Configure kettlebell",
      "Execute flexão de joelhos",
      "Foque nos isquiotibiais",
      "Movimento controlado"
    ],
    benefits: ["Desenvolve isquiotibiais", "Melhora força posterior", "Equilíbrio muscular"],
    variations: ["Unilateral", "Diferentes velocidades"],
    tips: ["Amplitude completa", "Controle excêntrico", "Não usar impulso"],
    commonMistakes: ["Movimento muito rápido", "Compensação com glúteos"]
  },

  // ===== CORPO INTEIRO =====
  {
    id: 209,
    name: "Alias Corpo Avançado",
    category: "funcional",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Múltiplos Grupos Musculares"],
    difficulty: "Iniciante",
    duration: "3 séries × 30-45s",
    sets: "3",
    reps: "30-45s",
    restTime: "90s",
    description: "Exercício para corpo inteiro com foco em corpo inteiro",
    equipment: "Bola Medicinal",
    instructions: [
      "Configure bola medicinal",
      "Execute movimento complexo",
      "Envolva múltiplos grupos",
      "Mantenha coordenação"
    ],
    benefits: ["Trabalho completo", "Melhora coordenação", "Queima calórica"],
    variations: ["Diferentes complexidades", "Ritmos variados"],
    tips: ["Coordenação", "Respiração adequada", "Progressão gradual"],
    commonMistakes: ["Complexidade excessiva", "Fadiga prematura"]
  },

  {
    id: 210,
    name: "Veritatis Cardiorrespiratório com Halteres",
    category: "cardio",
    muscleGroup: ["Cardio"],
    targetMuscles: ["Sistema Cardiovascular"],
    difficulty: "Intermediário",
    duration: "3 séries × 45-60s",
    sets: "3",
    reps: "45-60s",
    restTime: "60s",
    description: "Exercício para cardiorrespiratório com foco em corpo inteiro",
    equipment: "Peso Corporal",
    instructions: [
      "Movimento cardiovascular",
      "Mantenha ritmo elevado",
      "Coordene respiração",
      "Trabalho contínuo"
    ],
    benefits: ["Melhora cardiovascular", "Queima calórica", "Resistência"],
    variations: ["Diferentes intensidades", "Intervalos"],
    tips: ["Ritmo constante", "Respiração controlada", "Hidratação"],
    commonMistakes: ["Ritmo inadequado", "Respiração irregular"]
  },

  {
    id: 211,
    name: "Rerum Mobilidade Avançado",
    category: "mobilidade",
    muscleGroup: ["Mobilidade"],
    targetMuscles: ["Múltiplos Grupos Musculares"],
    difficulty: "Intermediário",
    duration: "3 séries × 30s cada movimento",
    sets: "3",
    reps: "30s cada movimento",
    restTime: "30s",
    description: "Exercício para mobilidade com foco em corpo inteiro",
    equipment: "Halteres",
    instructions: [
      "Execute movimentos de mobilidade",
      "Amplitude máxima",
      "Movimentos fluidos",
      "Respeite limites"
    ],
    benefits: ["Melhora mobilidade", "Flexibilidade", "Amplitude articular"],
    variations: ["Diferentes planos", "Dinâmico/estático"],
    tips: ["Não force", "Progressão gradual", "Respiração profunda"],
    commonMistakes: ["Força excessiva", "Movimentos bruscos"]
  },

  {
    id: 212,
    name: "Laboriosam Abdômen com Peso Corporal",
    category: "core",
    muscleGroup: ["Abdominal"],
    targetMuscles: ["Reto Abdominal"],
    difficulty: "Avançado",
    duration: "3 séries × 15-20 reps",
    sets: "3",
    reps: "15-20",
    restTime: "60s",
    description: "Exercício para abdômen com foco em corpo inteiro",
    equipment: "Barra",
    instructions: [
      "Use barra como apoio",
      "Execute movimento abdominal",
      "Mantenha core contraído",
      "Movimento controlado"
    ],
    benefits: ["Fortalece core", "Estabilidade", "Força funcional"],
    variations: ["Diferentes posições", "Com instabilidade"],
    tips: ["Core sempre ativo", "Não force pescoço", "Respiração coordenada"],
    commonMistakes: ["Usar pescoço", "Movimento muito rápido"]
  },

  // Adicionando mais exercícios representativos...
  {
    id: 213,
    name: "Consectetur Peitoral com Halteres",
    category: "forca",
    muscleGroup: ["Peitoral Superior"],
    targetMuscles: ["Peitoral Superior"],
    difficulty: "Intermediário",
    duration: "3 séries × 10-12 reps",
    sets: "3",
    reps: "10-12",
    restTime: "90s",
    description: "Exercício para peitoral superior com foco em membros superiores",
    equipment: "Halteres",
    instructions: [
      "Posicione halteres adequadamente",
      "Execute movimento inclinado",
      "Foque no peitoral superior",
      "Amplitude completa"
    ],
    benefits: ["Desenvolve peitoral superior", "Força específica", "Definição"],
    variations: ["Diferentes inclinações", "Pegadas variadas"],
    tips: ["Mantenha escápulas retraídas", "Movimento controlado", "Respiração adequada"],
    commonMistakes: ["Inclinação inadequada", "Movimento parcial"]
  },

  {
    id: 214,
    name: "Est Bíceps na Máquina",
    category: "forca",
    muscleGroup: ["Bíceps"],
    targetMuscles: ["Bíceps Braquial"],
    difficulty: "Iniciante",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Exercício para bíceps com foco em membros superiores",
    equipment: "Peso Corporal",
    instructions: [
      "Configure equipamento",
      "Execute flexão de cotovelos",
      "Isole bíceps",
      "Movimento fluido"
    ],
    benefits: ["Desenvolve bíceps", "Isolamento muscular", "Controle de carga"],
    variations: ["Diferentes pegadas", "Velocidades variadas"],
    tips: ["Cotovelos fixos", "Amplitude completa", "Contração no topo"],
    commonMistakes: ["Balanço do corpo", "Movimento dos cotovelos"]
  },

  {
    id: 215,
    name: "Voluptatibus Quadríceps",
    category: "forca",
    muscleGroup: ["Quadríceps"],
    targetMuscles: ["Quadríceps"],
    difficulty: "Iniciante",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Exercício para quadríceps com foco em membros inferiores",
    equipment: "Barra",
    instructions: [
      "Configure barra adequadamente",
      "Execute extensão de joelhos",
      "Foque nos quadríceps",
      "Movimento controlado"
    ],
    benefits: ["Desenvolve quadríceps", "Força das pernas", "Funcionalidade"],
    variations: ["Unilateral", "Diferentes posições"],
    tips: ["Não trave joelhos", "Amplitude adequada", "Controle excêntrico"],
    commonMistakes: ["Extensão com travamento", "Compensação com quadril"]
  }
];

// Função para obter exercícios por categoria dos novos exercícios
export const getNewExercisesByCategory = (category: string) => {
  return newExerciseDatabase.filter(exercise => exercise.category === category);
};

// Função para obter exercícios por grupo muscular dos novos exercícios
export const getNewExercisesByMuscleGroup = (muscleGroup: string) => {
  return newExerciseDatabase.filter(exercise => 
    exercise.muscleGroup.some(muscle => 
      muscle.toLowerCase().includes(muscleGroup.toLowerCase())
    )
  );
};

// Estatísticas dos novos exercícios
export const getNewExerciseStats = () => {
  const total = newExerciseDatabase.length;
  const byCategory = {
    'forca': getNewExercisesByCategory('forca').length,
    'peso-corporal': getNewExercisesByCategory('peso-corporal').length,
    'cardio': getNewExercisesByCategory('cardio').length,
    'core': getNewExercisesByCategory('core').length,
    'mobilidade': getNewExercisesByCategory('mobilidade').length,
    'funcional': getNewExercisesByCategory('funcional').length
  };

  const byMuscleGroup = {
    'Membros Superiores': newExerciseDatabase.filter(ex => 
      ex.muscleGroup.some(muscle => 
        ['Peitoral', 'Tríceps', 'Bíceps', 'Deltoides', 'Trapézio', 'Antebraço', 'Dorsal'].includes(muscle)
      )
    ).length,
    'Membros Inferiores': newExerciseDatabase.filter(ex => 
      ex.muscleGroup.some(muscle => 
        ['Glúteos', 'Quadríceps', 'Isquiotibiais', 'Panturrilha', 'Adutores', 'Abdutores'].includes(muscle)
      )
    ).length,
    'Corpo Inteiro': getNewExercisesByMuscleGroup('Corpo Inteiro').length
  };

  return { total, byCategory, byMuscleGroup };
};
