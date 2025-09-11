import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Play, Clock, Target } from "lucide-react";
import { generatedPlansService, GeneratedPlan } from "@/services/generatedPlansService";
import { simpleModelsService, SimpleModel } from "@/services/simpleModelsService";
import { periodizationNewService, PeriodizacaoSemanal } from "@/services/periodizationNewService";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

export default function MeusTreinos() {
  const [planos, setPlanos] = useState<GeneratedPlan[]>([]);
  const [modelos, setModelos] = useState<{ [key: string]: SimpleModel }>({});
  const [periodizacao, setPeriodizacao] = useState<PeriodizacaoSemanal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [estudanteId, setEstudanteId] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setEstudanteId(user.id);
        }
      } catch (error) {
        console.error('Erro ao obter usuário:', error);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    if (estudanteId) {
      loadData();
    }
  }, [estudanteId]);

  const loadData = async () => {
    if (!estudanteId) return;
    
    try {
      setLoading(true);
      
      // Carregar planos gerados
      const planosData = await generatedPlansService.getByStudent(estudanteId);
      setPlanos(planosData);

      // Carregar modelos dos planos
      const modelosData: { [key: string]: SimpleModel } = {};
      for (const plano of planosData) {
        if (plano.modelo_id) {
          const modelo = await simpleModelsService.getById(plano.modelo_id);
          if (modelo) {
            modelosData[plano.modelo_id] = modelo;
          }
        }
      }
      setModelos(modelosData);

      // Carregar periodização
      const periodizacaoData = await periodizationNewService.getByStudent(estudanteId);
      setPeriodizacao(periodizacaoData);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus treinos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const iniciarTreino = (plano: GeneratedPlan) => {
    toast({
      title: "Treino Iniciado",
      description: `Iniciando treino: ${modelos[plano.modelo_id]?.nome || 'Modelo'}`,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Meus Treinos</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seus planos de treino e acompanhe seu progresso
        </p>
      </div>

      <Tabs defaultValue="planos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="planos">Planos de Treino</TabsTrigger>
          <TabsTrigger value="periodizacao">Periodização</TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="space-y-6">
          {planos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Target className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum plano encontrado</h3>
                <p className="text-muted-foreground text-center">
                  Você ainda não possui planos de treino gerados. Acesse a biblioteca de modelos para criar seu primeiro plano.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {planos.map((plano) => {
                const modelo = modelos[plano.modelo_id];
                return (
                  <Card key={plano.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {modelo?.nome || 'Plano de Treino'}
                        </CardTitle>
                        <Badge variant="secondary">Ativo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {modelo?.descricao && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {modelo.descricao}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          <span>{modelo?.duracao_em_semanas || 0} semanas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(plano.criado_em).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => iniciarTreino(plano)} 
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Treino
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="periodizacao" className="space-y-6">
          {periodizacao.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Target className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma periodização encontrada</h3>
                <p className="text-muted-foreground text-center">
                  Você ainda não possui dados de periodização. Faça upload de seu arquivo de periodização para visualizar os dados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Análise de Periodização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Semana</th>
                        <th className="text-left p-3 font-semibold">Carga Prevista</th>
                        <th className="text-left p-3 font-semibold">Carga Real</th>
                        <th className="text-left p-3 font-semibold">Diferença</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periodizacao.map((periodo) => (
                        <tr key={periodo.semana} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">Semana {periodo.semana}</td>
                          <td className="p-3">{periodo.carga_prevista || '-'}</td>
                          <td className="p-3">{periodo.carga_real || '-'}</td>
                          <td className="p-3">
                            {periodo.diferenca !== null ? (
                              <span className={periodo.diferenca >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {periodo.diferenca > 0 ? '+' : ''}{periodo.diferenca}
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}