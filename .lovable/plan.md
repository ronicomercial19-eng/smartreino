# FitPro Train — 4 fluxos sobre o eixo canônico `athlete_id`

Padroniza todos os fluxos do módulo Train do FitPro para ler/escrever exclusivamente pelas tabelas/views oficiais do `doc_smartreino.md`, eliminando dependência de `estudante_id`/`aluno_id` legados.

## Princípios (válidos para os 4 fluxos)

- Resolução do aluno: sempre `athlete_id` via `vw_athlete_full_profile` (com fallback `resolve_aluno_by_external` quando vier `student_external_id` do FitPro).
- Periodização ativa: `vw_athlete_periodizacao_ativa` (já existe) — única fonte de fase/semana/dia/categoria.
- Execução: grava em `workout_executions` (sessão) + `workout_exercises` (itens) ligados por `daily_workout_id`.
- Vídeos: prioriza `library_items` (type='videos') → fallback `exercises.video_url` / `exercises.gif_url`.
- Nenhum endpoint lê `estudante_id`, `aluno_id`, `modelos_de_treino.estudante_id`, `estruturas_de_treinamento` direto.

## Pré-requisitos de banco (migration única)

1. Criar `fn_award_xp(p_athlete_id uuid, p_amount int, p_reason text)` — atualmente ausente. Insere em `activation_events` + atualiza `aluno_score_composite`/`vw_athlete_status`.
2. Garantir coluna `workout_exercises.override_locked boolean default false` (já existe — apenas validar).
3. Conceder/validar GRANTs em `vw_athlete_periodizacao_ativa` e `vw_athlete_full_profile` para `authenticated` e `service_role`.
4. Função `aplicar_ajuste_treino_dia(p_athlete_id, p_workout_date, p_changes jsonb)` SECURITY DEFINER: aplica diff em `workout_exercises` do `daily_workout_id` do dia e seta `override_locked=true`. Garante isolamento ao dia.

## Edge Functions (novas/atualizadas, todas com `x-partner-key`)

Reusam `_shared/partner.ts` (`requirePartnerKey`, `resolveAluno`). Todas retornam `{ success, ... }` e emitem evento via `emitFitproWorkoutEvent`.

### 1. `POST /fitpro-quick-workout` (atualizar)
- GET → 3 perguntas: `objetivo_dia`, `tempo_min`, `equipamento`.
- POST → busca `workout_models` filtrando por `level` (de `vw_athlete_full_profile`) + `general_objective` (objetivo_dia) + duração compatível com `tempo_min`; fallback ad-hoc via `exercises` filtrando por `equipment` e `target_muscles`.
- Persiste `workout_executions { athlete_id, workout_date=today, phase_name='quick', status='in_progress' }` + `workout_exercises` (sem `override_locked`).
- Ao concluir: cliente chama `/fitpro-complete-workout` → status=completed + `fn_award_xp(athlete_id, 50, 'quick_workout')`.

### 2. `POST /fitpro-week-workouts` (novo)
- Input: `student_external_id`.
- Lê `planos_de_treino_gerados` (status='active') + `vw_athlete_periodizacao_ativa` → expande semana corrente em 7 dias (D1..D7).
- Para cada dia retorna `{ date, day_number, phase_name, summary, is_today, status }`.
- Apenas o dia atual vem com `executable=true` e `daily_workout_id`; demais são preview (resumo de blocos/exercícios sem `daily_workout_id`).
- Chamada de execução do dia: reusa `/fitpro-plan-workout` existente (que já materializa o `workout_executions` do dia).

### 3. `GET /fitpro-streaming-feed` (novo)
- Input: `student_external_id`.
- Lê `vw_athlete_periodizacao_ativa.current_phase_category` → consulta `library_items` `type='videos' AND category=current_phase_category` ordenado por `synced_at desc`.
- Fallback: `category='geral'`.
- Retorna `{ phase_category, items: [{id,name,thumbnail_url,player_url,category,subcategory}] }`.

### 4. `POST /fitpro-adjust-workout` (atualizar) + `POST /fitpro-copilot-adjust` (novo)
- `fitpro-adjust-workout`: input estruturado `{ student_external_id, changes:[{exercise_id, action:'swap|load|sets|add|remove', payload}] }` → chama `aplicar_ajuste_treino_dia` → retorna treino do dia atualizado. Garante `override_locked=true`. **Nunca toca em planos_de_treino_gerados/weekly_structures.**
- `fitpro-copilot-adjust`: input `{ student_external_id, command:"trocar agachamento por leg press" }` → Gemini (Lovable AI Gateway) interpreta em JSON `changes[]` no mesmo schema acima → delega para `aplicar_ajuste_treino_dia`. Resposta inclui `interpretation` (o que entendeu) + `treino_atualizado`. Se comando pedir mudança fora do dia atual, retorna `{ error:'planning_required', redirect:'/settings/planejamento' }`.

### 5. `POST /fitpro-complete-workout` (novo, suporte ao 1 e 2)
- Marca `workout_executions.status='completed'`, preenche `duration_minutes/total_volume_kg/avg_rpe`.
- Dispara `fn_award_xp(athlete_id, 100, 'workout_completed')` (ou 50 quando `phase_name='quick'`).
- Emite evento FitPro `workout_completed`.

## SDK & Documentação

- `docs/fitpro-sdk/smartreino.ts`: novos métodos `getWeekWorkouts`, `getStreamingFeed`, `adjustWorkout(changes)`, `copilotAdjust(command)`, `completeWorkout`.
- `docs/fitpro-sdk/README.md`: documentar contrato + exemplos cURL + regra "ajuste só afeta o dia".
- Postman collection: adicionar as 4 chamadas novas.

## Auditoria & remoção de leituras legadas

Sweep dos edge functions e `src/services` para garantir que nenhum dos fluxos novos toque `estudante_id`/`aluno_id`/`alunos`/`students` diretamente; toda resolução passa por `vw_athlete_full_profile` (com `resolveAluno` mantendo retrocompat para mapping FitPro).

## Detalhes técnicos

```text
┌─ FitPro Train ───────────────────────────────────────┐
│ Quick     → /fitpro-quick-workout (GET 3Q, POST gen) │
│ Semana    → /fitpro-week-workouts → /fitpro-plan-workout (dia)
│ Streaming → /fitpro-streaming-feed (library_items)   │
│ Ajuste    → /fitpro-adjust-workout (structured)      │
│ Copilot   → /fitpro-copilot-adjust (NLP→structured)  │
│ Concluir  → /fitpro-complete-workout (XP + event)    │
└──────────────────────────────────────────────────────┘
                    ↓ (todos)
   vw_athlete_full_profile · vw_athlete_periodizacao_ativa
   planos_de_treino_gerados · workout_executions · workout_exercises
   library_items · exercises · fn_award_xp
```

## Entregáveis

- 1 migration (fn_award_xp, aplicar_ajuste_treino_dia, GRANTs)
- 4 novas edge functions + 2 atualizações
- SDK TS + README + Postman atualizados
- Sem mudanças em UI do app SmartReino (somente backend/SDK para o FitPro consumir)

## Confirmar antes de implementar

- OK criar `fn_award_xp` simples (sem alterar tabelas de score existentes além de inserir em `activation_events`)?
- OK manter `phase_name='quick'` em `workout_executions` quando não há plano ativo?
- O FitPro envia `student_external_id` (mapping) ou já tem `athlete_id` real? (afeta apenas o resolver — ambos suportados.)
