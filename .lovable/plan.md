

# Plano: Cadastro Focado em Treino + SmartReino Quiz + Correcao de Geracao

## Problema Atual

1. **Cadastro pede dados genericos** (email, data nascimento, genero) mas falta informacao de treino para a IA
2. **Erro ao gerar treino**: a edge function `generate-workout` tem `verify_jwt = true` mas precisa de `verify_jwt = false` para funcionar corretamente; alem disso falta `analyze-periodization` no config.toml
3. **Nao existe SmartReino Quiz**: o aluno nao tem como responder perguntas rapidas para gerar treino automaticamente

---

## O que sera feito

### 1. Reformular Cadastro do Aluno

Simplificar para pedir apenas **nome + telefone** como dados pessoais, e adicionar **9 perguntas de treino** + **6 perguntas de preferencia** clicaveis (Select/Radio), para maximizar informacoes para a IA.

**Dados pessoais (2 campos):**
- Nome completo
- Telefone/WhatsApp

**9 Perguntas de Treino (clicaveis):**
1. Objetivo principal (hipertrofia / emagrecimento / forca / condicionamento / saude / reabilitacao)
2. Nivel de experiencia (iniciante / intermediario / avancado)
3. Frequencia semanal (2x / 3x / 4x / 5x / 6x)
4. Ambiente de treino (academia / casa / ar livre / hibrido)
5. Tempo disponivel por sessao (30min / 45min / 60min / 90min)
6. Historico de lesoes (nenhuma / ombro / joelho / lombar / outro)
7. Foco muscular prioritario (superior / inferior / core / corpo todo)
8. Nivel de condicionamento cardiovascular (baixo / medio / alto)
9. Experiencia com pesos livres (nunca / basico / confortavel / avancado)

**6 Perguntas de Preferencia de Treino:**
1. Prefere treinos curtos e intensos OU longos e moderados
2. Gosta de cardio integrado ao treino OU separado
3. Prefere maquinas OU pesos livres OU ambos
4. Treina sozinho OU com parceiro
5. Horario preferido (manha / tarde / noite)
6. Meta de tempo (1 mes / 3 meses / 6 meses / 12 meses)

### 2. Migrar Banco de Dados

Adicionar colunas na tabela `alunos` para armazenar as novas informacoes:
- `tempo_disponivel_min` (integer)
- `historico_lesoes` (text)
- `foco_muscular` (varchar)
- `condicionamento_cardio` (varchar)
- `experiencia_pesos_livres` (varchar)
- `preferencia_intensidade` (varchar)
- `preferencia_cardio` (varchar)
- `preferencia_equipamento` (varchar)
- `treina_sozinho` (boolean)
- `horario_preferido` (varchar)
- `meta_tempo_meses` (integer)

### 3. Corrigir Edge Function de Geracao

- Mudar `verify_jwt = false` no config.toml para `generate-workout`
- Validar JWT manualmente dentro da funcao
- Adicionar CORS headers completos
- Incluir TODOS os novos campos do aluno no prompt da IA
- Adicionar `analyze-periodization` ao config.toml

### 4. Criar SmartReino Quiz (Interface do Aluno)

Nova funcionalidade na interface do aluno: quando o aluno nao tem treino ativo, aparece um quiz de **9 perguntas clicaveis** (cards/botoes). Ao finalizar, chama a edge function `generate-workout` com todas as respostas e gera o treino do dia automaticamente.

**Fluxo:**

```text
Aluno abre SmartReino
    |
    v
Tem treino ativo? --SIM--> Mostra treino (como esta hoje)
    |
    NAO
    |
    v
Quiz SmartReino (9 perguntas, uma por vez)
    |
    Pergunta 1: Qual seu objetivo? [cards clicaveis]
    Pergunta 2: Nivel? [cards clicaveis]
    ...
    Pergunta 9: Experiencia com pesos? [cards clicaveis]
    |
    v
Resumo das respostas + botao "Gerar Meu Treino"
    |
    v
IA gera treino --> Salva no banco --> Exibe na interface
```

### 5. Atualizar Formulario Admin

O formulario de cadastro do admin (`FormularioAluno`) tambem sera atualizado para usar as mesmas perguntas, mas em formato compacto (selects lado a lado), removendo email como obrigatorio e adicionando as 15 perguntas de treino.

---

## Arquivos a Criar

1. **`src/components/student/SmartReinoQuiz.tsx`** - Quiz de 9 perguntas com cards clicaveis, animacoes de transicao, barra de progresso, e chamada a edge function ao final

## Arquivos a Modificar

1. **`src/components/alunos/FormularioAluno.tsx`** - Reformular: nome + telefone + 15 perguntas de treino clicaveis
2. **`src/services/alunosService.ts`** - Atualizar interface `Aluno` e `NovoAlunoInput` com novos campos
3. **`supabase/config.toml`** - Adicionar `analyze-periodization`, mudar `verify_jwt = false`
4. **`supabase/functions/generate-workout/index.ts`** - Incluir novos campos no prompt, validar JWT manual, melhorar CORS
5. **`src/pages/StudentInterface.tsx`** - Integrar SmartReinoQuiz quando nao ha treino ativo

## Migracao SQL

```sql
ALTER TABLE public.alunos
  ADD COLUMN IF NOT EXISTS tempo_disponivel_min integer DEFAULT 60,
  ADD COLUMN IF NOT EXISTS historico_lesoes text,
  ADD COLUMN IF NOT EXISTS foco_muscular varchar DEFAULT 'corpo_todo',
  ADD COLUMN IF NOT EXISTS condicionamento_cardio varchar DEFAULT 'medio',
  ADD COLUMN IF NOT EXISTS experiencia_pesos_livres varchar DEFAULT 'basico',
  ADD COLUMN IF NOT EXISTS preferencia_intensidade varchar DEFAULT 'moderado',
  ADD COLUMN IF NOT EXISTS preferencia_cardio varchar DEFAULT 'integrado',
  ADD COLUMN IF NOT EXISTS preferencia_equipamento varchar DEFAULT 'ambos',
  ADD COLUMN IF NOT EXISTS treina_sozinho boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS horario_preferido varchar DEFAULT 'manha',
  ADD COLUMN IF NOT EXISTS meta_tempo_meses integer DEFAULT 3;
```

