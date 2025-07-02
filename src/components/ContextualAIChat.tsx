
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
  Target
} from "lucide-react";
import { useUserContext } from "@/hooks/useUserContext";
import { contextualAI, AIAnalysis } from "@/services/contextualAIService";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'suggestion' | 'motivation' | 'analysis' | 'warning';
  analysis?: AIAnalysis;
}

const ContextualAIChat = () => {
  const { userContext, loading } = useUserContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);

  // Inicializar chat com análise personalizada
  useEffect(() => {
    if (userContext && !loading) {
      const analysis = contextualAI.analyzeUser(userContext);
      setCurrentAnalysis(analysis);

      const welcomeMessage: Message = {
        id: 1,
        text: `Olá, ${userContext.profile.name}! 👋\n\n${analysis.motivationalMessage}\n\n✨ Análise do seu perfil:\n• Estado atual: ${getStateEmoji(analysis.userState)} ${analysis.userState}\n• Treinos esta semana: ${userContext.performanceMetrics.weeklyFrequency}\n• PSE médio: ${userContext.performanceMetrics.averagePSE.toFixed(1)}\n\n🎯 Sugestão para hoje:\n${analysis.nextWorkoutSuggestion}`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'analysis',
        analysis
      };

      setMessages([welcomeMessage]);
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

  const quickQuestions = [
    "Como está meu progresso?",
    "Que treino fazer hoje?",
    "Como melhorar meus resultados?",
    "Preciso ajustar minha intensidade?"
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

    // Gerar resposta contextual
    setTimeout(() => {
      const contextualResponse = contextualAI.generateContextualResponse(inputText, userContext);
      const newAnalysis = contextualAI.analyzeUser(userContext);
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: contextualResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: inputText.toLowerCase().includes('progresso') ? 'analysis' : 'suggestion',
        analysis: newAnalysis
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setCurrentAnalysis(newAnalysis);
    }, 1000);

    setInputText("");
  };

  const sendQuickQuestion = (question: string) => {
    setInputText(question);
    setTimeout(() => sendMessage(), 100);
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-yellow-400" />;
      case 'motivation':
        return <Heart className="h-4 w-4 text-red-400" />;
      case 'analysis':
        return <TrendingUp className="h-4 w-4 text-blue-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      default:
        return <Brain className="h-4 w-4 text-purple-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Analisando seu perfil...</p>
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
      {/* Chat Header com Status do Usuário */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Personal Trainer IA</CardTitle>
                <CardDescription className="text-gray-400">
                  Análise em tempo real • {userContext.profile.name}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge className={`${getStateColor(currentAnalysis?.userState || 'progressing')}`}>
                {getStateEmoji(currentAnalysis?.userState || 'progressing')} {currentAnalysis?.userState}
              </Badge>
              <span className="text-xs text-gray-400">
                PSE: {userContext.performanceMetrics.averagePSE.toFixed(1)}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alertas Contextuais */}
      {currentAnalysis?.warnings && currentAnalysis.warnings.length > 0 && (
        <Alert className="bg-orange-500/10 border-orange-500/20">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-white">
            {currentAnalysis.warnings[0]}
          </AlertDescription>
        </Alert>
      )}

      {/* Chat Messages */}
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
                    className={`flex max-w-[85%] ${
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
                    
                    <div className={`space-y-1 ${message.sender === 'user' ? 'mr-3' : 'ml-3'}`}>
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
                      <p className={`text-xs text-gray-400 ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Questions Contextuais */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Perguntas Personalizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendQuickQuestion(question)}
                className="border-white/20 text-white hover:bg-white/10 text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pergunte sobre seu treino, progresso ou objetivos..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              onClick={sendMessage}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={!inputText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            💡 IA contextual analisando: {userContext.performanceMetrics.totalWorkouts} treinos, 
            PSE médio {userContext.performanceMetrics.averagePSE.toFixed(1)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const getStateColor = (state: string) => {
  switch (state) {
    case 'motivated': return 'bg-green-500/20 text-green-400';
    case 'progressing': return 'bg-blue-500/20 text-blue-400';
    case 'plateaued': return 'bg-yellow-500/20 text-yellow-400';
    case 'struggling': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

export default ContextualAIChat;
