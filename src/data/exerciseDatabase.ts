
export interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroup: string[];
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: string;
  description: string;
  equipment: string;
  instructions: string[];
  benefits: string[];
  video?: string;
  image?: string;
  variations?: string[];
  tips: string[];
}

export const exerciseDatabase: Exercise[] = [
  // PESO CORPORAL - PEITO
  {
    id: 1,
    name: "Flexão de Braço Tradicional",
    category: "peso-corporal",
    muscleGroup: ["Peito", "Tríceps", "Core"],
    difficulty: "Intermediário",
    duration: "3 séries × 10-15 reps",
    description: "Exercício fundamental para desenvolver força do tronco superior.",
    equipment: "Peso Corporal",
    instructions: [
      "Posicione-se em prancha com as mãos na largura dos ombros",
      "Mantenha o corpo alinhado da cabeça aos pés",
      "Desça o peito até quase tocar o chão",
      "Empurre o corpo de volta à posição inicial"
    ],
    benefits: ["Fortalece peito, tríceps e core", "Melhora estabilidade", "Não requer equipamentos"],
    variations: ["Flexão inclinada", "Flexão declinada", "Flexão diamante"],
    tips: ["Mantenha o core contraído", "Não deixe os quadris caírem", "Respire corretamente"]
  },
  {
    id: 2,
    name: "Flexão Diamante",
    category: "peso-corporal",
    muscleGroup: ["Tríceps", "Peito", "Core"],
    difficulty: "Avançado",
    duration: "3 séries × 8-12 reps",
    description: "Variação da flexão focada no desenvolvimento dos tríceps.",
    equipment: "Peso Corporal",
    instructions: [
      "Posicione as mãos em formato de diamante",
      "Mantenha os cotovelos próximos ao corpo",
      "Desça controladamente",
      "Empurre com força para cima"
    ],
    benefits: ["Foco intenso nos tríceps", "Fortalece core", "Melhora força funcional"],
    variations: ["Diamante inclinada", "Diamante com pausa"],
    tips: ["Mantenha cotovelos próximos", "Controle a descida", "Foque na contração dos tríceps"]
  },
  {
    id: 3,
    name: "Flexão Arqueiro",
    category: "peso-corporal",
    muscleGroup: ["Peito", "Tríceps", "Core", "Ombros"],
    difficulty: "Avançado",
    duration: "3 séries × 5-8 reps cada lado",
    description: "Flexão unilateral que desenvolve força assimétrica.",
    equipment: "Peso Corporal",
    instructions: [
      "Posição de flexão com braços bem abertos",
      "Desça focando o peso em um braço",
      "O outro braço fica quase reto",
      "Alterne os lados"
    ],
    benefits: ["Força unilateral", "Melhora desequilíbrios", "Desafio progressivo"],
    variations: ["Arqueiro assistida", "Arqueiro elevada"],
    tips: ["Comece devagar", "Foque na técnica", "Fortaleça cada lado igualmente"]
  },

  // PESO CORPORAL - PERNAS
  {
    id: 4,
    name: "Agachamento Livre",
    category: "peso-corporal",
    muscleGroup: ["Quadríceps", "Glúteos", "Core"],
    difficulty: "Iniciante",
    duration: "3 séries × 15-20 reps",
    description: "Movimento fundamental para membros inferiores.",
    equipment: "Peso Corporal",
    instructions: [
      "Pés na largura dos ombros",
      "Desça como se fosse sentar",
      "Joelhos alinhados com os pés",
      "Suba empurrando pelos calcanhares"
    ],
    benefits: ["Fortalece pernas e glúteos", "Melhora mobilidade", "Base para outros exercícios"],
    variations: ["Agachamento sumo", "Agachamento búlgaro", "Agachamento pistola"],
    tips: ["Mantenha o peito erguido", "Não deixe joelhos caírem para dentro", "Desça até onde conseguir"]
  },
  {
    id: 5,
    name: "Agachamento Pistola",
    category: "peso-corporal",
    muscleGroup: ["Quadríceps", "Glúteos", "Core", "Equilíbrio"],
    difficulty: "Avançado",
    duration: "3 séries × 3-8 reps cada perna",
    description: "Agachamento unilateral que exige força e equilíbrio.",
    equipment: "Peso Corporal",
    instructions: [
      "Fique em uma perna só",
      "Estenda a outra perna à frente",
      "Desça controladamente",
      "Suba usando apenas uma perna"
    ],
    benefits: ["Força unilateral extrema", "Melhora equilíbrio", "Corrige assimetrias"],
    variations: ["Pistola assistida", "Pistola com caixa", "Pistola negativa"],
    tips: ["Use progressões", "Trabalhe mobilidade", "Pratique equilíbrio"]
  },
  {
    id: 6,
    name: "Afundo Alternado",
    category: "peso-corporal",
    muscleGroup: ["Quadríceps", "Glúteos", "Panturrilhas"],
    difficulty: "Intermediário",
    duration: "3 séries × 12-16 reps cada perna",
    description: "Exercício unilateral para desenvolvimento de pernas.",
    equipment: "Peso Corporal",
    instructions: [
      "Dê um passo largo à frente",
      "Desça até o joelho traseiro quase tocar o chão",
      "Suba e alterne as pernas",
      "Mantenha o tronco ereto"
    ],
    benefits: ["Trabalha pernas unilateralmente", "Melhora equilíbrio", "Ativa core"],
    variations: ["Afundo reverso", "Afundo lateral", "Afundo saltado"],
    tips: ["Passos largos", "Mantenha peso no calcanhar da frente", "Core contraído"]
  },

  // PESO CORPORAL - CORE
  {
    id: 7,
    name: "Prancha Tradicional",
    category: "core",
    muscleGroup: ["Core", "Ombros", "Glúteos"],
    difficulty: "Intermediário",
    duration: "3 séries × 30-60s",
    description: "Isometria fundamental para fortalecimento do core.",
    equipment: "Peso Corporal",
    instructions: [
      "Posição de flexão apoiado nos antebraços",
      "Corpo alinhado da cabeça aos pés",
      "Mantenha a posição sem mover",
      "Respire normalmente"
    ],
    benefits: ["Fortalece core profundo", "Melhora postura", "Estabiliza coluna"],
    variations: ["Prancha lateral", "Prancha com elevação", "Prancha dinâmica"],
    tips: ["Não levante os quadris", "Mantenha pescoço neutro", "Contraia glúteos"]
  },
  {
    id: 8,
    name: "Prancha Lateral",
    category: "core",
    muscleGroup: ["Oblíquos", "Core", "Ombros"],
    difficulty: "Intermediário",
    duration: "3 séries × 20-45s cada lado",
    description: "Foca no fortalecimento dos oblíquos e estabilidade lateral.",
    equipment: "Peso Corporal",
    instructions: [
      "Deite de lado apoiado no antebraço",
      "Eleve o quadril formando linha reta",
      "Mantenha a posição",
      "Alterne os lados"
    ],
    benefits: ["Fortalece oblíquos", "Melhora estabilidade lateral", "Corrige desequilíbrios"],
    variations: ["Prancha lateral com rotação", "Prancha lateral elevada"],
    tips: ["Alinhe corpo inteiro", "Não deixe quadril cair", "Olhe para frente"]
  },
  {
    id: 9,
    name: "Mountain Climber",
    category: "cardio",
    muscleGroup: ["Core", "Cardio", "Ombros"],
    difficulty: "Intermediário",
    duration: "3 séries × 30-45s",
    description: "Exercício dinâmico que combina core e cardio.",
    equipment: "Peso Corporal",
    instructions: [
      "Posição de prancha alta",
      "Traga um joelho ao peito",
      "Alterne rapidamente as pernas",
      "Mantenha core estável"
    ],
    benefits: ["Queima muitas calorias", "Fortalece core", "Melhora resistência"],
    variations: ["Mountain climber lento", "Mountain climber cruzado"],
    tips: ["Mantenha ritmo constante", "Core sempre contraído", "Não balance quadris"]
  },

  // CARDIO E HIIT
  {
    id: 10,
    name: "Burpee",
    category: "cardio",
    muscleGroup: ["Corpo Todo", "Cardio"],
    difficulty: "Avançado",
    duration: "3 séries × 8-12 reps",
    description: "Exercício completo que trabalha todo o corpo.",
    equipment: "Peso Corporal",
    instructions: [
      "Agache e coloque as mãos no chão",
      "Jogue as pernas para trás em prancha",
      "Faça uma flexão",
      "Puxe pernas de volta e salte"
    ],
    benefits: ["Exercício completo", "Alta queima calórica", "Melhora condicionamento"],
    variations: ["Burpee sem flexão", "Burpee com salto alto", "Burpee lateral"],
    tips: ["Mantenha ritmo constante", "Foque na técnica", "Respire adequadamente"]
  },
  {
    id: 11,
    name: "Jumping Jacks",
    category: "cardio",
    muscleGroup: ["Cardio", "Panturrilhas", "Ombros"],
    difficulty: "Iniciante",
    duration: "3 séries × 30-60s",
    description: "Exercício cardiovascular simples e efetivo.",
    equipment: "Peso Corporal",
    instructions: [
      "Pés juntos, braços ao lado do corpo",
      "Salte abrindo pernas e erguendo braços",
      "Retorne à posição inicial",
      "Mantenha ritmo constante"
    ],
    benefits: ["Aquece o corpo", "Melhora coordenação", "Ativa sistema cardiovascular"],
    variations: ["Jumping jacks lateral", "Jumping jacks com agachamento"],
    tips: ["Aterrisse suavemente", "Mantenha core ativo", "Controle respiração"]
  },
  {
    id: 12,
    name: "High Knees",
    category: "cardio",
    muscleGroup: ["Cardio", "Core", "Quadríceps"],
    difficulty: "Iniciante",
    duration: "3 séries × 30-45s",
    description: "Corrida no lugar com elevação de joelhos.",
    equipment: "Peso Corporal",
    instructions: [
      "Corra no lugar",
      "Eleve os joelhos até a altura do quadril",
      "Mantenha ritmo acelerado",
      "Balance os braços naturalmente"
    ],
    benefits: ["Melhora coordenação", "Ativa músculos do core", "Aquecimento eficaz"],
    variations: ["High knees lateral", "High knees com pausa"],
    tips: ["Joelhos bem altos", "Aterrisse na ponta dos pés", "Mantenha postura ereta"]
  },

  // EXERCÍCIOS COM PESO/EQUIPAMENTOS
  {
    id: 13,
    name: "Supino com Halteres",
    category: "forca",
    muscleGroup: ["Peito", "Tríceps", "Ombros"],
    difficulty: "Intermediário",
    duration: "3 séries × 8-12 reps",
    description: "Exercício clássico para desenvolvimento do peitoral.",
    equipment: "Halteres",
    instructions: [
      "Deite no banco com halteres nas mãos",
      "Desça os pesos controladamente",
      "Empurre para cima contraindo o peito",
      "Não trave completamente os cotovelos"
    ],
    benefits: ["Desenvolve massa muscular", "Força funcional", "Trabalho unilateral"],
    variations: ["Supino inclinado", "Supino declinado", "Supino com pegada neutra"],
    tips: ["Controle a carga", "Amplitude completa", "Não arqueie demais as costas"]
  },
  {
    id: 14,
    name: "Levantamento Terra",
    category: "forca",
    muscleGroup: ["Posterior", "Glúteos", "Core", "Trapézio"],
    difficulty: "Avançado",
    duration: "3 séries × 5-8 reps",
    description: "Um dos melhores exercícios compostos para força geral.",
    equipment: "Barra e Anilhas",
    instructions: [
      "Pés na largura dos quadris",
      "Agarre a barra com pegada mista",
      "Mantenha costas retas",
      "Levante empurrando o chão com os pés"
    ],
    benefits: ["Desenvolve força total", "Trabalha múltiplos grupos", "Melhora postura"],
    variations: ["Terra romeno", "Terra sumo", "Terra com trap bar"],
    tips: ["Técnica é fundamental", "Comece com peso leve", "Mantenha barra próxima ao corpo"]
  },
  {
    id: 15,
    name: "Agachamento com Barra",
    category: "forca",
    muscleGroup: ["Quadríceps", "Glúteos", "Core"],
    difficulty: "Avançado",
    duration: "3 séries × 6-10 reps",
    description: "Rei dos exercícios para membros inferiores.",
    equipment: "Barra e Rack",
    instructions: [
      "Posicione a barra no trapézio",
      "Pés na largura dos ombros",
      "Desça controladamente",
      "Suba empurrando pelos calcanhares"
    ],
    benefits: ["Máximo desenvolvimento de pernas", "Força funcional", "Queima muitas calorias"],
    variations: ["Agachamento frontal", "Agachamento búlgaro", "Agachamento overhead"],
    tips: ["Aqueça bem antes", "Use cinto se necessário", "Técnica antes da carga"]
  },

  // EXERCÍCIOS DE MOBILIDADE E ALONGAMENTO
  {
    id: 16,
    name: "Alongamento de Quadríceps",
    category: "mobilidade",
    muscleGroup: ["Quadríceps", "Flexores do Quadril"],
    difficulty: "Iniciante",
    duration: "2-3 séries × 30s cada perna",
    description: "Alongamento essencial para flexibilidade das pernas.",
    equipment: "Peso Corporal",
    instructions: [
      "Segure o pé atrás do corpo",
      "Puxe suavemente em direção aos glúteos",
      "Mantenha joelhos próximos",
      "Sinta o alongamento na frente da coxa"
    ],
    benefits: ["Melhora flexibilidade", "Reduz tensão muscular", "Previne lesões"],
    variations: ["Alongamento deitado", "Alongamento dinâmico"],
    tips: ["Não force demais", "Respire durante o alongamento", "Mantenha equilíbrio"]
  },
  {
    id: 17,
    name: "Gato e Vaca",
    category: "mobilidade",
    muscleGroup: ["Coluna", "Core"],
    difficulty: "Iniciante",
    duration: "2 séries × 10-15 repetições",
    description: "Mobilização da coluna vertebral.",
    equipment: "Peso Corporal",
    instructions: [
      "Posição de quatro apoios",
      "Arqueie as costas olhando para cima (vaca)",
      "Curve as costas olhando para baixo (gato)",
      "Alterne suavemente"
    ],
    benefits: ["Mobiliza coluna", "Relaxa tensões", "Melhora postura"],
    variations: ["Gato-vaca em pé", "Com rotação lateral"],
    tips: ["Movimento fluido", "Respire com o movimento", "Não force amplitude"]
  },

  // EXERCÍCIOS AVANÇADOS
  {
    id: 18,
    name: "Muscle Up",
    category: "forca",
    muscleGroup: ["Dorsais", "Bíceps", "Tríceps", "Core"],
    difficulty: "Avançado",
    duration: "3 séries × 1-5 reps",
    description: "Exercício avançado que combina barra fixa e paralelas.",
    equipment: "Barra Fixa",
    instructions: [
      "Pegada na barra mais larga que ombros",
      "Balanço controlado para ganhar impulso",
      "Puxe explosivamente",
      "Transição por cima da barra"
    ],
    benefits: ["Força explosiva", "Coordenação", "Força funcional extrema"],
    variations: ["Muscle up com corda", "Muscle up estrito", "Muscle up com kip"],
    tips: ["Domine barra fixa primeiro", "Pratique transição", "Use progressões"]
  },
  {
    id: 19,
    name: "Handstand Push-up",
    category: "forca",
    muscleGroup: ["Ombros", "Tríceps", "Core"],
    difficulty: "Avançado",
    duration: "3 séries × 3-8 reps",
    description: "Flexão em parada de mão.",
    equipment: "Parede",
    instructions: [
      "Parada de mão contra a parede",
      "Desça a cabeça controladamente",
      "Empurre de volta para cima",
      "Mantenha core contraído"
    ],
    benefits: ["Força de ombros extrema", "Equilíbrio", "Core funcional"],
    variations: ["Com caixa", "Livre", "Com banda elástica"],
    tips: ["Domine parada de mão primeiro", "Use progressões", "Fortaleça ombros"]
  },
  {
    id: 20,
    name: "Dragon Flag",
    category: "core",
    muscleGroup: ["Core", "Dorsais"],
    difficulty: "Avançado",
    duration: "3 séries × 3-6 reps",
    description: "Exercício avançado de core popularizado por Bruce Lee.",
    equipment: "Banco",
    instructions: [
      "Deite no banco segurando atrás da cabeça",
      "Eleve todo o corpo mantendo reto",
      "Desça controladamente",
      "Use apenas ombros como apoio"
    ],
    benefits: ["Core extremamente forte", "Controle corporal", "Força excêntrica"],
    variations: ["Dragon flag negativo", "Com joelhos dobrados"],
    tips: ["Comece com negativos", "Mantenha corpo rígido", "Progressão gradual"]
  }
];

export const getExercisesByCategory = (category: string) => {
  if (category === "all") return exerciseDatabase;
  return exerciseDatabase.filter(exercise => exercise.category === category);
};

export const getExercisesByMuscleGroup = (muscleGroup: string) => {
  return exerciseDatabase.filter(exercise => 
    exercise.muscleGroup.some(muscle => 
      muscle.toLowerCase().includes(muscleGroup.toLowerCase())
    )
  );
};

export const getExercisesByDifficulty = (difficulty: string) => {
  return exerciseDatabase.filter(exercise => exercise.difficulty === difficulty);
};
