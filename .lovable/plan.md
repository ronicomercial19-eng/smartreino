

# Recalibração Pragmática do Smart Treino + Chat IA em Tempo Real

## Problemas Identificados

1. **Chat IA nao atualiza treinos em tempo real**: O `WorkoutAIChat` salva mudancas no `sessionStorage` e requer click manual no botao verde. O plano atualizado nao e aplicado ao `WorkoutDisplayTemplate` imediatamente.

2. **Protocolos repetidos entre modalidades**: Os `block_9_template` e `block_neural` sao identicos dentro da mesma variacao (ex: todos 9 modelos de "Tensao Mecanica > Padrao" tem `reps:8-12, cadence:3:0:1:0, rest:75`). Os modelos diferem apenas no `model_description`, mas os parametros de execucao nao mudam.

3. **729 variacoes ja existem no banco**: Confirmado — a tabela `smart_treino_protocols` tem 729 registros com dados detalhados e diferenciados POR protocolo (Tensao Mecanica vs Estresse Metabolico tem parametros distintos). O seed function contem dados ricos e corretos.

4. **Frontend nao exibe os modelos de treino de forma navegavel**: O seletor hierarquico funciona mas nao ha uma pagina para explorar/visualizar todos os protocolos disponveis.

---

## O Que Sera Feito

### 1. Chat IA — Aplicacao em Tempo Real (sem botao verde)

**Arquivo**: `src/components/workout/WorkoutAIChat.tsx`

- Remover o fluxo de `sessionStorage` + botao de confirmacao
- Quando a IA retornar `updatedPlan`, chamar `onPlanUpdated(data.updatedPlan)` imediatamente
- O `WorkoutPlan.tsx` ja faz `setPlan({ ...plan, plano_completo: updatedPlan })` no `handlePlanUpdate`, entao a UI ja re-renderiza automaticamente
- Adicionar indicador visual de "Aplicando..." durante o save no banco

### 2. Diferenciar `block_9_template` Por Modelo

**Arquivo**: `supabase/functions/seed-protocols/index.ts`

O problema: dentro de cada variacao, os 9 modelos compartilham o mesmo `b9` template do protocolo pai. Cada modelo precisa ter seu proprio `block_9_template` com parametros especificos.

- Atualizar a funcao `generateProtocols()` para gerar `block_9_template` unico por modelo, baseado no `model_description` (ex: "3x12 RPE 6" → `{sets:"3", reps:"12", cadence:"3:0:1:0", rest:75, rpe:"6"}`)
- Fazer parsing inteligente do `model_description` para extrair sets/reps/cadencia quando descrito
- Re-executar o seed para atualizar os 729 registros com templates diferenciados

### 3. Pagina de Catalogo de Protocolos (Biblioteca 9x9x9)

**Novo arquivo**: `src/pages/ProtocolCatalog.tsx`

- Grid visual dos 9 protocolos organizados por Pilar
- Click para expandir variacoes e modelos
- Mostrar parametros de cada modelo (sets, reps, RPE, cadencia)
- Filtros por pilar, objetivo (forca/hipertrofia/emagrecimento), nivel
- Badge com cor por pilar (verde/azul/amarelo)

**Rota**: `/protocol-catalog`
**Sidebar**: Adicionar em "Treinos" submenu

### 4. Mapear Protocolos por Modalidade/Objetivo

**Arquivo**: `supabase/functions/seed-protocols/index.ts` + migration

- Adicionar campo `goal_tags` (text[]) em `smart_treino_protocols`:
  - Protocolos 1-3 (Performance) → `["performance", "emagrecimento", "cardio"]`
  - Protocolo 4 (Tensao Mecanica) → `["forca", "hipertrofia"]`
  - Protocolo 5 (Estresse Metabolico) → `["hipertrofia", "emagrecimento"]`
  - Protocolo 6 (Simetria) → `["estetica", "reabilitacao"]`
  - Protocolos 7-9 (Longevidade) → `["funcional", "longevidade", "reabilitacao"]`
- Permitir filtragem inteligente no seletor do wizard

### 5. Recalibrar `modify-workout` com Contexto do Protocolo

**Arquivo**: `supabase/functions/modify-workout/index.ts`

- Buscar o protocolo associado ao treino (se houver `protocol_code` salvo)
- Injetar contexto do protocolo 9FIT (4 blocos obrigatorios) no prompt do sistema
- Garantir que modificacoes respeitem a estrutura Neural/Integracao/Bloco9/Reset
- Manter parametros dentro do range do protocolo selecionado

---

## Arquivos Criados/Modificados

| Arquivo | Acao |
|---------|------|
| `src/components/workout/WorkoutAIChat.tsx` | Remover sessionStorage, aplicar mudancas em tempo real |
| `supabase/functions/modify-workout/index.ts` | Adicionar contexto de protocolo ao prompt |
| `supabase/functions/seed-protocols/index.ts` | Templates diferenciados por modelo |
| `supabase/migrations/protocol_goal_tags.sql` | Coluna `goal_tags` |
| `src/pages/ProtocolCatalog.tsx` | Nova pagina catalogo 9x9x9 |
| `src/App.tsx` | Rota `/protocol-catalog` |
| `src/components/AppSidebar.tsx` | Link no submenu Treinos |
| `src/components/smart-treino/StepMacroRules.tsx` | Filtro por objetivo/modalidade |

