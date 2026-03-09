import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SmartTreinoMacroRules } from "@/services/smartTreinoService";
import { Settings2 } from "lucide-react";

interface Props {
  rules: Partial<SmartTreinoMacroRules>;
  onChange: (r: Partial<SmartTreinoMacroRules>) => void;
}

export default function StepParameters({ rules, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Parâmetros Fixos do Macrociclo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Repetições Alvo</Label>
            <Input value={rules.reps_range ?? "8-12"} onChange={e => onChange({ ...rules, reps_range: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>RPE Alvo</Label>
            <Input type="number" step={0.5} min={3} max={10} value={rules.rpe_target ?? 6} onChange={e => onChange({ ...rules, rpe_target: parseFloat(e.target.value) })} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Descanso Compostos</Label>
            <Input value={rules.descanso_compostos ?? "75-90s"} onChange={e => onChange({ ...rules, descanso_compostos: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Descanso Acessórios</Label>
            <Input value={rules.descanso_acessorios ?? "60s"} onChange={e => onChange({ ...rules, descanso_acessorios: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Descanso Core</Label>
            <Input value={rules.descanso_core ?? "45-60s"} onChange={e => onChange({ ...rules, descanso_core: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Carga Inicial (% 1RM)</Label>
            <Input type="number" min={30} max={95} value={rules.carga_inicial_percent ?? 60} onChange={e => onChange({ ...rules, carga_inicial_percent: parseFloat(e.target.value) })} />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-1">
          <p className="font-medium">📋 Regras do Motor (automáticas):</p>
          <p>• IF técnica degrada → bloquear progressão</p>
          <p>• IF RPE médio {'>'} {rules.rpe_target ?? 6} → reduzir densidade 20%</p>
          <p>• IF dor {'>'} 3/10 → reduzir volume local</p>
          <p>• IF 2 sem técnica limpa + RPE ≤ alvo → liberar progressão</p>
        </div>
      </CardContent>
    </Card>
  );
}
