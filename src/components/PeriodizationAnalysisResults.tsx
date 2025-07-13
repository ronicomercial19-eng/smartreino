
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  BarChart3,
  Download,
  Share2,
  FileText,
  Zap,
  Clock
} from "lucide-react";

interface AnalysisBlock {
  name: string;
  duration: string;
  focus: string;
  intensity: number;
  volume: number;
}

interface WeeklyPlan {
  week: number;
  day3_focus: string;
  day4_focus: string;
  load: number;
}

interface MacroChartData {
  volume: number[];
  intensity: number[];
}

interface PeriodizationAnalysisResultsProps {
  analysisData: {
    blocks: AnalysisBlock[];
    weeklyPlan: WeeklyPlan[];
    macroChartData: MacroChartData;
    confidence: number;
    totalDuration: string;
    mainObjective: string;
  };
  onGeneratePDF: () => void;
  onGenerateLink: () => void;
}

const PeriodizationAnalysisResults = ({ 
  analysisData, 
  onGeneratePDF, 
  onGenerateLink 
}: PeriodizationAnalysisResultsProps) => {
  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return "text-red-400 bg-red-400/20";
    if (intensity >= 6) return "text-orange-400 bg-orange-400/20";
    return "text-green-400 bg-green-400/20";
  };

  const getVolumeColor = (volume: number) => {
    if (volume >= 8) return "text-blue-400 bg-blue-400/20";
    if (volume >= 6) return "text-cyan-400 bg-cyan-400/20";
    return "text-slate-400 bg-slate-400/20";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header com Métricas Principais */}
      <Card className="bg-gradient-to-r from-card via-card to-muted/30 border-border card-hover">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-10 bg-gradient-to-b from-primary to-orange-600 rounded-full"></div>
              <Zap className="h-8 w-8 text-primary" />
              <div>
                <span className="text-2xl gradient-text font-bold">Treino Gerado com IA</span>
                <p className="text-sm text-muted-foreground mt-1">Análise completa e personalizada</p>
              </div>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-2 text-lg">
              {analysisData.confidence}% Confiança
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-muted/50 p-6 rounded-xl border border-border hover:bg-muted/70 transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="text-muted-foreground font-medium">Duração Total</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{analysisData.totalDuration}</p>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-xl border border-border hover:bg-muted/70 transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <Target className="h-6 w-6 text-primary" />
                <span className="text-muted-foreground font-medium">Objetivo Principal</span>
              </div>
              <p className="text-xl font-semibold text-foreground">{analysisData.mainObjective}</p>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-xl border border-border hover:bg-muted/70 transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <span className="text-muted-foreground font-medium">Fases Detectadas</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{analysisData.blocks.length}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={onGeneratePDF}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 btn-glow"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Exportar PDF Completo
            </Button>
            <Button
              onClick={onGenerateLink}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 px-6 py-3"
              size="lg"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Compartilhar Treino
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Blocos de Periodização */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center space-x-3">
            <div className="w-1 h-8 bg-primary rounded-full"></div>
            <span className="text-xl">Blocos de Treinamento Inteligente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {analysisData.blocks.map((block, index) => (
              <div key={index} className="bg-muted/30 p-6 rounded-xl border border-border hover:bg-muted/50 transition-all card-hover">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{block.name}</h3>
                    <p className="text-muted-foreground text-base">{block.focus}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                      {block.duration}
                    </Badge>
                    <Badge variant="outline" className="border-border">
                      Fase {index + 1}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Intensidade</span>
                      <span className="text-foreground font-bold">{block.intensity}/10</span>
                    </div>
                    <Progress 
                      value={block.intensity * 10} 
                      className="h-3 bg-muted progress-glow"
                    />
                    <p className="text-xs text-muted-foreground">
                      {block.intensity >= 8 ? "🔴 Muito Alta" : block.intensity >= 6 ? "🟡 Moderada a Alta" : "🟢 Baixa a Moderada"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Volume</span>
                      <span className="text-foreground font-bold">{block.volume}/10</span>
                    </div>
                    <Progress 
                      value={block.volume * 10} 
                      className="h-3 bg-muted progress-glow"
                    />
                    <p className="text-xs text-muted-foreground">
                      {block.volume >= 8 ? "📈 Muito Alto" : block.volume >= 6 ? "📊 Moderado a Alto" : "📉 Baixo a Moderado"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Plano Semanal */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center space-x-3">
            <div className="w-1 h-8 bg-primary rounded-full"></div>
            <span className="text-xl">Distribuição Semanal Detalhada</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {analysisData.weeklyPlan.slice(0, 8).map((week, index) => (
              <div key={index} className="bg-muted/30 p-4 rounded-lg border border-border hover:bg-muted/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                      📅 Semana {week.week}
                    </Badge>
                    <div className="text-sm text-muted-foreground space-x-4">
                      <span>
                        <span className="font-semibold text-foreground">Dia 3:</span> {week.day3_focus}
                      </span>
                      <span>
                        <span className="font-semibold text-foreground">Dia 4:</span> {week.day4_focus}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">Carga: {week.load}/10</span>
                    <Badge variant="outline" className={getVolumeColor(week.load)}>
                      {week.load >= 8 ? "Alta" : week.load >= 6 ? "Moderada" : "Baixa"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Gráfico de Macro Dados */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center space-x-3">
            <div className="w-1 h-8 bg-primary rounded-full"></div>
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl">Progressão do Macrociclo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-foreground font-bold text-lg mb-4 flex items-center">
                📊 Volume Semanal
                <Badge className="ml-2 bg-blue-500/20 text-blue-400">Séries x Exercícios</Badge>
              </h4>
              <div className="space-y-3">
                {analysisData.macroChartData.volume.map((vol, index) => (
                  <div key={index} className="flex items-center space-x-4 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all">
                    <span className="text-sm font-semibold text-muted-foreground w-20">Sem {index + 1}</span>
                    <Progress value={vol * 10} className="flex-1 h-4 bg-muted progress-glow" />
                    <Badge className={`text-sm ${getVolumeColor(vol)} px-2 py-1`}>{vol}/10</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-foreground font-bold text-lg mb-4 flex items-center">
                🔥 Intensidade Semanal
                <Badge className="ml-2 bg-red-500/20 text-red-400">% 1RM</Badge>
              </h4>
              <div className="space-y-3">
                {analysisData.macroChartData.intensity.map((int, index) => (
                  <div key={index} className="flex items-center space-x-4 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all">
                    <span className="text-sm font-semibold text-muted-foreground w-20">Sem {index + 1}</span>
                    <Progress value={int * 10} className="flex-1 h-4 bg-muted progress-glow" />
                    <Badge className={`text-sm ${getIntensityColor(int)} px-2 py-1`}>{int}/10</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h5 className="font-bold text-foreground mb-2">📈 Insights da Periodização:</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Volume alto no início para adaptação anatômica</li>
              <li>• Pico de intensidade nas semanas 6-8 para ganhos de força</li>
              <li>• Redução gradual de volume com aumento de intensidade</li>
              <li>• Fase de polimento (tapering) nas últimas semanas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodizationAnalysisResults;
