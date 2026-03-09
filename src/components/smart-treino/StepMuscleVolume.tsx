import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MUSCLE_GROUPS } from "@/services/smartTreinoService";
import { Dumbbell, AlertTriangle } from "lucide-react";

interface MuscleEntry {
  muscle_group: string;
  weekly_sets: number;
  is_emphasis: boolean;
}

interface Props {
  muscles: MuscleEntry[];
  onChange: (m: MuscleEntry[]) => void;
}

const EMPHASIS_SETS = 26;
const NORMAL_SETS = 22;

export default function StepMuscleVolume({ muscles, onChange }: Props) {
  // Initialize if empty
  if (muscles.length === 0) {
    const initial = MUSCLE_GROUPS.map(mg => ({
      muscle_group: mg,
      weekly_sets: NORMAL_SETS,
      is_emphasis: false,
    }));
    onChange(initial);
    return null;
  }

  const toggleEmphasis = (idx: number) => {
    const updated = [...muscles];
    updated[idx].is_emphasis = !updated[idx].is_emphasis;
    updated[idx].weekly_sets = updated[idx].is_emphasis ? EMPHASIS_SETS : NORMAL_SETS;
    onChange(updated);
  };

  const updateSets = (idx: number, val: number) => {
    const updated = [...muscles];
    updated[idx].weekly_sets = val;
    onChange(updated);
  };

  const totalSets = muscles.reduce((sum, m) => sum + m.weekly_sets, 0);
  const emphasisCount = muscles.filter(m => m.is_emphasis).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Volume Semanal por Grupo Muscular
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex gap-4 mb-4">
            <Badge variant="secondary">Total: {totalSets} séries/semana</Badge>
            <Badge variant="default">{emphasisCount} em ênfase</Badge>
          </div>

          <div className="space-y-3">
            {muscles.map((m, idx) => {
              const isCustom = (m.is_emphasis && m.weekly_sets !== EMPHASIS_SETS) || (!m.is_emphasis && m.weekly_sets !== NORMAL_SETS);
              return (
                <div key={m.muscle_group} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex-1 min-w-[120px]">
                    <span className="font-medium text-sm">{m.muscle_group}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Ênfase</Label>
                    <Switch checked={m.is_emphasis} onCheckedChange={() => toggleEmphasis(idx)} />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      min={10}
                      max={40}
                      value={m.weekly_sets}
                      onChange={e => updateSets(idx, parseInt(e.target.value) || 22)}
                      className="h-8 text-center"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-16">séries/sem</span>
                  {m.is_emphasis && <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">🔴</Badge>}
                  {isCustom && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {emphasisCount > 4 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ Muitos músculos em ênfase ({emphasisCount}). Recomendado: máximo 3-4 grupos.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
