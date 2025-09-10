import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Play, User, Target, Dumbbell } from "lucide-react";

export interface ModeloTreino {
  id: string;
  nome: string;
  descricao?: string;
  objetivo?: string;
  nivel?: string;
  duracao_em_semanas?: number;
  estudante_id?: string;
  tag?: string;
  periodizacao?: object;
}

interface ModelosTreinoCardProps {
  modelo: ModeloTreino;
  onEditar?: (modelo: ModeloTreino) => void;
  onGerar?: (modelo: ModeloTreino) => void;
  isOwner?: boolean;
  isLoading?: boolean;
}

export default function ModelosTreinoCard({ 
  modelo, 
  onEditar, 
  onGerar, 
  isOwner = false,
  isLoading = false 
}: ModelosTreinoCardProps) {
  return (
    <Card className="p-4 rounded-2xl shadow-sm bg-background hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {modelo.nome || 'Modelo de Treino'}
          </CardTitle>
          {modelo.tag && (
            <Badge variant={modelo.tag === 'gerado_programa' ? 'default' : 'secondary'}>
              {modelo.tag === 'gerado_programa' ? 'Gerado' : 'Manual'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {modelo.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {modelo.descricao}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {modelo.objetivo && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>{modelo.objetivo}</span>
            </div>
          )}
          {modelo.nivel && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{modelo.nivel}</span>
            </div>
          )}
          {modelo.duracao_em_semanas && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Dumbbell className="h-3 w-3" />
              <span>{modelo.duracao_em_semanas} semanas</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {onEditar && (
            <Button 
              onClick={() => onEditar(modelo)} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
          
          {isOwner && onGerar && (
            <Button 
              onClick={() => onGerar(modelo)} 
              size="sm"
              disabled={isLoading}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-1" />
              {isLoading ? 'Gerando...' : 'Gerar'}
            </Button>
          )}
        </div>

        {!isOwner && onGerar && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            Faça login para gerar modelos
          </p>
        )}
      </CardContent>
    </Card>
  );
}