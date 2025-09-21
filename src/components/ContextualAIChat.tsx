import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Send, 
  Sparkles, 
  Lightbulb,
  Heart,
  Zap,
  TrendingUp,
  AlertTriangle,
  Target,
  Play,
  FileText,
  Settings,
  BarChart3
} from "lucide-react";
import { useUserContext } from "@/hooks/useUserContext";
import { enhancedContextualAI, EnhancedAIResponse } from "@/services/enhancedContextualAI";
import { GeneratedWorkout } from "@/services/workoutGenerationService";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'suggestion' | 'motivation' | 'analysis' | 'warning' | 'workout';
  workout?: GeneratedWorkout;
  quickActions?: Array<{ label: string; action: string; icon: string; }>;
}

const ContextualAIChat = () => {
  const { userContext, loading } = useUserContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (userContext && !loading) {
      (async () => {
        const enhancedAnalysis = await enhancedContextualAI.analyzeUserAndGenerateRecommendations(userContext);

        const welcomeMessage: Message = {
          id: 1,
          text: `Olá, ${userContext.profile.name}! 👋\n\n${enhancedAnalysis.analysis.motivationalMessage}\n\n🧠 **Análise Inteligente Completa:**\n• Estado atual: ${getStateEmoji(enhancedAnalysis.analysis.userState)} ${enhancedAnalysis.analysis.userState}\n• Treinos esta semana: ${userContext.performanceMetrics.weeklyFrequency}\n• PSE médio: ${userContext.performanceMetrics.averagePSE.toFixed(1)}\n• Tendência: ${getTrendEmoji(userContext.performanceMetrics.progressTrend)} ${userContext.performanceMetrics.progressTrend}\n\n💡 **Insights Personalizados:**\n${enhancedAnalysis.insights.map(insight => `• ${insight}`).join('\n')}\n\n🎯 **Treino Sugerido Hoje:**\n${enhancedAnalysis.suggestedWorkout?.name} - ${enhancedAnalysis.suggestedWorkout?.duration}min\nPSE Alvo: ${enhancedAnalysis.suggestedWorkout?.targetPSE}/10`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'analysis',
          workout: enhancedAnalysis.suggestedWorkout,
          quickActions: enhancedAnalysis.quickActions
        };

        setMessages([welcomeMessage]);
      })();
    }
  }, [userContext, loading]);

  const getStateEmoji = (state: string) => {
    switch (state) {
      case 'motivated': return '🔥';
      case 'progressing': return '📈';
      case 'plateaued': return '⚖️';
      case 'struggling': return '💪';
      default: return '🎯';
    }
  };

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '⚖️';
      default: return '📊';
    }
  };

  const quickQuestions = [
    "Gerar treino personalizado",
    "Como está meu progresso?",
    "Preciso de motivação hoje",
    "Dicas de técnica e forma",
    "Orientação nutricional"
  ];

  const sendMessage = () => {
    if (!inputText.trim() || !userContext) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(async () => {
      const enhancedResponse = await enhancedContextualAI.generateEnhancedResponse(inputText, userContext);
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: enhancedResponse.text,
        sender: 'ai',
        timestamp: new Date(),
        type: enhancedResponse.type,
        workout: enhancedResponse.workoutSuggestion,
        quickActions: enhancedResponse.quickActions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);

    setInputText("");
  };

  const sendQuickQuestion = (question: string) => {
    setInputText(question);
    setTimeout(() => sendMessage(), 100);
  };

  const handleQuickAction = (action: string, workout?: GeneratedWorkout) => {
    // Handle quick action for workout
    
    const actionMessages: Record<string, string> = {
      'start_workout': `Iniciando treino: ${workout?.name}! 🚀`,
      'view_details': 'Abrindo detalhes completos do treino...',
      'generate_workout': 'Gerando novo treino personalizado...',
      'view_progress': 'Carregando análise detalhada de progresso...',
      'customize': 'Abrindo opções de personalização...'
    };

    if (actionMessages[action]) {
      const actionMessage: Message = {
        id: messages.length + 1,
        text: actionMessages[action],
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, actionMessage]);
    }
  };

  const getActionIcon = (iconString: string) => {
    const iconMap: Record<string, any> = {
      '▶️': Play,
      '📋': FileText,
      '⚙️': Settings,
      '🏋️‍♂️': Target,
      '📊': BarChart3
    };
    
    const IconComponent = iconMap[iconString] || Sparkles;
    return <IconComponent className="h-3 w-3" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Analisando seu perfil com IA avançada...</p>
        </div>
      </div>
    );
  }

  if (!userContext) {
    return (
      <Alert className="bg-red-500/10 border-red-500/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-white">
          Não foi possível carregar seus dados. Faça login para usar o chat contextual.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Chat Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white flex items-center">
                  Personal Trainer IA
                  <Badge className="ml-2 bg-green-500/20 text-green-400 text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Enhanced
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  IA Contextual Avançada • Análise em tempo real • {userContext.profile.name}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge className={`${getStateColor(userContext.performanceMetrics.progressTrend)}`}>
                {getTrendEmoji(userContext.performanceMetrics.progressTrend)} {userContext.performanceMetrics.progressTrend}
              </Badge>
              <span className="text-xs text-gray-400">
                PSE: {userContext.performanceMetrics.averagePSE.toFixed(1)} | {userContext.performanceMetrics.weeklyFrequency}x/semana
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Chat Messages */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10">
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[90%] ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    } items-start space-x-3`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={
                        message.sender === 'user' 
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs" 
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs"
                      }>
                        {message.sender === 'user' ? 'EU' : 'IA'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`space-y-2 ${message.sender === 'user' ? 'mr-3' : 'ml-3'}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-white/10 text-white border border-white/20'
                        }`}
                      >
                        {message.sender === 'ai' && message.type && (
                          <div className="flex items-center space-x-1 mb-2 opacity-70">
                            {getMessageIcon(message.type)}
                            <span className="text-xs capitalize">{message.type}</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                      </div>
                      
                      {/* Quick Actions */}
                      {message.quickActions && message.quickActions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {message.quickActions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickAction(action.action, message.workout)}
                              className="text-xs border-white/20 text-white hover:bg-white/10 h-7"
                            >
                              {getActionIcon(action.icon)}
                              <span className="ml-1">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      <p className={`text-xs text-gray-400 ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-3 ml-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                        IA
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/20">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Enhanced Quick Questions */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Perguntas Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendQuickQuestion(question)}
                className="border-white/20 text-white hover:bg-white/10 text-xs justify-start"
              >
                <Sparkles className="h-3 w-3 mr-2" />
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Message Input */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pergunte sobre treinos, progresso, técnica, nutrição ou motivação..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && !isTyping && sendMessage()}
              disabled={isTyping}
            />
            <Button
              onClick={sendMessage}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={!inputText.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            🧠 IA Enhanced: Análise de {userContext.performanceMetrics.totalWorkouts} treinos • 
            Geração inteligente de workouts • Insights personalizados em tempo real
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const getStateColor = (state: string) => {
  switch (state) {
    case 'improving': return 'bg-green-500/20 text-green-400';
    case 'stable': return 'bg-blue-500/20 text-blue-400';
    case 'declining': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

const getStateEmoji = (state: string) => {
  switch (state) {
    case 'motivated': return '🔥';
    case 'progressing': return '📈';
    case 'plateaued': return '⚖️';
    case 'struggling': return '💪';
    default: return '🎯';
  }
};

const getMessageIcon = (type?: string) => {
  switch (type) {
    case 'suggestion':
      return <Lightbulb className="h-4 w-4 text-yellow-400" />;
    case 'motivation':
      return <Heart className="h-4 w-4 text-red-400" />;
    case 'analysis':
      return <TrendingUp className="h-4 w-4 text-blue-400" />;
    case 'workout':
      return <Target className="h-4 w-4 text-green-400" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-orange-400" />;
    default:
      return <Brain className="h-4 w-4 text-purple-400" />;
  }
};

export default ContextualAIChat;
