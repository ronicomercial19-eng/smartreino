

# Smart Treino v2.0 Premium — Plano de Implementação

## Resumo

Implementar o sistema completo Smart Treino v2.0 que transforma o fluxo de "professor cria treino" para "professor configura regras, sistema gera estrutura". O professor não monta treino — ele configura o sistema.

## O que será construído

### 1. Novas tabelas no Supabase (3 tabelas + 1 enum)

**`smart_treino_profiles`** — Perfil técnico do atleta (separado dos dados cadastrais em `alunos`)
- `aluno_id`, `dominant_profile` (enum), `secondary_profile`, `score_global` (numeric), `gargalos_tecnicos` (text[]), `riscos_estruturais` (text[]), `modalidade_principal` (varchar)

**`smart_treino_macro_rules`** — Regras do macrociclo atual
- `aluno_id`, `macro_number` (1-4), `macro_objetivo` (text), `reps_range` (varchar), `rpe_target` (numeric), `progression_type` (varchar), `density_control` (boolean), `volume_locked` (boolean), `deload_planned` (boolean), `descanso_compostos` (varchar), `descanso_acessorios` (varchar), `descanso_core` (varchar), `carga_inicial_percent` (numeric), `status` (active/archived)

**`smart_treino_muscle_volume`** — Volume semanal por grupo muscular
- `macro_rules_id` (FK), `muscle_group` (varchar), `weekly_sets` (int), `is_emphasis` (boolean), `distribution_json` (jsonb — ex: `{"A": 8, "B": 6, "C": 6, "D": 6}`)

### 2. Nova Edge Function: `generate-smart-treino`

Recebe: `aluno_id` + `macro_rules_id`

Lógica:
1. Busca perfil técnico (`smart_treino_profiles`)
2. Busca regras do macro (`smart_treino_macro_rules`)
3. Busca volumes musculares (`smart_treino_muscle_volume`)
4. Constrói prompt com o dossiê completo (o prompt do Smart Treino v2.0 que você forneceu)
5. Envia para Lovable AI Gateway (`google/gemini-3-flash-preview`)
6. Retorna estrutura de sessões A/B/C/D com slots de exercícios (nome do padrão de movimento, séries, reps, descanso) — **sem escolher exercícios específicos**
7. Salva resultado em `planos_treino_aluno` com `tipo_periodizacao = 'smart_treino_v2'`

O prompt inclui todas as regras do motor:
- IF técnica degrada → bloquear progressão
- IF RPE > alvo → reduzir densidade 20%
- Progressão por semana (1-3 leve, 4 absorção, 5-7 progressão, etc.)

### 3. Nova página: `/smart-treino-builder` — Wizard de 6 etapas

**Etapa 1 — Perfil do Atleta** (lê/escreve `smart_treino_profiles`)
- Score global, perfil dominante/secundário, gargalos, riscos, modalidade

**Etapa 2 — Contexto de Periodização** (lê/escreve `smart_treino_macro_rules`)
- Macro atual (1-4), objetivo do macro (auto-preenchido), modelo de periodização
- Checkboxes: técnica > carga, volume travado, densidade controlada, deload planejado

**Etapa 3 — Ênfase Muscular** (lê/escreve `smart_treino_muscle_volume`)
- Lista de 10 grupos musculares com toggle ênfase (26 séries) / normal (22 séries)
- Alerta se volume fora do padrão

**Etapa 4 — Parâmetros Fixos** (auto-preenchido pelo macro, editável)
- Reps alvo, RPE alvo, descansos, progressão permitida

**Etapa 5 — Distribuição em Sessões** (automática, confirmável)
- Mostra A/B/C/D com % de volume e foco de cada sessão
- Professor confirma ou ajusta

**Etapa 6 — Revisão + Geração**
- Resumo completo → botão "Gerar Base de Treino com IA"
- IA retorna estrutura → professor vê preview
- Botão "Selecionar Exercícios" leva para tela de seleção por slot

### 4. Componente de Seleção de Exercícios

Após a IA gerar a estrutura (padrões de movimento com séries/reps), o professor substitui cada slot por exercícios reais do banco de exercícios existente. Interface: card por slot com dropdown de exercícios filtrados por padrão de movimento.

### 5. Atualização do `AppSidebar` e rotas

- Nova rota `/smart-treino-builder` no `App.tsx`
- Link no sidebar: "Smart Treino Builder" com ícone `Zap`

## Fluxo resumido

```text
Professor seleciona aluno
  → Etapa 1: Define perfil técnico
  → Etapa 2: Define macro atual + regras
  → Etapa 3: Define ênfase muscular + volume
  → Etapa 4: Confirma parâmetros (auto)
  → Etapa 5: Confirma distribuição A/B/C/D (auto)
  → Etapa 6: IA gera base → Professor seleciona exercícios → Salva plano
```

## Arquivos modificados/criados

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/smart_treino_v2.sql` | 3 novas tabelas + RLS |
| `supabase/functions/generate-smart-treino/index.ts` | Nova edge function |
| `supabase/config.toml` | Registrar nova função |
| `src/pages/SmartTreinoBuilder.tsx` | Wizard de 6 etapas |
| `src/services/smartTreinoService.ts` | CRUD perfil + regras + volume |
| `src/components/smart-treino/StepAthleteProfile.tsx` | Etapa 1 |
| `src/components/smart-treino/StepMacroRules.tsx` | Etapa 2 |
| `src/components/smart-treino/StepMuscleVolume.tsx` | Etapa 3 |
| `src/components/smart-treino/StepParameters.tsx` | Etapa 4 |
| `src/components/smart-treino/StepDistribution.tsx` | Etapa 5 |
| `src/components/smart-treino/StepReviewGenerate.tsx` | Etapa 6 |
| `src/components/smart-treino/ExerciseSlotSelector.tsx` | Seleção de exercícios |
| `src/App.tsx` | Nova rota |
| `src/components/AppSidebar.tsx` | Novo link |

## Observações

- Usa `LOVABLE_API_KEY` já configurado (Lovable AI Gateway)
- Modelo: `google/gemini-3-flash-preview` (rápido, bom para JSON estruturado)
- Todas as tabelas terão RLS vinculado ao `professor_id` via `auth.uid()`
- Reutiliza banco de exercícios existente (`exerciseDatabase`) para seleção na etapa final

