# Entrega: SDK + API SmartReino ↔ FitPro

Material pronto pra colar no FitPro. 4 endpoints públicos autenticados por `x-partner-key` (FITPRO_API_KEY), cobrindo: treino rápido, ajuste de treino (chat RON), treino por periodização anual e biblioteca de conteúdo 9FIT.

## 1. Edge functions a criar/expor (públicas, `verify_jwt=false`)

Base URL: `https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1`

| Endpoint | Função | Uso no FitPro |
|---|---|---|
| `POST /fitpro-quick-workout` | Treino rápido (3 perguntas) | Aba **Train → Treino Rápido** |
| `POST /fitpro-adjust-workout` | Ajuste via RON (NLP) | Aba **Ajuste de Treino** |
| `POST /fitpro-plan-workout` | Treino do dia baseado na periodização anual | Loop diário do app aluno |
| `GET  /library-full` | Biblioteca 9FIT (catálogo 9x9x9 + vídeos + infoprodutos) | Aba **Biblioteca de Conteúdo** |

Autenticação: header `x-partner-key: <FITPRO_API_KEY>` (compartilhada com a conexão `fitpro_connections`). Resolução de aluno: header `x-student-external-id` ou query/body `student_external_id` → mapeado via `fitpro_student_map.fitpro_student_id → athlete_id`.

## 2. Contratos de API (copiar/colar)

### 2.1 Treino Rápido
```bash
curl -X POST https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/fitpro-quick-workout \
  -H "x-partner-key: <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "student_external_id": "<FITPRO_STUDENT_ID>",
    "respostas": {
      "tempo_min": 45,
      "foco": "membros_inferiores",
      "energia": "media"
    }
  }'
```
Resposta:
```json
{
  "success": true,
  "treino_id": "uuid",
  "duracao_min": 45,
  "blocos": [
    {"tipo": "neural", "cor": "#22c55e", "exercicios": [...]},
    {"tipo": "integration", "cor": "#3b82f6", "exercicios": [...]},
    {"tipo": "block9", "cor": "#f97316", "exercicios": [...]},
    {"tipo": "reset", "cor": "#9ca3af", "exercicios": [...]}
  ],
  "video_urls": {...},
  "infoproduto_sugerido": {"id":"...","titulo":"...","cta_url":"..."}
}
```

### 2.2 Ajuste de Treino (RON Chat)
```bash
curl -X POST https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/fitpro-adjust-workout \
  -H "x-partner-key: <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "student_external_id": "<ID>",
    "treino_atual_id": "uuid",
    "mensagem": "tô sem barra hoje, troca pra halter e diminui 10 min"
  }'
```
Resposta inclui `treino_ajustado` (mesmo shape do 2.1) + `delta` (lista de mudanças) + `mensagem_ron`.

### 2.3 Treino do Dia (Periodização)
```bash
curl -X POST https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/fitpro-plan-workout \
  -H "x-partner-key: <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"student_external_id":"<ID>","data":"2026-06-06"}'
```
Lê `vw_periodizacao_ativa_aluno` (interna OU `fitpro_smartperiodizer_periodizations`). Se ausente → `409 sem_periodizacao_ativa` com CTA pra cadastrar no SmartPeriodizer + notificação automática ao professor.

### 2.4 Biblioteca de Conteúdo 9FIT
```bash
curl -H "x-partner-key: <API_KEY>" \
  "https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1/library-full?student_external_id=<ID>"
```
Resposta:
```json
{
  "biblioteca": {
    "exercicios": [{"id","nome","grupo","video_url","thumb","instrucoes","equipamento","nivel"}],
    "protocolos_9x9x9": [{"code","pilar","categoria","block_9_template","goal_tags"}],
    "infoprodutos": [{"id","titulo","cta_url","preco","thumb"}],
    "videos_aulas": [...]
  },
  "personalizado_para": {"aluno":"...","objetivo":"...","nivel":"..."}
}
```

## 3. SDK TypeScript (drop-in `fitpro-sdk/smartreino.ts`)

```ts
export interface SmartReinoConfig {
  apiKey: string;
  baseUrl?: string;
}
export class SmartReinoClient {
  constructor(private cfg: SmartReinoConfig) {
    cfg.baseUrl ??= "https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1";
  }
  private async req(path: string, init: RequestInit = {}) {
    const r = await fetch(`${this.cfg.baseUrl}${path}`, {
      ...init,
      headers: { "x-partner-key": this.cfg.apiKey, "Content-Type": "application/json", ...(init.headers||{}) },
    });
    const json = await r.json().catch(()=>({}));
    if (!r.ok) throw Object.assign(new Error(json?.error||r.statusText), { status: r.status, body: json });
    return json;
  }
  quickWorkout(p:{student_external_id:string; respostas:{tempo_min:number;foco:string;energia:string}}) {
    return this.req("/fitpro-quick-workout",{method:"POST",body:JSON.stringify(p)});
  }
  adjustWorkout(p:{student_external_id:string; treino_atual_id:string; mensagem:string}) {
    return this.req("/fitpro-adjust-workout",{method:"POST",body:JSON.stringify(p)});
  }
  planWorkout(p:{student_external_id:string; data?:string}) {
    return this.req("/fitpro-plan-workout",{method:"POST",body:JSON.stringify(p)});
  }
  library(student_external_id:string) {
    return this.req(`/library-full?student_external_id=${encodeURIComponent(student_external_id)}`);
  }
}
```
Uso no FitPro:
```ts
const sr = new SmartReinoClient({ apiKey: process.env.SMARTREINO_KEY! });
const t = await sr.quickWorkout({ student_external_id: aluno.id, respostas:{tempo_min:45,foco:"superior",energia:"alta"} });
```

## 4. Loops de UX no FitPro (especificação)

**Loop A — Ajuste de Treino**
```
Aba Ajuste → input texto → POST /fitpro-adjust-workout
  → retorna treino_ajustado → grava local → atualiza aba Train
```

**Loop B — Treino Rápido**
```
Aba Train → "Treino Rápido" → 3 perguntas (tempo/foco/energia)
  → POST /fitpro-quick-workout → render grid 4 blocos + vídeos + CTA infoproduto
```

**Loop C — Biblioteca**
```
Aba "Biblioteca de Conteúdo" → GET /library-full
  → grid nativo (exercícios | protocolos 9x9x9 | infoprodutos | aulas)
  → SUBSTITUI a lista de exercícios atual
```

## 5. Backend a entregar (lado SmartReino)

1. **Migração:** RPC `resolve_aluno_by_external(p_external_id text)` retornando `aluno_id` via `fitpro_student_map`.
2. **4 edge functions novas** (`verify_jwt=false`, validam `x-partner-key` contra `fitpro_connections.api_key_hash`):
   - `fitpro-quick-workout` — chama `prescrever_treino` com perfil derivado das 3 respostas.
   - `fitpro-adjust-workout` — chama `modify-workout` (SSE convertido em JSON final) com contexto do treino atual.
   - `fitpro-plan-workout` — lê `vw_periodizacao_ativa_aluno`, deriva microciclo do dia, chama `prescrever_treino` com `p_protocol_code`.
   - `library-full` — agrega `exercise_library` + `smart_treino_protocols` (729) + `library_items` (infoprodutos) personalizando por `objetivo/nivel` do aluno.
3. **Catálogo 9x9x9 como biblioteca oficial:** `smart_treino_protocols` exposto via `/library-full` com `video_url`, `thumb`, `instrucoes` (join com `exercise_library`).
4. **Resposta de erro padronizada:** `{error, code, hint, cta_url?}` (409 para `sem_periodizacao_ativa`).

## 6. Variáveis/segredos

- `FITPRO_API_KEY` (já configurado) — usado como `x-partner-key`.
- FitPro guarda: `SMARTREINO_KEY`, `SMARTREINO_BASE_URL=https://mfrydtrzjxscbkaiwfnw.supabase.co/functions/v1`.

## 7. Entregáveis finais

- Arquivo `docs/fitpro-sdk/README.md` com este contrato + cURLs.
- Arquivo `docs/fitpro-sdk/smartreino.ts` (SDK acima).
- 4 edge functions implementadas e deployadas.
- 1 migração (RPC `resolve_aluno_by_external` + view enriquecida da biblioteca).
- Postman collection JSON em `docs/fitpro-sdk/SmartReino.postman_collection.json`.

**Aprovar para eu implementar tudo isso?**
