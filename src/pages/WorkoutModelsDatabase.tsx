
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Clock, Users, Target, Calendar } from 'lucide-react';
import { workoutModelsService, WorkoutModel } from '@/services/workoutModelsService';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

const WorkoutModelsDatabase = () => {
  const [models, setModels] = useState<WorkoutModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<WorkoutModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [statistics, setStatistics] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadWorkoutModels();
    loadStatistics();
  }, []);

  useEffect(() => {
    filterModels();
  }, [models, searchTerm, selectedPhase, selectedLevel]);

  const loadWorkoutModels = async () => {
    try {
      setLoading(true);
      const data = await workoutModelsService.getAllWorkoutModels();
      setModels(data);
    } catch (error) {
      console.error('Error loading workout models:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os modelos de treino',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await workoutModelsService.getWorkoutStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const filterModels = () => {
    let filtered = models;

    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.general_objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.stimulus_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPhase !== 'all') {
      filtered = filtered.filter(model => model.periodization_phase === selectedPhase);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(model => model.level === selectedLevel);
    }

    setFilteredModels(filtered);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Básico': return 'bg-green-100 text-green-800';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800';
      case 'Avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Base': return 'bg-blue-100 text-blue-800';
      case 'Intensificação': return 'bg-orange-100 text-orange-800';
      case 'Realização': return 'bg-purple-100 text-purple-800';
      case 'Deload': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Carregando modelos de treino...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Base de Dados de Modelos de Treino
          </h1>
          <p className="text-gray-600">
            Explore nossa coleção completa de modelos de treino estruturados por periodização
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Modelos</p>
                    <p className="text-2xl font-bold">{statistics.totalModels}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Fases</p>
                    <p className="text-2xl font-bold">{Object.keys(statistics.byPhase).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Níveis</p>
                    <p className="text-2xl font-bold">{Object.keys(statistics.byLevel).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tipos de Estímulo</p>
                    <p className="text-2xl font-bold">{Object.keys(statistics.byStimulusType).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, objetivo ou tipo de estímulo..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todas as Fases</option>
                  <option value="Base">Base</option>
                  <option value="Intensificação">Intensificação</option>
                  <option value="Realização">Realização</option>
                  <option value="Deload">Deload</option>
                </select>
                
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos os Níveis</option>
                  <option value="Básico">Básico</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Mostrando {filteredModels.length} de {models.length} modelos
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <Card key={model.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                  <Badge className={getLevelColor(model.level)}>
                    {model.level}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPhaseColor(model.periodization_phase)}>
                    {model.periodization_phase}
                  </Badge>
                  <Badge variant="outline">
                    Semana {model.week_number}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {model.general_objective}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Método:</span> {model.method_description}
                  </div>
                  <div>
                    <span className="font-medium">Formato:</span> {model.format_type}
                  </div>
                  <div>
                    <span className="font-medium">Estímulo:</span> {model.stimulus_type}
                  </div>
                  
                  {model.timer_enabled && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="h-4 w-4" />
                      <span>Timer: {model.timer_type}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    {model.structure_description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhum modelo encontrado com os filtros selecionados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutModelsDatabase;
