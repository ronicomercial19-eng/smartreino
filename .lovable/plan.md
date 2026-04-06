

# Correções Críticas: Chat IA + Smart Treino + Catálogo + Periodização

## Problemas Diagnosticados

1. **Chat IA não aplica mudanças**: A Edge Function `modify-workout` usa `authSupabase.auth.getClaims(token)` que **não existe** no Supabase JS SDK. Retorna 401 sempre. A IA responde com texto mas `updatedPlan` nunca chega.

2. **Smart Treino Builder não encontra atletas**: Busca na tabela `athletes` com `coach_id`, mas o usuário logado pode ter ID diferente do `coach_id`. Além disso, também deveria buscar da tabela `alunos` (que tem 5 registros com `professor_id`).

3. **Catálogo 9x9x9 não mostra todos protocolos**: Os 729 registros existem no banco. O problema é o limite padrão de 1000 rows do Supabase (ok neste caso), mas a query sem `.limit()` pode falhar se RLS bloquear. Verificar RLS na tabela `smart_treino_protocols`.

4. **Importação de periodização para treino**: Não existe fluxo para importar dados de periodização salva e usar como base para geração de treino completo.

---

## Correções

### 1. Fix `modify-workout` Edge Function
**Arquivo**: `supabase/functions/modify-workout/index.ts`

- Substituir `auth.getClaims(token)` por `auth.getUser(token)` — método que realmente existe
- Extrair `user.id` do resultado
- Garantir que o JSON parse da resposta da IA funcione corretamente
- Após save no banco via `handlePlanUpdate`, o `WorkoutPlan.tsx` já re-renderiza (fluxo correto)

### 2. Fix Smart Treino Builder — Busca de Atletas
**Arquivo**: `src/pages/SmartTreinoBuilder.tsx`

- Buscar de **ambas** tabelas: `athletes` (campo `name`, `coach_id`) e `alunos` (campo `nome`, `professor_id`)
- Unificar em um único seletor com label da origem
- Garantir que o `selectedAlunoId` funcione com ambas tabelas

### 3. Fix Catálogo de Protocolos
**Arquivo**: `src/pages/ProtocolCatalog.tsx`

- Adicionar `.limit(1000)` explícito na query (729 < 1000, mas seguro)
- Usar `(supabase as any)` caso a tabela não esteja nos types gerados
- Verificar/criar RLS policy para `smart_treino_protocols` (SELECT para authenticated)

### 4. Importação de Periodização para Treino
**Arquivo**: `src/pages/WorkoutPlan.tsx` + novo componente

- Adicionar botão "Importar Periodização" no `WorkoutPlan` e/ou no `GenerateWorkout`
- Buscar periodizações salvas do aluno (`saved_periodizations`, `athlete_periodizations`, `periodization_plans`)
- Injetar dados da periodização (macrociclo, mesociclo, fase atual) como contexto na geração de treino
- Passar esse contexto ao `generate-workout` edge function

---

## Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `supabase/functions/modify-workout/index.ts` | Fix auth: `getClaims` → `getUser` |
| `src/pages/SmartTreinoBuilder.tsx` | Buscar atletas de `athletes` + `alunos` |
| `src/pages/ProtocolCatalog.tsx` | Fix query limit + RLS |
| `src/pages/GenerateWorkout.tsx` | Seletor de periodização como contexto |
| Migration SQL | RLS SELECT para `smart_treino_protocols` |

