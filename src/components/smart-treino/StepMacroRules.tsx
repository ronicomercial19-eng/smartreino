import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SmartTreinoMacroRules, SmartTreinoProtocol, PILLARS, PROTOCOLS_META, getProtocols } from "@/services/smartTreinoService";
import { Layers, Info, Zap } from "lucide-react";

interface Props {
  rules: Partial<SmartTreinoMacroRules>;
  onChange: (r: Partial<SmartTreinoMacroRules>) => void;
}

const frequencyOptions = [2, 3, 4, 5, 6];

export default function StepMacroRules({ rules, onChange }: Props) {
  const [protocols, setProtocols] = useState<SmartTreinoProtocol[]>([]);
  const [selectedPillar, setSelectedPillar] = useState(rules.pillar || "");
  const [selectedProtocolId, setSelectedProtocolId] = useState<number | null>(null);
  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  useEffect(() => {
    getProtocols().then(setProtocols).catch(console.error);
  }, []);

  // Initialize from existing rules
  useEffect(() => {
    if (rules.protocol_code && protocols.length > 0) {
      const parts = rules.protocol_code.split(".");
      if (parts.length === 3) {
        const p = protocols.find(pr => pr.id === rules.protocol_code);
        if (p) {
          setSelectedPillar(p.pillar);
          setSelectedProtocolId(p.protocol_id);
          setSelectedVariationId(p.variation_id);
          setSelectedModelId(p.model_id);
        }
      }
    }
  }, [rules.protocol_code, protocols]);

  // Derived lists
  const pillarProtocols = useMemo(() => {
    if (!selectedPillar) return [];
    const seen = new Map<number, SmartTreinoProtocol>();
    protocols.filter(p => p.pillar === selectedPillar).forEach(p => {
      if (!seen.has(p.protocol_id)) seen.set(p.protocol_id, p);
    });
    return Array.from(seen.values());
  }, [protocols, selectedPillar]);

  const variations = useMemo(() => {
    if (!selectedProtocolId) return [];
    const seen = new Map<number, SmartTreinoProtocol>();
    protocols.filter(p => p.pillar === selectedPillar && p.protocol_id === selectedProtocolId).forEach(p => {
      if (!seen.has(p.variation_id)) seen.set(p.variation_id, p);
    });
    return Array.from(seen.values());
  }, [protocols, selectedPillar, selectedProtocolId]);

  const models = useMemo(() => {
    if (!selectedVariationId) return [];
    return protocols.filter(p =>
      p.pillar === selectedPillar &&
      p.protocol_id === selectedProtocolId &&
      p.variation_id === selectedVariationId
    );
  }, [protocols, selectedPillar, selectedProtocolId, selectedVariationId]);

  const selectedProtocol = useMemo(() => {
    if (!selectedModelId) return null;
    return protocols.find(p =>
      p.pillar === selectedPillar &&
      p.protocol_id === selectedProtocolId &&
      p.variation_id === selectedVariationId &&
      p.model_id === selectedModelId
    ) || null;
  }, [protocols, selectedPillar, selectedProtocolId, selectedVariationId, selectedModelId]);

  const handlePillarChange = (val: string) => {
    setSelectedPillar(val);
    setSelectedProtocolId(null);
    setSelectedVariationId(null);
    setSelectedModelId(null);
    onChange({ ...rules, pillar: val, protocol_code: undefined, protocol_name: undefined, variation_name: undefined, model_name: undefined });
  };

  const handleProtocolChange = (val: string) => {
    const num = parseInt(val);
    setSelectedProtocolId(num);
    setSelectedVariationId(null);
    setSelectedModelId(null);
    const meta = PROTOCOLS_META[num];
    onChange({ ...rules, protocol_name: meta?.name });
  };

  const handleVariationChange = (val: string) => {
    const num = parseInt(val);
    setSelectedVariationId(num);
    setSelectedModelId(null);
    const v = variations.find(v => v.variation_id === num);
    onChange({ ...rules, variation_name: v?.variation_name });
  };

  const handleModelChange = (val: string) => {
    const num = parseInt(val);
    setSelectedModelId(num);
    const proto = protocols.find(p =>
      p.pillar === selectedPillar &&
      p.protocol_id === selectedProtocolId &&
      p.variation_id === selectedVariationId &&
      p.model_id === num
    );
    if (proto) {
      const b9 = proto.block_9_template || {};
      onChange({
        ...rules,
        protocol_code: proto.id,
        model_name: proto.model_description,
        macro_objetivo: `${proto.protocol_name} — ${proto.variation_name}: ${proto.model_description}`,
        rpe_target: parseFloat(proto.rpe_range.split("-")[0]) || rules.rpe_target,
        reps_range: b9.reps || rules.reps_range,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Protocol Selector (9x9x9) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Protocolo 9FIT (Matriz 9×9×9)
            <Badge variant="secondary" className="text-xs">729 variações</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pillar */}
          <div className="space-y-2">
            <Label>1. Pilar de Treinamento</Label>
            <Select value={selectedPillar} onValueChange={handlePillarChange}>
              <SelectTrigger><SelectValue placeholder="Selecione o pilar..." /></SelectTrigger>
              <SelectContent>
                {PILLARS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.icon} {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Protocol */}
          {selectedPillar && (
            <div className="space-y-2">
              <Label>2. Protocolo Chefe</Label>
              <Select value={selectedProtocolId ? String(selectedProtocolId) : ""} onValueChange={handleProtocolChange}>
                <SelectTrigger><SelectValue placeholder="Selecione o protocolo..." /></SelectTrigger>
                <SelectContent>
                  {pillarProtocols.map(p => (
                    <SelectItem key={p.protocol_id} value={String(p.protocol_id)}>
                      {p.protocol_name} — {p.protocol_axis}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Variation */}
          {selectedProtocolId && (
            <div className="space-y-2">
              <Label>3. Variação Modular (Fase)</Label>
              <Select value={selectedVariationId ? String(selectedVariationId) : ""} onValueChange={handleVariationChange}>
                <SelectTrigger><SelectValue placeholder="Selecione a variação..." /></SelectTrigger>
                <SelectContent>
                  {variations.map(v => (
                    <SelectItem key={v.variation_id} value={String(v.variation_id)}>
                      Módulo {v.variation_id}: {v.variation_name} — {v.variation_focus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Model */}
          {selectedVariationId && (
            <div className="space-y-2">
              <Label>4. Modelo de Treino (Progressão)</Label>
              <Select value={selectedModelId ? String(selectedModelId) : ""} onValueChange={handleModelChange}>
                <SelectTrigger><SelectValue placeholder="Selecione o modelo..." /></SelectTrigger>
                <SelectContent>
                  {models.map(m => (
                    <SelectItem key={m.model_id} value={String(m.model_id)}>
                      {m.model_id}. {m.model_description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Selected protocol info */}
          {selectedProtocol && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-2">
                <Badge>{selectedProtocol.id}</Badge>
                <span className="font-semibold">{selectedProtocol.protocol_name}</span>
                <span className="text-muted-foreground">→</span>
                <span>{selectedProtocol.variation_name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{selectedProtocol.model_description}</p>
              <div className="flex gap-2 flex-wrap text-xs">
                <Badge variant="outline">RPE: {selectedProtocol.rpe_range}</Badge>
                <Badge variant="outline">Reps: {selectedProtocol.block_9_template?.reps || "variável"}</Badge>
                <Badge variant="outline">Cadência: {selectedProtocol.block_9_template?.cadence || "padrão"}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Frequency + Global Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Configuração Global
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="space-y-3">
            <Label>Regras Globais</Label>
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
          </div>

          <div className="space-y-2">
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

          {rules.macro_objetivo && (
            <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                <strong>Objetivo:</strong> {rules.macro_objetivo}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
