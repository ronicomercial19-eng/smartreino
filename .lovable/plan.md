

# Plano: Geracao Completa de Treinos baseada em Periodizacao (Macro/Meso/Micro)

## Problema Atual

1. A pagina `PeriodizationUpload` analisa periodizacao com IA mas **nao gera treinos completos** - apenas mostra blocos genericos com dados mock (random)
2. A edge function `analyze-periodization` retorna sugestoes e estrutura, mas **nao produz um plano dia-a-dia com exercicios**
3. Existem **44 modelos de periodizacao** em `periodization_models` com macro/meso/microciclos estruturados, mas nao sao usados para gerar treinos reais
4. O resultado da analise nao e salvo no banco - fica apenas em estado local

## Fluxo Proposto

```text
Upload/Paste Periodizacao (ou selecionar modelo existente)
    |
    v
IA analisa: identifica macro/meso/microciclos
    |
    v
Sistema cruza com periodization_models (44 modelos)
    |
    v
Nova edge function: generate-full-plan
    - Recebe: estrutura de periodizacao + dados do aluno
    - IA gera plano COMPLETO: ano > mes > semana > dia
    - Cada dia tem exercicios com series/reps/descanso/obs
    |
    v
Salva em planos_treino_aluno (estrutura_treino JSONB)
    |
    v
Exibe plano organizado na UI com navegacao por fase/semana/dia
```

## O que sera implementado

### 1. Nova Edge Function: `generate-full-plan`

Recebe a periodizacao analisada + perfil do aluno e gera o plano completo com IA:

- Input: `{ studentId, periodizationModelId?, periodizationText?, formData }`
- Busca dados do aluno em `alunos` (todos os 15 campos de treino)
- Se `periodizationModelId`, busca macro/meso/micro de `periodization_models`
- Prompt IA estruturado pedindo JSON com:
  - `macrociclo` (nome, duracao total)
  - `mesociclos[]` (fase, semanas, foco, volume, intensidade)
  - `semanas[]` (numero, fase, foco)
  - `dias[]` (dia da semana, tipo treino, exercicios com series/reps/descanso/observacao)
- Salva resultado em `planos_treino_aluno` com `tipo_periodizacao`, `fase_atual`
- Tambem salva em `planos_de_treino_gerados` para compatibilidade

### 2. Componente `FullPlanView.tsx`

Novo componente para exibir o plano completo gerado, com navegacao:

- Vista hierarquica: Macrociclo > Mesociclo > Semana > Dia
- Tabs ou accordion para navegar entre fases
- Cards por dia mostrando exercicios no template 9FIT
- Barra de progresso mostrando semana atual
- Botoes: exportar PDF, enviar ao aluno, editar

### 3. Atualizar `PeriodizationUpload.tsx`

- Adicionar selector de modelos de periodizacao existentes (44 modelos do banco)
- Ao analisar, mostrar opcao "Gerar Plano Completo" que chama `generate-full-plan`
- Tab "Meus Treinos" mostra planos gerados do banco (nao mais dados mock)
- Vincular ao aluno selecionado

### 4. Atualizar `analyze-periodization` edge function

- Melhorar o prompt para extrair estrutura macro/meso/micro mais precisa do texto colado
- Retornar formato padronizado que alimenta `generate-full-plan`

## Estrutura JSONB do Plano Completo (em `estrutura_treino`)

```json
{
  "macrociclo": {
    "nome": "Hipertrofia Linear 24 semanas",
    "duracao_semanas": 24
  },
  "mesociclos": [
    {
      "nome": "Adaptacao Anatomica",
      "semana_inicio": 1,
      "semana_fim": 4,
      "foco": "Tecnica e resistencia muscular",
      "volume": "Alto",
      "intensidade": "Baixa"
    }
  ],
  "semanas": [
    {
      "numero": 1,
      "mesociclo": "Adaptacao Anatomica",
      "dias": [
        {
          "dia": "Segunda",
          "nome": "Treino A - Peito e Triceps",
          "tipo": "Peito e Triceps",
          "exercicios": [
            {
              "nome": "Supino Reto",
              "series": "3",
              "repeticoes": "12-15",
              "descanso": "60s",
              "observacao": "Foco em tecnica"
            }
          ]
        }
      ]
    }
  ]
}
```

## Arquivos a Criar

1. **`supabase/functions/generate-full-plan/index.ts`** - Edge function que recebe periodizacao + aluno e gera plano completo dia-a-dia via IA
2. **`src/components/workout/FullPlanView.tsx`** - Componente de visualizacao hierarquica do plano (macro > meso > semana > dia)

## Arquivos a Modificar

1. **`supabase/config.toml`** - Adicionar `generate-full-plan` com `verify_jwt = false`
2. **`src/pages/PeriodizationUpload.tsx`** - Adicionar selector de modelos, botao "Gerar Plano Completo", e exibicao via `FullPlanView`
3. **`supabase/functions/analyze-periodization/index.ts`** - Melhorar prompt para extrair macro/meso/micro com mais precisao

## Migracao SQL

Nenhuma necessaria - `planos_treino_aluno.estrutura_treino` ja e JSONB e comporta a estrutura completa. Campos `tipo_periodizacao` e `fase_atual` ja existem.

