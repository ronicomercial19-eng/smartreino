
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/Navigation";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Olá! Sou sua assistente de treino com IA. Posso responder perguntas sobre saúde, treino, musculação, bem-estar, alongamento, alimentação, recuperação, performance, força, emagrecimento, descanso, frequência, resistência, fitness e wellness. Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");

  // Base de conhecimento para respostas automáticas
  const knowledgeBase = {
    saude: "Para manter uma boa saúde, é importante combinar exercícios regulares, alimentação balanceada e descanso adequado. O método 10X ajuda a melhorar sua condição física geral.",
    treino: "O treino deve ser consistente e progressivo. No método 10X, focamos em alta intensidade com volume moderado para máximos resultados.",
    musculacao: "A musculação é excelente para ganho de força e massa muscular. Combine exercícios compostos com isolados para melhores resultados.",
    "bem-estar": "O bem-estar físico e mental andam juntos. Exercícios regulares liberam endorfinas e melhoram o humor além da forma física.",
    alongamento: "O alongamento é fundamental para flexibilidade e recuperação. Faça alongamentos dinâmicos no aquecimento e estáticos no final do treino.",
    alimentacao: "Uma alimentação equilibrada com proteínas adequadas, carboidratos complexos e gorduras boas é essencial para o desempenho e recuperação.",
    recuperacao: "A recuperação é quando seus músculos crescem. Durma 7-9 horas por noite e respeite os dias de descanso entre treinos intensos.",
    performance: "Para melhorar a performance, foque na progressão gradual, técnica correta e periodização do treino.",
    forca: "O ganho de força vem com treinos progressivos, boa alimentação e descanso adequado. O método 10X é excelente para este objetivo.",
    emagrecimento: "Para emagrecer, combine treinos intensos com déficit calórico controlado. O método 10X acelera o metabolismo.",
    descanso: "O descanso ativo e passivo são importantes. Varie entre dias de treino intenso e atividades leves como caminhada.",
    frequencia: "A frequência ideal varia por pessoa, mas 3-5 treinos semanais costumam ser eficazes para a maioria dos objetivos.",
    resistencia: "Para melhorar resistência, inclua exercícios cardiovasculares e treinos em circuito como o método 10X.",
    fitness: "Fitness é um estilo de vida. Seja consistente, varie os exercícios e mantenha-se motivado com metas realistas.",
    wellness: "Wellness engloba saúde física, mental e emocional. Cuide de todos os aspectos para uma vida plena e saudável."
  };

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Verificar se contém palavras-chave relacionadas ao fitness
    const fitnessKeywords = Object.keys(knowledgeBase);
    const matchedKeyword = fitnessKeywords.find(keyword => 
      message.includes(keyword.toLowerCase())
    );
    
    if (matchedKeyword) {
      return knowledgeBase[matchedKeyword as keyof typeof knowledgeBase];
    }
    
    // Respostas contextuais baseadas em padrões
    if (message.includes("como") && message.includes("treinar")) {
      return "Para treinar efetivamente, comece com aquecimento, execute os exercícios com boa técnica, mantenha intensidade adequada e termine com alongamento. O método 10X é perfeito para otimizar seus resultados!";
    }
    
    if (message.includes("quantas") && (message.includes("vezes") || message.includes("dias"))) {
      return "Recomendo treinar 3-5 vezes por semana, dependendo do seu nível e objetivos. Deixe pelo menos um dia de descanso entre treinos intensos.";
    }
    
    if (message.includes("dor") || message.includes("lesao")) {
      return "Se você sente dor durante ou após o treino, é importante parar e consultar um profissional de saúde. Dor muscular leve pós-treino é normal, mas dor aguda não.";
    }
    
    if (message.includes("dieta") || message.includes("comer")) {
      return "Uma dieta balanceada com proteínas (1,6-2g por kg de peso), carboidratos complexos e gorduras boas é fundamental. Hidrate-se bem e coma de 3-6 refeições por dia.";
    }
    
    // Resposta padrão para perguntas fora do escopo
    return "Desculpe, posso responder apenas perguntas sobre treino, saúde e bem-estar. Tente perguntar sobre exercícios, alimentação, recuperação ou performance!";
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now(),
      text: currentMessage,
      isUser: true,
      timestamp: new Date(),
    };

    // Gerar resposta da IA
    const aiResponse: Message = {
      id: Date.now() + 1,
      text: generateAIResponse(currentMessage),
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, aiResponse]);
    setCurrentMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Chat com IA - Assistente de Treino
          </h1>
          <p className="text-gray-600">
            Tire suas dúvidas sobre treino, saúde e bem-estar
          </p>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg text-blue-600">
              Assistente Virtual de Fitness
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                        message.isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isUser ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Digite sua pergunta sobre treino, saúde ou bem-estar..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Enviar
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Dica: Pergunte sobre exercícios, alimentação, recuperação, frequência de treino, etc.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIChat;
