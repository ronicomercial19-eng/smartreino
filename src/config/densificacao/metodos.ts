/**
 * Catálogo de métodos de densificação, por estrutura.
 *
 * Arquivo de referência, ainda NÃO importado por nenhuma tela ou função.
 * Parâmetros (séries, descanso, ordem) estão `pendente` de validação.
 * A evidência resume a pesquisa de 09/11; validar com profissional de EF.
 */

import type { BlocoBanco } from "./estruturas";

export type Evidencia = "alta" | "moderada" | "baixa" | "nao_avaliada";

export interface MetodoDensificacao {
  codigo: string;
  nome: string;
  estrutura: "NINE" | "LIMA";
  /** Onde o método entra. Na NINE, o método fica no Nexus (execução densa). */
  bloco: BlocoBanco;
  evidencia: Evidencia;
  beneficio: string;
  cautela: string;
  parametros: "pendente";
}

export const METODOS_NINE: MetodoDensificacao[] = [
  {
    codigo: "superset_agonista_antagonista",
    nome: "Superset agonista-antagonista",
    estrutura: "NINE",
    bloco: "bloco9",
    evidencia: "alta",
    beneficio: "Mesmo volume e resultado em força e hipertrofia, com sessão mais curta.",
    cautela: "Pares do mesmo músculo reduzem a carga total; evitar nesse caso.",
    parametros: "pendente",
  },
  {
    codigo: "superset_mesmo_musculo",
    nome: "Superset de mesmo músculo (biomecânica semelhante)",
    estrutura: "NINE",
    bloco: "bloco9",
    evidencia: "moderada",
    beneficio: "Concentra o estímulo em um grupo muscular.",
    cautela: "Reduz a carga total em comparação com séries tradicionais.",
    parametros: "pendente",
  },
  {
    codigo: "cluster",
    nome: "Cluster set",
    estrutura: "NINE",
    bloco: "bloco9",
    evidencia: "alta",
    beneficio: "Mantém velocidade e potência ao longo da série.",
    cautela: "Resultado crônico equivalente ao tradicional; o ganho é de qualidade da repetição.",
    parametros: "pendente",
  },
  {
    codigo: "rest_pause",
    nome: "Rest-pause",
    estrutura: "NINE",
    bloco: "bloco9",
    evidencia: "moderada",
    beneficio: "Eficiente em tempo, especialmente em máquinas.",
    cautela: "Sem evidência de superioridade sobre o tradicional.",
    parametros: "pendente",
  },
  {
    codigo: "drop_set",
    nome: "Drop set",
    estrutura: "NINE",
    bloco: "bloco9",
    evidencia: "moderada",
    beneficio: "Pode aumentar a força com múltiplas quedas de carga.",
    cautela: "Alta fadiga; limitar a poucos exercícios por sessão.",
    parametros: "pendente",
  },
  {
    codigo: "pre_exaustao",
    nome: "Pré-exaustão",
    estrutura: "NINE",
    bloco: "bloco9",
    evidencia: "baixa",
    beneficio: "Pode permitir mais volume em um músculo específico.",
    cautela: "Evidência inconclusiva; pode reduzir repetições no exercício seguinte.",
    parametros: "pendente",
  },
  {
    codigo: "piramide",
    nome: "Pirâmide",
    estrutura: "NINE",
    bloco: "bloco9",
    evidencia: "baixa",
    beneficio: "Variação de estímulo.",
    cautela: "Resultado semelhante ao tradicional.",
    parametros: "pendente",
  },
  {
    codigo: "tri_set",
    nome: "Tri-set",
    estrutura: "NINE",
    bloco: "bloco9",
    evidencia: "nao_avaliada",
    beneficio: "A confirmar.",
    cautela: "Sem evidência direta levantada nesta pesquisa.",
    parametros: "pendente",
  },
];

/** LIMA: métodos de densificação ainda não definidos (estrutura pendente). */
export const METODOS_LIMA: MetodoDensificacao[] = [];
