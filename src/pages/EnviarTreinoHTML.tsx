import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/shared/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Send, FileCode, CheckCircle2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Aluno {
  id: string;
  nome: string;
}

interface Template {
  id: string;
  slug: string;
  nome: string;
  categoria: string;
  descricao: string;
  preview_color: string;
}

export default function EnviarTreinoHTML() {
  const { id: alunoIdFromRoute } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>(alunoIdFromRoute ?? "");
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState<string>("");
  const [trainingName, setTrainingName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ url: string; template_used: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [alunosRes, templatesRes] = await Promise.all([
      (supabase as any).from("vw_alunos_canonical").select("id, athlete_id, nome"),
      (supabase as any)
        .from("training_html_templates")
        .select("id, slug, nome, categoria, descricao, preview_color")
        .eq("ativo", true)
        .order("categoria")
        .order("nome"),
    ]);

    if (alunosRes.data) {
      setAlunos(
        alunosRes.data.map((a: any) => ({ id: a.athlete_id ?? a.id, nome: a.nome ?? "Aluno" }))
      );
    }
    if (templatesRes.data) setTemplates(templatesRes.data as any);
    setLoading(false);
  };

  const grouped = templates.reduce((acc, t) => {
    if (!acc[t.categoria]) acc[t.categoria] = [];
    acc[t.categoria].push(t);
    return acc;
  }, {} as Record<string, Template[]>);

  const selectedTemplate = templates.find((t) => t.slug === selectedTemplateSlug);
  const selectedAluno = alunos.find((a) => a.id === selectedAlunoId);

  const handleEnviar = async () => {
    if (!selectedAlunoId || !selectedTemplateSlug) return;
    setSending(true);
    setResult(null);
    try {
      const { data, error } = await (supabase as any).functions.invoke("generate-training-html", {
        body: {
          athlete_id: selectedAlunoId,
          template_slug: selectedTemplateSlug,
          training_name: trainingName || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) {
        throw new Error(data.detail || data.motivo || data.error);
      }

      setResult({ url: data.url, template_used: data.template_used });
      toast({
        title: "Treino enviado",
        description: `Template "${selectedTemplate?.nome}" gerado para ${selectedAluno?.nome}.`,
      });
    } catch (e: any) {
      toast({
        title: "Erro ao gerar treino",
        description: e.message ?? "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Enviar Treino HTML" subtitle="Carregando...">
        <div />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="📤 Enviar Treino HTML" subtitle="Gerar e entregar treino a partir do catálogo de templates">
      <div className="space-y-4 max-w-3xl">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        {/* Seleção de aluno */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">1. Aluno</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAlunoId} onValueChange={setSelectedAlunoId}>
              <SelectTrigger className="w-full md:w-[320px]">
                <SelectValue placeholder="Selecionar aluno..." />
              </SelectTrigger>
              <SelectContent>
                {alunos.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Seleção de template */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">2. Template</CardTitle>
            <CardDescription>Escolha o design de entrega do treino</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(grouped).map(([categoria, tpls]) => (
              <div key={categoria} className="space-y-2">
                <p className="text-xs uppercase text-muted-foreground font-medium">{categoria}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {tpls.map((t) => {
                    const selected = t.slug === selectedTemplateSlug;
                    return (
                      <button
                        key={t.slug}
                        onClick={() => setSelectedTemplateSlug(t.slug)}
                        className={`text-left rounded-lg border p-3 transition-colors ${
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border/40 hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: t.preview_color }}
                          />
                          <span className="font-medium text-sm">{t.nome}</span>
                          {selected && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{t.descricao}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Nome opcional + envio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">3. Enviar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="training-name">Nome do treino (opcional)</Label>
              <Input
                id="training-name"
                placeholder={selectedTemplate?.nome ?? "Ex: Treino Semana 3"}
                value={trainingName}
                onChange={(e) => setTrainingName(e.target.value)}
              />
            </div>

            <Button
              onClick={handleEnviar}
              disabled={!selectedAlunoId || !selectedTemplateSlug || sending}
              className="gap-2"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Gerar e enviar treino
            </Button>

            {result && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileCode className="h-4 w-4 text-green-500" />
                  <span>
                    Gerado com <Badge variant="outline">{result.template_used}</Badge>
                  </span>
                </div>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary flex items-center gap-1 hover:underline"
                >
                  Abrir <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
