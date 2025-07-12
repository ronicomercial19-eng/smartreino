
export interface AISettings {
  chatbotEnabled: boolean;
  workoutGenerationEnabled: boolean;
  contextualAnalysisEnabled: boolean;
  motivationalMessagesEnabled: boolean;
  intensityPreference: number;
  responseStyle: 'formal' | 'casual' | 'motivacional';
  workoutComplexity: 'simples' | 'intermediario' | 'avancado';
  analysisFrequency: 'baixa' | 'moderada' | 'alta';
}

class AIConfigService {
  private static readonly STORAGE_KEY = 'ai-settings';
  
  // Configurações padrão
  private static readonly DEFAULT_SETTINGS: AISettings = {
    chatbotEnabled: true,
    workoutGenerationEnabled: true,
    contextualAnalysisEnabled: true,
    motivationalMessagesEnabled: true,
    intensityPreference: 6,
    responseStyle: 'motivacional',
    workoutComplexity: 'intermediario',
    analysisFrequency: 'moderada'
  };

  // Obter as configurações atuais
  static getSettings(): AISettings {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge com defaults para garantir que todas as propriedades existam
        return { ...this.DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Erro ao carregar configurações de IA:', error);
    }
    return this.DEFAULT_SETTINGS;
  }

  // Salvar configurações
  static saveSettings(settings: AISettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações de IA:', error);
    }
  }

  // Obter configuração específica
  static getSetting<K extends keyof AISettings>(key: K): AISettings[K] {
    const settings = this.getSettings();
    return settings[key];
  }

  // Atualizar configuração específica
  static updateSetting<K extends keyof AISettings>(key: K, value: AISettings[K]): void {
    const settings = this.getSettings();
    settings[key] = value;
    this.saveSettings(settings);
  }

  // Verificar se uma funcionalidade está habilitada
  static isFeatureEnabled(feature: 'chatbot' | 'workout-generation' | 'contextual-analysis' | 'motivational'): boolean {
    const settings = this.getSettings();
    switch (feature) {
      case 'chatbot':
        return settings.chatbotEnabled;
      case 'workout-generation':
        return settings.workoutGenerationEnabled;
      case 'contextual-analysis':
        return settings.contextualAnalysisEnabled;
      case 'motivational':
        return settings.motivationalMessagesEnabled;
      default:
        return true;
    }
  }

  // Obter configurações para o estilo de resposta da IA
  static getResponseConfig() {
    const settings = this.getSettings();
    return {
      style: settings.responseStyle,
      intensity: settings.intensityPreference,
      complexity: settings.workoutComplexity,
      analysisFreq: settings.analysisFrequency
    };
  }

  // Aplicar configurações aos serviços de IA
  static applySettingsToPrompt(basePrompt: string): string {
    const config = this.getResponseConfig();
    
    let styleInstruction = '';
    switch (config.style) {
      case 'formal':
        styleInstruction = 'Responda de forma técnica e profissional, usando terminologia fitness adequada.';
        break;
      case 'casual':
        styleInstruction = 'Responda de forma amigável e descontraída, como um amigo experiente.';
        break;
      case 'motivacional':
        styleInstruction = 'Responda de forma energética e motivadora, sempre incentivando o usuário.';
        break;
    }

    const complexityInstruction = config.complexity === 'simples' 
      ? 'Mantenha as explicações simples e diretas.' 
      : config.complexity === 'avancado'
      ? 'Forneça detalhes técnicos e explicações aprofundadas.'
      : 'Balance simplicidade com informações úteis.';

    return `${basePrompt}\n\nInstruções de estilo: ${styleInstruction} ${complexityInstruction}\nNível de intensidade preferido: ${config.intensity}/10`;
  }

  // Resetar para configurações padrão
  static resetToDefaults(): void {
    this.saveSettings(this.DEFAULT_SETTINGS);
  }
}

export { AIConfigService };
