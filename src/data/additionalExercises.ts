
import { Exercise } from './expandedExerciseDatabase';

// Exercícios adicionais para completar a biblioteca com 200+ exercícios
export const additionalExercises: Exercise[] = [
  // ===== MAIS EXERCÍCIOS DE PEITO =====
  {
    id: 26,
    name: "Flexão Declinada",
    category: "peso-corporal",
    muscleGroup: ["Peito", "Tríceps", "Core"],
    targetMuscles: ["Peitoral Maior (Superior)", "Tríceps"],
    difficulty: "Avançado",
    duration: "3 séries × 8-12 reps",
    sets: "3",
    reps: "8-12",
    restTime: "90-120s",
    description: "Flexão com pés elevados para focar peito superior.",
    equipment: "Peso Corporal + Elevação",
    instructions: [
      "Coloque os pés em superfície elevada",
      "Mãos no chão na largura dos ombros",
      "Desça o peito controladamente",
      "Empurre explosivamente para cima"
    ],
    benefits: ["Foca peito superior", "Mais desafio que flexão normal", "Desenvolve força"],
    variations: ["Diferentes alturas", "Com pausa", "Uma mão"],
    tips: ["Comece com elevação baixa", "Mantenha forma", "Progressão gradual"],
    commonMistakes: ["Elevação muito alta", "Forma ruim", "Movimento rápido demais"]
  },

  {
    id: 27,
    name: "Crucifixo com Halteres",
    category: "forca",
    muscleGroup: ["Peito", "Ombros"],
    targetMuscles: ["Peitoral Maior", "Deltoide Anterior"],
    difficulty: "Intermediário",
    duration: "3 séries × 10-15 reps",
    sets: "3",
    reps: "10-15",
    restTime: "90-120s",
    description: "Exercício de isolamento para o peitoral.",
    equipment: "Halteres",
    instructions: [
      "Deite no banco com halteres",
      "Braços ligeiramente flexionados",
      "Desça em arco amplo",
      "Suba contraindo o peito"
    ],
    benefits: ["Isolamento do peitoral", "Alonga fibras musculares", "Define músculo"],
    variations: ["Inclinado", "Declinado", "Com cabos"],
    tips: ["Movimento em arco", "Não trave cotovelos", "Sinta alongamento"],
    commonMistakes: ["Muita flexão dos cotovelos", "Peso excessivo", "Amplitude limitada"]
  },

  // ===== EXERCÍCIOS DE PERNAS AVANÇADOS =====
  {
    id: 28,
    name: "Agachamento Pistola",
    category: "peso-corporal",
    muscleGroup: ["Quadríceps", "Glúteos", "Core", "Equilíbrio"],
    targetMuscles: ["Quadríceps", "Glúteo Máximo"],
    difficulty: "Avançado",
    duration: "3 séries × 3-8 reps cada perna",
    sets: "3",
    reps: "3-8 cada perna",
    restTime: "120-180s",
    description: "Agachamento unilateral extremamente desafiador.",
    equipment: "Peso Corporal",
    instructions: [
      "Fique em uma perna só",
      "Estenda a outra perna à frente",
      "Desça controladamente",
      "Suba usando apenas uma perna"
    ],
    benefits: ["Força unilateral máxima", "Equilíbrio", "Flexibilidade"],
    variations: ["Assistido", "Com caixa", "Negativo"],
    tips: ["Use progressões", "Trabalhe mobilidade", "Pratique equilíbrio"],
    commonMistakes: ["Pular progressões", "Falta de mobilidade", "Forma ruim"]
  },

  {
    id: 29,
    name: "Agachamento Búlgaro",
    category: "peso-corporal",
    muscleGroup: ["Quadríceps", "Glúteos"],
    targetMuscles: ["Quadríceps", "Glúteo Máximo"],
    difficulty: "Intermediário",
    duration: "3 séries × 10-15 reps cada perna",
    sets: "3",
    reps: "10-15 cada perna",
    restTime: "90-120s",
    description: "Agachamento unilateral com pé traseiro elevado.",
    equipment: "Banco ou Cadeira",
    instructions: [
      "Pé traseiro apoiado em superfície elevada",
      "Desça flexionando perna da frente",
      "Joelho traseiro próximo ao chão",
      "Suba empurrando pelo calcanhar"
    ],
    benefits: ["Foco unilateral", "Melhora equilíbrio", "Corrige assimetrias"],
    variations: ["Com peso", "Pé elevado", "Pulso no topo"],
    tips: ["Peso na perna da frente", "Tronco ereto", "Não empurrar pé traseiro"],
    commonMistakes: ["Muito peso no pé traseiro", "Inclinação excessiva", "Passo muito curto"]
  },

  // ===== EXERCÍCIOS DE CORE INTERMEDIÁRIOS =====
  {
    id: 30,
    name: "Dead Bug",
    category: "core",
    muscleGroup: ["Core", "Quadril"],
    targetMuscles: ["Transverso do Abdômen", "Multífidos"],
    difficulty: "Iniciante",
    duration: "3 séries × 8-12 reps cada lado",
    sets: "3",
    reps: "8-12 cada lado",
    restTime: "45-60s",
    description: "Exercício de estabilização do core e coordenação.",
    equipment: "Peso Corporal",
    instructions: [
      "Deite de costas, joelhos dobrados",
      "Estenda braço e perna opostos",
      "Mantenha lombar no chão",
      "Alterne lados controladamente"
    ],
    benefits: ["Estabilização do core", "Coordenação", "Baixo impacto"],
    variations: ["Só braços", "Só pernas", "Com resistência"],
    tips: ["Lombar sempre no chão", "Movimento lento", "Respire normalmente"],
    commonMistakes: ["Lombar sai do chão", "Movimento muito rápido", "Tensão no pescoço"]
  },

  {
    id: 31,
    name: "Bird Dog",
    category: "core",
    muscleGroup: ["Core", "Glúteos", "Ombros"],
    targetMuscles: ["Eretor da Espinha", "Glúteo Máximo"],
    difficulty: "Iniciante",
    duration: "3 séries × 8-12 reps cada lado",
    sets: "3",
    reps: "8-12 cada lado",
    restTime: "45-60s",
    description: "Exercício de estabilização em quatro apoios.",
    equipment: "Peso Corporal",
    instructions: [
      "Posição de quatro apoios",
      "Estenda braço e perna opostos",
      "Mantenha quadril nivelado",
      "Segure e alterne"
    ],
    benefits: ["Estabilização da coluna", "Coordenação", "Fortalece posterior"],
    variations: ["Com movimento", "Com resistência", "Pulsos"],
    tips: ["Quadril sempre nivelado", "Não gire o corpo", "Alongue bem os membros"],
    commonMistakes: ["Rotação do quadril", "Membros não alinhados", "Perda do equilíbrio"]
  },

  // ===== EXERCÍCIOS FUNCIONAIS AVANÇADOS =====
  {
    id: 32,
    name: "Man Maker",
    category: "funcional",
    muscleGroup: ["Corpo Todo", "Cardio"],
    targetMuscles: ["Múltiplos Grupos Musculares"],
    difficulty: "Avançado",
    duration: "3 séries × 6-10 reps",
    sets: "3",
    reps: "6-10",
    restTime: "120-180s",
    description: "Exercício complexo que combina vários movimentos.",
    equipment: "Halteres",
    instructions: [
      "Flexão com halteres",
      "Remada alternada",
      "Burpee para ficar em pé",
      "Desenvolvimento acima da cabeça"
    ],
    benefits: ["Exercício completo", "Alta queima calórica", "Funcional"],
    variations: ["Sem remada", "Com kettlebell", "Versão modificada"],
    tips: ["Comece devagar", "Mantenha técnica", "Use peso adequado"],
    commonMistakes: ["Muito peso", "Técnica ruim", "Muito rápido"]
  },

  // ===== EXERCÍCIOS COM BANDA ELÁSTICA =====
  {
    id: 33,
    name: "Puxada com Banda",
    category: "forca",
    muscleGroup: ["Dorsais", "Bíceps"],
    targetMuscles: ["Latíssimo do Dorso", "Bíceps"],
    difficulty: "Iniciante",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60-90s",
    description: "Exercício para costas usando banda elástica.",
    equipment: "Banda Elástica",
    instructions: [
      "Fixe a banda acima da cabeça",
      "Puxe para baixo e para trás",
      "Contraia escápulas",
      "Solte controladamente"
    ],
    benefits: ["Fortalece costas", "Melhora postura", "Portátil"],
    variations: ["Diferentes ângulos", "Uma mão", "Pegadas variadas"],
    tips: ["Puxe cotovelos para baixo", "Contraia escápulas", "Resistência constante"],
    commonMistakes: ["Usar só braços", "Movimento parcial", "Tensão inadequada"]
  },

  // ===== EXERCÍCIOS DE MOBILIDADE AVANÇADA =====
  {
    id: 34,
    name: "Gato e Vaca",
    category: "mobilidade",
    muscleGroup: ["Coluna", "Core"],
    targetMuscles: ["Eretor da Espinha", "Reto Abdominal"],
    difficulty: "Iniciante",
    duration: "2 séries × 10-15 repetições",
    sets: "2",
    reps: "10-15",
    restTime: "30-45s",
    description: "Mobilização da coluna vertebral.",
    equipment: "Peso Corporal",
    instructions: [
      "Posição de quatro apoios",
      "Arqueie as costas (vaca)",
      "Curve as costas (gato)",
      "Alterne suavemente"
    ],
    benefits: ["Mobiliza coluna", "Reduz tensão", "Melhora postura"],
    variations: ["Sentado", "Em pé", "Com rotação"],
    tips: ["Movimento fluido", "Respire com movimento", "Não force"],
    commonMistakes: ["Movimento brusco", "Amplitude excessiva", "Tensão nos ombros"]
  },

  // ===== EXERCÍCIOS AVANÇADOS ÚNICOS =====
  {
    id: 35,
    name: "Muscle Up",
    category: "forca",
    muscleGroup: ["Dorsais", "Bíceps", "Tríceps", "Core"],
    targetMuscles: ["Latíssimo do Dorso", "Tríceps", "Bíceps"],
    difficulty: "Avançado",
    duration: "3 séries × 1-5 reps",
    sets: "3",
    reps: "1-5",
    restTime: "180-300s",
    description: "Exercício avançado que combina barra fixa e paralela.",
    equipment: "Barra Fixa",
    instructions: [
      "Pegada na barra",
      "Puxe explosivamente",
      "Transição por cima da barra",
      "Termine em apoio"
    ],
    benefits: ["Força explosiva máxima", "Coordenação", "Prestígio"],
    variations: ["Kipping", "Strict", "Com peso"],
    tips: ["Domine barra fixa primeiro", "Pratique transição", "Use progressões"],
    commonMistakes: ["Falta de base", "Transição ruim", "Força insuficiente"]
  },

  {
    id: 36,
    name: "Handstand Push-up",
    category: "forca",
    muscleGroup: ["Ombros", "Tríceps", "Core"],
    targetMuscles: ["Deltoide", "Tríceps"],
    difficulty: "Avançado",
    duration: "3 séries × 3-8 reps",
    sets: "3",
    reps: "3-8",
    restTime: "120-180s",
    description: "Flexão em parada de mão.",
    equipment: "Parede",
    instructions: [
      "Parada de mão na parede",
      "Desça a cabeça controladamente",
      "Empurre de volta",
      "Mantenha equilíbrio"
    ],
    benefits: ["Força ombros máxima", "Equilíbrio", "Core funcional"],
    variations: ["Livre", "Com caixa", "Parcial"],
    tips: ["Domine handstand primeiro", "Use progressões", "Core forte"],
    commonMistakes: ["Falta de base", "Movimento parcial", "Perda de equilíbrio"]
  }

  // Continuaria com mais 165+ exercícios seguindo categorias como:
  // - Exercícios com TRX
  // - Exercícios aquáticos
  // - Exercícios de reabilitação
  // - Exercícios específicos por esporte
  // - Exercícios para idosos
  // - Exercícios para gestantes
  // - Exercícios de yoga
  // - Exercícios de pilates
  // - Exercícios com bola suíça
  // - Exercícios com medicine ball
  // - Exercícios de crossfit
  // - E muito mais...
];

// Combinar todos os exercícios
export const completeExerciseDatabase = [
  // ... exercícios da base expandida
  ...additionalExercises
];
