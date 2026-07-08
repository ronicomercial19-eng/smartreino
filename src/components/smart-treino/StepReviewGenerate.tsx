import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SmartTreinoProfile, SmartTreinoMacroRules, GeneratedStructure, TrainingSession, PROFILE_TYPES } from "@/services/smartTreinoService";
import { Sparkles, Loader2, CheckCircle, Clock, Brain, Link2, Flame, RotateCcw } from "lucide-react";

interface MuscleEntry {
  muscle_group: string;
  weekly_sets: number;
  is_emphasis: boolean;
  distribution_json: Record<string, number>;
}

interface Props {
  profile: Partial<SmartTreinoProfile>;
  rules: Partial<SmartTreinoMacroRules>;
  muscles: MuscleEntry[];
  athleteName: string;
  onGenerate: () => Promise<GeneratedStructure>;
  generatedResult: GeneratedStructure | null;
  previewCategoria?: string;
  previewDias?: number;
  weekRows?: { workout_date: string; workout_type: string | null; exercise_count: number }[] | null;
}

function renderBlocks(session: TrainingSession) {
  if (!session.blocks) {
    // Legacy slot-based rendering
    return (
      <div className="space-y-2">
        {session.slots?.map((slot, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded border bg-muted/30 text-sm">
            <span className="font-mono text-muted-foreground w-6">{slot.order}.</span>
            <span className="flex-1 font-medium">{slot.movement_pattern}</span>
            <Badge variant="outline">{slot.target_muscle}</Badge>
            <span>{slot.sets}x{slot.reps}</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" /> {slot.rest_seconds}s
            </span>
            {slot.intensity && <Badge variant="secondary">{slot.intensity}</Badge>}
          </div>
        ))}
      </div>
    );
  }

  const blockConfig = [
    { key: "neural" as const, label: "NEURAL", icon: Brain, color: "green", borderColor: "border-l-green-500", bgColor: "bg-green-50 dark:bg-green-950/30" },
    { key: "integration" as const, label: "INTEGRAÇÃO", icon: Link2, color: "blue", borderColor: "border-l-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
    { key: "block_9" as const, label: "BLOCO 9", icon: Flame, color: "orange", borderColor: "border-l-orange-500", bgColor: "bg-orange-50 dark:bg-orange-950/30" },
    { key: "reset" as const, label: "RESET", icon: RotateCcw, color: "gray", borderColor: "border-l-gray-400", bgColor: "bg-gray-50 dark:bg-gray-950/30" },
  ];

  return (
    <div className="space-y-3">
      {blockConfig.map(({ key, label, icon: Icon, borderColor, bgColor }) => {
        const slots = session.blocks![key];
        if (!slots || slots.length === 0) return null;
        return (
          <div key={key} className={`border-l-4 ${borderColor} rounded-r-lg ${bgColor} p-3`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className="space-y-1.5">
              {slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-muted-foreground w-5">{slot.order || i + 1}.</span>
                  <span className="flex-1 font-medium">{slot.movement_pattern || slot.duration}</span>
                  {slot.target_muscle && <Badge variant="outline" className="text-xs">{slot.target_muscle}</Badge>}
                  {slot.sets && slot.reps && <span className="text-xs">{slot.sets}x{slot.reps}</span>}
                  {slot.rest_seconds && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {slot.rest_seconds}s
                    </span>
                  )}
                  {slot.cadence && <Badge variant="secondary" className="text-xs">{slot.cadence}</Badge>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StepReviewGenerate({ profile, rules, muscles, athleteName, onGenerate, generatedResult, previewCategoria, previewDias, weekRows }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      await onGenerate();
    } catch (e: any) {
      setError(e.message || "Erro ao gerar treino");
    } finally {
      setLoading(false);
    }
  };

  const profileLabel = PROFILE_TYPES.find(p => p.value === profile.dominant_profile)?.label || profile.dominant_profile;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Resumo — {athleteName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><span className="text-muted-foreground">Perfil:</span> <strong>{profileLabel}</strong></div>
            <div><span className="text-muted-foreground">Score:</span> <strong>{profile.score_global}</strong></div>
            <div><span className="text-muted-foreground">Freq:</span> <strong>{rules.weekly_frequency}x/sem</strong></div>
            <div><span className="text-muted-foreground">RPE:</span> <strong>{rules.rpe_target}</strong></div>
            <div><span className="text-muted-foreground">Reps:</span> <strong>{rules.reps_range}</strong></div>
            <div><span className="text-muted-foreground">Progressão:</span> <strong>{rules.progression_type}</strong></div>
          </div>

          {rules.protocol_code && (
            <div className="pt-2 flex items-center gap-2">
              <Badge>{rules.protocol_code}</Badge>
              <span className="text-sm">{rules.protocol_name} → {rules.variation_name}</span>
            </div>
          )}

          <div className="pt-2">
            <p className="text-muted-foreground mb-1">Volume por músculo:</p>
            <div className="flex flex-wrap gap-2">
              {muscles.map(m => (
                <Badge key={m.muscle_group} variant={m.is_emphasis ? "default" : "outline"}>
                  {m.muscle_group}: {m.weekly_sets}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate button */}
      {!generatedResult && (
        <div className="flex flex-col items-center gap-4">
          <Button onClick={handleGenerate} disabled={loading} size="lg" className="gap-2">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {loading ? "Gerando com IA..." : "Gerar Base de Treino com IA"}
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Result */}
      {generatedResult && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Estrutura gerada com sucesso!</span>
          </div>

          {generatedResult.sessions.map(session => (
            <Card key={session.session_label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  Treino {session.session_label} — {session.session_name}
                  <div className="flex gap-1 ml-auto">
                    {session.focus_muscles?.map(m => (
                      <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderBlocks(session)}
              </CardContent>
            </Card>
          ))}

          {generatedResult.progression_notes && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm"><strong>📈 Progressão:</strong> {generatedResult.progression_notes}</p>
              </CardContent>
            </Card>
          )}
          {generatedResult.safety_notes && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm"><strong>🛡️ Segurança:</strong> {generatedResult.safety_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
