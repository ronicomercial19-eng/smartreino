
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const grokApiKey = Deno.env.get('GROK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { objetivo, nivel, tempo_disponivel, restricoes, periodizacao } = await req.json();

    const prompt = `
Você é um especialista em periodização de treinamento físico. Analise os seguintes dados do aluno e forneça recomendações específicas:

Dados do Aluno:
- Objetivo: ${objetivo}
- Nível: ${nivel}
- Tempo disponível: ${tempo_disponivel} minutos
- Restrições: ${restricoes || 'Nenhuma'}
- Tipo de periodização: ${periodizacao}

Por favor, forneça uma análise detalhada incluindo:
1. Sugestões específicas de periodização (máximo 5 pontos)
2. Fase atual recomendada
3. Considerações especiais baseadas no perfil
4. Score de confiança da análise (0-1)

Responda em formato JSON com as chaves: suggestions, currentPhase, considerations, confidence.
`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em educação física e periodização de treinamento. Responda sempre em português brasileiro com informações técnicas e práticas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'grok-beta',
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('Grok API Error:', response.status, response.statusText);
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Grok API Response:', data);
    
    let analysisResult;
    try {
      const content = data.choices[0].message.content;
      
      // Try to parse JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create structured response from text
        analysisResult = {
          suggestions: [
            'Progressão gradual baseada no nível atual',
            'Monitoramento da PSE para ajuste de intensidade',
            'Variação de estímulos para evitar adaptação',
            'Períodos de recuperação adequados',
            'Foco na técnica de execução'
          ],
          currentPhase: 'Fase de Adaptação',
          considerations: content,
          confidence: 0.8
        };
      }
    } catch (parseError) {
      console.error('Error parsing Grok response:', parseError);
      // Provide fallback analysis
      analysisResult = {
        suggestions: [
          `Para ${objetivo}, recomenda-se foco em progressão gradual`,
          `Nível ${nivel} requer atenção especial à técnica`,
          'Monitoramento constante da recuperação entre sessões',
          'Variação de exercícios para estímulo contínuo'
        ],
        currentPhase: 'Fase Inicial',
        considerations: 'Análise baseada em parâmetros básicos devido a limitações técnicas',
        confidence: 0.75
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-periodization function:', error);
    
    // Return fallback analysis instead of error
    const fallbackAnalysis = {
      suggestions: [
        'Progressão gradual de volume e intensidade',
        'Alternância entre fases de acúmulo e intensificação',
        'Monitoramento da percepção subjetiva de esforço',
        'Inclusão de períodos de recuperação ativa'
      ],
      currentPhase: 'Fase Básica',
      considerations: 'Análise baseada em diretrizes gerais de periodização',
      confidence: 0.7
    };

    return new Response(JSON.stringify(fallbackAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
