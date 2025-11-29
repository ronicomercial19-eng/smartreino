/**
 * Chat IA para Modificação de Treinos
 * Permite ajustes em tempo real usando comandos em linguagem natural
 */

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! 👋 Sou seu assistente IA de treinos. Posso ajudar você a modificar este treino. Exemplos:\n\n• 'Aumentar carga do agachamento em 5kg'\n• 'Adicionar abdominais no dia 1'\n• 'Reduzir descanso para 60s'\n• 'Trocar supino por flexão'",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("modify-workout", {
        body: {
          workoutPlanId,
          currentPlan,
          userCommand: input
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.updatedPlan) {
        setHasChanges(true);
        // Store temporarily - user must click "Aplicar" to save
        sessionStorage.setItem(`workout_changes_${workoutPlanId}`, JSON.stringify(data.updatedPlan));
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ Erro ao processar: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyChanges = () => {
    const changes = sessionStorage.getItem(`workout_changes_${workoutPlanId}`);
    if (changes) {
      onPlanUpdated(JSON.parse(changes));
      sessionStorage.removeItem(`workout_changes_${workoutPlanId}`);
      setHasChanges(false);
      
      const confirmMessage: Message = {
        role: "assistant",
        content: "✅ Alterações aplicadas com sucesso!",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, confirmMessage]);
    }
  };

  return (
    <Card className="glass border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Chat IA - Modificar Treino
          </CardTitle>
          {hasChanges && (
            <Badge className="bg-primary/20 text-primary border-primary/50 animate-pulse">
              Alterações Pendentes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea ref={scrollRef} className="h-[300px] rounded-lg border border-border/50 p-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
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
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            {hasChanges && (
              <Button
                onClick={applyChanges}
                variant="default"
                size="icon"
                className="bg-green-500 hover:bg-green-600"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {hasChanges && (
          <p className="text-xs text-muted-foreground text-center">
            ✨ Clique no botão verde para aplicar as alterações sugeridas
          </p>
        )}
      </CardContent>
    </Card>
  );
}
