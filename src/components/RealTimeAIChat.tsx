/**
 * RealTimeAIChat — Chat IA com streaming em tempo real
 * Usa Lovable AI Gateway via edge function ai-coach-chat
 */

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Brain, Send, Bot, User, Sparkles, Zap,
  Dumbbell, Apple, TrendingUp, RefreshCw, AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RealTimeAIChatProps {
  athleteId?: string;
  athleteName?: string;
  className?: string;
}

const QUICK_PROMPTS = [
  { icon: <Dumbbell className="h-3.5 w-3.5" />, text: "Monte um treino completo para hoje", color: "text-primary" },
  { icon: <TrendingUp className="h-3.5 w-3.5" />, text: "Como posso melhorar meu progresso?", color: "text-green-500" },
  { icon: <RefreshCw className="h-3.5 w-3.5" />, text: "Substitua supino reto por alternativa", color: "text-blue-500" },
  { icon: <Apple className="h-3.5 w-3.5" />, text: "O que comer antes e depois do treino?", color: "text-orange-500" },
  { icon: <AlertTriangle className="h-3.5 w-3.5" />, text: "Estou com dor no ombro, adapte meu treino", color: "text-yellow-500" },
  { icon: <Zap className="h-3.5 w-3.5" />, text: "Aplique técnicas de intensidade no treino de peito", color: "text-purple-500" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach-chat`;

export default function RealTimeAIChat({ athleteId, athleteName, className }: RealTimeAIChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = useCallback(async (allMessages: Message[]) => {
    const controller = new AbortController();
    abortRef.current = controller;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast({ title: "Erro", description: "Sessão expirada. Faça login novamente.", variant: "destructive" });
      return;
    }

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        messages: allMessages.map(m => ({ role: m.role, content: m.content })),
        athleteId,
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
      if (resp.status === 429) {
        toast({ title: "Limite atingido", description: "Muitas requisições. Aguarde alguns segundos.", variant: "destructive" });
      } else if (resp.status === 402) {
        toast({ title: "Créditos esgotados", description: "Adicione créditos de IA no workspace.", variant: "destructive" });
      } else {
        toast({ title: "Erro", description: err.error || "Falha na comunicação com a IA.", variant: "destructive" });
      }
      throw new Error(err.error);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";
    let streamDone = false;

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      const snapshot = assistantSoFar;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snapshot } : m);
        }
        return [...prev, { role: "assistant", content: snapshot }];
      });
    };

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { streamDone = true; break; }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) upsertAssistant(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) upsertAssistant(content);
        } catch { /* ignore */ }
      }
    }
  }, [athleteId, toast]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isStreaming) return;

    const userMsg: Message = { role: "user", content: messageText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      await streamChat(newMessages);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error("Chat error:", e);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="bg-primary/20 p-2 rounded-full">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              Coach IA 9FIT
              <Badge variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Real-Time
              </Badge>
            </CardTitle>
            {athleteName && (
              <Badge variant="outline" className="text-xs">
                Aluno: {athleteName}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3">
            <p className="text-sm text-muted-foreground font-medium mb-3">⚡ Comece com uma sugestão:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2.5 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  onClick={() => sendMessage(q.text)}
                  disabled={isStreaming}
                >
                  <span className={`mr-2 ${q.color}`}>{q.icon}</span>
                  <span className="text-xs">{q.text}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <ScrollArea className="h-[450px] px-4" ref={scrollRef}>
            <div className="space-y-4 py-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[380px] text-center text-muted-foreground">
                  <Bot className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">Envie uma mensagem ou escolha uma sugestão acima para começar.</p>
                  <p className="text-xs mt-1 opacity-60">Respostas geradas em tempo real com IA</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-1">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre treinos, nutrição, progressão, substituições..."
                disabled={isStreaming}
                className="min-h-[50px] max-h-[120px] resize-none flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              {isStreaming ? (
                <Button type="button" size="icon" variant="destructive" onClick={stopStreaming} className="h-auto self-end">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" size="icon" disabled={!input.trim()} className="h-auto self-end">
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </form>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              🧠 IA em tempo real • Respostas adaptadas ao seu perfil e histórico
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
