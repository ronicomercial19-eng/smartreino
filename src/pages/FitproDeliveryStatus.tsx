import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, AlertCircle, CheckCircle2, Clock, CalendarDays } from "lucide-react";

interface LogRow {
  id: string;
  athlete_id: string;
  plano_id: string | null;
  workout_date: string;
  source: string;
  status: string;
  attempt_count: number;
  last_error: string | null;
  next_retry_at: string | null;
  created_at: string;
  updated_at: string;
}

const statusColor: Record<string, string> = {
  success: "bg-green-500/15 text-green-500 border-green-500/30",
  failed: "bg-red-500/15 text-red-500 border-red-500/30",
  pending: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  retrying: "bg-orange-500/15 text-orange-500 border-orange-500/30",
};

export default function FitproDeliveryStatus() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("fitpro_delivery_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) toast.error(error.message);
    setLogs((data as LogRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const retry = async (id?: string) => {
    setRetrying(id ?? "all");
    const { data, error } = await supabase.functions.invoke("fitpro-delivery-retry", {
      body: id ? { log_id: id } : {},
    });
    setRetrying(null);
    if (error) return toast.error(error.message);
    toast.success(`Reprocessadas ${data?.processed ?? 0} entregas`);
    load();
  };

  const retryWeek = async (athleteId: string, weekStart: string) => {
    setRetrying(`week:${athleteId}:${weekStart}`);
    const { data, error } = await supabase.functions.invoke("fitpro-deliver-week", {
      body: { athlete_id: athleteId, week_start: weekStart },
    });
    setRetrying(null);
    if (error) return toast.error(error.message);
    toast.success(`Semana reprocessada: ${data?.delivered ?? 0}/${data?.total ?? 7}`);
    load();
  };

  const failedCount = logs.filter(l => l.status === "failed").length;

  // Agrupa entregas semanais por (athlete_id + Monday do workout_date)
  const weekDeliveries = (() => {
    const weekLogs = logs.filter(l => l.source === "week_deliver");
    const buckets = new Map<string, { athleteId: string; weekStart: string; total: number; success: number; failed: number; last: string }>();
    for (const l of weekLogs) {
      const d = new Date(l.workout_date + "T00:00:00");
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const weekStart = monday.toISOString().slice(0, 10);
      const key = `${l.athlete_id}|${weekStart}`;
      const b = buckets.get(key) ?? { athleteId: l.athlete_id, weekStart, total: 0, success: 0, failed: 0, last: l.updated_at };
      b.total += 1;
      if (l.status === "success") b.success += 1;
      if (l.status === "failed") b.failed += 1;
      if (l.updated_at > b.last) b.last = l.updated_at;
      buckets.set(key, b);
    }
    return Array.from(buckets.values()).sort((a, b) => (a.last < b.last ? 1 : -1)).slice(0, 5);
  })();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Status de Entrega FitPro</h1>
          <p className="text-sm text-muted-foreground">
            Auditoria de todas as entregas de treino ao FitPro (auto-refresh 30s).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={() => retry()} disabled={failedCount === 0 || retrying !== null}>
            Retry todas ({failedCount})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total" value={logs.length} icon={Clock} />
        <StatCard label="Sucesso" value={logs.filter(l => l.status === "success").length} icon={CheckCircle2} tone="text-green-500" />
        <StatCard label="Falhas" value={failedCount} icon={AlertCircle} tone="text-red-500" />
        <StatCard label="Pendentes" value={logs.filter(l => ["pending","retrying"].includes(l.status)).length} icon={Clock} tone="text-blue-500" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Athlete</th>
                <th className="p-3">Source</th>
                <th className="p-3">Status</th>
                <th className="p-3">Tentativas</th>
                <th className="p-3">Erro</th>
                <th className="p-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-t border-border/50">
                  <td className="p-3 font-mono text-xs">{l.workout_date}</td>
                  <td className="p-3 font-mono text-xs">{l.athlete_id.slice(0, 8)}…</td>
                  <td className="p-3"><Badge variant="outline">{l.source}</Badge></td>
                  <td className="p-3">
                    <Badge className={statusColor[l.status] ?? ""}>{l.status}</Badge>
                  </td>
                  <td className="p-3 font-mono">{l.attempt_count}</td>
                  <td className="p-3 max-w-[240px] truncate text-red-500 text-xs">{l.last_error ?? "—"}</td>
                  <td className="p-3">
                    {l.status === "failed" && (
                      <Button size="sm" variant="outline" disabled={retrying === l.id}
                        onClick={() => retry(l.id)}>
                        Retry
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhuma entrega registrada ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone?: string }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <Icon className={`w-8 h-8 ${tone ?? "text-muted-foreground"}`} />
      <div>
        <div className="text-xs text-muted-foreground uppercase">{label}</div>
        <div className="text-2xl font-mono font-bold">{value}</div>
      </div>
    </Card>
  );
}
