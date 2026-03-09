

# Plano de Implementacao — Ecossistema 9FIT (SmartReino Module)

---

## 1. AUDITORIA — Estado Atual

### 1.1 Banco de Dados (103 tabelas/views)

Organizadas por dominio detectado:

| Dominio 9FIT | Tabelas Existentes | Problema |
|---|---|---|
| **users** | `profiles`, `user_profiles`, `user_profiles_extended`, `user_profile_details`, `user_roles`, `students`, `estudantes`, `athletes`, `alunos`, `student_profiles` | **10+ tabelas redundantes** para o mesmo conceito |
| **training** | `workouts`, `workouts_new`, `workout_models`, `workout_templates`, `workout_exercises`, `workout_exercises_new`, `modelos_de_treino`, `planos_treino_aluno`, `planos_de_treino_gerados`, `generated_workout_plans`, `daily_workouts`, `program_workouts`, `workout_assignments_new`, `training_programs`, `training_structures`, `estruturas_de_treinamento` | **16+ tabelas** com sobreposicao massiva |
| **progress** | `workout_logs`, `user_workout_logs`, `exercise_logs`, `workout_executions`, `workout_exercise_sets`, `workout_progress`, `historico_treinos_realizados`, `progresso_aluno`, `student_activity_history`, `strength_records` | **10+ tabelas** duplicando tracking |
| **assessments** | `avaliacoes`, `avaliacoes_fisicas`, `avaliacoes_unificadas`, `physical_assessments`, `student_measurements`, `student_pdf_assessments`, `student_photos`, `student_anamnesis`, `historico_avaliacoes` | **9 tabelas** para avaliacoes |
| **content** | `exercise_library`, `exercises`, `exercicios_novos`, `link_de_video`, `super_sets`, `supersets` | Duplicacao exercicios + supersets |
| **analytics** | `real_time_analytics`, `analises_ia_aluno`, `system_health`, `system_events`, `audit_log` | OK, mas disperso |
| **commerce** | `payments`, `plans`, `planos`, `products`, `user_plans`, `user_credits`, `student_credits`, `vacation_requests`, `vacation_freeze_requests` | Duplicacao planos/creditos |
| **system** | `ambiente_config`, `notifications`, `logs_sincronizacao`, `uploads_periodizacao` | OK |

**Views canonicas existentes (bom):** `v_students_canonical`, `v_assessments_canonical`, `v_assignments_canonical`, `v_periodizations_canonical`, `v_system_health`, `v_workout_progression`

### 1.2 APIs (Edge Functions)

5 edge functions existentes — todas sem `verify_jwt`:
- `generate-workout`
- `modify-workout`
- `generate-recommendations`
- `analyze-periodization`
- `generate-full-plan`

**Risco:** Nenhuma funcao valida JWT. Qualquer pessoa pode invocar.

### 1.3 Services (Frontend — 25 arquivos)

Sem camada de abstração unificada. Cada service acessa Supabase diretamente com padroes diferentes (`supabase` vs `supabaseUntyped`).

### 1.4 Funcoes RPC (29 funcoes)

Mix de portugues/ingles. Funcoes de role: `has_role`, `is_admin`, `is_professor`, `is_trainer`, `is_super_admin`, `get_user_role` — redundancia.

---

## 2. RISCOS TECNICOS IDENTIFICADOS

| # | Risco | Severidade | Impacto |
|---|---|---|---|
| R1 | Edge functions sem JWT verification | **CRITICO** | Acesso publico a geracao de treinos |
| R2 | 10+ tabelas de usuarios/alunos redundantes | ALTO | Dados fragmentados, inconsistencia |
| R3 | Dois clientes Supabase (`client` + `untypedClient`) | MEDIO | Bypass de tipagem, bugs silenciosos |
| R4 | Role system inconsistente (trigger insere `user`, app espera `professor`) | **CRITICO** | Professores redirecionados como alunos |
| R5 | Sem paginacao em queries | MEDIO | Limite 1000 rows do Supabase |
| R6 | Sem versionamento de API | MEDIO | Impossivel evoluir sem quebrar |
| R7 | Nomenclatura mista PT/EN em tabelas e funcoes | BAIXO | Dificuldade de manutencao |

---

## 3. PLANO DE IMPLEMENTACAO — 5 Fases

### FASE 1 — Seguranca e Roles (Prioridade Maxima)

**Objetivo:** Corrigir o sistema de roles e proteger edge functions.

1. **Corrigir trigger `handle_new_user_role`** para ler `raw_user_meta_data->user_type` e inserir role correto (`professor`/`student`) em `user_roles`
2. **Migrar roles existentes** — SQL para sincronizar `profiles.role` com `user_roles.role` para usuarios existentes
3. **Ativar `verify_jwt = true`** em todas edge functions no `config.toml`
4. **Atualizar edge functions** para extrair user do JWT e validar permissoes
5. **Consolidar funcoes de role** — manter apenas `has_role` e `get_user_role`, depreciar `is_admin`/`is_professor`/`is_trainer`

### FASE 2 — Camada de Servicos Padronizada

**Objetivo:** Criar abstração unificada para comunicacao com backend.

1. **Criar `src/lib/api/client.ts`** — wrapper unico sobre Supabase client (eliminar `untypedClient`)
2. **Criar modulos por dominio:**

```text
src/services/
  domains/
    users/        → userService.ts (unifica auth, profile, role)
    training/     → workoutService.ts, modelService.ts
    assessments/  → assessmentService.ts
    progress/     → progressService.ts
    analytics/    → analyticsService.ts
    system/       → systemService.ts
```

3. **Criar `src/services/api.ts`** — facade que expoe todos os dominios como namespace unico
4. **Manter services antigos** como re-exports para compatibilidade retroativa

### FASE 3 — Consolidacao de Dados via Views

**Objetivo:** Criar fonte unica de dados sem alterar tabelas existentes.

1. **Expandir views canonicas** existentes (`v_students_canonical`, etc.) para incluir dados de todas as tabelas redundantes
2. **Criar novas views:**
   - `v_workouts_canonical` — unifica `workouts`, `workouts_new`, `workout_models`, `modelos_de_treino`
   - `v_exercises_canonical` — unifica `exercises`, `exercise_library`, `exercicios_novos`
   - `v_progress_canonical` — unifica `workout_logs`, `exercise_logs`, `historico_treinos_realizados`
   - `v_plans_canonical` — unifica `plans`, `planos`, `user_plans`
3. **Migrar services da Fase 2** para consultar views canonicas
4. **Nenhuma tabela removida** — views servem como camada de abstração

### FASE 4 — APIs Versionadas (Edge Functions)

**Objetivo:** Padronizar endpoints conforme padrão 9FIT.

1. **Criar edge function `api-gateway`** — roteador central:

```text
POST /api/v1/training/generate    → generate-workout
POST /api/v1/training/modify      → modify-workout  
POST /api/v1/training/full-plan   → generate-full-plan
POST /api/v1/analytics/recommend  → generate-recommendations
POST /api/v1/assessments/analyze  → analyze-periodization
```

2. **Manter edge functions originais** funcionando (compatibilidade)
3. **Adicionar headers padrao** (`X-9FIT-Module: smartreino`, `X-9FIT-Version: 1.0`)
4. **Implementar rate limiting** basico via `system_events`

### FASE 5 — Preparacao para Integracao Ecossistema

**Objetivo:** Tornar o sistema plugavel ao banco central 9FIT.

1. **Criar `src/lib/ecosystem/config.ts`** — configuracao de conexao com ecossistema:

```text
ECOSYSTEM_MODE: 'standalone' | 'connected'
CENTRAL_DB_URL: string (quando conectado)
MODULE_ID: 'smartreino'
```

2. **Criar `src/lib/ecosystem/events.ts`** — sistema de eventos:
   - Publicar eventos em `system_events` (workout_created, student_enrolled, etc.)
   - Preparar para webhook dispatch futuro
3. **Criar tabela `ecosystem_config`** — configuracoes do modulo dentro do ecossistema
4. **Documentar contrato de integracao** — schema das views canonicas como "API de dados" do modulo

---

## 4. ESTRUTURA DE PASTAS RECOMENDADA

```text
src/
  app/                          ← Nova (organização por feature)
    dashboard/
    training/
    students/
    assessments/
    analytics/
  lib/
    api/
      client.ts                 ← Cliente Supabase unificado
    ecosystem/
      config.ts                 ← Config ecossistema 9FIT
      events.ts                 ← Sistema de eventos
      types.ts                  ← Tipos compartilhados
  services/
    domains/                    ← Services por dominio
      users/
      training/
      assessments/
      progress/
      analytics/
      system/
    index.ts                    ← Facade
  components/                   ← Manter existente
  pages/                        ← Manter existente (migrar gradualmente)
  hooks/                        ← Manter existente
  integrations/                 ← Manter existente
```

Migracao gradual: novas features usam `src/app/`, paginas existentes continuam em `src/pages/`.

---

## 5. SEQUENCIA DE EXECUCAO

| Fase | Estimativa | Dependencia | Risco de Quebra |
|---|---|---|---|
| Fase 1 — Seguranca | 1-2 sessoes | Nenhuma | Baixo (aditivo) |
| Fase 2 — Services | 2-3 sessoes | Fase 1 | Nenhum (re-exports) |
| Fase 3 — Views | 1-2 sessoes | Nenhuma | Nenhum (views novas) |
| Fase 4 — API Gateway | 1-2 sessoes | Fase 1 | Nenhum (funcao nova) |
| Fase 5 — Ecossistema | 1 sessao | Fases 2-4 | Nenhum (preparatorio) |

**Total estimado:** 6-10 sessoes de implementacao.

Todas as fases sao aditivas — nenhuma tabela removida, nenhuma funcionalidade quebrada, compatibilidade retroativa total.

