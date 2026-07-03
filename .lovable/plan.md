# Plano — Auditoria de Entrega FitPro + Correção Auth Geração

## 1. Migração — Auditoria e Retry

Nova tabela `fitpro_delivery_log` (auditoria por `athlete_id`):

- `athlete_id`, `plano_id`, `workout_date`, `payload jsonb`, `result jsonb`
- `status` (`pending` | `success` | `failed` | `retrying`)
- `attempt_count int`, `last_error text`, `next_retry_at timestamptz`
- `source text` (smart_treino_builder | periodization | quick_workout | copilot_adjust | manual_edit)
- created_at/updated_at + trigger update
- GRANTs (authenticated SELECT do próprio via join; service_role ALL)
- RLS: professor lê logs dos próprios atletas; service_role escreve

## 2. Edge Function `fitpro-deliver-workout` (atualizar)

- Antes da chamada externa: `INSERT` em `fitpro_delivery_log` com status `pending`
- Após resposta: `UPDATE` com `status=success/failed`, `result`, `last_error`
- Manter idempotência por (athlete_id, workout_date)

## 3. Nova Edge Function `fitpro-delivery-retry`

- Cron-like (invocável) que busca `status='failed' AND attempt_count < 5` com backoff exponencial (`next_retry_at <= now()`)
- Re-invoca `fitpro-deliver-workout` e atualiza log
- Também pode ser chamada manualmente por linha (via UI)

## 4. Auto-entrega em novos fluxos

Adicionar `autoDeliverToFitpro(...)` (fire-and-forget, já existe) em:

- **Smart Treino Builder** — após ajustes salvos (não só na geração inicial). Localizar handlers de save/ajuste em `SmartTreinoBuilder.tsx` e componentes step
- **FitCopilot ajuste** — `supabase/functions/fitpro-copilot-adjust/index.ts`: no final do handler, chamar `fitpro-deliver-workout` internamente (fetch para própria URL) com `source='copilot_adjust'`
- **Edição manual de exercício** — qualquer save em `workout_exercises` do dia via componentes de edição de treino (localizar `WorkoutLogger`, `TreinoDoDiaView`)
- **Treino Rápido** — no fim do fluxo de quick workout (`generate-quick-workout` ou onde salva `phase_name='quick'`), disparar com `source='quick_workout'`

## 5. UI — Painel de Status de Entrega FitPro

Nova página `/fitpro-delivery-status` (professor):

- Lista últimas entregas: aluno (nome via `vw_alunos_canonical`), data, status badge, tentativas, erro
- Botão "Retry" por linha → invoca `fitpro-delivery-retry` com id específico
- Filtro por status/aluno; auto-refresh 30s
- Indicador global (badge no sidebar) contando entregas `failed`

## 6. Correção 401 em `generate-workout` e `generate-full-plan`

Problema: logs mostram `session_not_found`/`refresh_token_not_found` — o cliente envia token expirado.

Fixes:

- **Client wrapper `invokeWithAuth(fnName, body)**` em `src/lib/api/client.ts`:
  1. `supabase.auth.getSession()` → se sem token, `signOut()` e redirect `/login`
  2. Se `expires_at` próximo, `refreshSession()` antes
  3. Chama `fetch` com `Authorization: Bearer ${access_token}` explícito
  4. Se resposta 401 → tenta `refreshSession()` uma vez, repete; se falhar, redireciona
- Substituir chamadas atuais em `PeriodizationUpload.tsx`, `smartPeriodizationService.ts`, `workoutAIService.ts`, `SmartReinoQuiz.tsx`, `trainingService.ts` por `invokeWithAuth`
- Remover chamadas a RPC `ensure_current_user_profile` sem sessão verificada (buscar todas ocorrências e envolver em guard)

## 7. Catálogo antes de IA (fluxo "Gerar Base com IA")

Ajustar `generate-workout` e `generate-full-plan`:

1. Buscar em `workout_models` + `exercises` matches por objetivo/nível/frequência do aluno
2. Se houver template compatível → montar sessão do catálogo (sem IA)
3. Se não → fallback para geração via LLM (fluxo atual)
4. Marcar `source: 'catalog' | 'ai'` no plano salvo

## 8. Entrega semanal FitPro Train

Em `fitpro-week-workouts` (ou novo endpoint `fitpro-deliver-week`):

- Ao professor clicar "Gerar todos treinos da semana" → itera 7 dias, chama `fitpro-deliver-workout` por dia, agrega resultado
- UI: botão em Gestão de Alunos / detalhes do aluno  
  
9.  email do admin principal/professor princiopal :    
-  email: [roni.comercial19@gmail.com](mailto:roni.comercial19@gmail.com)  
- senha : 54967554

---

## Seção Técnica

**Arquivos novos:**

- `supabase/migrations/<ts>_fitpro_delivery_log.sql`
- `supabase/functions/fitpro-delivery-retry/index.ts`
- `supabase/functions/fitpro-deliver-week/index.ts`
- `src/pages/FitproDeliveryStatus.tsx`
- `src/lib/api/invokeWithAuth.ts`

**Arquivos alterados:**

- `supabase/functions/fitpro-deliver-workout/index.ts` — logging + retry state
- `supabase/functions/fitpro-copilot-adjust/index.ts` — chamar deliver ao final
- `supabase/functions/generate-workout/index.ts` — catálogo-first + logging
- `supabase/functions/generate-full-plan/index.ts` — catálogo-first
- `supabase/functions/generate-quick-workout/index.ts` — auto-deliver
- `src/pages/PeriodizationUpload.tsx`, `src/services/smartPeriodizationService.ts`, `src/services/workoutAIService.ts`, `src/services/domains/training/trainingService.ts`, `src/components/student/SmartReinoQuiz.tsx` — usar `invokeWithAuth`
- `src/pages/SmartTreinoBuilder.tsx` e componentes step — hook em save de ajustes
- `src/components/AppSidebar.tsx` — badge status + link
- `src/App.tsx` — nova rota

**Dependências:** nenhuma nova.

Confirma que posso avançar?  implementar complemente e me entregar funcional prinncipalmente para geraçao de treinos e envios dos treinos . as etapas criticas de funcionamento sao as : 1 (tabela) → 2 (logging) → 6 (auth) → 7 (catálogo) → 4 (auto-entrega) → 8 (semana) → 3 (retry) → 5 (painel) 