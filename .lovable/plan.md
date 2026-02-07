

# Plano: Interface do Aluno Completa + Fase 6 (Refinamentos)

## Contexto do Problema

1. **Rota `/student-interface` inacessivel**: O usuario admin esta tentando acessar `/student-interface`, mas essa rota so esta disponivel quando `userType === 'student'`. O usuario admin cai no 404.
2. **Interface do aluno basica**: A tela atual consulta tabelas (`athletes`, views inexistentes) que nao correspondem ao fluxo de dados principal (`alunos`, `planos_de_treino_gerados`).
3. **Falta experiencia completa do aluno**: O aluno precisa de uma interface pratica e intuitiva que aproveite todo o poder do SmartReino (visualizar treinos, chat IA, historico, progresso).

---

## O que sera implementado

### 1. Nova Interface do Aluno - Redesign Completo

Transformar `StudentInterface.tsx` em uma experiencia completa e intuitiva:

- **Dashboard pessoal** com saudacao e resumo do dia
- **Treino do dia** em destaque com o template visual 9FIT
- **Chat IA Coach** integrado para o aluno pedir ajustes, tirar duvidas sobre exercicios, pedir motivacao
- **Historico de treinos** com registro de execucao (PSE, notas, duracao)
- **Progresso pessoal** com graficos simples de evolucao
- **Perfil resumido** com dados fisicos e objetivos

A interface buscara dados das tabelas corretas:
- `alunos` (vinculado por email do usuario logado)
- `planos_de_treino_gerados` (treinos atribuidos ao aluno)
- `historico_treinos_realizados` (treinos executados)

### 2. Correcao de Rota e Acesso

- Tornar `/student-interface` acessivel tanto para alunos quanto para admins (preview)
- Para admin: mostrar como preview da experiencia do aluno selecionado
- Para aluno: mostrar seus proprios dados automaticamente

### 3. Fase 6: Refinamentos e Otimizacoes

- Animacoes suaves em transicoes de pagina e cards
- Loading states com skeletons em todas as acoes assincronas
- Mensagens de erro amigaveis com sugestoes de acao
- Tooltips contextuais nos botoes e metricas principais
- Responsividade mobile otimizada na interface do aluno
- Dark mode ja esta implementado (tema 9FIT preto/laranja)

### 4. Atualizacao do Roadmap

- Adicionar nova Fase 7 para a Interface do Aluno
- Atualizar Fase 6 como em progresso
- Atualizar proximos passos imediatos

---

## Detalhes Tecnicos

### Arquivos a criar:

1. **`src/pages/StudentInterface.tsx`** (reescrever completamente)
   - Dashboard com abas: Meu Treino | Chat IA | Historico | Meu Progresso
   - Busca dados via email do usuario logado na tabela `alunos`
   - Exibe treino ativo usando `WorkoutDisplayTemplate`
   - Chat IA integrado para comandos do aluno
   - Registro de treino realizado (PSE, duracao, notas)

2. **`src/components/student/StudentWorkoutView.tsx`** (novo)
   - Exibe o treino do dia usando o template 9FIT
   - Botao "Iniciar Treino" que abre modo de registro
   - Timer de descanso entre series
   - Checkbox por exercicio concluido

3. **`src/components/student/StudentTrainingLog.tsx`** (novo)
   - Formulario para registrar treino realizado
   - Campos: PSE (1-10), duracao, notas pessoais
   - Salva em `historico_treinos_realizados`

4. **`src/components/student/StudentProgressChart.tsx`** (novo)
   - Graficos simples com Recharts
   - Evolucao de PSE ao longo do tempo
   - Frequencia semanal
   - Volume total

5. **`src/components/student/StudentAICoach.tsx`** (novo)
   - Chat IA usando edge function existente `modify-workout`
   - Perguntas rapidas pre-definidas
   - Streaming de respostas
   - Comandos como: "Qual exercicio substitui supino?", "Estou com dor no ombro", "Aumentar carga"

### Arquivos a modificar:

1. **`src/App.tsx`**
   - Tornar `/student-interface` acessivel para admin tambem (para preview)
   - Manter rota para alunos como pagina principal

2. **`src/pages/RoadmapView.tsx`**
   - Adicionar Fase 7: Interface do Aluno
   - Marcar Fase 6 como em progresso
   - Atualizar proximos passos

3. **`src/components/AppSidebar.tsx`**
   - Adicionar links para StudentAnalytics e AdvancedStatistics no menu

### Fluxo do Aluno:

```text
Login (tipo student)
    |
    v
Dashboard Pessoal
    |
    +-- [Meu Treino] --> Visualiza treino do dia (template 9FIT)
    |                      |
    |                      +-- Iniciar Treino --> Registrar execucao
    |                      +-- Ver proximo dia
    |
    +-- [Chat IA] ------> Conversa com IA Coach
    |                      |
    |                      +-- Perguntas rapidas
    |                      +-- Pedir substituicao
    |                      +-- Relatar dor/desconforto
    |
    +-- [Historico] -----> Lista de treinos realizados
    |                      |
    |                      +-- PSE medio
    |                      +-- Frequencia
    |
    +-- [Progresso] -----> Graficos de evolucao
                           |
                           +-- PSE ao longo do tempo
                           +-- Volume total
                           +-- Aderencia ao plano
```

### Dados buscados:

- **Perfil do aluno**: `alunos` WHERE email = usuario_logado.email
- **Treino ativo**: `planos_de_treino_gerados` WHERE estudante_id = aluno.id AND status = 'ativo'
- **Historico**: `historico_treinos_realizados` WHERE aluno_id = aluno.id
- **Avaliacoes**: `avaliacoes_unificadas` WHERE aluno_id = aluno.id

### Refinamentos (Fase 6) aplicados em todas as telas:

- `animate-fade-in` em transicoes de pagina
- Skeleton loaders nos cards enquanto carrega
- Toast com mensagens claras em portugues
- Tooltips em icones e metricas
- Layout responsivo com `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Hover effects suaves nos cards interativos

