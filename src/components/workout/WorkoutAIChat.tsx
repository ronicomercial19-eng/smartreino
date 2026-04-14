/**
 * Chat IA para Modificação de Treinos
 * Aplica mudanças em tempo real sem necessidade de confirmação manual
 */

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface WorkoutAIChatProps {
  workoutPlanId: string;
  currentPlan: any;
  onPlanUpdated: (updatedPlan: any) => void;
}

export function WorkoutAIChat({ workoutPlanId, currentPlan, onPlanUpdated }: WorkoutAIChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! 👋 Sou seu assistente IA de treinos. Posso ajudar você a modificar este treino em tempo real. Exemplos:\n\n• **Aumentar carga** do agachamento em 5kg\n• **Adicionar abdominais** no dia 1\n• **Reduzir descanso** para 60s\n• **Trocar supino** por flexão\n• **Aplicar Drop Set** no supino",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    const userCommand = input;
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("modify-workout", {
        body: { workoutPlanId, currentPlan, userCommand }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "Modificação processada com sucesso!",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.updatedPlan) {
        onPlanUpdated(data.updatedPlan);
        toast({ title: "✅ Treino atualizado", description: "As modificações foram aplicadas em tempo real." });
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}. Tente novamente.`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          Chat IA — Modificar Treino
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea ref={scrollRef} className="h-[280px] rounded-lg border border-border/50 p-3">
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <span className="text-xs opacity-70 mt-1 block">{msg.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Aplicando modificação...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite seu comando... Ex: 'Aumentar carga do supino em 10kg'"
            className="min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon" className="h-auto">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
