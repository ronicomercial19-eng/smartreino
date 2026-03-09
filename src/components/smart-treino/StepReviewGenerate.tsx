import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SmartTreinoProfile, SmartTreinoMacroRules, GeneratedStructure, PROFILE_TYPES } from "@/services/smartTreinoService";
import { Sparkles, Loader2, CheckCircle, Clock } from "lucide-react";

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
}

const macroNames: Record<number, string> = {
  1: "Base Técnica / Estrutural",
  2: "Hipertrofia Funcional",
  3: "Força Máxima",
  4: "Manutenção / Performance",
};

export default function StepReviewGenerate({ profile, rules, muscles, athleteName, onGenerate, generatedResult }: Props) {
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
            <div><span className="text-muted-foreground">Macro:</span> <strong>{macroNames[rules.macro_number!] || rules.macro_objetivo}</strong></div>
            <div><span className="text-muted-foreground">RPE:</span> <strong>{rules.rpe_target}</strong></div>
            <div><span className="text-muted-foreground">Reps:</span> <strong>{rules.reps_range}</strong></div>
            <div><span className="text-muted-foreground">Freq:</span> <strong>{rules.weekly_frequency}x/sem</strong></div>
          </div>

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
                <div className="space-y-2">
                  {session.slots.map((slot, i) => (
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
