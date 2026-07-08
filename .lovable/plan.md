Objetivo: entregar geração de treinos 100% via RPC (banco), sem depender de Edge Function paga. Base = catálogo. IA só em modo avançado. Provas coladas com athlete_id da Fernanda (18fabf10-6ab7-4c09-8c5c-7169516043e2).

## Bloco 1 — Smart Treino Builder (RPC direta)

Estado atual: `smartTreinoService.generateSmartTreino` já chama `fn_gerar_treino_semana`. Ajustes:

1. Em `src/pages/SmartTreinoBuilder.tsx` (`handleGenerate`):
  - Após retorno da RPC, executar SELECT de verificação em `daily_workouts` para o `athlete_id` na semana atual (Seg-Dom) e mostrar lista D1–D7 (data, `workout_type`, contagem de `workout_exercises`) num painel de confirmação inline (usar componentes já existentes, sem novo CSS).
  - Prévia visível de `categoria` e `dias_semana` derivados em `StepReviewGenerate` antes do clique (badges dentro do card de revisão já existente).
  - Se `data.success !== true` ou `daily_workouts` vazio → toast destrutivo com payload cru.
2. Prova: rodar `generateSmartTreino('18fabf10-…','Hipertrofia',4)` e colar `{ success, categoria, dias_gerados }` + `SELECT workout_date, workout_type FROM daily_workouts WHERE athlete_id=… ORDER BY workout_date`.

## Bloco 2 — Catálogo 9×9×9 (botão Gerar)

Em `src/pages/ProtocolCatalog.tsx`:

1. Adicionar `<StudentSelector>` (já existe em `src/components/analytics/StudentSelector.tsx`) no topo da página, guardando `selectedAthleteId` em estado.
2. Ao lado de cada modelo (linha do model card, dentro do bloco já renderizado) adicionar botão `Gerar` (variant outline sm) que:
  - Desabilita se `!selectedAthleteId` (tooltip "selecione um aluno antes").
  - Chama `supabase.rpc('fn_aplicar_protocolo_9x9x9', { p_athlete_id, p_protocol_id: m.id, p_data: hoje })`.
  - Toast com `daily_workout_id`, `protocol_name`, `pillar`, `workout_type_aplicado`.
3. Antes de escrever, rodar `SELECT proname, pg_get_function_identity_arguments(oid) FROM pg_proc WHERE proname='fn_aplicar_protocolo_9x9x9'` para confirmar assinatura.

Prova: aplicar `1.1.1` na Fernanda e colar payload.

## Bloco 3 — Plano Periodizado

Não alterar código. Se o 402 aparecer, mostrar toast já existente com a mensagem crua. Nada mais.

## Bloco 4 — GenerateWorkout (Catálogo-first)

Reescrever `handleGenerate` em `src/pages/GenerateWorkout.tsx`:

1. Padrão (não-avançado): chamar `supabase.rpc('fn_gerar_treino_semana', { p_athlete_id: aluno.id, p_categoria: mapObjetivo(objetivo), p_dias_semana: parseInt(frequencia) })`.
  - Mapeamento objetivo→categoria já usado no Builder.
2. Toggle "Modo avançado (usar IA)" (Switch shadcn existente, sem CSS novo). Só se marcado, cai no fluxo `WorkoutAIService.generateWorkout` atual (Edge Function).
3. Após RPC OK, verificação `SELECT` em `daily_workouts` da semana e navegação para `/meus-treinos?aluno=…` (rota existente) em vez de `/workout-plan/:id` (que dependia de plano legado).
4. Chamar `fitpro-deliver-week` fire-and-forget.

Prova: gerar para Fernanda com Hipertrofia/4 dias e colar retorno + linhas de `daily_workouts`.

## Bloco 5 — Página de status `fitpro-deliver-week`

Já existe `FitproDeliveryStatus.tsx`. Estender:

1. Adicionar card no topo "Última entrega semanal" — lê `fitpro_delivery_log` filtrando por `source='week_deliver'`, agrupa por `athlete_id + week_start` (derivado de `workout_date` da segunda).
2. Botão "Reprocessar semana" que chama `supabase.functions.invoke('fitpro-deliver-week', { body: { athlete_id, week_start } })`.
3. Manter todo o resto igual (auto-refresh 30s, retry por linha).

## Arquivos alterados

- `src/pages/SmartTreinoBuilder.tsx` — prévia + verificação D1–D7
- `src/components/smart-treino/StepReviewGenerate.tsx` — badges categoria/dias
- `src/pages/ProtocolCatalog.tsx` — student selector + botão Gerar
- `src/pages/GenerateWorkout.tsx` — RPC-first + toggle IA avançado
- `src/pages/FitproDeliveryStatus.tsx` — seção semana + retry

## Regras obrigatórias

- Nenhuma migration/CREATE FUNCTION. Só consumir RPCs existentes (`fn_gerar_treino_semana`, `fn_aplicar_protocolo_9x9x9`).
- Auditar assinatura das duas RPCs com `pg_proc` antes de chamar.
- Sem alteração de layout/CSS. Só reutilizar componentes atuais.
- Provas obrigatórias por bloco antes de dar por pronto.  
respectivas atualizaçeos do frontend/ design   
entrega dos treinos semanais para o aluno em semana no fitpro   
