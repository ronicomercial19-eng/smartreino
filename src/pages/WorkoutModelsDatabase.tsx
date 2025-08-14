
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Download, Eye, BarChart3 } from "lucide-react";
import { workoutModelsService } from '@/services/workoutModelsService';
import { useToast } from '@/hooks/use-toast';

type DistinctValues = {
  levels: string[];
  phases: string[];
  stimulusTypes: string[];
} | null;

export default function WorkoutModelsDatabase() {
  const [models, setModels] = useState<any[]>([]);
  const [filteredModels, setFilteredModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [distinctValues, setDistinctValues] = useState<DistinctValues>(null);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  // Reaplicar filtros sempre que os critérios mudarem
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedLevel, selectedPhase]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('➡️ Carregando modelos, estatísticas e valores distintos...');
      const [modelsData, statsData, distinct] = await Promise.all([
        workoutModelsService.getAllWorkoutModels(),
        workoutModelsService.getWorkoutStatistics(),
        workoutModelsService.getDistinctValues(),
      ]);

      setModels(modelsData || []);
      setFilteredModels(modelsData || []);
      setStats(statsData);
      setDistinctValues(distinct);
      console.log('✅ Dados carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados da base de modelos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setFiltering(true);
      console.log('🎛️ Aplicando filtros no Supabase:', {
        level: selectedLevel === 'all' ? undefined : selectedLevel,
        periodization_phase: selectedPhase === 'all' ? undefined : selectedPhase,
        search: searchTerm || undefined,
      });

      const filtered = await workoutModelsService.getFilteredModels({
        level: selectedLevel === 'all' ? undefined : selectedLevel,
        periodization_phase: selectedPhase === 'all' ? undefined : selectedPhase,
        search: searchTerm || undefined,
      });

      setFilteredModels(filtered || []);
      console.log(`✅ ${filtered?.length || 0} modelos após filtros`);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
      toast({
        title: "Erro nos filtros",
        description: "Não foi possível aplicar os filtros. Mostrando dados atuais.",
        variant: "destructive",
      });
    } finally {
      setFiltering(false);
    }
  };

  const handleExport = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo preparados para download..."
    });
  };

  const showingInfo = useMemo(() => {
    return `Mostrando ${filteredModels.length} de ${models.length} modelos`;
  }, [filteredModels.length, models.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-pulse-orange">
            <BarChart3 className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">Carregando base de dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading gradient-text">
            Base de Dados - Modelos de Treino
          </h1>
          <p className="text-muted-foreground">
            Explore e analise todos os modelos de treino disponíveis.
          </p>
        </div>
        <Button onClick={handleExport} className="btn-glow">
          <Download className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Modelos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-primary">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Níveis Únicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-emerald-600">
                {Object.keys(stats.byLevel || {}).length}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fases de Periodização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-blue-600">
                {Object.keys(stats.byPhase || {}).length}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tipos de Estímulo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-orange-600">
                {Object.keys(stats.byStimulusType || {}).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, objetivo ou metodologia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus-ring"
              />
            </div>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="focus-ring">
                <SelectValue placeholder="Filtrar por nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                {distinctValues?.levels?.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger className="focus-ring">
                <SelectValue placeholder="Filtrar por fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fases</SelectItem>
                {distinctValues?.phases?.map((ph) => (
                  <SelectItem key={ph} value={ph}>{ph}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            {filtering ? 'Filtrando...' : showingInfo}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="grid">Visualização em Grade</TabsTrigger>
          <TabsTrigger value="list">Visualização em Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredModels.map((model) => (
              <Card key={model.id} className="glass border-border/50 card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-heading text-lg">
                      {model.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {model.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {model.periodization_phase}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {model.general_objective}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <p><strong>Metodologia:</strong> {model.method_description}</p>
                    <p><strong>Semana:</strong> {model.week_number}</p>
                    <p><strong>Estímulo:</strong> {model.stimulus_type}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 btn-glow">
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-2">
            {filteredModels.map((model) => (
              <Card key={model.id} className="glass border-border/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold">{model.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {model.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {model.periodization_phase}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {model.general_objective}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="btn-glow">
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredModels.length === 0 && (
        <Card className="glass border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold font-heading mb-2">
              Nenhum modelo encontrado
            </h3>
            <p className="text-muted-foreground text-center">
              Tente ajustar os filtros ou termos de busca para encontrar modelos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
