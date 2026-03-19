import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SmartTreinoMacroRules, SmartTreinoProtocol, getProtocol } from "@/services/smartTreinoService";
import { Settings2, Brain, Link2, Flame, RotateCcw } from "lucide-react";

interface Props {
  rules: Partial<SmartTreinoMacroRules>;
  onChange: (r: Partial<SmartTreinoMacroRules>) => void;
}

interface BlockState {
  neural: string;
  integration: string;
  block_9: Record<string, any>;
  reset: string;
}

export default function StepParameters({ rules, onChange }: Props) {
  const [blocks, setBlocks] = useState<BlockState>({
    neural: "",
    integration: "",
    block_9: {},
    reset: "",
  });
  const [protocol, setProtocol] = useState<SmartTreinoProtocol | null>(null);

  // Load protocol blocks when protocol_code changes
  useEffect(() => {
    if (rules.protocol_code) {
      getProtocol(rules.protocol_code).then(p => {
        if (p) {
          setProtocol(p);
          setBlocks({
            neural: p.block_neural,
            integration: p.block_integration,
            block_9: p.block_9_template || {},
            reset: p.block_reset,
          });
        }
      }).catch(console.error);
    }
  }, [rules.protocol_code]);

  return (
    <div className="space-y-4">
      {/* 4 Blocks */}
      {protocol && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{protocol.id}</Badge>
            <span className="text-sm font-medium">{protocol.protocol_name} → {protocol.variation_name} → Modelo {protocol.model_id}</span>
          </div>

          {/* Block Neural */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-green-500" />
                <span className="text-green-700 dark:text-green-400">Bloco NEURAL</span>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Despertar do SNC</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={blocks.neural}
                onChange={e => setBlocks({ ...blocks, neural: e.target.value })}
                className="text-sm"
                rows={2}
              />
            </CardContent>
          </Card>

          {/* Block Integration */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Link2 className="h-4 w-4 text-blue-500" />
                <span className="text-blue-700 dark:text-blue-400">Bloco INTEGRAÇÃO</span>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Conexão de Cadeias</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={blocks.integration}
                onChange={e => setBlocks({ ...blocks, integration: e.target.value })}
                className="text-sm"
                rows={2}
              />
            </CardContent>
          </Card>

          {/* Block 9 */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-orange-700 dark:text-orange-400">Bloco 9 — EXECUÇÃO</span>
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">Nexo de Carga</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Séries</Label>
                  <Input value={blocks.block_9.sets || ""} onChange={e => setBlocks({ ...blocks, block_9: { ...blocks.block_9, sets: e.target.value } })} className="text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Reps</Label>
                  <Input value={blocks.block_9.reps || ""} onChange={e => setBlocks({ ...blocks, block_9: { ...blocks.block_9, reps: e.target.value } })} className="text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cadência</Label>
                  <Input value={blocks.block_9.cadence || ""} onChange={e => setBlocks({ ...blocks, block_9: { ...blocks.block_9, cadence: e.target.value } })} className="text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Descanso (s)</Label>
                  <Input type="number" value={blocks.block_9.rest || ""} onChange={e => setBlocks({ ...blocks, block_9: { ...blocks.block_9, rest: parseInt(e.target.value) } })} className="text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block Reset */}
          <Card className="border-l-4 border-l-gray-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-400">Bloco RESET</span>
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">Recuperação</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={blocks.reset}
                onChange={e => setBlocks({ ...blocks, reset: e.target.value })}
                className="text-sm"
                rows={2}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Classic parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Parâmetros Fisiológicos
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
          <div className="space-y-2">
            <Label>Carga Inicial (% 1RM)</Label>
            <Input type="number" min={30} max={95} value={rules.carga_inicial_percent ?? 60} onChange={e => onChange({ ...rules, carga_inicial_percent: parseFloat(e.target.value) })} className="w-32" />
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
    </div>
  );
}
