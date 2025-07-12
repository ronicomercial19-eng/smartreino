
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
  userId: string;
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
  userId: string;
  category: string;
  createdAt: string;
}

class PeriodizationAnalysisService {
  
  async analyzePeriodization(content: string, userId: string = 'default'): Promise<PeriodizationAnalysis> {
    try {
      console.log('Iniciando análise de periodização para usuário:', userId);
      const analysis = this.parseContentWithAI(content, userId);
      
      // Salvar análise no localStorage
      const savedAnalyses = JSON.parse(localStorage.getItem("periodizationAnalyses") || "[]");
      savedAnalyses.push(analysis);
      localStorage.setItem("periodizationAnalyses", JSON.stringify(savedAnalyses));
      
      return analysis;
    } catch (error) {
      console.error('Erro na análise de periodização:', error);
      throw new Error('Falha ao analisar periodização');
    }
  }

  private parseContentWithAI(content: string, userId: string): PeriodizationAnalysis {
    console.log('Processando conteúdo da periodização...');
    
    const keywords = content.toLowerCase();
    
    // Detectar objetivo principal com mais precisão
    let mainObjective = "Condicionamento Geral";
    if (keywords.includes("força") || keywords.includes("force") || keywords.includes("strength")) {
      mainObjective = "Desenvolvimento de Força";
    } else if (keywords.includes("hipertrofia") || keywords.includes("massa") || keywords.includes("volume")) {
      mainObjective = "Hipertrofia Muscular";
    } else if (keywords.includes("perda") && (keywords.includes("peso") || keywords.includes("gordura"))) {
      mainObjective = "Perda de Peso";
    } else if (keywords.includes("resistência") || keywords.includes("cardio") || keywords.includes("endurance")) {
      mainObjective = "Resistência Cardiovascular";
    }

    // Detectar duração total
    const weekMatches = content.match(/(\d+)\s*semanas?/gi);
    const monthMatches = content.match(/(\d+)\s*meses?/gi);
    
    let totalWeeks = 12; // padrão
    if (weekMatches) {
      totalWeeks = Math.max(...weekMatches.map(m => parseInt(m.match(/\d+/)?.[0] || "0")));
    } else if (monthMatches) {
      const months = Math.max(...monthMatches.map(m => parseInt(m.match(/\d+/)?.[0] || "0")));
      totalWeeks = months * 4;
    }

    // Gerar fases específicas
    const phases = this.generatePhasesFromAnalysis(content, totalWeeks, mainObjective);
    const muscleGroupPriority = this.extractMuscleGroupPriority(content);
    const trainingFrequency = this.extractTrainingFrequency(content);

    return {
      id: `analysis_${userId}_${Date.now()}`,
      totalWeeks,
      mainObjective,
      phases,
      muscleGroupPriority,
      trainingFrequency,
      analysisDate: new Date().toISOString(),
      confidence: this.calculateConfidenceScore(content),
      userId
    };
  }

  private generatePhasesFromAnalysis(content: string, totalWeeks: number, objective: string): PeriodizationPhase[] {
    const phases: PeriodizationPhase[] = [];
    const keywords = content.toLowerCase();

    console.log('Gerando fases baseadas no objetivo:', objective);

    if (objective.includes("Força")) {
      const adaptationWeeks = Math.ceil(totalWeeks * 0.25);
      const strengthWeeks = Math.ceil(totalWeeks * 0.5);
      const peakWeeks = totalWeeks - adaptationWeeks - strengthWeeks;

      phases.push(
        {
          name: "Adaptação Anatômica",
          duration: adaptationWeeks,
          objective: "Preparação muscular e técnica",
          priority: "alta",
          intensity: "baixa",
          focus: ["Técnica", "Volume Base", "Adaptação Articular"]
        },
        {
          name: "Desenvolvimento de Força",
          duration: strengthWeeks,
          objective: "Ganho de força máxima",
          priority: "alta",
          intensity: "alta",
          focus: ["Força Máxima", "Cargas Pesadas", "Técnica Avançada"]
        },
        {
          name: "Realização",
          duration: peakWeeks,
          objective: "Expressão da força desenvolvida",
          priority: "media",
          intensity: "moderada",
          focus: ["Potência", "Técnica Refinada", "Manutenção"]
        }
      );
    } else if (objective.includes("Hipertrofia")) {
      const prepWeeks = Math.ceil(totalWeeks * 0.2);
      const hypertrophyWeeks = Math.ceil(totalWeeks * 0.6);
      const definitionWeeks = totalWeeks - prepWeeks - hypertrophyWeeks;

      phases.push(
        {
          name: "Preparação",
          duration: prepWeeks,
          objective: "Condicionamento base",
          priority: "media",
          intensity: "baixa",
          focus: ["Volume Progressivo", "Técnica", "Adaptação"]
        },
        {
          name: "Hipertrofia Intensiva",
          duration: hypertrophyWeeks,
          objective: "Máximo crescimento muscular",
          priority: "alta",
          intensity: "alta",
          focus: ["Alto Volume", "Tensão Mecânica", "Tempo Sob Tensão"]
        },
        {
          name: "Definição",
          duration: definitionWeeks,
          objective: "Refinamento e definição",
          priority: "media",
          intensity: "moderada",
          focus: ["Definição Muscular", "Cardio Moderado", "Manutenção"]
        }
      );
    } else if (objective.includes("Perda")) {
      const baseWeeks = Math.ceil(totalWeeks * 0.3);
      const intensiveWeeks = Math.ceil(totalWeeks * 0.5);
      const maintenanceWeeks = totalWeeks - baseWeeks - intensiveWeeks;

      phases.push(
        {
          name: "Base Metabólica",
          duration: baseWeeks,
          objective: "Preparação metabólica",
          priority: "alta",
          intensity: "baixa",
          focus: ["Cardio Base", "Força Funcional", "Hábitos"]
        },
        {
          name: "Queima Intensiva",
          duration: intensiveWeeks,
          objective: "Máxima queima calórica",
          priority: "alta",
          intensity: "alta",
          focus: ["HIIT", "Circuitos", "Alta Intensidade"]
        },
        {
          name: "Manutenção",
          duration: maintenanceWeeks,
          objective: "Consolidação dos resultados",
          priority: "media",
          intensity: "moderada",
          focus: ["Estabilidade", "Manutenção", "Lifestyle"]
        }
      );
    } else {
      // Periodização genérica
      const phaseLength = Math.ceil(totalWeeks / 3);
      phases.push(
        {
          name: "Adaptação",
          duration: phaseLength,
          objective: "Condicionamento inicial",
          priority: "alta",
          intensity: "baixa",
          focus: ["Resistência Base", "Técnica", "Movimento"]
        },
        {
          name: "Desenvolvimento",
          duration: phaseLength,
          objective: "Progressão sistemática",
          priority: "alta",
          intensity: "moderada",
          focus: ["Força-Resistência", "Capacidade", "Progressão"]
        },
        {
          name: "Especialização",
          duration: totalWeeks - (phaseLength * 2),
          objective: "Alta performance",
          priority: "media",
          intensity: "alta",
          focus: ["Especificidade", "Potência", "Performance"]
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
    console.log('Gerando recomendações de modelos para usuário:', analysis.userId);
    
    const recommendations: RecommendedWorkoutModel[] = [];
    
    try {
      // Para cada fase, gerar múltiplas recomendações
      for (const phase of analysis.phases) {
        const phaseRecommendations = await this.generatePhaseRecommendations(phase, analysis);
        recommendations.push(...phaseRecommendations);
      }
      
      // Salvar modelos únicos para o usuário
      this.saveUserWorkoutModels(recommendations, analysis.userId);
      
      return recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      throw new Error('Falha ao gerar modelos de treino');
    }
  }

  private async generatePhaseRecommendations(
    phase: PeriodizationPhase, 
    analysis: PeriodizationAnalysis
  ): Promise<RecommendedWorkoutModel[]> {
    
    const recommendations: RecommendedWorkoutModel[] = [];
    
    // Mapear objetivos para categorias de treino
    const objectiveToCategory = this.mapObjectiveToCategory(phase);
    
    // Gerar variações de intensidade para cada fase
    const intensityVariations = [
      { level: "baixa" as const, duration: 30, suffix: "Suave" },
      { level: "moderada" as const, duration: 45, suffix: "Moderado" }, 
      { level: "alta" as const, duration: 60, suffix: "Intenso" }
    ];

    for (const variation of intensityVariations) {
      const recommendation = this.createUniqueRecommendation(
        phase, 
        analysis, 
        objectiveToCategory,
        variation
      );
      
      recommendations.push(recommendation);
    }

    return recommendations;
  }

  private mapObjectiveToCategory(phase: PeriodizationPhase): string {
    const phaseName = phase.name.toLowerCase();
    const objective = phase.objective.toLowerCase();
    
    if (phaseName.includes("força") || objective.includes("força")) {
      return "forca";
    } else if (phaseName.includes("hipertrofia") || objective.includes("crescimento")) {
      return "hipertrofia";
    } else if (phaseName.includes("queima") || objective.includes("perda")) {
      return "perda-peso";
    } else if (phaseName.includes("condicionamento") || objective.includes("resistência")) {
      return "condicionamento";
    } else {
      return "mobilidade";
    }
  }

  private createUniqueRecommendation(
    phase: PeriodizationPhase,
    analysis: PeriodizationAnalysis, 
    category: string,
    variation: {level: 'baixa' | 'moderada' | 'alta', duration: number, suffix: string}
  ): RecommendedWorkoutModel {
    
    const uniqueId = `model_${analysis.userId}_${phase.name.replace(/\s+/g, '_')}_${variation.level}_${Date.now()}`;
    
    return {
      id: uniqueId,
      name: `${phase.name} ${variation.suffix}`,
      description: `${phase.objective} com foco em ${phase.focus.slice(0, 2).join(" e ").toLowerCase()}`,
      phase: phase.name,
      duration: variation.duration,
      targetPSE: this.calculateTargetPSE(phase.intensity, variation.level),
      muscleGroups: this.selectMuscleGroupsForPhase(phase, analysis),
      exercises: [], // Seriam gerados pelo workoutGenerationService
      recommendationScore: this.calculateUniqueRecommendationScore(phase, variation),
      aiReasoning: this.generatePersonalizedReasoning(phase, variation, analysis),
      periodizationPhase: phase.name,
      userId: analysis.userId,
      category: category,
      createdAt: new Date().toISOString()
    };
  }

  private calculateTargetPSE(phaseIntensity: string, workoutIntensity: string): number {
    const baseMap = {
      "baixa": 4,
      "moderada": 6, 
      "alta": 8
    };
    
    let pse = baseMap[phaseIntensity as keyof typeof baseMap] || 6;
    
    if (workoutIntensity === "alta") pse += 1;
    if (workoutIntensity === "baixa") pse -= 1;
    
    return Math.min(Math.max(pse, 3), 9);
  }

  private selectMuscleGroupsForPhase(phase: PeriodizationPhase, analysis: PeriodizationAnalysis): string[] {
    let muscleGroups = [...analysis.muscleGroupPriority];
    
    // Especializar baseado no foco da fase
    const focus = phase.focus.join(" ").toLowerCase();
    
    if (focus.includes("superior") || focus.includes("braço")) {
      muscleGroups = ["Peitoral", "Dorsais", "Deltoide", "Bíceps", "Tríceps"];
    } else if (focus.includes("inferior") || focus.includes("perna")) {
      muscleGroups = ["Quadríceps", "Isquiotibiais", "Glúteos", "Panturrilha"];
    } else if (focus.includes("core") || focus.includes("abdômen")) {
      muscleGroups = ["Abdômen", "Core", "Lombar"];
    }
    
    return muscleGroups.slice(0, 4);
  }

  private calculateUniqueRecommendationScore(
    phase: PeriodizationPhase, 
    variation: {level: string, duration: number}
  ): number {
    let score = 70; // base mais alta
    
    // Compatibilidade de intensidade
    if (phase.intensity === variation.level) {
      score += 20;
    } else if (Math.abs(["baixa", "moderada", "alta"].indexOf(phase.intensity) - 
                       ["baixa", "moderada", "alta"].indexOf(variation.level)) === 1) {
      score += 10;
    }
    
    // Boost para fases de alta prioridade
    if (phase.priority === "alta") {
      score += 8;
    }
    
    return Math.min(score, 98);
  }

  private generatePersonalizedReasoning(
    phase: PeriodizationPhase, 
    variation: {level: string, suffix: string}, 
    analysis: PeriodizationAnalysis
  ): string {
    
    const reasoningTemplates = {
      "baixa": `Perfeito para ${phase.name} pois permite adaptação gradual focando em ${phase.focus[0]?.toLowerCase()}. Ideal para usuários que buscam ${analysis.mainObjective.toLowerCase()}.`,
      "moderada": `Equilíbrio ideal para ${phase.name}, combinando ${phase.focus.slice(0,2).join(" e ").toLowerCase()}. Compatível com seu objetivo de ${analysis.mainObjective.toLowerCase()}.`,
      "alta": `Intensidade máxima para ${phase.name}, focando em ${phase.focus[0]?.toLowerCase()}. Necessário para alcançar resultados em ${analysis.mainObjective.toLowerCase()}.`
    };

    return reasoningTemplates[variation.level as keyof typeof reasoningTemplates] || 
           `Modelo personalizado para ${phase.name} baseado na sua periodização.`;
  }

  private saveUserWorkoutModels(models: RecommendedWorkoutModel[], userId: string): void {
    try {
      // Salvar modelos específicos do usuário
      const userModelsKey = `userWorkoutModels_${userId}`;
      const existingUserModels = JSON.parse(localStorage.getItem(userModelsKey) || "[]");
      
      // Adicionar novos modelos únicos
      const newModels = models.filter(model => 
        !existingUserModels.some((existing: RecommendedWorkoutModel) => existing.id === model.id)
      );
      
      const updatedUserModels = [...existingUserModels, ...newModels];
      localStorage.setItem(userModelsKey, JSON.stringify(updatedUserModels));
      
      // Também salvar no banco geral de modelos
      this.saveToModelDatabase(newModels);
      
      console.log(`Salvos ${newModels.length} modelos únicos para usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao salvar modelos do usuário:', error);
    }
  }

  private saveToModelDatabase(models: RecommendedWorkoutModel[]): void {
    try {
      const modelDatabase = JSON.parse(localStorage.getItem("workoutModelsDatabase") || "[]");
      const updatedDatabase = [...modelDatabase, ...models];
      localStorage.setItem("workoutModelsDatabase", JSON.stringify(updatedDatabase));
    } catch (error) {
      console.error('Erro ao salvar no banco de modelos:', error);
    }
  }

  // Métodos utilitários mantidos do código original
  private extractMuscleGroupPriority(content: string): string[] {
    const keywords = content.toLowerCase();
    const muscleGroups = [];

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
    
    const keywords = content.toLowerCase();
    if (keywords.includes("iniciante")) return 3;
    if (keywords.includes("avançado")) return 5;
    return 4;
  }

  private calculateConfidenceScore(content: string): number {
    let score = 50;
    
    if (content.length > 500) score += 20;
    if (content.includes("semana")) score += 10;
    if (content.includes("fase")) score += 15;
    if (content.match(/\d+/g)?.length > 5) score += 10;
    
    return Math.min(score, 95);
  }

  // Métodos para acessar o banco de modelos
  getUserWorkoutModels(userId: string): RecommendedWorkoutModel[] {
    try {
      const userModelsKey = `userWorkoutModels_${userId}`;
      return JSON.parse(localStorage.getItem(userModelsKey) || "[]");
    } catch (error) {
      console.error('Erro ao carregar modelos do usuário:', error);
      return [];
    }
  }

  getAllWorkoutModels(): RecommendedWorkoutModel[] {
    try {
      return JSON.parse(localStorage.getItem("workoutModelsDatabase") || "[]");
    } catch (error) {
      console.error('Erro ao carregar banco de modelos:', error);
      return [];
    }
  }

  getModelsByCategory(category: string): RecommendedWorkoutModel[] {
    try {
      const allModels = this.getAllWorkoutModels();
      return allModels.filter(model => model.category === category);
    } catch (error) {
      console.error('Erro ao filtrar modelos por categoria:', error);
      return [];
    }
  }
}

export const periodizationAnalysisService = new PeriodizationAnalysisService();
