
import { workoutGenerationService } from './workoutGenerationService';

export interface PeriodizationPhase {
  name: string;
  duration: number; // em semanas
  objective: string;
  priority: 'alta' | 'media' | 'baixa';
  intensity: 'baixa' | 'moderada' | 'alta';
  focus: string[];
}

export interface PeriodizationAnalysis {
  id: string;
  totalWeeks: number;
  mainObjective: string;
  phases: PeriodizationPhase[];
  muscleGroupPriority: string[];
  trainingFrequency: number;
  analysisDate: string;
  confidence: number;
}

export interface RecommendedWorkoutModel {
  id: string;
  name: string;
  description: string;
  phase: string;
  duration: number;
  targetPSE: number;
  muscleGroups: string[];
  exercises: any[];
  recommendationScore: number;
  aiReasoning: string;
  periodizationPhase: string;
}

class PeriodizationAnalysisService {
  
  async analyzePeriodization(content: string): Promise<PeriodizationAnalysis> {
    // Simular análise de IA do conteúdo da periodização
    // Em uma implementação real, isso seria processado por uma IA real
    
    const analysis = this.parseContentWithAI(content);
    
    // Salvar análise no localStorage
    const savedAnalyses = JSON.parse(localStorage.getItem("periodizationAnalyses") || "[]");
    savedAnalyses.push(analysis);
    localStorage.setItem("periodizationAnalyses", JSON.stringify(savedAnalyses));
    
    return analysis;
  }

  private parseContentWithAI(content: string): PeriodizationAnalysis {
    // Simulação de análise inteligente do conteúdo
    // Na implementação real, seria processado por IA para extrair:
    // - Fases da periodização
    // - Objetivos de cada fase  
    // - Intensidades planejadas
    // - Grupos musculares prioritários
    
    const keywords = content.toLowerCase();
    
    // Detectar objetivo principal
    let mainObjective = "Condicionamento Geral";
    if (keywords.includes("força") || keywords.includes("force")) {
      mainObjective = "Desenvolvimento de Força";
    } else if (keywords.includes("hipertrofia") || keywords.includes("massa")) {
      mainObjective = "Hipertrofia Muscular";
    } else if (keywords.includes("perda") && keywords.includes("peso")) {
      mainObjective = "Perda de Peso";
    } else if (keywords.includes("resistência") || keywords.includes("cardio")) {
      mainObjective = "Resistência Cardiovascular";
    }

    // Detectar duração (procurar por números + "semanas")
    const weekMatches = content.match(/(\d+)\s*semanas?/gi);
    const totalWeeks = weekMatches ? 
      Math.max(...weekMatches.map(m => parseInt(m.match(/\d+/)?.[0] || "0"))) : 12;

    // Gerar fases baseadas na análise
    const phases = this.generatePhasesFromAnalysis(content, totalWeeks, mainObjective);
    
    // Detectar grupos musculares prioritários
    const muscleGroupPriority = this.extractMuscleGroupPriority(content);
    
    // Detectar frequência de treino
    const trainingFrequency = this.extractTrainingFrequency(content);

    return {
      id: `analysis_${Date.now()}`,
      totalWeeks,
      mainObjective,
      phases,
      muscleGroupPriority,
      trainingFrequency,
      analysisDate: new Date().toISOString(),
      confidence: this.calculateConfidenceScore(content)
    };
  }

  private generatePhasesFromAnalysis(content: string, totalWeeks: number, objective: string): PeriodizationPhase[] {
    const phases: PeriodizationPhase[] = [];
    const keywords = content.toLowerCase();

    // Lógica inteligente para detectar fases baseada no objetivo
    if (objective.includes("Força")) {
      phases.push(
        {
          name: "Adaptação Anatômica",
          duration: Math.ceil(totalWeeks * 0.25),
          objective: "Preparação muscular e articular",
          priority: "alta",
          intensity: "baixa",
          focus: ["Técnica", "Volume", "Adaptação"]
        },
        {
          name: "Desenvolvimento de Força",
          duration: Math.ceil(totalWeeks * 0.5),
          objective: "Aumento da força máxima",
          priority: "alta", 
          intensity: "alta",
          focus: ["Força Máxima", "CNS"]
        },
        {
          name: "Realização/Pico",
          duration: Math.ceil(totalWeeks * 0.25),
          objective: "Expressão máxima da força",
          priority: "media",
          intensity: "moderada",
          focus: ["Potência", "Técnica Refinada"]
        }
      );
    } else if (objective.includes("Hipertrofia")) {
      phases.push(
        {
          name: "Fase Preparatória",
          duration: Math.ceil(totalWeeks * 0.2),
          objective: "Adaptação inicial",
          priority: "media",
          intensity: "baixa",
          focus: ["Volume", "Técnica"]
        },
        {
          name: "Fase de Desenvolvimento",
          duration: Math.ceil(totalWeeks * 0.6),
          objective: "Máximo crescimento muscular",
          priority: "alta",
          intensity: "alta",
          focus: ["Volume Alto", "Tensão Mecânica"]
        },
        {
          name: "Fase de Definição",
          duration: Math.ceil(totalWeeks * 0.2),
          objective: "Refinamento e definição",
          priority: "media",
          intensity: "moderada",
          focus: ["Definição", "Cardio"]
        }
      );
    } else {
      // Periodização genérica
      const phaseLength = Math.ceil(totalWeeks / 3);
      phases.push(
        {
          name: "Fase Inicial",
          duration: phaseLength,
          objective: "Condicionamento base",
          priority: "alta",
          intensity: "baixa",
          focus: ["Resistência", "Técnica"]
        },
        {
          name: "Fase Intermediária", 
          duration: phaseLength,
          objective: "Progressão controlada",
          priority: "alta",
          intensity: "moderada",
          focus: ["Força", "Resistência"]
        },
        {
          name: "Fase Avançada",
          duration: totalWeeks - (phaseLength * 2),
          objective: "Alta performance",
          priority: "media",
          intensity: "alta",
          focus: ["Potência", "Especificidade"]
        }
      );
    }

    return phases;
  }

  private extractMuscleGroupPriority(content: string): string[] {
    const keywords = content.toLowerCase();
    const muscleGroups = [];

    // Mapear termos para grupos musculares
    const muscleMap = {
      "peitoral": ["peito", "peitoral", "chest"],
      "dorsais": ["costas", "dorsais", "lat", "back"],
      "quadríceps": ["quadríceps", "coxa", "quad", "thigh"],
      "isquiotibiais": ["isquiotibiais", "posterior", "hamstring"],
      "deltoide": ["ombro", "deltoide", "shoulder"],
      "bíceps": ["bíceps", "bicep"],
      "tríceps": ["tríceps", "tricep"],
      "glúteos": ["glúteo", "glute", "bumbum"],
      "abdômen": ["abdômen", "core", "abs"]
    };

    for (const [muscle, terms] of Object.entries(muscleMap)) {
      if (terms.some(term => keywords.includes(term))) {
        muscleGroups.push(muscle);
      }
    }

    // Se não encontrou músculos específicos, retornar grupos principais
    if (muscleGroups.length === 0) {
      return ["Peitoral", "Dorsais", "Quadríceps", "Deltoide"];
    }

    return muscleGroups;
  }

  private extractTrainingFrequency(content: string): number {
    const frequencyMatches = content.match(/(\d+)\s*(x|vezes)\s*(semana|week)/gi);
    if (frequencyMatches) {
      const numbers = frequencyMatches.map(m => parseInt(m.match(/\d+/)?.[0] || "0"));
      return Math.max(...numbers);
    }
    
    // Frequência padrão baseada em palavras-chave
    const keywords = content.toLowerCase();
    if (keywords.includes("iniciante")) return 3;
    if (keywords.includes("avançado")) return 5;
    return 4; // padrão
  }

  private calculateConfidenceScore(content: string): number {
    let score = 50; // base
    
    // Aumentar confiança baseado na qualidade do conteúdo
    if (content.length > 500) score += 20;
    if (content.includes("semana")) score += 10;
    if (content.includes("fase")) score += 15;
    if (content.match(/\d+/g)?.length > 5) score += 10; // muitos números
    
    return Math.min(score, 95);
  }

  async recommendWorkoutModels(analysis: PeriodizationAnalysis): Promise<RecommendedWorkoutModel[]> {
    const recommendations: RecommendedWorkoutModel[] = [];
    
    // Para cada fase, gerar recomendações individuais
    for (const phase of analysis.phases) {
      const phaseRecommendations = await this.generatePhaseRecommendations(phase, analysis);
      recommendations.push(...phaseRecommendations);
    }
    
    // Ordenar por score de recomendação
    return recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  private async generatePhaseRecommendations(
    phase: PeriodizationPhase, 
    analysis: PeriodizationAnalysis
  ): Promise<RecommendedWorkoutModel[]> {
    
    const recommendations: RecommendedWorkoutModel[] = [];
    
    // Mapear objetivos da fase para tipos de treino
    const objectiveToWorkoutType = {
      "força": "forca",
      "hipertrofia": "ganho-massa", 
      "resistência": "condicionamento",
      "condicionamento": "condicionamento",
      "perda": "perda-peso",
      "definição": "perda-peso"
    };

    let workoutType = "condicionamento";
    for (const [key, type] of Object.entries(objectiveToWorkoutType)) {
      if (phase.objective.toLowerCase().includes(key) || phase.name.toLowerCase().includes(key)) {
        workoutType = type;
        break;
      }
    }

    // Gerar diferentes variações para a fase
    const intensities: Array<{level: any, duration: number}> = [
      { level: "baixa", duration: 30 },
      { level: "moderada", duration: 45 },
      { level: "alta", duration: 60 }
    ];

    for (const intensity of intensities) {
      // Análise individual para cada combinação
      const recommendation = this.createIndividualRecommendation(
        phase, 
        analysis, 
        workoutType, 
        intensity
      );
      
      recommendations.push(recommendation);
    }

    return recommendations;
  }

  private createIndividualRecommendation(
    phase: PeriodizationPhase,
    analysis: PeriodizationAnalysis, 
    workoutType: string,
    intensity: {level: any, duration: number}
  ): RecommendedWorkoutModel {
    
    // Análise individual para justificar a recomendação
    const reasoning = this.generateIndividualReasoning(phase, workoutType, intensity);
    
    // Calcular score baseado na compatibilidade
    const score = this.calculateRecommendationScore(phase, workoutType, intensity);
    
    // Selecionar grupos musculares específicos para esta recomendação
    const muscleGroups = this.selectSpecificMuscleGroups(phase, analysis);
    
    return {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${phase.name} - ${this.capitalizeFirst(intensity.level)} Intensidade`,
      description: `Treino especializado para ${phase.objective.toLowerCase()} com foco em ${phase.focus.join(", ").toLowerCase()}`,
      phase: phase.name,
      duration: intensity.duration,
      targetPSE: this.calculateTargetPSE(phase.intensity, intensity.level),
      muscleGroups,
      exercises: [], // Seriam gerados pelo workoutGenerationService
      recommendationScore: score,
      aiReasoning: reasoning,
      periodizationPhase: phase.name
    };
  }

  private generateIndividualReasoning(
    phase: PeriodizationPhase, 
    workoutType: string, 
    intensity: {level: any, duration: number}
  ): string {
    
    const reasonings = {
      "baixa": [
        `Ideal para ${phase.name} pois permite foco na técnica e adaptação gradual.`,
        `A intensidade baixa é perfeita para ${phase.objective.toLowerCase()} sem sobrecarga excessiva.`,
        `Recomendado para esta fase devido ao objetivo de ${phase.focus.join(" e ").toLowerCase()}.`
      ],
      "moderada": [
        `Equilíbrio ideal entre desafio e recuperação para ${phase.name}.`,
        `Esta intensidade permite progressão consistente em ${phase.objective.toLowerCase()}.`,
        `Compatível com o foco em ${phase.focus.join(" e ").toLowerCase()} desta fase.`
      ],
      "alta": [
        `Intensidade máxima justificada pelo objetivo de ${phase.objective.toLowerCase()}.`,
        `Necessária para alcançar os resultados específicos de ${phase.name}.`,
        `O foco em ${phase.focus.join(" e ").toLowerCase()} demanda esta intensidade.`
      ]
    };

    const options = reasonings[intensity.level] || reasonings["moderada"];
    return options[Math.floor(Math.random() * options.length)];
  }

  private calculateRecommendationScore(
    phase: PeriodizationPhase, 
    workoutType: string, 
    intensity: {level: any, duration: number}
  ): number {
    let score = 60; // base
    
    // Compatibilidade de intensidade
    if (phase.intensity === intensity.level) {
      score += 25;
    } else if (
      (phase.intensity === "alta" && intensity.level === "moderada") ||
      (phase.intensity === "baixa" && intensity.level === "moderada")
    ) {
      score += 15;
    }
    
    // Compatibilidade de duração com prioridade
    if (phase.priority === "alta" && intensity.duration >= 45) {
      score += 10;
    }
    
    // Boost para fases específicas
    if (phase.name.toLowerCase().includes("desenvolvimento") && intensity.level === "alta") {
      score += 10;
    }
    
    return Math.min(Math.max(score, 40), 98); // Entre 40-98%
  }

  private selectSpecificMuscleGroups(
    phase: PeriodizationPhase, 
    analysis: PeriodizationAnalysis
  ): string[] {
    // Análise individual para cada recomendação
    let muscleGroups = [...analysis.muscleGroupPriority];
    
    // Ajustar baseado no foco da fase
    if (phase.focus.includes("Upper") || phase.focus.includes("Membros Superiores")) {
      muscleGroups = muscleGroups.filter(m => 
        ["Peitoral", "Dorsais", "Deltoide", "Bíceps", "Tríceps"].includes(m)
      );
    } else if (phase.focus.includes("Lower") || phase.focus.includes("Membros Inferiores")) {
      muscleGroups = muscleGroups.filter(m => 
        ["Quadríceps", "Isquiotibiais", "Glúteos", "Panturrilha"].includes(m)
      );
    }
    
    // Se não há grupos suficientes, adicionar complementares
    if (muscleGroups.length < 2) {
      const allGroups = ["Peitoral", "Dorsais", "Quadríceps", "Deltoide"];
      muscleGroups.push(...allGroups.filter(g => !muscleGroups.includes(g)).slice(0, 2));
    }
    
    return muscleGroups.slice(0, 4); // Máximo 4 grupos
  }

  private calculateTargetPSE(phaseIntensity: string, workoutIntensity: string): number {
    const baseMap = {
      "baixa": 4,
      "moderada": 6, 
      "alta": 8
    };
    
    let pse = baseMap[phaseIntensity] || 6;
    
    // Ajustar baseado na intensidade do treino
    if (workoutIntensity === "alta") pse += 1;
    if (workoutIntensity === "baixa") pse -= 1;
    
    return Math.min(Math.max(pse, 3), 9);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export const periodizationAnalysisService = new PeriodizationAnalysisService();
