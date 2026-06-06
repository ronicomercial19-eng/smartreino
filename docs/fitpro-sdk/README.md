# SmartReino SDK + API — Integração FitPro

Material pronto para copiar e colar no FitPro. Toda a integração com SmartReino/9FIT (geração de treinos, ajustes via IA, biblioteca de conteúdo) acontece por **4 endpoints HTTP** autenticados por header `x-partner-key`.

- **Base URL:** `https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1`
- **Autenticação:** header `x-partner-key: <SMARTREINO_KEY>` (valor da secret `FITPRO_API_KEY` compartilhada entre os times).
- **Resolução de aluno:** body/query `student_external_id` OU header `x-student-external-id`. Mapeado internamente via `fitpro_student_map.fitpro_student_id → athlete_id`.

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
  → grava local → atualiza aba Train
```

**Loop B — Treino Rápido**
```
Aba Train → "Treino Rápido" → 3 perguntas (tempo / foco / energia)
  → POST /fitpro-quick-workout
  → renderizar grid 4-blocos (Neural, Integration, Block 9, Reset)
  → exibir vídeos via player_url + CTA infoproduto_sugerido
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
| 404 | `student_not_mapped` | `student_external_id` sem correspondência no SmartReino |
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
