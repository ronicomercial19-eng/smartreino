# 📁 Estrutura de Pastas - 9FIT

## Visão Geral da Organização

```
9fit-trainsync/
├── 📄 docs/                        # Documentação
│   ├── FLUXOGRAMA.md              # Fluxograma de interação
│   ├── ESTRUTURA.md               # Este arquivo
│   └── ROADMAP.md                 # Roadmap do projeto
│
├── 📁 src/
│   ├── 📁 components/              # Componentes React
│   │   ├── 📁 alunos/             # Gestão de alunos
│   │   │   ├── FormularioAluno.tsx
│   │   │   ├── TabelaAlunos.tsx
│   │   │   └── EnviarTreinoDialog.tsx
│   │   │
│   │   ├── 📁 treinos/            # Componentes de treino
│   │   │   ├── PerformanceHistory.tsx
│   │   │   ├── WorkoutLogger.tsx
│   │   │   ├── ExerciseCard.tsx
│   │   │   └── ModelosTreinoCard.tsx
│   │   │
│   │   ├── 📁 shared/             # Componentes compartilhados
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── PageLayout.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── ComponentTemplate.tsx
│   │   │
│   │   ├── 📁 ui/                 # Componentes UI base (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── ... (outros componentes shadcn)
│   │   │
│   │   └── 📁 layout/             # Layouts da aplicação
│   │       ├── AppLayout.tsx
│   │       └── AppSidebar.tsx
│   │
│   ├── 📁 pages/                  # Páginas da aplicação
│   │   ├── Login.tsx              # ✅ Autenticação
│   │   ├── Register.tsx           # ✅ Registro
│   │   │
│   │   ├── Dashboard.tsx          # 📊 Dashboard principal
│   │   │
│   │   ├── GerenciamentoAlunos.tsx    # 👥 Gestão de alunos
│   │   ├── AlunoDetalhes.tsx          # 👤 Detalhes do aluno
│   │   │
│   │   ├── MeusTreinos.tsx        # 💪 Área de treinos dos alunos
│   │   ├── WorkoutModels.tsx      # 📋 Modelos de treino
│   │   ├── WorkoutDetails.tsx     # 📄 Detalhes do treino
│   │   ├── WorkoutHistory.tsx     # 📊 Histórico de treinos
│   │   │
│   │   ├── ExerciseLibrary.tsx    # 📚 Biblioteca de exercícios
│   │   ├── ExerciseManagement.tsx # ⚙️ Gestão de exercícios
│   │   │
│   │   ├── PeriodizationUpload.tsx    # 📈 Upload de periodização
│   │   │
│   │   ├── AIChat.tsx             # 🤖 Chat com IA
│   │   ├── AIConfig.tsx           # ⚙️ Configurações de IA
│   │   │
│   │   ├── StudentInterface.tsx   # 🎓 Interface do aluno
│   │   │
│   │   ├── Profile.tsx            # 👤 Perfil do usuário
│   │   ├── UserSettings.tsx       # ⚙️ Configurações
│   │   │
│   │   ├── RoadmapView.tsx        # 🗺️ Roadmap do sistema
│   │   │
│   │   └── NotFound.tsx           # ❌ Página 404
│   │
│   ├── 📁 services/               # Serviços de API
│   │   ├── alunosService.ts       # Gestão de alunos
│   │   ├── authService.ts         # Autenticação
│   │   ├── generatedPlansService.ts   # Planos gerados
│   │   ├── simpleModelsService.ts     # Modelos simples
│   │   ├── workoutService.ts      # Treinos
│   │   ├── aiService.ts           # IA
│   │   ├── contextualAIService.ts # IA contextual
│   │   ├── periodizationService.ts    # Periodização
│   │   └── userProfileService.ts  # Perfil do usuário
│   │
│   ├── 📁 hooks/                  # Custom Hooks
│   │   ├── useUserProfile.ts      # Hook de perfil
│   │   ├── useUserContext.ts      # Hook de contexto
│   │   ├── usePerformanceMonitor.ts   # Monitor de performance
│   │   ├── useOptimizedQuery.ts   # Queries otimizadas
│   │   ├── useErrorHandler.ts     # Tratamento de erros
│   │   ├── use-toast.ts           # Toast notifications
│   │   └── use-mobile.tsx         # Detecção mobile
│   │
│   ├── 📁 utils/                  # Utilitários
│   │   ├── logger.ts              # Sistema de logs
│   │   ├── formatters.ts          # Formatadores
│   │   ├── constants.ts           # Constantes
│   │   └── cleanLogs.ts           # Limpeza de logs
│   │
│   ├── 📁 data/                   # Dados estáticos
│   │   ├── exerciseDatabase.ts
│   │   ├── mockData.ts
│   │   └── ... (outros databases)
│   │
│   ├── 📁 schemas/                # Schemas de validação
│   │   └── userProfileSchema.ts
│   │
│   ├── 📁 integrations/           # Integrações externas
│   │   └── 📁 supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   │
│   ├── 📄 App.tsx                 # Componente principal
│   ├── 📄 main.tsx                # Entry point
│   ├── 📄 index.css               # Estilos globais + Design System
│   └── 📄 vite-env.d.ts           # Types do Vite
│
├── 📁 supabase/                   # Configuração Supabase
│   ├── config.toml
│   ├── 📁 functions/
│   │   └── analyze-periodization/
│   └── 📁 migrations/
│
├── 📄 package.json                # Dependências
├── 📄 tailwind.config.ts          # Config Tailwind
├── 📄 vite.config.ts              # Config Vite
├── 📄 tsconfig.json               # Config TypeScript
└── 📄 README.md                   # Documentação principal
```

## 🎯 Convenções de Nomenclatura

### Arquivos
- **Componentes React**: PascalCase (ex: `FormularioAluno.tsx`)
- **Services**: camelCase + "Service" (ex: `alunosService.ts`)
- **Hooks**: camelCase começando com "use" (ex: `useUserProfile.ts`)
- **Utils**: camelCase (ex: `logger.ts`)
- **Pages**: PascalCase (ex: `GerenciamentoAlunos.tsx`)

### Pastas
- **Minúsculas**: para pastas genéricas (`components`, `services`, `hooks`)
- **kebab-case**: quando necessário (`user-profile`)

## 📦 Responsabilidades

### `/components`
Componentes React reutilizáveis organizados por domínio:
- `alunos/`: Tudo relacionado a gestão de alunos
- `treinos/`: Componentes de treinos e exercícios
- `shared/`: Componentes genéricos usados em toda app
- `ui/`: Componentes base do design system (shadcn)
- `layout/`: Layouts principais da aplicação

### `/pages`
Páginas completas da aplicação. Cada página representa uma rota.
- Devem ser componentes "smart" que orquestram outros componentes
- Fazem chamadas a services
- Gerenciam estado da página

### `/services`
Camada de serviço que abstrai chamadas à API (Supabase).
- Cada service corresponde a um domínio (alunos, treinos, etc)
- Retorna dados tipados
- Trata erros
- Não deve conter lógica de UI

### `/hooks`
Custom hooks React para lógica reutilizável.
- Começam com `use`
- Encapsulam lógica stateful
- Podem compor outros hooks

### `/utils`
Funções utilitárias puras.
- Não dependem de React
- Não tem side effects
- Testáveis isoladamente

## 🎨 Design System (9FIT)

### Cores (index.css)
```css
/* Tema Preto & Laranja */
--background: hsl(0 0% 0%)          /* Preto puro */
--foreground: hsl(0 0% 98%)         /* Branco para texto */
--primary: hsl(24 100% 50%)         /* Laranja 9FIT */
--card: hsl(0 0% 8%)                /* Cards escuros */
--border: hsl(0 0% 20%)             /* Bordas sutis */
```

### Tipografia
- **Headings**: Montserrat (bold, moderno)
- **Body**: Inter (legível, profissional)

### Componentes UI
Todos os componentes base estão em `/components/ui` e seguem o padrão shadcn/ui com customizações para o tema 9FIT.

## 🔄 Fluxo de Dados

```
┌─────────────┐
│   Pages     │ ← Componentes "smart"
└──────┬──────┘
       │
       ├─► Services ─► Supabase (API)
       │
       ├─► Hooks ─► State Management
       │
       └─► Components ─► UI
```

## 📱 Rotas da Aplicação

### Públicas
- `/login` - Tela de login
- `/register` - Registro de nova conta

### Protegidas - Admin/Professor
- `/` - Redireciona para `/gerenciamento-alunos`
- `/gerenciamento-alunos` - Gestão de alunos ⭐
- `/aluno/:id` - Detalhes de um aluno
- `/meus-treinos` - Área de treinos dos alunos
- `/workout-models` - Modelos de treino
- `/workout-details/:id` - Detalhes de um treino
- `/dashboard` - Dashboard analítico
- `/exercise-library` - Biblioteca de exercícios
- `/periodization-upload` - Upload de periodização
- `/ai-chat` - Chat com IA
- `/settings` - Configurações
- `/roadmap` - Roadmap do sistema

### Protegidas - Aluno
- `/student-interface` - Interface principal do aluno

## 🚀 Onboarding

### Primeiro Acesso - Professor
1. Login/Registro
2. Redirecionado para `/gerenciamento-alunos`
3. Prompt para cadastrar primeiro aluno
4. Sugestão para gerar primeiro treino

### Primeiro Acesso - Aluno
1. Convite por email do professor
2. Registro com token
3. Completar perfil
4. Ver treino atribuído

## 📊 Stack Tecnológico

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State**: React Hooks + TanStack Query
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod

## 🎯 Próximas Melhorias

1. ✅ Estrutura organizada
2. ✅ Design System 9FIT
3. 🔄 Testes automatizados
4. 🔄 Documentação de componentes
5. 🔄 Storybook para UI
6. 🔄 Performance optimization
7. 🔄 Mobile responsive melhorado
8. 🔄 PWA capabilities
