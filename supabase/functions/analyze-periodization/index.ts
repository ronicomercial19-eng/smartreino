import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // JWT Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authSupabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;
    console.log(`[analyze-periodization] Authenticated user: ${userId}`);

    const { objetivo, nivel, tempo_disponivel, restricoes, periodizacao, periodizacao_texto, lesoes, grupo_prioritario, dias_semana } = await req.json();

    console.log('📊 Iniciando análise de periodização com IA');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const prompt = buildAnalysisPrompt({ objetivo, nivel, tempo_disponivel, restricoes, periodizacao, periodizacao_texto, lesoes, grupo_prioritario, dias_semana });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em periodização de treinamento e ciência do esporte. Responda sempre em português brasileiro com análises técnicas e científicas. Retorne APENAS JSON válido.'
          },
          { role: 'user', content: prompt }
        ],
        model: 'google/gemini-2.5-flash',
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          suggestions: getFallbackSuggestions(objetivo, nivel),
          currentPhase: 'Fase Básica',
          considerations: 'Análise baseada em diretrizes gerais de periodização',
          confidence: 0.6
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    let analysisResult;
    try {
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = createFallbackAnalysis(content, objetivo, nivel);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      analysisResult = createFallbackAnalysis('', objetivo, nivel);
    }

    console.log('✅ Análise concluída com sucesso');

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-periodization function:', error);
    
    const fallbackAnalysis = {
      suggestions: [
        'Progressão gradual de volume e intensidade',
        'Alternância entre fases de acúmulo e intensificação',
        'Monitoramento da percepção subjetiva de esforço (PSE)',
        'Inclusão de períodos de recuperação ativa',
        'Variação de exercícios para evitar platô'
      ],
      currentPhase: 'Fase Básica',
      considerations: 'Análise baseada em diretrizes gerais de periodização. Recomenda-se consultar um profissional para ajustes específicos.',
      confidence: 0.65,
      extractedStructure: null,
      scientificRecommendations: [
        'Princípio da sobrecarga progressiva',
        'Periodização ondulante para otimização de resultados',
        'Deload a cada 3-4 semanas de treino intenso'
      ]
    };

    return new Response(JSON.stringify(fallbackAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildAnalysisPrompt(params: Record<string, any>): string {
  const { objetivo, nivel, tempo_disponivel, restricoes, periodizacao, periodizacao_texto, lesoes, grupo_prioritario, dias_semana } = params;
  
  return `
Você é um especialista em periodização de treinamento físico e ciência do esporte. Analise os seguintes dados e forneça uma análise COMPLETA e ESTRUTURADA:

## DADOS DO ALUNO:
- Objetivo Principal: ${objetivo || 'Não especificado'}
- Nível de Experiência: ${nivel || 'Não especificado'}
- Tempo Disponível por Sessão: ${tempo_disponivel || '60'} minutos
- Restrições/Lesões: ${restricoes || lesoes || 'Nenhuma'}
- Tipo de Periodização: ${periodizacao || 'Linear'}
- Grupo Muscular Prioritário: ${grupo_prioritario || 'Nenhum específico'}
- Dias por Semana: ${dias_semana || '3-4 dias'}

${periodizacao_texto ? `
## PERIODIZAÇÃO IMPORTADA:
${periodizacao_texto}
` : ''}

## FORNEÇA UMA ANÁLISE EM JSON COM:
{
  "suggestions": ["Lista de 5-7 sugestões específicas"],
  "currentPhase": "Nome da fase atual recomendada",
  "considerations": "Considerações especiais",
  "confidence": 0.0-1.0,
  "extractedStructure": {
    "macrocycle_weeks": número,
    "mesocycles": [{"name": "Nome", "weeks": duração, "focus": "Foco", "volume": "Alto/Moderado/Baixo", "intensity": "Alta/Moderada/Baixa"}],
    "progressions": ["Lista de progressões"],
    "optimizations": ["Lista de otimizações"]
  },
  "scientificRecommendations": ["Recomendações baseadas em evidências"],
  "weeklyPlan": [{"week": 1, "focus": "Foco", "volume_level": 1-10, "intensity_level": 1-10}]
}`;
}

function getFallbackSuggestions(objetivo: string, nivel: string): string[] {
  const suggestions: string[] = [];
  
  if (objetivo === 'hipertrofia') {
    suggestions.push('Volume progressivo de 10-20 séries por grupo muscular/semana');
    suggestions.push('Intensidade entre 65-85% de 1RM');
    suggestions.push('Tempo sob tensão de 40-70 segundos por série');
  } else if (objetivo === 'forca') {
    suggestions.push('Foco em exercícios compostos multiarticulares');
    suggestions.push('Intensidade acima de 80% de 1RM');
    suggestions.push('Descanso de 3-5 minutos entre séries pesadas');
  } else if (objetivo === 'resistencia') {
    suggestions.push('Alto volume com intensidade moderada');
    suggestions.push('Intervalos curtos entre séries (30-60s)');
    suggestions.push('Circuitos e superséries');
  }
  
  if (nivel === 'iniciante') {
    suggestions.push('Fase de adaptação anatômica de 4-6 semanas');
    suggestions.push('Priorizar aprendizado motor e técnica');
  } else if (nivel === 'avancado') {
    suggestions.push('Periodização ondulante diária para variabilidade');
    suggestions.push('Técnicas avançadas como drop sets e rest-pause');
  }
  
  suggestions.push('Monitoramento semanal de PSE e fadiga');
  suggestions.push('Ajustes baseados em resposta individual');
  
  return suggestions;
}

function createFallbackAnalysis(content: string, objetivo: string, nivel: string) {
  return {
    suggestions: getFallbackSuggestions(objetivo, nivel),
    currentPhase: nivel === 'iniciante' ? 'Adaptação Anatômica' : 'Fase de Desenvolvimento',
    considerations: content || 'Análise baseada em parâmetros básicos',
    confidence: 0.75,
    extractedStructure: null,
    scientificRecommendations: [
      'Aplicar princípio da especificidade para o objetivo definido',
      'Respeitar tempo de recuperação entre sessões',
      'Monitorar sinais de overtraining'
    ]
  };
}
