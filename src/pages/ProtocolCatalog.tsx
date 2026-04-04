import { useState, useEffect } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Dumbbell, Zap, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Protocol {
  id: string;
  pillar: string;
  pillar_label: string;
  protocol_id: number;
  protocol_name: string;
  protocol_axis: string;
  variation_id: number;
  variation_name: string;
  variation_focus: string;
  model_id: number;
  model_description: string;
  block_neural: string;
  block_integration: string;
  block_9_template: any;
  block_reset: string;
  rpe_range: string;
  goal_tags: string[];
}

const PILLAR_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  performance: { icon: Zap, color: "text-green-400", bg: "bg-green-500/20 border-green-500/30" },
  estrutural: { icon: Dumbbell, color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
  longevidade: { icon: Heart, color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30" },
};

const GOAL_FILTERS = [
  { label: "Todos", value: "" },
  { label: "Força", value: "forca" },
  { label: "Hipertrofia", value: "hipertrofia" },
  { label: "Emagrecimento", value: "emagrecimento" },
  { label: "Performance", value: "performance" },
  { label: "Funcional", value: "funcional" },
  { label: "Longevidade", value: "longevidade" },
];

export default function ProtocolCatalog() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [search, setSearch] = useState("");
  const [goalFilter, setGoalFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProtocols();
  }, []);

  const loadProtocols = async () => {
    const { data } = await supabase
      .from("smart_treino_protocols")
      .select("*")
      .order("protocol_id")
      .order("variation_id")
      .order("model_id");
    if (data) setProtocols(data as any);
    setLoading(false);
  };

  // Group: pillar → protocol → variation → models
  const grouped = protocols.reduce((acc, p) => {
    if (!acc[p.pillar]) acc[p.pillar] = {};
    const pKey = `${p.protocol_id}-${p.protocol_name}`;
    if (!acc[p.pillar][pKey]) acc[p.pillar][pKey] = { name: p.protocol_name, axis: p.protocol_axis, label: p.pillar_label, variations: {} };
    const vKey = `${p.variation_id}-${p.variation_name}`;
    if (!acc[p.pillar][pKey].variations[vKey]) acc[p.pillar][pKey].variations[vKey] = { name: p.variation_name, focus: p.variation_focus, models: [] };
    acc[p.pillar][pKey].variations[vKey].models.push(p);
    return acc;
  }, {} as any);

  const matchesFilter = (p: Protocol) => {
    const matchSearch = !search || p.model_description.toLowerCase().includes(search.toLowerCase()) ||
      p.protocol_name.toLowerCase().includes(search.toLowerCase()) ||
      p.variation_name.toLowerCase().includes(search.toLowerCase());
    const matchGoal = !goalFilter || (p.goal_tags && p.goal_tags.includes(goalFilter));
    return matchSearch && matchGoal;
  };

  if (loading) return <PageLayout title="Catálogo de Protocolos" subtitle="Carregando..."><div /></PageLayout>;

  return (
    <PageLayout title="📋 Catálogo 9x9x9" subtitle={`${protocols.length} protocolos disponíveis na matriz Smart Treino`}>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar protocolo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {GOAL_FILTERS.map((f) => (
              <Badge
                key={f.value}
                variant={goalFilter === f.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setGoalFilter(f.value)}
              >
                {f.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Pillar sections */}
        {Object.entries(grouped).map(([pillar, protos]: [string, any]) => {
          const cfg = PILLAR_CONFIG[pillar] || PILLAR_CONFIG.performance;
          const Icon = cfg.icon;

          return (
            <Card key={pillar} className={`border ${cfg.bg}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`flex items-center gap-2 ${cfg.color}`}>
                  <Icon className="h-5 w-5" />
                  {Object.values(protos)[0]?.label || pillar}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-1">
                  {Object.entries(protos).map(([pKey, proto]: [string, any]) => (
                    <AccordionItem key={pKey} value={pKey} className="border-border/30">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        <span>{proto.name} — <span className="text-muted-foreground font-normal">{proto.axis}</span></span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Accordion type="multiple" className="ml-4 space-y-1">
                          {Object.entries(proto.variations).map(([vKey, variation]: [string, any]) => {
                            const filteredModels = variation.models.filter(matchesFilter);
                            if (filteredModels.length === 0) return null;

                            return (
                              <AccordionItem key={vKey} value={vKey} className="border-border/20">
                                <AccordionTrigger className="text-sm hover:no-underline">
                                  <span>{variation.name} <span className="text-muted-foreground">({variation.focus})</span></span>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid gap-2 ml-4">
                                    {filteredModels.map((m: Protocol) => {
                                      const b9 = typeof m.block_9_template === 'string' ? JSON.parse(m.block_9_template) : m.block_9_template;
                                      return (
                                        <div key={m.id} className="flex items-center justify-between bg-background/50 rounded-md p-2 text-sm border border-border/20">
                                          <div>
                                            <span className="font-medium">{m.model_id}.</span> {m.model_description}
                                          </div>
                                          <div className="flex gap-1.5 items-center text-xs text-muted-foreground">
                                            {b9?.sets && <Badge variant="outline" className="text-xs">{b9.sets}×{b9.reps}</Badge>}
                                            {b9?.cadence && <span>⏱ {b9.cadence}</span>}
                                            <span>RPE {m.rpe_range}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
}
