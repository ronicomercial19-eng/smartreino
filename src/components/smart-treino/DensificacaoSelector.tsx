import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Zap } from "lucide-react";

const NONE = "__none__";
const db = supabase as any;

interface Metodo { codigo: string; nome: string }
interface Parametros {
  series_min: number | null; series_max: number | null;
  descanso_intra_seg_min: number | null; descanso_intra_seg_max: number | null;
  descanso_pos_seg: number | null; limite_por_sessao: number | null;
}

export function normalizeNivel(n?: string | null): string | null {
  if (!n) return null;
  const v = n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  return ["iniciante", "intermediario", "avancado"].includes(v) ? v : null;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function DensificacaoSelector({ athleteId }: { athleteId?: string }) {
  const [metodos, setMetodos] = useState<Metodo[]>([]);
  const [date, setDate] = useState(today());
  const [codigo, setCodigo] = useState(NONE);
  const [nivel, setNivel] = useState<string | null>(null);
  const [params, setParams] = useState<Parametros | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    db.from("densificacao_metodos").select("codigo,nome").eq("ativo", true).eq("estrutura", "NINE").order("nome")
      .then(({ data }: any) => setMetodos(data || []));
  }, []);

  useEffect(() => {
    if (!athleteId) return;
    db.from("vw_alunos_canonical").select("nivel").or(`athlete_id.eq.${athleteId},id.eq.${athleteId}`).limit(1)
      .then(({ data }: any) => setNivel(normalizeNivel(data?.[0]?.nivel)));
  }, [athleteId]);

  // Load existing choice for athlete/date
  useEffect(() => {
    if (!athleteId || !date) return;
    db.from("prescricao_metodo").select("metodo_codigo").eq("athlete_id", athleteId).eq("workout_date", date).eq("escopo", "treino").limit(1)
      .then(({ data }: any) => setCodigo(data?.[0]?.metodo_codigo || NONE));
  }, [athleteId, date]);

  useEffect(() => {
    setParams(null);
    if (codigo === NONE || !nivel) return;
    db.from("densificacao_parametros").select("*").eq("metodo_codigo", codigo).eq("nivel", nivel).limit(1)
      .then(({ data }: any) => setParams(data?.[0] || null));
  }, [codigo, nivel]);

  const handleChange = async (value: string) => {
    if (!athleteId) { setMsg({ type: "err", text: "Selecione um aluno antes de escolher o método." }); return; }
    const prev = codigo;
    setCodigo(value); setSaving(true); setMsg(null);
    try {
      const { error: delErr } = await db.from("prescricao_metodo").delete()
        .eq("athlete_id", athleteId).eq("workout_date", date).eq("escopo", "treino");
      if (delErr) throw delErr;
      if (value !== NONE) {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await db.from("prescricao_metodo").insert({
          athlete_id: athleteId, workout_date: date, escopo: "treino", metodo_codigo: value,
          workout_exercise_id: null, definido_por: session?.user?.id ?? null,
        });
        if (error) throw error;
      }
      setMsg({ type: "ok", text: value === NONE ? "Método removido." : "Método salvo." });
    } catch (e: any) {
      setCodigo(prev);
      setMsg({ type: "err", text: `Não foi possível salvar o método: ${e?.message || "erro desconhecido"}` });
    } finally { setSaving(false); }
  };

  const range = (a: number | null, b: number | null, suf = "") =>
    a == null && b == null ? "—" : a === b || b == null ? `${a}${suf}` : `${a}–${b}${suf}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Densificação (método NINE)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Data do treino</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Método (opcional)</Label>
            <Select value={codigo} onValueChange={handleChange} disabled={saving}>
              <SelectTrigger><SelectValue placeholder="Sem método" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sem método</SelectItem>
                {metodos.map(m => <SelectItem key={m.codigo} value={m.codigo}>{m.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {params && (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><p className="text-muted-foreground">Séries</p><p className="font-mono">{range(params.series_min, params.series_max)}</p></div>
            <div><p className="text-muted-foreground">Descanso</p><p className="font-mono">{range(params.descanso_intra_seg_min, params.descanso_intra_seg_max, "s")}{params.descanso_pos_seg != null ? ` · pós ${params.descanso_pos_seg}s` : ""}</p></div>
            <div><p className="text-muted-foreground">Limite/sessão</p><p className="font-mono">{params.limite_por_sessao ?? "—"}</p></div>
          </div>
        )}
        {msg && <p role={msg.type === "err" ? "alert" : undefined} className={msg.type === "err" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{msg.text}</p>}
      </CardContent>
    </Card>
  );
}
