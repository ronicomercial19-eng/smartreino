/**
 * Exportador de PDF para Treinos
 * Mantém o padrão visual 9FIT (preto/laranja)
 */

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface Exercise {
  nome: string;
  series: string;
  repeticoes: string;
  descanso?: string;
  observacao?: string;
  tipo?: string;
}

interface DayWorkout {
  dia: string;
  tipo: string;
  exercicios: Exercise[];
  cardio?: {
    tipo: string;
    duracao: string;
    intensidade: string;
  };
}

interface WorkoutPlan {
  nome: string;
  objetivo: string;
  nivel: string;
  estudante?: string;
  estrutura_semanal: DayWorkout[];
}

interface WorkoutPDFExportProps {
  plan: WorkoutPlan;
  fileName?: string;
}

export function WorkoutPDFExport({ plan, fileName }: WorkoutPDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Criar o HTML com estilo 9FIT
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${plan.nome}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      color: #000;
      background: #fff;
    }
    .header {
      background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
      color: #fff;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header .badges {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    .badge {
      background: #f97316;
      color: #fff;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      display: inline-block;
    }
    .day-section {
      page-break-inside: avoid;
      margin-bottom: 30px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }
    .day-header {
      background: #f97316;
      color: #fff;
      padding: 15px 20px;
      font-size: 20px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .day-type {
      background: rgba(255,255,255,0.2);
      padding: 5px 15px;
      border-radius: 15px;
      font-size: 14px;
    }
    .exercise-block {
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .exercise-block:last-child {
      border-bottom: none;
    }
    .exercise-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #000;
    }
    .exercise-details {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .detail-item {
      color: #666;
    }
    .detail-value {
      color: #f97316;
      font-weight: bold;
    }
    .exercise-note {
      font-size: 12px;
      color: #666;
      font-style: italic;
      margin-top: 8px;
      padding-left: 15px;
      border-left: 3px solid #f97316;
    }
    .cardio-section {
      background: #fff7ed;
      border: 2px solid #f97316;
      border-radius: 8px;
      padding: 15px;
      margin: 15px 20px;
    }
    .cardio-section h3 {
      color: #f97316;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${plan.nome}</h1>
    ${plan.estudante ? `<p style="font-size: 18px; margin-top: 10px;">Aluno: ${plan.estudante}</p>` : ''}
    <div class="badges">
      <span class="badge">🎯 ${plan.objetivo}</span>
      <span class="badge">💪 ${plan.nivel}</span>
    </div>
  </div>

  ${plan.estrutura_semanal.map(day => `
    <div class="day-section">
      <div class="day-header">
        <span>${day.dia}</span>
        <span class="day-type">${day.tipo}</span>
      </div>
      
      ${day.exercicios.map(exercise => `
        <div class="exercise-block">
          <div class="exercise-name">${exercise.nome}</div>
          <div class="exercise-details">
            <span class="detail-item">Séries: <span class="detail-value">${exercise.series}</span></span>
            <span class="detail-item">Repetições: <span class="detail-value">${exercise.repeticoes}</span></span>
            ${exercise.descanso ? `<span class="detail-item">Descanso: <span class="detail-value">${exercise.descanso}</span></span>` : ''}
          </div>
          ${exercise.observacao ? `<div class="exercise-note">💡 ${exercise.observacao}</div>` : ''}
        </div>
      `).join('')}
      
      ${day.cardio ? `
        <div class="cardio-section">
          <h3>Cardio / Aeróbio</h3>
          <div class="exercise-details">
            <span class="detail-item">Tipo: <span class="detail-value">${day.cardio.tipo}</span></span>
            <span class="detail-item">Duração: <span class="detail-value">${day.cardio.duracao}</span></span>
            <span class="detail-item">Intensidade: <span class="detail-value">${day.cardio.intensidade}</span></span>
          </div>
        </div>
      ` : ''}
    </div>
  `).join('')}
  
  <div class="footer">
    <p>Treino gerado por 9FIT • ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
</body>
</html>
      `;

      // Criar blob e download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `treino-${plan.nome.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Exportado!",
        description: "O treino foi salvo com o template 9FIT"
      });
    } catch (error) {
      toast({
        title: "Erro ao Exportar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      variant="outline"
      size="sm"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </>
      )}
    </Button>
  );
}
