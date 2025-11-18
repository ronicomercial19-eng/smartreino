# 9FIT - Fluxograma de Interação do Sistema

## 📱 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        9FIT SYSTEM                          │
│              Sistema de Gestão de Treinos                   │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
              ┌─────▼─────┐        ┌────▼─────┐
              │   LOGIN   │        │ REGISTER │
              └─────┬─────┘        └────┬─────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼──────────┐
                    │  AUTH MIDDLEWARE   │
                    │   (Supabase Auth)  │
                    └─────────┬──────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
          ┌─────────▼──────┐    ┌───────▼────────┐
          │ ADMIN/TRAINER  │    │    STUDENT     │
          │   INTERFACE    │    │   INTERFACE    │
          └────────┬───────┘    └───────┬────────┘
                   │                    │
                   │                    │
    ┌──────────────┼────────────────┐   │
    │              │                │   │
    ▼              ▼                ▼   ▼
```

## 🎯 Fluxo do Professor/Admin

### 1. Gestão de Alunos
```
┌──────────────────────────────────────────────────────────────┐
│                    GESTÃO DE ALUNOS                          │
└──────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼──────┐    ┌───────▼────────┐   ┌─────▼─────┐
    │ CADASTRAR  │    │  VISUALIZAR    │   │  EDITAR   │
    │   ALUNO    │    │   LISTAGEM     │   │   ALUNO   │
    └─────┬──────┘    └───────┬────────┘   └─────┬─────┘
          │                   │                   │
          │           ┌───────▼────────┐          │
          │           │  DETALHES DO   │          │
          └──────────►│     ALUNO      │◄─────────┘
                      └───────┬────────┘
                              │
                      ┌───────▼────────┐
                      │ GERAR TREINO   │
                      └────────────────┘
```

**Dados Necessários para Cadastro:**
- ✅ Nome completo
- ✅ Email (único)
- ✅ Data de nascimento
- ✅ Peso atual
- ✅ Altura
- ✅ Objetivo (hipertrofia, emagrecimento, etc.)
- ✅ Nível de experiência
- ✅ Frequência semanal
- ✅ Restrições médicas (opcional)

### 2. Geração de Treinos
```
┌──────────────────────────────────────────────────────────────┐
│                  GERAÇÃO DE TREINOS                          │
└──────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼──────┐    ┌───────▼────────┐   ┌─────▼─────────┐
    │ SELECIONAR │    │   ESCOLHER     │   │   CRIAR       │
    │   ALUNO    │    │    MODELO      │   │   MANUAL      │
    └─────┬──────┘    └───────┬────────┘   └─────┬─────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                      ┌───────▼────────┐
                      │  CONFIGURAR    │
                      │  PERIODIZAÇÃO  │
                      └───────┬────────┘
                              │
                      ┌───────▼────────┐
                      │    SALVAR E    │
                      │    APLICAR     │
                      └────────────────┘
```

### 3. Área de Treinos (Meus Treinos)
```
┌──────────────────────────────────────────────────────────────┐
│                     MEUS TREINOS                             │
└──────────────────────────────────────────────────────────────┘
                              │
                      ┌───────▼────────┐
                      │  SELECIONAR    │
                      │     ALUNO      │
                      └───────┬────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼──────┐    ┌───────▼────────┐   ┌─────▼─────────┐
    │   PERFIL   │    │    TREINOS     │   │  PERFORMANCE  │
    │  COMPLETO  │    │   APLICADOS    │   │   HISTORY     │
    └────────────┘    └───────┬────────┘   └───────────────┘
                              │
                      ┌───────▼────────┐
                      │  VER DETALHES  │
                      │   DO TREINO    │
                      └────────────────┘
```

## 👤 Fluxo do Aluno

```
┌──────────────────────────────────────────────────────────────┐
│                  INTERFACE DO ALUNO                          │
└──────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼──────┐    ┌───────▼────────┐   ┌─────▼─────────┐
    │    MEU     │    │     MEUS       │   │     MINHA     │
    │   PERFIL   │    │    TREINOS     │   │   EVOLUÇÃO    │
    └────────────┘    └───────┬────────┘   └───────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼──────┐    ┌───────▼────────┐   ┌─────▼─────────┐
    │  TREINO    │    │   REGISTRAR    │   │   HISTÓRICO   │
    │  DO DIA    │    │   EXECUÇÃO     │   │  DE TREINOS   │
    └────────────┘    └────────────────┘   └───────────────┘
```

## 🗂️ Estrutura de Pastas Organizada

```
src/
├── 📁 components/
│   ├── 📁 alunos/              # Componentes de gestão de alunos
│   │   ├── FormularioAluno.tsx
│   │   ├── TabelaAlunos.tsx
│   │   └── EnviarTreinoDialog.tsx
│   ├── 📁 treinos/             # Componentes de treinos
│   │   ├── PerformanceHistory.tsx
│   │   ├── WorkoutLogger.tsx
│   │   └── ExerciseCard.tsx
│   ├── 📁 shared/              # Componentes compartilhados
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorBoundary.tsx
│   ├── 📁 ui/                  # Componentes UI base (shadcn)
│   └── 📁 layout/              # Layouts
│       ├── AppLayout.tsx
│       └── AppSidebar.tsx
│
├── 📁 pages/
│   ├── 📁 auth/                # Páginas de autenticação
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── 📁 admin/               # Páginas do admin
│   │   ├── Dashboard.tsx
│   │   ├── AdminStudentManagement.tsx
│   │   └── AlunoDetalhes.tsx
│   ├── 📁 treinos/             # Páginas de treinos
│   │   ├── MeusTreinos.tsx
│   │   ├── WorkoutModels.tsx
│   │   ├── WorkoutDetails.tsx
│   │   └── WorkoutHistory.tsx
│   ├── 📁 student/             # Páginas do aluno
│   │   └── StudentInterface.tsx
│   └── 📁 common/              # Páginas comuns
│       ├── Profile.tsx
│       └── Settings.tsx
│
├── 📁 services/                # Serviços de API
│   ├── alunosService.ts
│   ├── generatedPlansService.ts
│   └── workoutService.ts
│
├── 📁 hooks/                   # Custom hooks
│   ├── useUserProfile.ts
│   ├── usePerformanceMonitor.ts
│   └── useToast.ts
│
└── 📁 utils/                   # Utilitários
    ├── logger.ts
    ├── formatters.ts
    └── constants.ts
```

## 🎨 Design System - 9FIT

### Cores Principais
```css
/* Black & Orange Theme */
--background: #000000         /* Preto puro */
--foreground: #FAFAFA         /* Branco para texto */

--primary: #FF6600           /* Laranja 9FIT */
--primary-foreground: #FFFFFF

--card: #141414              /* Preto suave para cards */
--border: #333333            /* Bordas sutis */

--orange-primary: #FF6600    /* Laranja principal */
--orange-secondary: #FF8533  /* Laranja secundário */
--orange-dark: #CC5200       /* Laranja escuro */
```

### Componentes com Marca 9FIT
- Logo: Número "9" em quadrado laranja + texto "9FIT"
- Gradientes: Sempre usando variações de laranja
- Cards: Fundo preto com bordas laranja em hover
- Botões primários: Fundo laranja com efeito glow
- Sidebar: Preto com highlights laranja

## 🚀 Onboarding Facilitado

### Primeira Vez - Admin/Professor
1. ✅ Login/Registro
2. ✅ Redirecionamento para Gestão de Alunos
3. ✅ Prompt para cadastrar primeiro aluno
4. ✅ Após cadastro → Gerar primeiro treino
5. ✅ Dashboard com overview

### Primeira Vez - Aluno
1. ✅ Recebe convite do professor
2. ✅ Cria conta com token
3. ✅ Completa perfil
4. ✅ Visualiza treino atribuído
5. ✅ Começa a registrar execuções

## 📊 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │  alunos  │───►│ planos_treino│───►│  historico  │  │
│  │          │    │   _aluno     │    │  _treinos   │  │
│  └──────────┘    └──────────────┘    └─────────────┘  │
│       │                  │                   │         │
│       │                  │                   │         │
│  ┌────▼──────┐    ┌──────▼───────┐    ┌────▼────────┐ │
│  │avaliacoes │    │  modelos_de  │    │  estruturas │ │
│  │ _fisicas  │    │    treino    │    │ _treinamento│ │
│  └───────────┘    └──────────────┘    └─────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## ✨ Próximos Passos (Roadmap)

1. **Fase 1 - Estrutura Base** ✅
   - Sistema de autenticação
   - Gestão de alunos
   - CRUD completo

2. **Fase 2 - Geração de Treinos** 🔄
   - Modelos de treino
   - Periodização
   - Seleção de exercícios

3. **Fase 3 - Execução e Acompanhamento**
   - Registro de treinos realizados
   - Performance tracking
   - Gráficos de evolução

4. **Fase 4 - IA e Automação**
   - Geração automática com IA
   - Sugestões personalizadas
   - Análise preditiva

5. **Fase 5 - Mobile e Comunicação**
   - App mobile
   - Notificações
   - Chat professor-aluno
