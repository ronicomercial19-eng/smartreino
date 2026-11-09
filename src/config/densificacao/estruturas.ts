/**
 * Estruturas de prescrição 9FIT: NINE e LIMA.
 *
 * Arquivo de referência, ainda NÃO importado por nenhuma tela ou função.
 * Não altera o comportamento do app nem do motor de prescrição.
 * Itens em `pendencias` aguardam confirmação do Ron.
 */

export type BlocoBanco = "neural" | "integracao" | "bloco9" | "reset";

export interface EtapaEstrutura {
  letra: string;
  nome: string;
  bloco: BlocoBanco;
  quando: "sempre" | "condicional";
  variavel?: string;
}

export interface Estrutura {
  codigo: "NINE" | "LIMA";
  objetivos: string[];
  etapas: EtapaEstrutura[];
  resetObrigatorio: boolean;
  status: "confirmada" | "pendente";
  pendencias: string[];
}

export const NINE: Estrutura = {
  codigo: "NINE",
  objetivos: ["Performance", "Emagrecimento", "Hipertrofia", "HIIT"],
  etapas: [
    { letra: "N", nome: "Neural — ativa o SNC", bloco: "neural", quando: "sempre" },
    { letra: "I", nome: "Impulse / Integração — exercícios leves e integrados", bloco: "integracao", quando: "sempre" },
    { letra: "N", nome: "Nexus — centro e conexão; execução densa no core (método de densificação)", bloco: "bloco9", quando: "sempre" },
    { letra: "E", nome: "Exercise — aplicação da intensidade", bloco: "bloco9", quando: "sempre" },
    { letra: "-", nome: "Reset — recuperação, após a intensidade", bloco: "reset", quando: "sempre" },
  ],
  resetObrigatorio: true,
  status: "confirmada",
  pendencias: [],
};

export const LIMA: Estrutura = {
  codigo: "LIMA",
  objetivos: ["Reabilitação", "Alívio", "Flow", "Alongamento", "Fluidez"],
  etapas: [
    { letra: "L", nome: "Liberação — linhas miofasciais e trilhos anatômicos", bloco: "neural", quando: "sempre" },
    {
      letra: "I",
      nome: "Inibição ou Isometria, conforme a variável",
      bloco: "neural",
      quando: "condicional",
      variavel: "RML de 1 min e avaliação postural (regra proposta)",
    },
    { letra: "M", nome: "Mobilidade — ampliar a amplitude de movimento", bloco: "integracao", quando: "condicional", variavel: "avaliação postural (proposta)" },
    { letra: "A", nome: "Ativação — ativar músculos hipoativos para a função real", bloco: "integracao", quando: "sempre" },
    { letra: "-", nome: "Exercícios principais", bloco: "bloco9", quando: "sempre" },
    { letra: "-", nome: "Reset — obrigatório", bloco: "reset", quando: "sempre" },
  ],
  resetObrigatorio: true,
  status: "pendente",
  pendencias: [
    "Confirmar se RML baixo leva a Isometria e desequilíbrio postural leva a Inibição",
    "Confirmar se Mobilidade entra só com restrição postural ou sempre",
    "Confirmar o mapeamento Neural = L + I e Integração = M + A",
    "Definir o que é um RML válido antes de usar como variável",
  ],
};

export const ESTRUTURAS: Estrutura[] = [NINE, LIMA];
