
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Clock, 
  Target,
  Dumbbell,
  CheckCircle2,
  Info,
  Lightbulb,
  AlertTriangle,
  Timer,
  Repeat,
  RotateCcw
} from "lucide-react";
import { Exercise } from "@/data/expandedExerciseDatabase";
import { useState } from "react";

interface EnhancedExerciseCardProps {
  exercise: Exercise;
  onAddToWorkout?: (exercise: Exercise) => void;
}

const EnhancedExerciseCard = ({ exercise, onAddToWorkout }: EnhancedExerciseCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediário':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Avançado':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'peso-corporal':
        return '💪';
      case 'forca':
        return '🏋️';
      case 'cardio':
        return '❤️';
      case 'core':
        return '⚡';
      case 'mobilidade':
        return '🤸';
      case 'funcional':
        return '🎯';
      case 'pliometrico':
        return '💥';
      default:
        return '🎯';
    }
  };

  return (
    <Card className="bg-black/30 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{getCategoryIcon(exercise.category)}</span>
              <CardTitle className="text-white text-lg">{exercise.name}</CardTitle>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getDifficultyColor(exercise.difficulty)}>
                {exercise.difficulty}
              </Badge>
              {exercise.equipment !== "Peso Corporal" && (
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  {exercise.equipment}
                </Badge>
              )}
            </div>
            {/* Músculos Primários */}
            {exercise.targetMuscles && (
              <div className="flex flex-wrap gap-1 mt-2">
                {exercise.targetMuscles.slice(0, 2).map((muscle, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                    {muscle}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm leading-relaxed">{exercise.description}</p>
        
        {/* Informações Principais */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 text-blue-400 mr-2" />
            <span className="text-gray-300">{exercise.duration}</span>
          </div>
          <div className="flex items-center text-sm">
            <Target className="h-4 w-4 text-purple-400 mr-2" />
            <span className="text-gray-300">{exercise.muscleGroup.length} grupos</span>
          </div>
          {exercise.sets && (
            <div className="flex items-center text-sm">
              <Repeat className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-gray-300">{exercise.sets} séries</span>
            </div>
          )}
          {exercise.restTime && (
            <div className="flex items-center text-sm">
              <Timer className="h-4 w-4 text-orange-400 mr-2" />
              <span className="text-gray-300">{exercise.restTime}</span>
            </div>
          )}
        </div>

        {/* Músculos Trabalhados */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Músculos Trabalhados:</p>
          <div className="flex flex-wrap gap-1">
            {exercise.muscleGroup.map((muscle, index) => (
              <Badge key={index} variant="outline" className="text-xs border-white/20 text-gray-300">
                {muscle}
              </Badge>
            ))}
          </div>
        </div>

        {showDetails && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            {/* Instruções */}
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                Como Executar:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300 ml-6">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            {/* Benefícios */}
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-400" />
                Benefícios:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 ml-6">
                {exercise.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>

            {/* Dicas */}
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-400" />
                Dicas Importantes:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 ml-6">
                {exercise.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Erros Comuns */}
            {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
                  Erros Comuns:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 ml-6">
                  {exercise.commonMistakes.map((mistake, index) => (
                    <li key={index} className="text-red-300">{mistake}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Músculos Secundários */}
            {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2">Músculos Secundários:</h4>
                <div className="flex flex-wrap gap-1">
                  {exercise.secondaryMuscles.map((muscle, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Variações */}
            {exercise.variations && exercise.variations.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <RotateCcw className="h-4 w-4 mr-2 text-cyan-400" />
                  Variações:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {exercise.variations.map((variation, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-300">
                      {variation}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Separator className="bg-white/10" />

        <div className="flex space-x-2">
          <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Play className="h-4 w-4 mr-2" />
            Ver Demonstração
          </Button>
          {onAddToWorkout && (
            <Button 
              variant="outline" 
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              onClick={() => onAddToWorkout(exercise)}
            >
              Adicionar ao Treino
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedExerciseCard;
