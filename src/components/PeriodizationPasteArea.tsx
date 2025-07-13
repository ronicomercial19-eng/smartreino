
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Copy, Trash2, FileText, Zap, Check } from "lucide-react";

interface PeriodizationPasteAreaProps {
  onPeriodizationData: (data: string) => void;
}

const PeriodizationPasteArea = ({ onPeriodizationData }: PeriodizationPasteAreaProps) => {
  const [pasteContent, setPasteContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    if (!pasteContent.trim()) {
      toast({
        title: "❌ Nenhum conteúdo",
        description: "Não há conteúdo para copiar.",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(pasteContent);
      setIsCopied(true);
      toast({
        title: "✅ Copiado!",
        description: "Conteúdo copiado para a área de transferência.",
      });
      
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast({
        title: "❌ Erro ao copiar",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive"
      });
    }
  };

  const handleClear = () => {
    setPasteContent("");
    toast({
      title: "🧹 Limpo!",
      description: "Área de texto limpa.",
    });
  };

  const handleAnalyze = () => {
    if (!pasteContent.trim()) {
      toast({
        title: "❌ Conteúdo vazio",
        description: "Cole a periodização antes de analisar.",
        variant: "destructive"
      });
      return;
    }

    onPeriodizationData(pasteContent);
    toast({
      title: "🚀 Analisando...",
      description: "Processando periodização com IA.",
    });
  };

  return (
    <Card className="bg-card border-border card-hover">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center space-x-3">
          <div className="w-1 h-8 bg-primary rounded-full"></div>
          <FileText className="h-6 w-6 text-primary" />
          <span>Importar Periodização Existente</span>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            IA Ready
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="📋 Cole aqui sua periodização completa...

📅 Exemplo de formato:
• Macrociclo: 16 semanas
• Mesociclo 1: Adaptação Anatômica (4 semanas)
  - Volume: Alto | Intensidade: Baixa
  - Foco: Técnica e resistência muscular
• Mesociclo 2: Hipertrofia (6 semanas)  
  - Volume: Muito Alto | Intensidade: Moderada
  - Foco: Crescimento muscular
• Mesociclo 3: Força (4 semanas)
  - Volume: Moderado | Intensidade: Alta
  - Foco: Força máxima
• Mesociclo 4: Potência (2 semanas)
  - Volume: Baixo | Intensidade: Muito Alta
  - Foco: Explosão e velocidade"
            className="min-h-[300px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none focus-ring rounded-lg"
          />
          <div className="absolute bottom-4 right-4 flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {pasteContent.length} caracteres
            </Badge>
            <Badge variant="outline" className="text-xs">
              {pasteContent.split('\n').filter(line => line.trim()).length} linhas
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="border-border hover:bg-muted"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className="border-border hover:bg-muted"
            >
              {isCopied ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {isCopied ? "Copiado!" : "Copiar"}
            </Button>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!pasteContent.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-glow"
          >
            <Zap className="h-4 w-4 mr-2" />
            Analisar com IA
          </Button>
        </div>

        {pasteContent.trim() && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-orange"></div>
                <span className="text-foreground font-medium">Pronto para análise</span>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-primary/20 text-primary">
                  {pasteContent.split('•').length - 1} seções detectadas
                </Badge>
                <Badge variant="outline" className="border-primary/30">
                  {Math.ceil(pasteContent.length / 100)} tokens aprox.
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-2">💡 Dicas para melhor análise:</p>
          <ul className="space-y-1 text-xs">
            <li>• Inclua informações sobre volume, intensidade e foco de cada fase</li>
            <li>• Mencione exercícios específicos quando possível</li>
            <li>• Indique durações em semanas para cada mesociclo</li>
            <li>• Adicione observações sobre progressões e adaptações</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodizationPasteArea;
