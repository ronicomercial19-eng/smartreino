
import { Exercise } from './expandedExerciseDatabase';

// Exercícios adicionais baseados na solicitação do usuário
export const userExerciseDatabase: Exercise[] = [
  // ===== EXERCÍCIOS DE CORPO INTEIRO =====
  {
    id: 500,
    name: "Burpees",
    category: "funcional",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Múltiplos Grupos Musculares"],
    difficulty: "Intermediário",
    duration: "3 séries × 8-12 reps",
    sets: "3",
    reps: "8-12",
    restTime: "90s",
    description: "Exercício funcional de corpo inteiro",
    equipment: "Peso Corporal",
    instructions: [
      "Agache e coloque as mãos no chão",
      "Jogue as pernas para trás em prancha",
      "Faça uma flexão",
      "Puxe pernas de volta e salte"
    ],
    benefits: ["Exercício completo", "Alta queima calórica", "Melhora condicionamento"],
    variations: ["Burpee sem flexão", "Burpee com salto alto"],
    tips: ["Mantenha ritmo constante", "Foque na técnica", "Respire adequadamente"],
    commonMistakes: ["Muito rápido sem técnica", "Pular a flexão"]
  },
  {
    id: 501,
    name: "Thruster",
    category: "funcional",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Quadríceps", "Deltoides", "Core"],
    difficulty: "Avançado",
    duration: "3 séries × 6-10 reps",
    sets: "3",
    reps: "6-10",
    restTime: "120s",
    description: "Combinação de agachamento e desenvolvimento",
    equipment: "Halteres",
    instructions: [
      "Agache com halteres nos ombros",
      "Suba explosivamente",
      "Continue o movimento elevando os pesos",
      "Desça controladamente"
    ],
    benefits: ["Desenvolve potência", "Trabalho completo", "Força funcional"],
    variations: ["Com barra", "Com kettlebell"],
    tips: ["Movimento fluido", "Explosão na subida", "Core sempre ativo"],
    commonMistakes: ["Pausar entre movimentos", "Peso excessivo"]
  },
  {
    id: 502,
    name: "Clean and Press",
    category: "olimpico",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Múltiplos Grupos Musculares"],
    difficulty: "Avançado",
    duration: "4 séries × 3-5 reps",
    sets: "4",
    reps: "3-5",
    restTime: "180s",
    description: "Movimento olímpico completo",
    equipment: "Barra",
    instructions: [
      "Levante a barra até os ombros",
      "Estabilize na posição rack",
      "Empurre a barra acima da cabeça",
      "Desça controladamente"
    ],
    benefits: ["Máxima potência", "Coordenação total", "Força olímpica"],
    variations: ["Clean and Push Press", "Clean and Jerk"],
    tips: ["Técnica é fundamental", "Aquecimento extenso", "Progressão gradual"],
    commonMistakes: ["Técnica inadequada", "Pressa na execução"]
  },
  {
    id: 503,
    name: "Snatch",
    category: "olimpico",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Múltiplos Grupos Musculares"],
    difficulty: "Avançado",
    duration: "4 séries × 2-4 reps",
    sets: "4",
    reps: "2-4",
    restTime: "180s",
    description: "Exercício olímpico com coordenação total",
    equipment: "Barra",
    instructions: [
      "Pegada larga na barra",
      "Puxada explosiva do chão",
      "Recepção em agachamento",
      "Estabilize acima da cabeça"
    ],
    benefits: ["Máxima explosão", "Coordenação complexa", "Mobilidade total"],
    variations: ["Power Snatch", "Hang Snatch"],
    tips: ["Mobilidade é essencial", "Aprenda progressivamente", "Técnica perfeita"],
    commonMistakes: ["Falta de mobilidade", "Pegada inadequada"]
  },
  {
    id: 504,
    name: "Kettlebell Swing",
    category: "funcional",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Glúteos", "Isquiotibiais", "Core"],
    difficulty: "Intermediário",
    duration: "3 séries × 15-20 reps",
    sets: "3",
    reps: "15-20",
    restTime: "60s",
    description: "Movimento balístico para potência de corpo inteiro",
    equipment: "Kettlebell",
    instructions: [
      "Pés na largura dos ombros",
      "Kettlebell entre as pernas",
      "Movimento explosivo do quadril",
      "Kettlebell sobe até altura do peito"
    ],
    benefits: ["Força explosiva", "Queima calórica alta", "Fortalece posterior"],
    variations: ["Swing americano", "Swing com uma mão"],
    tips: ["Movimento vem do quadril", "Não é agachamento", "Glúteos contraídos"],
    commonMistakes: ["Usar braços demais", "Arco nas costas"]
  },
  {
    id: 505,
    name: "Man Maker",
    category: "funcional",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Múltiplos Grupos Musculares"],
    difficulty: "Avançado",
    duration: "3 séries × 5-8 reps",
    sets: "3",
    reps: "5-8",
    restTime: "120s",
    description: "Sequência intensa com halteres para corpo inteiro",
    equipment: "Halteres",
    instructions: [
      "Flexão com halteres",
      "Remada alternada",
      "Burpee com halteres",
      "Desenvolvimento"
    ],
    benefits: ["Exercício completo", "Alta intensidade", "Força e resistência"],
    variations: ["Man Maker simplificado", "Com kettlebells"],
    tips: ["Mantenha forma", "Respire entre movimentos", "Peso adequado"],
    commonMistakes: ["Peso excessivo", "Perda da técnica"]
  },
  {
    id: 506,
    name: "Mountain Climber",
    category: "cardio",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Core", "Ombros", "Cardio"],
    difficulty: "Intermediário",
    duration: "3 séries × 30-45s",
    sets: "3",
    reps: "30-45s",
    restTime: "60s",
    description: "Movimento contínuo para resistência e core",
    equipment: "Peso Corporal",
    instructions: [
      "Posição de prancha alta",
      "Traga um joelho ao peito",
      "Alterne rapidamente as pernas",
      "Mantenha core estável"
    ],
    benefits: ["Queima muitas calorias", "Fortalece core", "Melhora resistência"],
    variations: ["Mountain climber lento", "Mountain climber cruzado"],
    tips: ["Ritmo constante", "Core contraído", "Não balance quadris"],
    commonMistakes: ["Quadris muito altos", "Muito rápido"]
  },
  {
    id: 507,
    name: "Devil Press",
    category: "funcional",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Múltiplos Grupos Musculares"],
    difficulty: "Avançado",
    duration: "3 séries × 6-10 reps",
    sets: "3",
    reps: "6-10",
    restTime: "120s",
    description: "Combina burpee, swing e desenvolvimento com halteres",
    equipment: "Halteres",
    instructions: [
      "Burpee com halteres no chão",
      "Levante os halteres",
      "Swing até os ombros",
      "Desenvolvimento acima da cabeça"
    ],
    benefits: ["Exercício extremo", "Força e resistência", "Queima máxima"],
    variations: ["Devil Press com pause", "Com kettlebells"],
    tips: ["Técnica sempre primeiro", "Respire adequadamente", "Peso moderado"],
    commonMistakes: ["Peso muito pesado", "Técnica inadequada"]
  },
  {
    id: 508,
    name: "Clean com Kettlebell",
    category: "olimpico",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Múltiplos Grupos Musculares"],
    difficulty: "Avançado",
    duration: "3 séries × 5-8 reps cada lado",
    sets: "3",
    reps: "5-8 cada lado",
    restTime: "90s",
    description: "Explosão e técnica com foco total",
    equipment: "Kettlebell",
    instructions: [
      "Kettlebell entre as pernas",
      "Puxada explosiva",
      "Recepção no ombro",
      "Estabilize e repita"
    ],
    benefits: ["Potência unilateral", "Coordenação", "Estabilidade"],
    variations: ["Hang Clean", "Double Clean"],
    tips: ["Recepção suave", "Cotovelo para baixo", "Core ativo"],
    commonMistakes: ["Recepção dura", "Falta de técnica"]
  },
  {
    id: 509,
    name: "Snatch com Kettlebell",
    category: "olimpico",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Múltiplos Grupos Musculares"],
    difficulty: "Avançado",
    duration: "3 séries × 4-6 reps cada lado",
    sets: "3",
    reps: "4-6 cada lado",
    restTime: "120s",
    description: "Movimento olímpico unilateral e funcional",
    equipment: "Kettlebell",
    instructions: [
      "Swing alto com uma mão",
      "Punho atravessa por baixo",
      "Recepção acima da cabeça",
      "Estabilize e desça"
    ],
    benefits: ["Máxima potência", "Mobilidade ombro", "Coordenação total"],
    variations: ["Hang Snatch", "Power Snatch"],
    tips: ["Timing é crucial", "Mobilidade essencial", "Progressão lenta"],
    commonMistakes: ["Falta de timing", "Mobilidade inadequada"]
  },
  {
    id: 510,
    name: "Slam Ball",
    category: "pliometrico",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Core", "Ombros", "Pernas"],
    difficulty: "Intermediário",
    duration: "3 séries × 10-15 reps",
    sets: "3",
    reps: "10-15",
    restTime: "75s",
    description: "Arremesso de bola no chão para potência",
    equipment: "Medicine Ball",
    instructions: [
      "Eleve a bola acima da cabeça",
      "Arremesse com força no chão",
      "Agache para pegar",
      "Repita o movimento"
    ],
    benefits: ["Potência explosiva", "Descarrega tensão", "Core forte"],
    variations: ["Slam lateral", "Slam com agachamento"],
    tips: ["Use corpo todo", "Força máxima", "Arremesso seguro"],
    commonMistakes: ["Só usar braços", "Postura inadequada"]
  },
  {
    id: 511,
    name: "Clean and Jerk",
    category: "olimpico",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Múltiplos Grupos Musculares"],
    difficulty: "Avançado",
    duration: "4 séries × 2-4 reps",
    sets: "4",
    reps: "2-4",
    restTime: "180s",
    description: "Movimento de levantamento olímpico em dois tempos",
    equipment: "Barra",
    instructions: [
      "Clean até os ombros",
      "Estabilize na posição",
      "Jerk acima da cabeça",
      "Estabilize e desça"
    ],
    benefits: ["Máxima potência", "Técnica olímpica", "Força total"],
    variations: ["Split Jerk", "Push Jerk"],
    tips: ["Dois movimentos distintos", "Pausa entre eles", "Técnica perfeita"],
    commonMistakes: ["Juntar os movimentos", "Técnica inadequada"]
  },
  {
    id: 512,
    name: "Corda Naval",
    category: "cardio",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Ombros", "Core", "Cardio"],
    difficulty: "Intermediário",
    duration: "3 séries × 30-45s",
    sets: "3",
    reps: "30-45s",
    restTime: "60s",
    description: "Resistência metabólica e potência muscular",
    equipment: "Corda Naval",
    instructions: [
      "Segure as pontas da corda",
      "Movimentos alternados ou simultâneos",
      "Mantenha core ativo",
      "Intensidade constante"
    ],
    benefits: ["Resistência metabólica", "Força explosiva", "Queima intensa"],
    variations: ["Ondas alternadas", "Ondas simultâneas", "Spirals"],
    tips: ["Postura ereta", "Core contraído", "Respiração controlada"],
    commonMistakes: ["Postura inadequada", "Perda de intensidade"]
  },
  {
    id: 513,
    name: "Wall Ball",
    category: "funcional",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Quadríceps", "Ombros", "Core"],
    difficulty: "Intermediário",
    duration: "3 séries × 12-20 reps",
    sets: "3",
    reps: "12-20",
    restTime: "60s",
    description: "Agachamento seguido de arremesso contra parede",
    equipment: "Medicine Ball",
    instructions: [
      "Agache com bola no peito",
      "Suba explosivamente",
      "Arremesse a bola na parede",
      "Receba e repita"
    ],
    benefits: ["Potência de pernas", "Coordenação", "Resistência"],
    variations: ["Diferentes alturas", "Wall Ball com passada"],
    tips: ["Agachamento completo", "Arremesso explosivo", "Recepção suave"],
    commonMistakes: ["Agachamento parcial", "Arremesso fraco"]
  },
  {
    id: 514,
    name: "Mountain Climbers com Slider",
    category: "core",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Core", "Ombros"],
    difficulty: "Intermediário",
    duration: "3 séries × 30-40s",
    sets: "3",
    reps: "30-40s",
    restTime: "60s",
    description: "Variação de escalada com menor atrito para abdômen e pernas",
    equipment: "Discos Deslizantes",
    instructions: [
      "Prancha com pés nos sliders",
      "Traga joelhos alternadamente",
      "Movimento controlado",
      "Core sempre ativo"
    ],
    benefits: ["Core intenso", "Estabilidade", "Controle motor"],
    variations: ["Ambas pernas juntas", "Movimento lateral"],
    tips: ["Movimento controlado", "Core contraído", "Não balance quadris"],
    commonMistakes: ["Movimento descontrolado", "Perda da postura"]
  },
  {
    id: 515,
    name: "Bear Crawl",
    category: "funcional",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Core", "Ombros", "Quadríceps"],
    difficulty: "Intermediário",
    duration: "3 séries × 30-45s",
    sets: "3",
    reps: "30-45s",
    restTime: "60s",
    description: "Deslocamento funcional com ativação completa",
    equipment: "Peso Corporal",
    instructions: [
      "Posição quadrúpede",
      "Joelhos ligeiramente elevados",
      "Deslocamento alternado",
      "Mantenha core rígido"
    ],
    benefits: ["Estabilidade total", "Coordenação", "Força funcional"],
    variations: ["Bear crawl reverso", "Bear crawl lateral"],
    tips: ["Joelhos baixos", "Core rígido", "Movimento controlado"],
    commonMistakes: ["Joelhos muito altos", "Movimento descontrolado"]
  },
  {
    id: 516,
    name: "Farmer Carry",
    category: "funcional",
    muscleGroup: ["Corpo Inteiro"],
    targetMuscles: ["Trapézio", "Core", "Antebraços"],
    difficulty: "Intermediário",
    duration: "3 séries × 30-60s",
    sets: "3",
    reps: "30-60s",
    restTime: "90s",
    description: "Deslocamento com carga para força e resistência",
    equipment: "Halteres",
    instructions: [
      "Halteres nas mãos",
      "Postura ereta",
      "Caminhada controlada",
      "Core sempre ativo"
    ],
    benefits: ["Força de pegada", "Core estável", "Força funcional"],
    variations: ["Farmer carry unilateral", "Com kettlebells"],
    tips: ["Postura sempre ereta", "Pegada firme", "Passos controlados"],
    commonMistakes: ["Postura inadequada", "Perda da pegada"]
  }
];

// Função para obter exercícios do usuário por categoria
export const getUserExercisesByCategory = (category: string) => {
  return userExerciseDatabase.filter(exercise => exercise.category === category);
};

// Função para obter exercícios do usuário por grupo muscular
export const getUserExercisesByMuscleGroup = (muscleGroup: string) => {
  return userExerciseDatabase.filter(exercise => 
    exercise.muscleGroup.some(muscle => 
      muscle.toLowerCase().includes(muscleGroup.toLowerCase())
    )
  );
};

// Estatísticas dos exercícios do usuário
export const getUserExerciseStats = () => {
  const total = userExerciseDatabase.length;
  
  const byMuscleGroup = {
    'Corpo Inteiro': userExerciseDatabase.filter(ex => 
      ex.muscleGroup.some(muscle => muscle.includes('Corpo Inteiro'))
    ).length,
    'Membros Superiores': userExerciseDatabase.filter(ex => 
      ex.muscleGroup.some(muscle => 
        ['Peitoral', 'Tríceps', 'Bíceps', 'Deltoides', 'Trapézio', 'Dorsais', 'Antebraço'].some(upper =>
          muscle.includes(upper)
        )
      )
    ).length,
    'Membros Inferiores': userExerciseDatabase.filter(ex => 
      ex.muscleGroup.some(muscle => 
        ['Glúteos', 'Quadríceps', 'Isquiotibiais', 'Panturrilha', 'Adutores', 'Abdutores'].some(lower =>
          muscle.includes(lower)
        )
      )
    ).length
  };

  const byDifficulty = {
    'Iniciante': userExerciseDatabase.filter(ex => ex.difficulty === 'Iniciante').length,
    'Intermediário': userExerciseDatabase.filter(ex => ex.difficulty === 'Intermediário').length,
    'Avançado': userExerciseDatabase.filter(ex => ex.difficulty === 'Avançado').length
  };

  const byCategory = {
    'Funcional': userExerciseDatabase.filter(ex => ex.category === 'funcional').length,
    'Olímpico': userExerciseDatabase.filter(ex => ex.category === 'olimpico').length,
    'Pliométrico': userExerciseDatabase.filter(ex => ex.category === 'pliometrico').length,
    'Cardio': userExerciseDatabase.filter(ex => ex.category === 'cardio').length,
    'Core': userExerciseDatabase.filter(ex => ex.category === 'core').length
  };

  return { total, byMuscleGroup, byDifficulty, byCategory };
};
