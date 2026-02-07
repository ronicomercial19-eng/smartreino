/**
 * StudentAICoach - Chat IA Coach para o aluno
 * Perguntas rápidas pré-definidas e chat livre
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageCircle, Send, Bot, User, Zap, 
  AlertTriangle, RefreshCw, Dumbbell 
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StudentAICoachProps {
  alunoNome: string;
  alunoObjetivo: string;
  planoAtivo: any;
}

const QUICK_QUESTIONS = [
  { icon: '🔄', text: 'Qual exercício substitui supino reto?' },
  { icon: '🤕', text: 'Estou com dor no ombro, o que fazer?' },
  { icon: '📈', text: 'Como aumentar minha carga progressivamente?' },
  { icon: '🍽️', text: 'O que comer antes do treino?' },
  { icon: '😴', text: 'Quanto tempo de descanso entre os treinos?' },
  { icon: '💪', text: 'Dicas para melhorar minha execução' },
];

export function StudentAICoach({ alunoNome, alunoObjetivo, planoAtivo }: StudentAICoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Olá ${alunoNome}! 👋 Sou seu Coach IA do SmartReino. Posso te ajudar com dúvidas sobre exercícios, substituições, dores, nutrição pré/pós treino e muito mais. Como posso te ajudar hoje?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = planoAtivo 
        ? `O aluno ${alunoNome} tem objetivo de ${alunoObjetivo}. Plano ativo: ${JSON.stringify(planoAtivo).substring(0, 500)}`
        : `O aluno ${alunoNome} tem objetivo de ${alunoObjetivo}. Sem plano ativo no momento.`;

      const { data, error } = await supabase.functions.invoke('modify-workout', {
        body: {
          command: text.trim(),
          currentWorkout: planoAtivo || {},
          context: context,
          mode: 'coach_chat',
        }
      });

      if (error) throw error;

      const assistantContent = data?.response || data?.message || data?.suggestion || 
        'Desculpe, não consegui processar sua pergunta. Tente reformular!';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Erro no chat IA:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Ops! Tive um problema ao processar sua pergunta. Tente novamente em alguns segundos. 🔄',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Perguntas rápidas */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground font-medium">⚡ Perguntas Rápidas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {QUICK_QUESTIONS.map((q, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="justify-start text-left h-auto py-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              onClick={() => sendMessage(q.text)}
              disabled={isLoading}
            >
              <span className="mr-2">{q.icon}</span>
              <span className="text-xs">{q.text}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <Card className="glass border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            Chat com IA Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] px-4" ref={scrollRef}>
            <div className="space-y-4 py-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    }`}>
                      {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <form 
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte algo ao seu Coach IA..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
