/**
 * PlanReviewPanel — Professor review & adjust UI for generated plans
 * Shows macro/meso/micro hierarchy with 4-block structure
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Link2, Flame, RotateCcw, Save, Loader2, ChevronDown, Layers, Calendar, Target } from "lucide-react";

interface Exercise {
  nome: string;
  series: string;
  repeticoes: string;
  descanso: string;
  observacao?: string;
  bloco?: string;
}

interface Day {
  dia: string;
  nome: string;
  tipo: string;
  exercicios: Exercise[];
  blocos?: {
    neural: any[];
    integration: any[];
    block_9: any[];
    reset: any[];
  };
}

interface Week {
  numero: number;
  mesociclo: string;
  foco_semana: string;
  dias: Day[];
}

interface Mesociclo {
  nome: string;
  semana_inicio: number;
  semana_fim: number;
  foco: string;
  volume: string;
  intensidade: string;
  descricao: string;
}

interface Plan {
  macrociclo: { nome: string; duracao_semanas: number };
  mesociclos: Mesociclo[];
  semanas: Week[];
}

interface Props {
  plan: Plan;
  onSave: (adjustments: { rpe_target?: number; volume_change?: number; notes?: string }) => Promise<void>;
}

const BLOCK_CONFIG = [
  { key: "neural", label: "NEURAL", icon: Brain, borderColor: "border-l-green-500", bgColor: "bg-green-50 dark:bg-green-950/30", textColor: "text-green-700 dark:text-green-400" },
  { key: "integration", label: "INTEGRAÇÃO", icon: Link2, borderColor: "border-l-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/30", textColor: "text-blue-700 dark:text-blue-400" },
  { key: "block_9", label: "BLOCO 9", icon: Flame, borderColor: "border-l-orange-500", bgColor: "bg-orange-50 dark:bg-orange-950/30", textColor: "text-orange-700 dark:text-orange-400" },
  { key: "reset", label: "RESET", icon: RotateCcw, borderColor: "border-l-gray-400", bgColor: "bg-gray-50 dark:bg-gray-950/30", textColor: "text-gray-700 dark:text-gray-400" },
] as const;

export default function PlanReviewPanel({ plan, onSave }: Props) {
  const [rpeTarget, setRpeTarget] = useState(7);
  const [volumeChange, setVolumeChange] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ rpe_target: rpeTarget, volume_change: volumeChange, notes });
    } finally {
      setSaving(false);
    }
  };

  const renderExercises = (exercises: Exercise[]) => (
    <div className="space-y-1">
      {exercises.map((ex, i) => (
        <div key={i} className="flex items-center gap-2 text-sm p-1.5 rounded bg-muted/30">
          <span className="font-mono text-muted-foreground w-5">{i + 1}.</span>
          <span className="flex-1 font-medium">{ex.nome}</span>
          <Badge variant="outline" className="text-xs">{ex.series}x{ex.repeticoes}</Badge>
          <span className="text-xs text-muted-foreground">{ex.descanso}</span>
        </div>
      ))}
    </div>
  );

  const renderDay = (day: Day) => {
    // If day has block structure (from Smart Treino)
    if (day.blocos) {
      return (
        <div className="space-y-2">
          {BLOCK_CONFIG.map(({ key, label, icon: Icon, borderColor, bgColor, textColor }) => {
            const slots = (day.blocos as any)?.[key];
            if (!slots || slots.length === 0) return null;
            return (
              <div key={key} className={`border-l-4 ${borderColor} rounded-r-lg ${bgColor} p-2`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3 w-3" />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textColor}`}>{label}</span>
                </div>
                <div className="space-y-0.5">
                  {slots.map((slot: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="flex-1">{slot.movement_pattern || slot.nome || slot.exercise}</span>
                      {slot.sets && slot.reps && <span>{slot.sets}x{slot.reps}</span>}
                      {slot.duration && <span>{slot.duration}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Standard exercise list
    return renderExercises(day.exercicios || []);
  };

  if (!plan?.macrociclo) {
    return (
      <Alert>
        <AlertDescription>Nenhum plano gerado ainda. Gere um plano primeiro.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Macro overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            {plan.macrociclo.nome}
            <Badge variant="secondary">{plan.macrociclo.duracao_semanas} semanas</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {plan.mesociclos?.map((meso, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {meso.nome} (sem {meso.semana_inicio}-{meso.semana_fim})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Adjustment controls */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Ajustes do Professor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">RPE Alvo: {rpeTarget}</Label>
              <Slider value={[rpeTarget]} onValueChange={([v]) => setRpeTarget(v)} min={4} max={10} step={0.5} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Volume: {volumeChange > 0 ? `+${volumeChange}%` : `${volumeChange}%`}</Label>
              <Slider value={[volumeChange]} onValueChange={([v]) => setVolumeChange(v)} min={-30} max={30} step={5} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Ajustes ou notas para este plano..." className="text-sm" />
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Ajustes
          </Button>
        </CardContent>
      </Card>

      {/* Mesociclos > Semanas > Dias */}
      <Accordion type="multiple" className="space-y-2">
        {plan.mesociclos?.map((meso, mi) => (
          <AccordionItem key={mi} value={`meso-${mi}`} className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
              <div className="flex items-center gap-3 text-left">
                <Badge className="bg-primary/20 text-primary">{mi + 1}</Badge>
                <div>
                  <p className="font-medium text-sm">{meso.nome}</p>
                  <p className="text-xs text-muted-foreground">Sem {meso.semana_inicio}–{meso.semana_fim} · {meso.foco}</p>
                </div>
                <div className="flex gap-1 ml-auto mr-4">
                  <Badge variant="outline" className="text-[10px]">Vol: {meso.volume}</Badge>
                  <Badge variant="outline" className="text-[10px]">Int: {meso.intensidade}</Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="text-sm text-muted-foreground mb-3">{meso.descricao}</p>
              <Accordion type="multiple" className="space-y-1">
                {plan.semanas
                  ?.filter(s => s.numero >= meso.semana_inicio && s.numero <= meso.semana_fim)
                  .map((semana, si) => (
                    <AccordionItem key={si} value={`sem-${semana.numero}`} className="border rounded">
                      <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Semana {semana.numero}</span>
                          <span className="text-xs text-muted-foreground">— {semana.foco_semana}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          {semana.dias?.map((dia, di) => (
                            <Card key={di} className="border-muted">
                              <CardHeader className="py-2 px-3">
                                <CardTitle className="text-xs flex items-center gap-2">
                                  <Badge variant="secondary" className="text-[10px]">{dia.dia}</Badge>
                                  {dia.nome}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="px-3 pb-2">
                                {renderDay(dia)}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
