# SmartReino SDK + API — Integração FitPro

Material pronto para copiar e colar no FitPro. Toda a integração com SmartReino/9FIT (geração de treinos, ajustes via IA, biblioteca de conteúdo) acontece por **4 endpoints HTTP** autenticados por header `x-partner-key`.

- **Base URL:** `https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1`
- **Autenticação:** header `x-partner-key: <SMARTREINO_KEY>` (valor da secret `FITPRO_API_KEY` compartilhada entre os times).
- **Resolução de aluno:** body/query `student_external_id` OU header `x-student-external-id`. Busca em `fitpro_student_map`, `alunos`, `athletes` e `students`, aceitando UUID existente ou email quando ainda não houver mapping.

---

## 1. Endpoints

| Método | Path | Para que serve | UI FitPro |
|---|---|---|---|
| `POST` | `/fitpro-quick-workout` | Treino rápido a partir de 3 respostas | Aba **Train → Treino Rápido** |
| `POST` | `/fitpro-adjust-workout` | Ajuste do treino atual via chat RON | Aba **Ajuste de Treino** |
| `POST` | `/fitpro-plan-workout` | Treino do dia da periodização anual | Loop diário do app aluno |
| `GET`  | `/library-full` | Biblioteca 9FIT (catálogo 9x9x9 oficial) | Aba **Biblioteca de Conteúdo** |

Todas as respostas de treino seguem o shape **4-blocos 9FIT**: `blocos[0]=neural (🟢)`, `[1]=integration (🔵)`, `[2]=block9 (🟠 #E8571A)`, `[3]=reset (⚪)`.

---

## 2. cURLs (copiar/colar)

### 2.1 Treino Rápido
Buscar as 3 perguntas cadastradas para abrir o modal do botão **Treino Rápido**:
```bash
curl -H "x-partner-key: $SMARTREINO_KEY" \
  https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/fitpro-quick-workout
```

Enviar respostas e receber o treino final já com vídeos 9FIT:
```bash
curl -X POST https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/fitpro-quick-workout \
  -H "x-partner-key: $SMARTREINO_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "student_external_id": "FITPRO_STUDENT_123",
    "respostas": { "tempo_min": 45, "foco": "membros_inferiores", "energia": "media" }
  }'
```

### 2.2 Ajuste via RON
```bash
curl -X POST https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/fitpro-adjust-workout \
  -H "x-partner-key: $SMARTREINO_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "student_external_id": "FITPRO_STUDENT_123",
    "treino_atual_id": "uuid-opcional",
    "mensagem": "tô sem barra hoje, troca pra halter e diminui 10 min"
  }'
```

### 2.3 Treino do Dia (periodização)
```bash
curl -X POST https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/fitpro-plan-workout \
  -H "x-partner-key: $SMARTREINO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"student_external_id":"FITPRO_STUDENT_123","data":"2026-06-06"}'
```
**Sem periodização cadastrada** → resposta `409`:
```json
{
  "error": "sem_periodizacao_ativa",
  "code": "no_active_periodization",
  "cta_url": "/periodization-upload",
  "message": "Aluno sem periodização ativa. Cadastre uma no SmartPeriodizer para liberar o treino do dia."
}
```
SmartReino dispara automaticamente uma notificação para o professor cadastrar.

### 2.4 Biblioteca 9FIT
```bash
curl -H "x-partner-key: $SMARTREINO_KEY" \
  "https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/library-full?student_external_id=FITPRO_STUDENT_123"
```

---

## 3. SDK TypeScript

Arquivo: [`smartreino.ts`](./smartreino.ts) — drop-in, zero deps.

```ts
import { SmartReinoClient } from "./smartreino";

const sr = new SmartReinoClient({ apiKey: process.env.SMARTREINO_KEY! });

// Treino rápido
const perguntas = await sr.quickWorkoutQuestions(); // renderizar modal nativo FitPro
const t = await sr.quickWorkout({
  student_external_id: aluno.fitpro_id,
  respostas: { tempo_min: 45, foco: "superior", energia: "alta" },
});

// Ajuste
const adj = await sr.adjustWorkout({
  student_external_id: aluno.fitpro_id,
  treino_atual_id: t.treino_id ?? undefined,
  mensagem: "Sem agachamento hoje, joelho doendo",
});

// Treino do dia
try {
  const dia = await sr.planWorkout({ student_external_id: aluno.fitpro_id });
} catch (e: any) {
  if (e.code === "no_active_periodization") {
    showCTA(e.cta_url); // redireciona pro SmartPeriodizer
  }
}

// Biblioteca
const lib = await sr.library(aluno.fitpro_id);
renderGrid(lib.biblioteca.exercicios, lib.biblioteca.protocolos_9x9x9, lib.biblioteca.infoprodutos);
```

---

## 4. Loops de UX no FitPro

**Loop A — Ajuste de Treino**
```
Aba Ajuste → input texto → POST /fitpro-adjust-workout
  → resposta com treino_ajustado + mensagem_ron
  → grava local + evento adjusted_workout_delivered
  → atualiza aba Ajuste e aba Train
```

**Loop B — Treino Rápido**
```
Aba Train → "Treino Rápido" → 3 perguntas (tempo / foco / energia)
  → POST /fitpro-quick-workout
  → renderizar grid 4-blocos (Neural, Integration, Block 9, Reset)
  → exibir vídeos via player_url + CTA infoproduto_sugerido
  → evento quick_workout_delivered atualiza aba Train do FitPro
```

**Loop C — Biblioteca de Conteúdo (substitui lista atual de exercícios)**
```
Aba "Biblioteca de Conteúdo" → GET /library-full
  → grid nativo: 4 abas (Exercícios | Protocolos 9x9x9 | Infoprodutos | Aulas)
  → SUBSTITUI a lista de exercícios atual do FitPro
```

---

## 5. Códigos de erro padronizados

| HTTP | `code` | Significado |
|---|---|---|
| 400 | `invalid_json` / `student_external_id_required` | Payload inválido |
| 401 | `no_partner_key` / `invalid_partner_key` | Header `x-partner-key` ausente ou inválido |
| 404 | `student_not_found` | aluno não encontrado em `fitpro_student_map`, `alunos`, `athletes` ou `students` |
| 409 | `no_active_periodization` | Aluno sem periodização → use `cta_url` para redirecionar |
| 422 | `generation_failed` | Motor de prescrição retornou falha (detalhes em `details`) |
| 500 | `rpc_error` / `ai_not_configured` | Erro interno (verificar logs) |
| 502 | `ai_gateway_error` / `ai_failed` | Falha do gateway de IA no ajuste |

Toda resposta de erro tem o formato:
```json
{ "error": "mensagem", "code": "string", "cta_url": "opcional", "details": {} }
```

---

## 6. Postman

Importe [`SmartReino.postman_collection.json`](./SmartReino.postman_collection.json) — usa variável `{{SMARTREINO_KEY}}` e `{{STUDENT_ID}}`.

---

## 7. Provisionamento

1. SmartReino fornece o valor de `SMARTREINO_KEY` (= `FITPRO_API_KEY`).
2. FitPro armazena como secret de ambiente.
3. Para cada aluno sincronizado, registrar mapping em `fitpro_student_map` (já feito via sync existente).
4. Pronto. Todos os 4 endpoints já estão deployados em produção.

---

## v2 — FitPro Train (4 fluxos canônicos)

Todos os endpoints abaixo resolvem o aluno via `athlete_id` (vw_athlete_full_profile) — nunca `estudante_id`/`aluno_id` legados.

### 1. Treino Rápido
`GET  /fitpro-quick-workout` → 3 perguntas (objetivo_dia, tempo_min, equipamento).
`POST /fitpro-quick-workout` body `{ student_external_id, respostas:{tempo_min,foco,energia} }` → gera sessão ad-hoc com vídeos de `exercises.video_url`/`gif_url`. Persiste em `workout_executions (phase_name='quick')`.

### 2. Treinos da Semana
`POST /fitpro-week-workouts` body `{ student_external_id }` → retorna `dias[7]`. Apenas o dia atual vem `executable:true` com `daily_workout_id`; demais são preview. Para abrir o treino do dia chame `POST /fitpro-plan-workout`.

### 3. Streaming (HealthFlix contextual)
`GET /fitpro-streaming-feed?student_external_id=...` → curadoria de `library_items` `type='videos'` filtrada por `vw_athlete_periodizacao_ativa.current_phase_category` (fallback `geral`). Player via `player_url`.

### 4. Ajuste de Treino + FitCopilot
Estruturado: `POST /fitpro-adjust-workout` body `{ student_external_id, changes:[{action,exercise_id?,new_exercise_id?,load_percentage?,sets?,reps_range?}], workout_date? }` — afeta SOMENTE `workout_exercises` do dia, marca `override_locked=true`.

Linguagem natural: `POST /fitpro-copilot-adjust` body `{ student_external_id, command:"trocar agachamento por leg press" }` — Gemini interpreta → mesmas `changes` → mesma RPC. Se o pedido envolver semana/periodização, retorna `error:"planning_required"` + `redirect:"/settings/planejamento"`.

### 5. Concluir treino + XP
`POST /fitpro-complete-workout` body `{ student_external_id, execution_id?, workout_date?, duration_minutes?, total_volume_kg?, avg_rpe? }` → marca `status=completed` e chama `fn_award_xp(athlete_id, 50|100, reason)`.

### Regra crítica
Nenhum dos 4 fluxos toca em `planos_de_treino_gerados`, `weekly_structures` ou `training_phases`. Para mudanças de planejamento o caminho é Settings → Planejamento (SmartPeriodizer).
