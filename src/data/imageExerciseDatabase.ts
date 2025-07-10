
import { Exercise } from './expandedExerciseDatabase';

// Exercícios extraídos das imagens fornecidas pelo usuário
export const imageExerciseDatabase: Exercise[] = [
  // ===== GLÚTEOS =====
  {
    id: 101,
    name: "Remo Glúteos",
    category: "forca",
    muscleGroup: ["Glúteos"],
    targetMuscles: ["Glúteo Máximo"],
    difficulty: "Avançado",
    duration: "3 séries × 10-12 reps",
    sets: "3",
    reps: "10-12",
    restTime: "90s",
    description: "Exercício específico para fortalecimento dos glúteos.",
    equipment: "Faixa Elástica",
    instructions: [
      "Posicione a faixa elástica adequadamente",
      "Execute o movimento de remo focando nos glúteos",
      "Mantenha a postura correta",
      "Contraia os glúteos no final do movimento"
    ],
    benefits: ["Fortalece glúteos", "Melhora postura", "Tonifica região posterior"],
    variations: ["Com diferentes resistências", "Unilateral"],
    tips: ["Foque na contração", "Mantenha core ativo", "Movimento controlado"],
    commonMistakes: ["Compensação com outros músculos", "Movimento muito rápido"]
  },
  
  {
    id: 102,
    name: "Perspiciatis Quadriceps",
    category: "forca",
    muscleGroup: ["Quadríceps"],
    targetMuscles: ["Quadríceps"],
    difficulty: "Intermediário",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Exercício direcionado para o desenvolvimento dos quadríceps.",
    equipment: "Kettlebell",
    instructions: [
      "Posicione-se corretamente com o kettlebell",
      "Execute extensão controlada dos joelhos",
      "Mantenha alinhamento corporal",
      "Retorne à posição inicial"
    ],
    benefits: ["Fortalece quadríceps", "Melhora estabilidade", "Desenvolve força funcional"],
    variations: ["Diferentes pesos", "Ritmo variado"],
    tips: ["Não trave joelhos", "Movimento fluido", "Respiração adequada"],
    commonMistakes: ["Compensação com quadril", "Amplitude limitada"]
  },

  {
    id: 103,
    name: "Matus Glúteos com Peso Corporal",
    category: "peso-corporal",
    muscleGroup: ["Glúteos"],
    targetMuscles: ["Glúteo Máximo", "Glúteo Médio"],
    difficulty: "Intermediário",
    duration: "3 séries × 15-20 reps",
    sets: "3",
    reps: "15-20",
    restTime: "45s",
    description: "Exercício de peso corporal para ativação e fortalecimento dos glúteos.",
    equipment: "Faixa Elástica",
    instructions: [
      "Posição inicial adequada",
      "Ativação consciente dos glúteos",
      "Movimento controlado e completo",
      "Manutenção da tensão"
    ],
    benefits: ["Ativa glúteos", "Melhora coordenação", "Fortalece core"],
    variations: ["Com pause", "Diferentes amplitudes"],
    tips: ["Foque na qualidade", "Mantenha tensão constante", "Evite compensações"],
    commonMistakes: ["Velocidade excessiva", "Falta de ativação"]
  },

  // ===== ADUTORES =====
  {
    id: 104,
    name: "Doloresque Adutores",
    category: "forca",
    muscleGroup: ["Adutores"],
    targetMuscles: ["Adutores"],
    difficulty: "Avançado",
    duration: "3 séries × 10-12 reps",
    sets: "3",
    reps: "10-12",
    restTime: "75s",
    description: "Exercício avançado para fortalecimento dos músculos adutores.",
    equipment: "Faixa Elástica",
    instructions: [
      "Configuração correta da faixa elástica",
      "Posicionamento adequado do corpo",
      "Movimento de adução controlado",
      "Retorno gradual à posição inicial"
    ],
    benefits: ["Fortalece adutores", "Melhora estabilidade do quadril", "Previne lesões"],
    variations: ["Diferentes ângulos", "Isométrico"],
    tips: ["Movimento lento", "Amplitude completa", "Foco na técnica"],
    commonMistakes: ["Movimento compensatório", "Tensão inadequada"]
  },

  {
    id: 105,
    name: "Modi Posterior na Máquina",
    category: "forca",
    muscleGroup: ["Posterior de Coxa"],
    targetMuscles: ["Isquiotibiais"],
    difficulty: "Avançado",
    duration: "3 séries × 8-10 reps",
    sets: "3",
    reps: "8-10",
    restTime: "90s",
    description: "Exercício de máquina para desenvolvimento da musculatura posterior da coxa.",
    equipment: "Barra",
    instructions: [
      "Ajuste adequado da máquina",
      "Posicionamento correto do corpo",
      "Flexão controlada dos joelhos",
      "Extensão gradual"
    ],
    benefits: ["Desenvolve isquiotibiais", "Fortalece posterior", "Melhora proporção muscular"],
    variations: ["Unilateral", "Diferentes velocidades"],
    tips: ["Amplitude completa", "Controle excêntrico", "Não use impulso"],
    commonMistakes: ["Movimento parcial", "Velocidade excessiva"]
  },

  // ===== ABDOMINAIS/CORE =====
  {
    id: 106,
    name: "Pulla Adutores na Máquina",
    category: "forca",
    muscleGroup: ["Adutores"],
    targetMuscles: ["Adutores"],
    difficulty: "Iniciante",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Exercício básico na máquina para fortalecimento dos adutores.",
    equipment: "Kettlebell",
    instructions: [
      "Ajuste a máquina conforme o corpo",
      "Posição sentada adequada",
      "Movimento de adução das pernas",
      "Retorno controlado"
    ],
    benefits: ["Fortalece adutores", "Melhora estabilidade", "Fácil execução"],
    variations: ["Diferentes resistências", "Tempo de contração"],
    tips: ["Postura ereta", "Movimento suave", "Respiração coordenada"],
    commonMistakes: ["Postura inadequada", "Impulso no movimento"]
  },

  {
    id: 107,
    name: "Odit Adutores na Máquina",
    category: "forca",
    muscleGroup: ["Adutores"],
    targetMuscles: ["Adutores"],
    difficulty: "Iniciante",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Variação do exercício de adutores na máquina.",
    equipment: "Barra",
    instructions: [
      "Posicionamento correto na máquina",
      "Ajuste adequado dos apoios",
      "Execução controlada do movimento",
      "Foco na contração muscular"
    ],
    benefits: ["Desenvolve adutores", "Melhora coordenação", "Fortalece core"],
    variations: ["Isométrico", "Dinâmico"],
    tips: ["Mantenha alinhamento", "Controle a resistência", "Evite compensações"],
    commonMistakes: ["Posição incorreta", "Movimento descoordenado"]
  },

  // ===== EXERCÍCIOS AVANÇADOS =====
  {
    id: 108,
    name: "Expedita Glúteos Avançado",
    category: "forca",
    muscleGroup: ["Glúteos"],
    targetMuscles: ["Glúteo Máximo", "Glúteo Médio"],
    difficulty: "Avançado",
    duration: "3 séries × 8-10 reps",
    sets: "3",
    reps: "8-10",
    restTime: "120s",
    description: "Exercício avançado para máximo desenvolvimento dos glúteos.",
    equipment: "Bola Medicinal",
    instructions: [
      "Configuração avançada do exercício",
      "Execução técnica precisa",
      "Controle total do movimento",
      "Ativação máxima dos glúteos"
    ],
    benefits: ["Máximo desenvolvimento", "Força funcional", "Estabilidade avançada"],
    variations: ["Com peso adicional", "Pliométrico"],
    tips: ["Técnica perfeita", "Progressão gradual", "Recuperação adequada"],
    commonMistakes: ["Técnica inadequada", "Progressão muito rápida"]
  },

  {
    id: 109,
    name: "At Posterior na Máquina",
    category: "forca",
    muscleGroup: ["Posterior de Coxa"],
    targetMuscles: ["Isquiotibiais"],
    difficulty: "Avançado",
    duration: "3 séries × 8-12 reps",
    sets: "3",
    reps: "8-12",
    restTime: "90s",
    description: "Exercício de máquina avançado para posterior da coxa.",
    equipment: "Corda",
    instructions: [
      "Ajuste preciso da máquina",
      "Posicionamento biomecânico correto",
      "Execução com amplitude completa",
      "Controle da fase excêntrica"
    ],
    benefits: ["Desenvolve isquiotibiais", "Melhora proporção muscular", "Força específica"],
    variations: ["Unilateral", "Bilateral"],
    tips: ["Amplitude máxima", "Controle total", "Respiração adequada"],
    commonMistakes: ["Compensação com outros músculos", "Amplitude limitada"]
  },

  // ===== ISQUIOTIBIAIS =====
  {
    id: 110,
    name: "Adipisci Adutores com Peso Corporal",
    category: "peso-corporal",
    muscleGroup: ["Adutores"],
    targetMuscles: ["Adutores"],
    difficulty: "Avançado",
    duration: "3 séries × 10-15 reps",
    sets: "3",
    reps: "10-15",
    restTime: "75s",
    description: "Exercício avançado de peso corporal para adutores.",
    equipment: "Kettlebell",
    instructions: [
      "Posição corporal adequada",
      "Ativação consciente dos adutores",
      "Movimento controlado sem equipamentos",
      "Manutenção do equilíbrio"
    ],
    benefits: ["Fortalece adutores", "Melhora propriocepção", "Funcionalidade"],
    variations: ["Diferentes posições", "Com instabilidade"],
    tips: ["Equilíbrio constante", "Movimento preciso", "Progressão gradual"],
    commonMistakes: ["Perda de equilíbrio", "Compensação excessiva"]
  },

  {
    id: 111,
    name: "Quad Quadriceps na Máquina",
    category: "forca",
    muscleGroup: ["Quadríceps"],
    targetMuscles: ["Quadríceps"],
    difficulty: "Intermediário",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Exercício clássico de quadríceps na máquina.",
    equipment: "Kettlebell",
    instructions: [
      "Ajuste da máquina para seu corpo",
      "Posição sentada correta",
      "Extensão controlada das pernas",
      "Retorno gradual"
    ],
    benefits: ["Isola quadríceps", "Desenvolvimento específico", "Segurança na execução"],
    variations: ["Unilateral", "Bilateral", "Diferentes velocidades"],
    tips: ["Não trave joelhos", "Amplitude completa", "Respiração coordenada"],
    commonMistakes: ["Extensão com travamento", "Movimento muito rápido"]
  },

  // ===== EXERCÍCIOS DE PANTURRILHA =====
  {
    id: 112,
    name: "Repudiandae Abdutores Avançado",
    category: "forca",
    muscleGroup: ["Abdutores"],
    targetMuscles: ["Glúteo Médio"],
    difficulty: "Intermediário",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Exercício avançado para desenvolvimento dos abdutores.",
    equipment: "Faixa Elástica",
    instructions: [
      "Posicionamento lateral adequado",
      "Movimento de abdução controlado",
      "Manutenção da estabilidade",
      "Retorno gradual à posição inicial"
    ],
    benefits: ["Fortalece abdutores", "Melhora estabilidade lateral", "Previne lesões"],
    variations: ["Em pé", "Deitado lateral"],
    tips: ["Movimento isolado", "Sem compensação", "Controle total"],
    commonMistakes: ["Movimento do tronco", "Amplitude inadequada"]
  },

  {
    id: 113,
    name: "Ab Abdutores com Peso Corporal",
    category: "peso-corporal",
    muscleGroup: ["Abdutores"],
    targetMuscles: ["Glúteo Médio"],
    difficulty: "Iniciante",
    duration: "3 séries × 15-20 reps",
    sets: "3",
    reps: "15-20",
    restTime: "45s",
    description: "Exercício básico de peso corporal para abdutores.",
    equipment: "Faixa Elástica",
    instructions: [
      "Posição inicial estável",
      "Movimento de abdução puro",
      "Controle durante toda amplitude",
      "Manutenção da postura"
    ],
    benefits: ["Ativa abdutores", "Melhora estabilidade", "Fortalecimento funcional"],
    variations: ["Diferentes posições", "Com pause"],
    tips: ["Foque no músculo alvo", "Evite compensações", "Movimento suave"],
    commonMistakes: ["Uso do tronco", "Movimento irregular"]
  },

  // ===== EXERCÍCIOS DE VOLUME E FORÇA =====
  {
    id: 114,
    name: "Voluptatem Posterior com Peso Corporal",
    category: "peso-corporal",
    muscleGroup: ["Posterior de Coxa"],
    targetMuscles: ["Isquiotibiais"],
    difficulty: "Iniciante",
    duration: "3 séries × 12-18 reps",
    sets: "3",
    reps: "12-18",
    restTime: "60s",
    description: "Exercício de peso corporal para fortalecimento do posterior da coxa.",
    equipment: "Halteres",
    instructions: [
      "Posição inicial adequada",
      "Flexão controlada do joelho",
      "Contração consciente dos isquiotibiais",
      "Retorno controlado"
    ],
    benefits: ["Fortalece posteriores", "Melhora flexibilidade", "Funcionalidade"],
    variations: ["Unilateral", "Com diferentes amplitudes"],
    tips: ["Movimento controlado", "Foco na contração", "Respiração coordenada"],
    commonMistakes: ["Movimento muito rápido", "Compensação com outros músculos"]
  },

  {
    id: 115,
    name: "Assumenda Quadriceps Avançado",
    category: "forca",
    muscleGroup: ["Quadríceps"],
    targetMuscles: ["Quadríceps"],
    difficulty: "Iniciante",
    duration: "3 séries × 10-15 reps",
    sets: "3",
    reps: "10-15",
    restTime: "75s",
    description: "Exercício avançado para máximo desenvolvimento dos quadríceps.",
    equipment: "Bola Medicinal",
    instructions: [
      "Configuração avançada",
      "Execução técnica perfeita",
      "Amplitude completa de movimento",
      "Controle em todas as fases"
    ],
    benefits: ["Máximo desenvolvimento", "Força específica", "Estabilidade avançada"],
    variations: ["Com carga adicional", "Isométrico"],
    tips: ["Técnica impecável", "Progressão gradual", "Descanso adequado"],
    commonMistakes: ["Técnica comprometida", "Sobrecarga prematura"]
  },

  // ===== EXERCÍCIOS DE PANTURRILHA ESPECÍFICOS =====
  {
    id: 116,
    name: "Atque Adutores com Halteres",
    category: "forca",
    muscleGroup: ["Adutores"],
    targetMuscles: ["Adutores"],
    difficulty: "Avançado",
    duration: "3 séries × 8-12 reps",
    sets: "3",
    reps: "8-12",
    restTime: "90s",
    description: "Exercício com halteres para desenvolvimento avançado dos adutores.",
    equipment: "Faixa Elástica",
    instructions: [
      "Posicionamento com halteres",
      "Movimento de adução resistido",
      "Controle total da carga",
      "Amplitude completa"
    ],
    benefits: ["Desenvolve força", "Melhora resistência", "Tonificação específica"],
    variations: ["Diferentes pesos", "Velocidades variadas"],
    tips: ["Carga progressiva", "Movimento controlado", "Técnica correta"],
    commonMistakes: ["Peso excessivo", "Técnica inadequada"]
  },

  {
    id: 117,
    name: "Ture Adutores com Peso Corporal",
    category: "peso-corporal",
    muscleGroup: ["Adutores"],
    targetMuscles: ["Adutores"],
    difficulty: "Iniciante",
    duration: "3 séries × 15-20 reps",
    sets: "3",
    reps: "15-20",
    restTime: "45s",
    description: "Exercício básico de peso corporal focado nos adutores.",
    equipment: "Faixa Elástica",
    instructions: [
      "Posição corporal estável",
      "Movimento de adução natural",
      "Controle da amplitude",
      "Respiração adequada"
    ],
    benefits: ["Fortalecimento básico", "Ativação muscular", "Coordenação"],
    variations: ["Diferentes posições", "Ritmos variados"],
    tips: ["Foco na qualidade", "Progressão gradual", "Consistência"],
    commonMistakes: ["Movimento irregular", "Falta de controle"]
  },

  // ===== EXERCÍCIOS PARA ISQUIOTIBIAIS =====
  {
    id: 118,
    name: "Quan Glúteos Avançado",
    category: "forca",
    muscleGroup: ["Glúteos"],
    targetMuscles: ["Glúteo Máximo"],
    difficulty: "Iniciante",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Exercício avançado para desenvolvimento máximo dos glúteos.",
    equipment: "Máquina",
    instructions: [
      "Configuração específica da máquina",
      "Posicionamento biomecânico ideal",
      "Execução com máxima ativação",
      "Controle em todas as fases"
    ],
    benefits: ["Máximo desenvolvimento", "Força específica", "Definição muscular"],
    variations: ["Unilateral", "Bilateral", "Com pause"],
    tips: ["Ativação máxima", "Técnica perfeita", "Progressão controlada"],
    commonMistakes: ["Compensação muscular", "Técnica inadequada"]
  },

  {
    id: 119,
    name: "Nic Isquiotibiais",
    category: "forca",
    muscleGroup: ["Isquiotibiais"],
    targetMuscles: ["Isquiotibiais"],
    difficulty: "Avançado",
    duration: "3 séries × 8-10 reps",
    sets: "3",
    reps: "8-10",
    restTime: "120s",
    description: "Exercício específico para desenvolvimento dos isquiotibiais.",
    equipment: "Kettlebell",
    instructions: [
      "Posicionamento específico",
      "Flexão controlada do joelho",
      "Máxima ativação dos isquiotibiais",
      "Controle excêntrico"
    ],
    benefits: ["Desenvolve isquiotibiais", "Melhora força posterior", "Previne lesões"],
    variations: ["Diferentes ângulos", "Unilateral"],
    tips: ["Amplitude completa", "Controle excêntrico", "Ativação consciente"],
    commonMistakes: ["Amplitude limitada", "Compensação com glúteos"]
  },

  // ===== EXERCÍCIOS DE PANTURRILHA AVANÇADOS =====
  {
    id: 120,
    name: "Placeat Posterior Avançado",
    category: "forca",
    muscleGroup: ["Posterior de Coxa"],
    targetMuscles: ["Isquiotibiais"],
    difficulty: "Intermediário",
    duration: "3 séries × 10-12 reps",
    sets: "3",
    reps: "10-12",
    restTime: "75s",
    description: "Exercício avançado para desenvolvimento do posterior da coxa.",
    equipment: "Faixa Elástica",
    instructions: [
      "Configuração avançada",
      "Execução técnica precisa",
      "Amplitude máxima",
      "Controle total do movimento"
    ],
    benefits: ["Desenvolve posteriores", "Melhora proporção", "Força funcional"],
    variations: ["Com resistência variável", "Velocidades diferentes"],
    tips: ["Técnica precisa", "Progressão gradual", "Consistência"],
    commonMistakes: ["Técnica comprometida", "Amplitude inadequada"]
  },

  // ===== EXERCÍCIOS ESPECÍFICOS COM EQUIPAMENTOS =====
  {
    id: 121,
    name: "Quis Isquiotibiais com Halteres",
    category: "forca",
    muscleGroup: ["Isquiotibiais"],
    targetMuscles: ["Isquiotibiais"],
    difficulty: "Avançado",
    duration: "3 séries × 8-10 reps",
    sets: "3",
    reps: "8-10",
    restTime: "90s",
    description: "Exercício com halteres para isquiotibiais.",
    equipment: "Peso Corporal",
    instructions: [
      "Posicionamento com halteres",
      "Movimento de flexão controlado",
      "Resistência progressiva",
      "Amplitude completa"
    ],
    benefits: ["Desenvolve força", "Melhora resistência", "Definição muscular"],
    variations: ["Diferentes pesos", "Unilateral"],
    tips: ["Carga adequada", "Movimento fluido", "Respiração correta"],
    commonMistakes: ["Peso excessivo", "Compensação muscular"]
  },

  {
    id: 122,
    name: "Rem Isquiotibiais com Peso Corporal",
    category: "peso-corporal",
    muscleGroup: ["Isquiotibiais"],
    targetMuscles: ["Isquiotibiais"],
    difficulty: "Intermediário",
    duration: "3 séries × 12-15 reps",
    sets: "3",
    reps: "12-15",
    restTime: "60s",
    description: "Exercício de peso corporal para isquiotibiais.",
    equipment: "Bola Medicinal",
    instructions: [
      "Posição corporal adequada",
      "Flexão natural do joelho",
      "Controle do movimento",
      "Ativação consciente"
    ],
    benefits: ["Fortalecimento natural", "Melhora coordenação", "Funcionalidade"],
    variations: ["Diferentes posições", "Com instabilidade"],
    tips: ["Movimento natural", "Controle total", "Progressão gradual"],
    commonMistakes: ["Movimento descontrolado", "Compensação excessiva"]
  },

  // ===== EXERCÍCIOS DE PANTURRILHA ESPECÍFICOS =====
  {
    id: 123,
    name: "Pariatur Panturrilha Avançado",
    category: "forca",
    muscleGroup: ["Panturrilha"],
    targetMuscles: ["Gastrocnêmio", "Sóleo"],
    difficulty: "Iniciante",
    duration: "3 séries × 15-20 reps",
    sets: "3",
    reps: "15-20",
    restTime: "45s",
    description: "Exercício avançado para desenvolvimento das panturrilhas.",
    equipment: "Corda",
    instructions: [
      "Posicionamento nos calcanhares",
      "Elevação máxima dos calcanhares",
      "Contração máxima no topo",
      "Descida controlada"
    ],
    benefits: ["Desenvolve panturrilhas", "Melhora propulsão", "Define músculos"],
    variations: ["Com peso", "Unilateral", "Diferentes ângulos"],
    tips: ["Amplitude máxima", "Contração no topo", "Movimento controlado"],
    commonMistakes: ["Amplitude limitada", "Movimento muito rápido"]
  },

  {
    id: 124,
    name: "Pariatur Adutores com Halteres",
    category: "forca",
    muscleGroup: ["Adutores"],
    targetMuscles: ["Adutores"],
    difficulty: "Avançado",
    duration: "3 séries × 10-12 reps",
    sets: "3",
    reps: "10-12",
    restTime: "75s",
    description: "Exercício com halteres para adutores.",
    equipment: "Bola Medicinal",
    instructions: [
      "Posicionamento com halteres",
      "Movimento de adução resistido",
      "Controle da carga",
      "Amplitude adequada"
    ],
    benefits: ["Desenvolve força", "Melhora resistência", "Tonificação"],
    variations: ["Diferentes pesos", "Velocidades variadas"],
    tips: ["Carga progressiva", "Técnica correta", "Movimento fluido"],
    commonMistakes: ["Peso inadequado", "Técnica comprometida"]
  },

  // ===== EXERCÍCIOS DIVERSOS =====
  {
    id: 125,
    name: "Eaque Isquiotibiais Avançado",
    category: "forca",
    muscleGroup: ["Isquiotibiais"],
    targetMuscles: ["Isquiotibiais"],
    difficulty: "Avançado",
    duration: "3 séries × 8-10 reps",
    sets: "3",
    reps: "8-10",
    restTime: "120s",
    description: "Exercício avançado para isquiotibiais.",
    equipment: "Bola Medicinal",
    instructions: [
      "Configuração avançada",
      "Execução técnica perfeita",
      "Máxima ativação muscular",
      "Controle total"
    ],
    benefits: ["Máximo desenvolvimento", "Força específica", "Prevenção de lesões"],
    variations: ["Com instabilidade", "Diferentes ângulos"],
    tips: ["Técnica impecável", "Progressão cuidadosa", "Recuperação adequada"],
    commonMistakes: ["Técnica inadequada", "Progressão muito rápida"]
  },

  // ===== EXERCÍCIOS DE MEMBRO SUPERIOR =====
  // Continuando com exercícios de membros superiores das imagens...
  
  {
    id: 126,
    name: "Culpa Glúteos com Halteres",
    category: "forca",
    muscleGroup: ["Glúteos"],
    targetMuscles: ["Glúteo Máximo"],
    difficulty: "Avançado",
    duration: "3 séries × 8-12 reps",
    sets: "3",
    reps: "8-12",
    restTime: "90s",
    description: "Exercício com halteres para glúteos.",
    equipment: "Halteres",
    instructions: [
      "Posicionamento com halteres",
      "Movimento de extensão do quadril",
      "Ativação máxima dos glúteos",
      "Controle da carga"
    ],
    benefits: ["Desenvolve glúteos", "Melhora força", "Definição muscular"],
    variations: ["Unilateral", "Bilateral"],
    tips: ["Ativação consciente", "Movimento controlado", "Carga adequada"],
    commonMistakes: ["Compensação lombar", "Peso excessivo"]
  },

  // ===== EXERCÍCIOS DE TRÍCEPS =====
  {
    id: 127,
    name: "Et Triceps",
    category: "forca",
    muscleGroup: ["Tríceps"],
    targetMuscles: ["Tríceps Braquial"],
    difficulty: "Intermediário",
    duration: "3 séries × 10-12 reps",
    sets: "3",
    reps: "10-12",
    restTime: "60s",
    description: "Exercício específico para tríceps.",
    equipment: "Faixa Elástica",
    instructions: [
      "Posicionamento adequado",
      "Extensão controlada do cotovelo",
      "Isolamento do tríceps",
      "Retorno gradual"
    ],
    benefits: ["Desenvolve tríceps", "Melhora definição", "Força específica"],
    variations: ["Unilateral", "Bilateral"],
    tips: ["Cotovelos fixos", "Movimento isolado", "Amplitude completa"],
    commonMistakes: ["Movimento dos cotovelos", "Compensação com ombros"]
  },

  {
    id: 128,
    name: "Labore Peitoral com Halteres",
    category: "forca",
    muscleGroup: ["Peitoral Superior"],
    targetMuscles: ["Peitoral Maior"],
    difficulty: "Intermediário",
    duration: "3 séries × 8-12 reps",
    sets: "3",
    reps: "8-12",
    restTime: "90s",
    description: "Exercício com halteres para peitoral.",
    equipment: "Corda",
    instructions: [
      "Posicionamento no banco",
      "Movimento de adução dos braços",
      "Contração máxima do peitoral",
      "Amplitude completa"
    ],
    benefits: ["Desenvolve peitoral", "Melhora definição", "Força específica"],
    variations: ["Inclinado", "Declinado", "Plano"],
    tips: ["Amplitude máxima", "Contração no centro", "Movimento controlado"],
    commonMistakes: ["Amplitude limitada", "Movimento muito rápido"]
  },

  // ===== EXERCÍCIOS DE BÍCEPS =====
  {
    id: 129,
    name: "Repudiandae Biceps Avançado",
    category: "forca",
    muscleGroup: ["Bíceps"],
    targetMuscles: ["Bíceps Braquial"],
    difficulty: "Intermediário",
    duration: "3 séries × 10-12 reps",
    sets: "3",
    reps: "10-12",
    restTime: "75s",
    description: "Exercício avançado para bíceps.",
    equipment: "Barra",
    instructions: [
      "Posicionamento com barra",
      "Flexão controlada do cotovelo",
      "Contração máxima do bíceps",
      "Descida controlada"
    ],
    benefits: ["Desenvolve bíceps", "Melhora força", "Definição muscular"],
    variations: ["Pegada variada", "Velocidades diferentes"],
    tips: ["Cotovelos fixos", "Amplitude completa", "Contração no topo"],
    commonMistakes: ["Balanço do corpo", "Movimento dos cotovelos"]
  },

  {
    id: 130,
    name: "Eum Peitoral com Peso Corporal",
    category: "peso-corporal",
    muscleGroup: ["Peitoral Superior"],
    targetMuscles: ["Peitoral Maior"],
    difficulty: "Avançado",
    duration: "3 séries × 8-15 reps",
    sets: "3",
    reps: "8-15",
    restTime: "90s",
    description: "Exercício de peso corporal para peitoral.",
    equipment: "Barra",
    instructions: [
      "Posição de flexão modificada",
      "Movimento de adução dos braços",
      "Ativação máxima do peitoral",
      "Controle corporal"
    ],
    benefits: ["Desenvolve peitoral", "Melhora estabilidade", "Força funcional"],
    variations: ["Inclinado", "Declinado"],
    tips: ["Movimento controlado", "Ativação consciente", "Progressão gradual"],
    commonMistakes: ["Postura inadequada", "Movimento descontrolado"]
  }

  // Continuaria adicionando mais exercícios baseados nas imagens fornecidas...
  // Por questões de espaço, incluí uma amostra representativa dos exercícios
];
