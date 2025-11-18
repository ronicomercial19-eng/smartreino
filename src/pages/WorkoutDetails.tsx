import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/AppLayout";
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  Activity, 
  Dumbbell,
  Clock,
  TrendingUp
} from "lucide-react";

export default function WorkoutDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { workout, studentId } = location.state || {};

  if (!workout) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Treino não encontrado</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const model = workout.model;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-text">
                {model?.nome || 'Detalhes do Treino'}
              </h1>
              <p className="text-muted-foreground">
                Informações detalhadas do plano de treino
              </p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Visão Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Objetivo</p>
                <Badge className="text-base">{model?.objetivo}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nível</p>
                <Badge variant="outline" className="text-base capitalize">
                  {model?.nivel}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Duração</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{model?.duracao_em_semanas} semanas</span>
                </div>
              </div>
            </div>

            {model?.descricao && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                  <p className="text-sm leading-relaxed">{model.descricao}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Periodization */}
        {model?.periodizacao && (
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Periodização
              </CardTitle>
              <CardDescription>
                Estrutura de progressão do treino
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(model.periodizacao, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Training Structure - Placeholder */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Estrutura de Treino
            </CardTitle>
            <CardDescription>
              Exercícios e séries programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Estrutura de treino detalhada será implementada</p>
              <p className="text-sm mt-2">Visualização de exercícios, séries, repetições e progressão</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate(`/meus-treinos`, { state: { selectedStudentId: studentId } })}
              >
                Voltar aos Treinos
              </Button>
              <Button className="flex-1 btn-glow">
                Editar Treino
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
