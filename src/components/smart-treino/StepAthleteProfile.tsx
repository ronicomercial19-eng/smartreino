import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SmartTreinoProfile, PROFILE_TYPES, GARGALOS_OPTIONS, RISCOS_OPTIONS } from "@/services/smartTreinoService";
import { User, Target, AlertTriangle } from "lucide-react";

interface Props {
  profile: Partial<SmartTreinoProfile>;
  onChange: (p: Partial<SmartTreinoProfile>) => void;
  athleteName: string;
}

function MultiSelect({ options, selected, onChange, label }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; label: string }) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <Badge
            key={opt}
            variant={selected.includes(opt) ? "default" : "outline"}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => toggle(opt)}
          >
            {opt}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function StepAthleteProfile({ profile, onChange, athleteName }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Perfil Técnico — {athleteName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Score Global (0-100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={profile.score_global ?? 0}
                onChange={e => onChange({ ...profile, score_global: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Modalidade Principal</Label>
              <Input
                value={profile.modalidade_principal ?? "geral"}
                onChange={e => onChange({ ...profile, modalidade_principal: e.target.value })}
                placeholder="Ex: corrida, musculação, geral"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Perfil Dominante</Label>
              <Select
                value={profile.dominant_profile ?? "equilibrado"}
                onValueChange={v => onChange({ ...profile, dominant_profile: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROFILE_TYPES.map(pt => (
                    <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Perfil Secundário</Label>
              <Select
                value={profile.secondary_profile ?? ""}
                onValueChange={v => onChange({ ...profile, secondary_profile: v })}
              >
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {PROFILE_TYPES.map(pt => (
                    <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Gargalos Técnicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MultiSelect
            options={GARGALOS_OPTIONS}
            selected={profile.gargalos_tecnicos ?? []}
            onChange={v => onChange({ ...profile, gargalos_tecnicos: v })}
            label="Selecione os gargalos identificados"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Riscos Estruturais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MultiSelect
            options={RISCOS_OPTIONS}
            selected={profile.riscos_estruturais ?? []}
            onChange={v => onChange({ ...profile, riscos_estruturais: v })}
            label="Selecione os riscos identificados"
          />
        </CardContent>
      </Card>
    </div>
  );
}
