
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
    <div className="space-y-6">
      {/* Header com Métricas Principais */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
              <Zap className="h-6 w-6 text-orange-500" />
              <span>Análise de Periodização IA</span>
            </div>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {analysisData.confidence}% confiança
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <span className="text-slate-300 text-sm">Duração Total</span>
              </div>
              <p className="text-2xl font-bold text-white">{analysisData.totalDuration}</p>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-orange-500" />
                <span className="text-slate-300 text-sm">Objetivo Principal</span>
              </div>
              <p className="text-lg font-semibold text-white">{analysisData.mainObjective}</p>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                <span className="text-slate-300 text-sm">Fases Detectadas</span>
              </div>
              <p className="text-2xl font-bold text-white">{analysisData.blocks.length}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onGeneratePDF}
              className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
            >
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
            <Button
              onClick={onGenerateLink}
              variant="outline"
              className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocos de Periodização */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
            <span>Blocos de Treinamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {analysisData.blocks.map((block, index) => (
              <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{block.name}</h3>
                    <p className="text-slate-300">{block.focus}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-orange-500 text-orange-400">
                      {block.duration}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Intensidade</span>
                      <span className="text-white">{block.intensity}/10</span>
                    </div>
                    <Progress 
                      value={block.intensity * 10} 
                      className="h-2 bg-slate-700"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Volume</span>
                      <span className="text-white">{block.volume}/10</span>
                    </div>
                    <Progress 
                      value={block.volume * 10} 
                      className="h-2 bg-slate-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plano Semanal */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
            <span>Distribuição Semanal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {analysisData.weeklyPlan.slice(0, 8).map((week, index) => (
              <div key={index} className="bg-slate-800 p-3 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-orange-500/20 text-orange-400">
                      Semana {week.week}
                    </Badge>
                    <div className="text-sm text-slate-300">
                      <span className="font-semibold">Dia 3:</span> {week.day3_focus}
                    </div>
                    <div className="text-sm text-slate-300">
                      <span className="font-semibold">Dia 4:</span> {week.day4_focus}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Carga: {week.load}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Macro Dados */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <span>Progressão do Macrociclo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Volume Semanal</h4>
              <div className="space-y-2">
                {analysisData.macroChartData.volume.map((vol, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm text-slate-400 w-16">Sem {index + 1}</span>
                    <Progress value={vol * 10} className="flex-1 h-3 bg-slate-700" />
                    <Badge className={`text-xs ${getVolumeColor(vol)}`}>{vol}</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3">Intensidade Semanal</h4>
              <div className="space-y-2">
                {analysisData.macroChartData.intensity.map((int, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm text-slate-400 w-16">Sem {index + 1}</span>
                    <Progress value={int * 10} className="flex-1 h-3 bg-slate-700" />
                    <Badge className={`text-xs ${getIntensityColor(int)}`}>{int}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodizationAnalysisResults;
