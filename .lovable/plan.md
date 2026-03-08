

# Plano: Sistema de Permissoes por Camada (Admin / Professor / Aluno)

## Problema Atual

1. **Role vem do `user_metadata`** no App.tsx (`session.user.user_metadata?.user_type || 'admin'`) - inseguro, qualquer um vira admin por default
2. **Tabela `user_roles` existe** com enum `app_role` (admin, professor, student, etc.) mas **nao e consultada** no frontend
3. **Sidebar mostra tudo** para todos - sem filtragem por role
4. **Rotas nao sao protegidas** por role - apenas "student" vs "tudo"
5. **Funcao `get_user_role()`** ja existe no banco mas nao e usada

## Arquitetura de Permissoes

```text
ADMIN (tudo)
├── Dashboard, Analytics, Estatisticas Avancadas
├── Gestao de Alunos (CRUD completo)
├── Periodizacao (upload + gerar plano completo)
├── Modelos de Treino (criar/editar/excluir)
├── Exercicios (gerenciar biblioteca)
├── Config IA, Roadmap, Settings
├── Interface Aluno (visualizar)
└── Chat IA

PROFESSOR (gera treinos, gerencia alunos)
├── Dashboard
├── Gestao de Alunos (CRUD)
├── Periodizacao (upload + gerar)
├── Modelos de Treino (visualizar + usar)
├── Meus Treinos
├── Exercicios (visualizar)
├── Chat IA
└── Interface Aluno (visualizar)

ALUNO (student)
├── SmartReino Quiz + Treino do Dia
├── Chat IA (coach)
├── Historico de Treinos
└── Meu Progresso
```

## O que sera feito

### 1. Hook `useUserRole` (novo)

Cria um hook que consulta a tabela `user_roles` via `get_user_role()` (funcao security definer ja existente) para obter o role real do usuario logado. Cacheia o resultado e expoe: `role`, `isAdmin`, `isProfessor`, `isStudent`, `loading`.

### 2. Atualizar App.tsx - Rotas por Role

Substituir a logica atual (`user_metadata?.user_type`) por consulta real ao `user_roles`. Organizar rotas em 3 grupos:
- **Admin**: todas as rotas
- **Professor**: rotas de gestao + treinos (sem config IA, roadmap, analytics avancadas)
- **Aluno**: apenas `/student-interface`

### 3. Sidebar Dinamica por Role

Filtrar `navigationItems` no `AppSidebar.tsx` baseado no role. Admin ve tudo, professor ve subset, aluno nao usa sidebar (tem interface propria).

### 4. Atualizar Register.tsx

Adicionar selector de tipo de conta (Professor / Aluno). Ao registrar, inserir na `user_roles` o role correto em vez de sempre colocar 'admin'.

### 5. Componente `ProtectedRoute` (novo)

Wrapper que verifica se o usuario tem o role necessario. Se nao, redireciona para a rota default do seu role.

## Arquivos a Criar

1. **`src/hooks/useUserRole.ts`** - Hook que consulta `get_user_role()` e expoe role + helpers
2. **`src/components/ProtectedRoute.tsx`** - Guard de rota por role

## Arquivos a Modificar

1. **`src/App.tsx`** - Substituir `user_metadata` por `useUserRole`, organizar rotas por role
2. **`src/components/AppSidebar.tsx`** - Filtrar items por role
3. **`src/pages/Register.tsx`** - Adicionar escolha de role (professor/aluno)
4. **`src/pages/Login.tsx`** - Apos login, redirecionar baseado no role real

## Detalhes Tecnicos

- Role e lido da tabela `user_roles` via funcao `get_user_role(_user_id)` (security definer, ja existe)
- Nenhuma migracao SQL necessaria - `app_role` enum ja tem admin, professor, student
- `handle_new_user_role()` trigger ja existe mas precisa aceitar o role do signup metadata
- RLS policies existentes ja usam `has_role()` e `is_professor()` - continuam funcionando

