
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Send, 
  Sparkles, 
  MessageCircle,
  Lightbulb,
  Heart,
  Zap
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'suggestion' | 'motivation' | 'analysis';
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Olá! 👋 Sou seu Personal Trainer IA. Estou aqui para te ajudar com treinos, técnicas, motivação e análise de performance. Como posso te ajudar hoje?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'motivation'
    },
    {
      id: 2,
      text: "Vi que você registrou PSE 8 no último treino. Excelente intensidade! Que tal um treino mais leve hoje para otimizar a recuperação?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'analysis'
    }
  ]);
  const [inputText, setInputText] = useState("");

  const quickQuestions = [
    "Como melhorar minha técnica?",
    "Qual treino fazer hoje?",
    "Dicas de recuperação",
    "Analisar meu desempenho"
  ];

  const aiResponses = [
    "Baseado no seu histórico, sugiro focar na técnica hoje. Mantenha PSE entre 6-7 e priorize a execução perfeita dos movimentos. 💪",
    "Sua carga interna está equilibrada! Continue assim. Para hoje, que tal trabalharmos core e flexibilidade? 🧘‍♂️",
    "Percebi que você tem consistência incrível! Treinou 4x esta semana. Vamos ajustar a intensidade para otimizar os resultados. 📈",
    "Excelente pergunta! Para melhorar a técnica, recomendo: 1) Reduzir carga e focar no movimento, 2) Gravar-se fazendo o exercício, 3) Treinar em frente ao espelho. 🎯"
  ];

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: 'ai',
        timestamp: new Date(),
        type: Math.random() > 0.5 ? 'suggestion' : 'analysis'
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInputText("");
  };

  const sendQuickQuestion = (question: string) => {
    setInputText(question);
    sendMessage();
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-yellow-400" />;
      case 'motivation':
        return <Heart className="h-4 w-4 text-red-400" />;
      case 'analysis':
        return <Zap className="h-4 w-4 text-blue-400" />;
      default:
        return <Brain className="h-4 w-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Chat Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Personal Trainer IA</CardTitle>
              <CardDescription className="text-gray-400">
                Seu coach inteligente 24/7 • Online agora
              </CardDescription>
            </div>
            <Badge className="ml-auto bg-green-500/20 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Online
            </Badge>
          </div>
        </CardHeader>
      </Card>

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
                    className={`flex max-w-[80%] ${
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
                        <p className="text-sm leading-relaxed">{message.text}</p>
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

      {/* Quick Questions */}
      <Card className="bg-black/30 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Perguntas Rápidas</CardTitle>
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
              placeholder="Digite sua pergunta sobre treino, técnica, nutrição..."
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChat;
