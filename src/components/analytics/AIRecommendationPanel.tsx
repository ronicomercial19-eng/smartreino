/**
 * Painel de Recomendações IA
 * Analisa métricas e sugere ajustes no treino
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AIRecommendationPanelProps {
  studentId: string;
  studentData: any;
  onApplyRecommendations?: () => void;
}

interface Recommendation {
  type: "warning" | "suggestion" | "success";
  title: string;
  description: string;
  action?: string;
}

export function AIRecommendationPanel({
  studentId,
  studentData,
  onApplyRecommendations
}: AIRecommendationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-recommendations", {
        body: {
          studentId,
          studentData
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      toast({
        title: "Recomendações Geradas!",
        description: "A IA analisou os dados e gerou sugestões personalizadas."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar recomendações",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const applyRecommendations = () => {
    if (onApplyRecommendations) {
      onApplyRecommendations();
      toast({
        title: "Recomendações Aplicadas!",
        description: "O treino foi atualizado com base nas sugestões da IA."
      });
    }
  };

  const getIcon = (type: Recommendation["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-4 w-4" />;
      case "suggestion":
        return <TrendingUp className="h-4 w-4" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (type: Recommendation["type"]) => {
    switch (type) {
      case "warning":
        return "destructive";
      case "suggestion":
        return "default";
      case "success":
        return "outline";
    }
  };

  return (
    <Card className="glass border-primary/30 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recomendações IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              Gere recomendações personalizadas baseadas nas métricas do aluno
            </p>
            <Button
              onClick={generateRecommendations}
              disabled={isGenerating}
              className="btn-glow"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Recomendações com IA
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border/50 bg-card space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <Badge variant={getBadgeVariant(rec.type)} className="mt-0.5">
                      {getIcon(rec.type)}
                    </Badge>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-sm">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      {rec.action && (
                        <p className="text-xs text-primary font-medium">💡 {rec.action}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={applyRecommendations}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aplicar Sugestões
              </Button>
              <Button
                onClick={generateRecommendations}
                variant="outline"
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
