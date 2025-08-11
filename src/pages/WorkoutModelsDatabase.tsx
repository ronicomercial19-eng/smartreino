import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Download, Eye, BarChart3 } from "lucide-react";
import { workoutModelsService } from '@/services/workoutModelsService';
import { useToast } from '@/hooks/use-toast';

export default function WorkoutModelsDatabase() {
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [stats, setStats] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [models, searchTerm, selectedLevel, selectedPhase]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modelsData, statsData] = await Promise.all([
        workoutModelsService.getAllWorkoutModels(),
        workoutModelsService.getWorkoutStatistics()
      ]);
      
      setModels(modelsData || []);
      setStats(statsData);
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

  const applyFilters = () => {
    let filtered = [...models];

    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.general_objective?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.method_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel) {
      filtered = filtered.filter(model => model.level === selectedLevel);
    }

    if (selectedPhase) {
      filtered = filtered.filter(model => model.periodization_phase === selectedPhase);
    }

    setFilteredModels(filtered);
  };

  const handleExport = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo preparados para download..."
    });
  };

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

      {/* Stats Overview */}
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

      {/* Filters */}
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
                <SelectItem value="">Todos os níveis</SelectItem>
                <SelectItem value="Básico">Básico</SelectItem>
                <SelectItem value="Intermediário">Intermediário</SelectItem>
                <SelectItem value="Avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger className="focus-ring">
                <SelectValue placeholder="Filtrar por fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as fases</SelectItem>
                <SelectItem value="Base">Base</SelectItem>
                <SelectItem value="Intensificação">Intensificação</SelectItem>
                <SelectItem value="Realização">Realização</SelectItem>
                <SelectItem value="Deload">Deload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            Mostrando {filteredModels.length} de {models.length} modelos
          </div>
        </CardContent>
      </Card>

      {/* Models Grid */}
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
