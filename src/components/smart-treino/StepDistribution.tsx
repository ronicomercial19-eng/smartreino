import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid } from "lucide-react";

interface MuscleEntry {
  muscle_group: string;
  weekly_sets: number;
  is_emphasis: boolean;
  distribution_json: Record<string, number>;
}

interface Props {
  muscles: MuscleEntry[];
  onChange: (m: MuscleEntry[]) => void;
  weeklyFrequency: number;
}

const SESSION_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function StepDistribution({ muscles, onChange, weeklyFrequency }: Props) {
  const sessions = SESSION_LABELS.slice(0, weeklyFrequency);

  // Auto-distribute if distribution is empty
  if (muscles.length > 0 && Object.keys(muscles[0].distribution_json || {}).length === 0) {
    const distributed = muscles.map(m => {
      const perSession = Math.floor(m.weekly_sets / weeklyFrequency);
      const remainder = m.weekly_sets % weeklyFrequency;
      const dist: Record<string, number> = {};
      sessions.forEach((s, i) => {
        dist[s] = perSession + (i < remainder ? 1 : 0);
      });
      return { ...m, distribution_json: dist };
    });
    onChange(distributed);
    return null;
  }

  const updateDist = (muscleIdx: number, session: string, value: number) => {
    const updated = [...muscles];
    updated[muscleIdx] = {
      ...updated[muscleIdx],
      distribution_json: { ...updated[muscleIdx].distribution_json, [session]: value },
    };
    onChange(updated);
  };

  const sessionTotals = sessions.map(s =>
    muscles.reduce((sum, m) => sum + (m.distribution_json?.[s] || 0), 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          Distribuição de Séries por Sessão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Músculo</th>
                <th className="text-center py-2 px-2">Total</th>
                {sessions.map(s => (
                  <th key={s} className="text-center py-2 px-2">Treino {s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {muscles.map((m, idx) => {
                const distTotal = Object.values(m.distribution_json || {}).reduce((a, b) => a + b, 0);
                const mismatch = distTotal !== m.weekly_sets;
                return (
                  <tr key={m.muscle_group} className="border-b">
                    <td className="py-2 pr-4 flex items-center gap-2">
                      <span>{m.muscle_group}</span>
                      {m.is_emphasis && <Badge variant="default" className="text-xs">🔴</Badge>}
                    </td>
                    <td className={`text-center py-2 px-2 font-medium ${mismatch ? "text-destructive" : ""}`}>
                      {distTotal}/{m.weekly_sets}
                    </td>
                    {sessions.map(s => (
                      <td key={s} className="text-center py-2 px-2">
                        <Input
                          type="number"
                          min={0}
                          max={m.weekly_sets}
                          value={m.distribution_json?.[s] || 0}
                          onChange={e => updateDist(idx, s, parseInt(e.target.value) || 0)}
                          className="h-8 w-14 text-center mx-auto"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="font-bold">
                <td className="py-2 pr-4">Total por sessão</td>
                <td></td>
                {sessionTotals.map((t, i) => (
                  <td key={i} className="text-center py-2 px-2">{t}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
