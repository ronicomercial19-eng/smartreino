import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SmartTreinoMacroRules, MACRO_DEFAULTS } from "@/services/smartTreinoService";
import { Layers, Info } from "lucide-react";

interface Props {
  rules: Partial<SmartTreinoMacroRules>;
  onChange: (r: Partial<SmartTreinoMacroRules>) => void;
}

const macroOptions = [
  { value: 1, label: "Macro 1 — Base Técnica / Estrutural" },
  { value: 2, label: "Macro 2 — Hipertrofia Funcional" },
  { value: 3, label: "Macro 3 — Força Máxima" },
  { value: 4, label: "Macro 4 — Manutenção / Performance" },
];

const frequencyOptions = [2, 3, 4, 5, 6];

export default function StepMacroRules({ rules, onChange }: Props) {
  const handleMacroChange = (val: string) => {
    const num = parseInt(val);
    const defaults = MACRO_DEFAULTS[num] || {};
    onChange({ ...rules, macro_number: num, ...defaults });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Contexto de Periodização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Macrociclo Atual</Label>
              <Select
                value={String(rules.macro_number ?? 1)}
                onValueChange={handleMacroChange}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {macroOptions.map(m => (
                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequência Semanal</Label>
              <Select
                value={String(rules.weekly_frequency ?? 4)}
                onValueChange={v => onChange({ ...rules, weekly_frequency: parseInt(v) })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map(f => (
                    <SelectItem key={f} value={String(f)}>{f}x / semana</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <strong>Objetivo:</strong> {rules.macro_objetivo || "Selecione um macro"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras Globais do Macro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "density_control", label: "Densidade controlada" },
            { key: "volume_locked", label: "Volume travado" },
            { key: "deload_planned", label: "Deload planejado" },
          ].map(item => (
            <div key={item.key} className="flex items-center space-x-2">
              <Checkbox
                id={item.key}
                checked={(rules as any)[item.key] ?? true}
                onCheckedChange={v => onChange({ ...rules, [item.key]: v })}
              />
              <Label htmlFor={item.key} className="cursor-pointer">{item.label}</Label>
            </div>
          ))}

          <div className="space-y-2 pt-2">
            <Label>Tipo de Progressão</Label>
            <Select
              value={rules.progression_type ?? "technique_first"}
              onValueChange={v => onChange({ ...rules, progression_type: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="technique_first">Técnica primeiro</SelectItem>
                <SelectItem value="load">Carga</SelectItem>
                <SelectItem value="intensity">Intensidade</SelectItem>
                <SelectItem value="frequency">Frequência</SelectItem>
                <SelectItem value="density">Densidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
