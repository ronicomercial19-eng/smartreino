
# SmartTreino 9FIT — Motor de Prescrição + Satélite no Ecossistema

Entrega única dividida em 4 pilares. Tudo respeitando as decisões: `alunos` como fonte de verdade, motor 9x9x9 (`athlete_periodizations` + `periodization_annual_plans` + `smart_treino_protocols`), Sovereign Auth **híbrido** (bootstrap por URL + login local mantido para admin), output HTML estruturado pela RPC.

---

## PILAR 1 — RPC `prescrever_treino` (motor técnico)

### Assinatura
```sql
public.prescrever_treino(
  p_user_id  uuid  default auth.uid(),
  p_aluno_id uuid  default null,        -- professor pode prescrever para o aluno
  p_data     date  default current_date
) RETURNS jsonb       -- JSON técnico completo (spec seção 4)
```

E uma função-irmã que devolve HTML pronto p/ template (conforme refinamento do usuário):
```sql
public.prescrever_treino_html(p_user_id uuid, p_aluno_id uuid, p_data date) RETURNS text
```
`SECURITY DEFINER`, `search_path=public`. Validação interna: `auth.uid()` precisa ser o `professor_id` do aluno OU estar em `athlete_auth_link` como o próprio aluno OU ter role `admin/super_admin`.

### Pipeline interno
1. **Resolução do aluno** — se `p_aluno_id` nulo, resolver via `athlete_auth_link.user_id = p_user_id`. Carregar perfil de `alunos` (nivel_experiencia, restricoes_medicas, historico_lesoes, preferencia_equipamento, ambiente_treino, foco_muscular, tempo_disponivel_min).
2. **Periodização ativa** — `athlete_periodizations` WHERE `athlete_id = aluno.id AND status IN ('in_progress','assigned')` mais recente. Join `periodization_annual_plans` via `annual_plan_id` para extrair **fase atual** e **semana_atual** (calculadas a partir de `assigned_at` + duração das fases em `macrocycle/mesocycle`).
3. **Protocolo 9x9x9** — ler `smart_treino_macro_rules` ativo do aluno → pegar `protocol_code` → carregar `smart_treino_protocols` (blocks neural/integration/block_9/reset, rpe_range, recommended_for, block_9_template).
4. **Seleção de exercícios (camadas)** — função auxiliar `_selecionar_exercicios_bloco(bloco, padroes_movimento, foco_muscular, restricoes, equipamentos, aluno_id, dias_anti_repeticao=>7)`:
   - Filtra `exercise_library`/`exercicios_novos` por `bloco_ideal`, `grupo_primario`, `compativel_protocolos`, `dificuldade` ≤ nível do aluno, `equipamento` compatível.
   - **Anti-repetição**: exclui exercícios usados em `historico_treinos_realizados` últimos 5-7 dias (via subquery em jsonb).
   - Rotação de padrões (push/pull/squat/hinge/carry/lunge/rotation) — round-robin por semana.
   - **Progressão automática**: ajusta séries/reps/RPE a partir de `semana_atual` e `phase` (acumulação → intensificação → realização → deload).
5. **Validação NINE** — garante: Neural=2, Integração=1-2, Bloco9=3-4, Reset=1-2 (total 7±1). Se motor não preencher mínimo, fallback determinístico via templates default do protocolo.
6. **Persistência** — INSERT em `historico_treinos_realizados` com `data_treino`, `semana_treino`, `dia_treino`, `plano_treino_id` (referenciando o annual_plan_id) e payload jsonb do treino.
7. **Saída JSON** — formato exato da spec (contexto, parametros, treino{neural,integracao,bloco9,reset}, rationale).
8. **Fallback** — se sem periodização ativa: retorna `{sucesso:false, motivo:'sem_periodizacao_ativa', sugestao_cta:'gerar_smart_treino'}` para a UI mostrar CTA "Gerar plano".

### Performance
- Índices: `historico_treinos_realizados(aluno_id, data_treino)`, `athlete_periodizations(athlete_id, status)`, `smart_treino_protocols(id)`.

### Output HTML (`prescrever_treino_html`)
Estrutura semântica neutra para o usuário injetar estilos depois:
```html
<section class="treino-9fit" data-data="...">
  <header class="treino-header">…contexto + parametros…</header>
  <div class="bloco-treino" data-bloco="neural"><h3>Neural</h3><ul class="lista-exercicios"><li class="exercicio" data-rpe="3">…</li></ul></div>
  <div class="bloco-treino" data-bloco="integracao">…</div>
  <div class="bloco-treino" data-bloco="bloco9">…</div>
  <div class="bloco-treino" data-bloco="reset">…</div>
  <footer class="treino-rationale">…</footer>
</section>
```

---

## PILAR 2 — UI Estrutura NINE no frontend

- Novo serviço `src/services/prescreverTreinoService.ts` — wrapper `supabase.rpc('prescrever_treino', …)` e `prescrever_treino_html`.
- Hook `useTreinoDoDia(alunoId?, data?)` com React Query + skeleton.
- Componente `<TreinoDoDiaView/>` — usa `WorkoutDisplayTemplate.tsx` existente (já tem 4 blocos coloridos verde/azul/laranja/cinza). Adapta para consumir o payload da nova RPC.
- Página `/treino-hoje` (aluno) e botão "Prescrever Treino de Hoje" no `AlunoDetalhes.tsx` (professor).
- Estado vazio: card com CTA "Gerar plano via Smart Treino Builder" quando RPC retorna `sem_periodizacao_ativa`.
- Mobile-first responsivo (iPhone-safe), com `animate-fade-in` e skeletons.

---

## PILAR 3 — Sovereign Auth Híbrido + Intelligence Hub

### Auth bootstrap
- Novo componente `<SovereignBootstrap/>` montado no topo do `App.tsx`:
  - Lê `?access_token=&refresh_token=&user_id=` da URL.
  - Se presentes → `supabase.auth.setSession({access_token, refresh_token})`, salva `localStorage.ninefit_token`, `window.history.replaceState({}, '', window.location.pathname)`.
  - Se sessão existente válida → **não redireciona** (previne loop em domínios local/preview/published).
  - Se sem sessão E sem tokens E rota não-pública → continua exibindo `/login` local (fallback admin).
- Tela de loading minimalista durante validação: "Validando acesso ao Ecossistema 9FIT…".
- Logout limpa `ninefit_token` + `supabase.auth.signOut({scope:'local'})` e mostra escolha: "Voltar ao Portal 9FIT" (https://ninelogin.lovable.app) ou ficar no login local.
- **Mantém** `/login`, `/register`, `/reset-password` ativos como fallback (decisão híbrida do usuário). Admin `roni.comercial19@gmail.com` continua funcionando.

### Intelligence Hub sync
- Edge function nova `hub-emit` (`supabase/functions/hub-emit/index.ts`):
  - Recebe `{event_type, aluno_id, payload}`.
  - Envia POST para `${SUPRA_HUB_URL}/rest/v1/intelligence_hub` com header `apikey: SUPRA_HUB_SERVICE_KEY`.
  - Body: `{source_system:'smartreino', event_type, aluno_email, aluno_id, payload, occurred_at}`.
  - Secrets já existem (`SUPRA_HUB_URL`, `SUPRA_HUB_SERVICE_KEY`).
- Helper frontend `emitHubEvent()` em `src/lib/ecosystem/events.ts`.
- Disparos: `treino_prescrito`, `treino_concluido`, `aluno_criado`, `periodizacao_atribuida`, `protocolo_alterado`.

---

## PILAR 4 — Padronização UI/UX 9FIT

- `index.html`: adiciona Google Fonts **Syne** (800) e **DM Mono**.
- `tailwind.config.ts`: adiciona `fontFamily: { display: ['Syne','sans-serif'], mono: ['"DM Mono"','monospace'] }`.
- `index.css`: tokens — `--brand-orange: 18 84% 51%` (#E8571A); aplica `font-display` em H1-H3 e `font-mono` em todos números/dados técnicos (séries, reps, carga, RPE, %).
- Header padronizado: "9FIT · SMART TREINO" no AppLayout, cor brand.
- Cards de pendência (Alertas de Risco, Treinos sem prescrição) recebem `border-l-4 border-l-brand-orange` + `animate-pulse-subtle`.
- Glossário: substituições no copy — "Atleta" → "Aluno" no fluxo do cliente final; mantém "Atleta" apenas em telas técnicas do admin/professor.

---

## Detalhes técnicos consolidados

**Migrations:**
1. RPC `prescrever_treino` + `prescrever_treino_html` + helper `_selecionar_exercicios_bloco`
2. Índices de performance
3. Sem alteração de tabelas existentes (só leitura + insert em `historico_treinos_realizados`)

**Edge functions:** `hub-emit` (nova). Reaproveita pattern dos existentes (`generate-smart-treino`).

**Arquivos frontend criados:**
- `src/services/prescreverTreinoService.ts`
- `src/hooks/useTreinoDoDia.ts`
- `src/components/workout/TreinoDoDiaView.tsx`
- `src/pages/TreinoHoje.tsx`
- `src/components/auth/SovereignBootstrap.tsx`
- `src/lib/ecosystem/hubEmit.ts`

**Arquivos editados:**
- `src/App.tsx` (montar Sovereign + rota `/treino-hoje`)
- `src/pages/AlunoDetalhes.tsx` (botão Prescrever)
- `index.html`, `tailwind.config.ts`, `index.css` (fontes + tokens)
- `src/components/AppSidebar.tsx` (header padrão + logout para portal)

**Memórias a atualizar após implementação:**
- Nova memória `features/prescrever-treino-engine`
- Nova memória `architecture/sovereign-auth-hybrid`
- Atualizar Core com tipografia Syne/DM Mono e cor `#E8571A`

---

## Ordem de implementação (1 entrega)

1. Migration: RPC + índices → aprovação do usuário
2. Edge function `hub-emit` + helper frontend
3. Tipografia + tokens (Syne/DM Mono/#E8571A)
4. Serviço + hook + página `/treino-hoje` + integração em `AlunoDetalhes`
5. SovereignBootstrap + ajuste no App.tsx + logout
6. Validação end-to-end: login admin → prescrever treino para 1 aluno teste → verificar render NINE → confirmar evento no Hub

