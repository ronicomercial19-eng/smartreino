

# Matriz 9x9x9 — 729 Protocolos no Smart Treino Builder

## Contexto

A conversa com o Gemini definiu uma arquitetura de treinamento profunda:
- **9 Protocolos Chefes** (VMAX, Threshold, Endurance, Tensão Mecânica, Estresse Metabólico, Simetria & Fluxo, Reativo, Mobilidade Carregada, Resiliência)
- **9 Variações Modulares** por protocolo (fases de progressão anual)
- **9 Modelos de Treino** por variação (progressão semanal/mensal)
- **Estrutura de prescrição obrigatória**: Neural → Integração → Bloco 9 → Reset

O sistema atual do Smart Treino Builder conhece apenas 4 macrociclos genéricos e não tem conceito de protocolo, variação modular nem blocos de prescrição (Neural/Integração/9/Reset).

## O que será construído

### 1. Tabela de Protocolos no Supabase

Nova tabela `smart_treino_protocols` com os 729 registros pré-populados:

| Campo | Tipo | Exemplo |
|-------|------|---------|
| `id` | text PK | `"4.5.3"` |
| `pillar` | text | `"estrutural"` |
| `pillar_label` | text | `"Estrutural & Morfológico"` |
| `protocol_id` | int (1-9) | `4` |
| `protocol_name` | text | `"Tensão Mecânica"` |
| `protocol_axis` | text | `"Recrutamento de fibras brancas"` |
| `variation_id` | int (1-9) | `5` |
| `variation_name` | text | `"Excêntrico"` |
| `variation_focus` | text | `"Fase negativa lenta"` |
| `model_id` | int (1-9) | `3` |
| `model_description` | text | `"Excêntrica 5s com pausa isométrica 2s"` |
| `block_neural` | text | `"Isometria máxima 6s no exercício principal"` |
| `block_integration` | text | `"Mobilidade articular específica"` |
| `block_9_template` | jsonb | `{"sets":"3-4","reps":"6-8","cadence":"5:2:1:0","rest":90}` |
| `block_reset` | text | `"Alongamento estático do músculo alvo"` |
| `rpe_range` | text | `"7-8"` |
| `recommended_for` | text[] | `["intermediario","avancado"]` |

Isso permite que o professor selecione protocolo → variação → modelo, e o sistema já entrega os blocos preenchidos com parâmetros corretos.

### 2. Seed dos 729 registros via Edge Function

Uma edge function `seed-protocols` que gera os 729 registros usando a IA (Gemini) baseada no dossiê completo da conversa. Chamada uma única vez pelo admin para popular a tabela.

Alternativamente, podemos gerar os dados via script e inserir via migration — mais confiável e sem custo de IA.

### 3. Atualizar o Wizard do Smart Treino Builder

**Etapa 2 (Periodização)** — Substituir o selector simples de "Macro 1-4" por:

1. **Pilar** (Performance / Estrutural / Longevidade) — 3 opções
2. **Protocolo Chefe** (1-9) — filtrado pelo pilar selecionado
3. **Variação Modular** (1-9) — filtrado pelo protocolo
4. **Modelo de Treino** (1-9) — filtrado pela variação

Cada seleção auto-preenche os parâmetros (RPE, reps, descanso, blocos Neural/Integração/9/Reset).

**Etapa 4 (Parâmetros)** — Mostrar os 4 blocos obrigatórios:
- Bloco Neural (pré-preenchido pelo modelo)
- Bloco Integração (pré-preenchido)
- Bloco 9 (parâmetros de execução: séries, reps, cadência, descanso)
- Bloco Reset (pré-preenchido)

O professor pode ajustar texto mas os parâmetros numéricos vêm do modelo.

### 4. Atualizar a Edge Function `generate-smart-treino`

O prompt do sistema incluirá:
- O protocolo selecionado (nome, eixo, variação, modelo)
- Os 4 blocos de prescrição como template obrigatório
- A IA deve gerar exercícios organizados nos 4 blocos (Neural → Integração → Bloco 9 → Reset) em vez de apenas "slots" genéricos

Output atualizado por sessão:
```json
{
  "session_label": "A",
  "session_name": "MMII Anterior + Core",
  "blocks": {
    "neural": [{ "exercise": "Prancha isométrica", "sets": 2, "duration": "30s" }],
    "integration": [{ "exercise": "Avanço com rotação", "sets": 2, "reps": "8" }],
    "block_9": [{ "movement_pattern": "Agachamento bilateral", "sets": 4, "reps": "6-8", "cadence": "5:0:1:0", "rest": 90 }],
    "reset": [{ "exercise": "L.M. Quadríceps + Respiração 4-2-6", "duration": "3min" }]
  }
}
```

### 5. Atualizar a Visualização (StepReviewGenerate)

Mostrar o treino gerado com os 4 blocos visuais (cards coloridos):
- 🟢 Neural (verde) 
- 🔵 Integração (azul)
- 🟠 Bloco 9 (laranja — cor da marca)
- ⚪ Reset (cinza)

### 6. Salvar protocolo selecionado na tabela `smart_treino_macro_rules`

Adicionar colunas: `protocol_code` (text, ex: "4.5.3"), `pillar`, `protocol_name`, `variation_name`, `model_name`.

## Arquivos criados/modificados

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/smart_treino_protocols.sql` | Nova tabela + seed de 729 registros |
| `supabase/migrations/macro_rules_protocol_cols.sql` | Colunas adicionais em `smart_treino_macro_rules` |
| `src/services/smartTreinoService.ts` | Adicionar tipos e queries para protocolos |
| `src/components/smart-treino/StepMacroRules.tsx` | Seletor hierárquico Pilar → Protocolo → Variação → Modelo |
| `src/components/smart-treino/StepParameters.tsx` | Mostrar 4 blocos (Neural/Integração/9/Reset) |
| `src/components/smart-treino/StepReviewGenerate.tsx` | Visualização em 4 blocos com cores |
| `supabase/functions/generate-smart-treino/index.ts` | Prompt atualizado com blocos e contexto de protocolo |

## Questão de seed

Os 729 registros serão gerados como dados estáticos na migration SQL. Cada registro terá as instruções de bloco (Neural, Integração, Bloco 9, Reset) baseadas na conversa com o Gemini. Isso garante consistência e não depende de chamadas de IA para popular.

