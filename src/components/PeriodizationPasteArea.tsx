
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
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-3">
          <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
          <FileText className="h-6 w-6 text-orange-500" />
          <span>Colar Periodização de Treino</span>
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
            AI Ready
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="Cole aqui a periodização completa do treino...

Exemplo:
- Macrociclo: 12 semanas
- Fase 1: Adaptação Anatômica (3 semanas)
- Fase 2: Hipertrofia (4 semanas)
- Fase 3: Força (3 semanas)
- Fase 4: Potência (2 semanas)"
            className="min-h-[200px] bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none focus:border-orange-500 focus:ring-orange-500/20"
          />
          <div className="absolute bottom-3 right-3 text-xs text-slate-400">
            {pasteContent.length} caracteres
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              {isCopied ? (
                <Check className="h-4 w-4 mr-2 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {isCopied ? "Copiado!" : "Copiar"}
            </Button>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!pasteContent.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-black font-bold disabled:bg-slate-700 disabled:text-slate-400"
          >
            <Zap className="h-4 w-4 mr-2" />
            Analisar com IA
          </Button>
        </div>

        {pasteContent.trim() && (
          <div className="mt-4 p-3 bg-slate-800 rounded-lg border border-slate-600">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300">Pronto para análise</span>
              <Badge variant="outline" className="border-orange-500 text-orange-400">
                {pasteContent.split('\n').filter(line => line.trim()).length} linhas
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PeriodizationPasteArea;
