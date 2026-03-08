

# Auditoria Completa do App 9FIT - Problemas e Correções

## 1. ERROS CRITICOS DE PERMISSAO / ROLE

### 1.1 `useUserRole` tem conflito logico
- Linhas 67-69: `isStudent = role === 'student' || role === 'user'` mas no return (linha 83): `isStudent: !isAdmin && !isProfessor` -- inconsistencia, a variavel local `isStudent` nunca e usada no return
- `isProfessor` inclui `isAdmin` (linha 68: `|| isAdmin`), entao `isProfessor && !isAdmin` no App.tsx funciona, mas se role == `'user'` o usuario cai no bloco student e so ve 3 rotas (correto), porem se role == `null` (RPC falha), fallback e `'user'` e vira student -- potencialmente tranca admins fora

### 1.2 Registro insere role errado
- `Register.tsx` linha 68: professor vira `'admin'` no user_roles (`const roleToInsert = formData.accountType === 'professor' ? 'admin' : 'user'`). Todo professor que se cadastra vira admin!
- Trigger `handle_new_user_role` tambem atribui `'user'` por default, causando duplicata com o insert do frontend

### 1.3 `handle_new_user` vs `handle_new_user_role` - 2 triggers concorrentes
- `handle_new_user()` insere em `profiles` com role `'professor'` por default
- `handle_new_user_role()` insere em `profiles` E `user_roles` com logica diferente (student por default)
- Possivel conflito/duplicacao de inserts no signup

### 1.4 `is_professor()` funcao SQL esta errada
```sql
-- Retorna TRUE so se role = 'admin', NAO verifica 'professor'!
SELECT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = check_user_id AND role = 'admin'
);
```
Qualquer RLS policy que use `is_professor()` esta quebrada para professores reais.

---

## 2. COMPONENTES COM LAYOUT ERRADO / LEGADO

### 2.1 Navigation.tsx - COMPLETAMENTE LEGADO
- Usa `localStorage.getItem("user")` (sistema antigo, pre-Supabase)
- Mostra "Lovelace Fitness" em vez de "9FIT"
- Nao verifica auth do Supabase
- Usado por: `AIConfig.tsx`, `WorkoutHistory.tsx`, `AdminStudentManagement.tsx`, `WorkoutRegister.tsx`

### 2.2 Paginas que usam Navigation ao inves de AppLayout/PageLayout
| Pagina | Usa Navigation (errado) | Deveria usar |
|--------|------------------------|-------------|
| AIConfig.tsx | Sim | AppLayout |
| WorkoutHistory.tsx | Sim | AppLayout/PageLayout |
| AdminStudentManagement.tsx | Sim | AppLayout/PageLayout |
| WorkoutRegister.tsx | Sim | AppLayout/PageLayout |

### 2.3 AIConfig.tsx usa localStorage para auth (linha 47-51)
- Verifica `localStorage.getItem("user")` para redirect
- Salva settings em localStorage, nao no banco
- Deveria usar Supabase auth + salvar configs na DB

### 2.4 Index.tsx - Landing page com branding errado
- Mostra "10X Training" em vez de "9FIT"
- Nao e referenciada em nenhuma rota (pagina morta)

---

## 3. ROTAS DUPLICADAS / PROBLEMATICAS

### 3.1 Rotas com mesma funcionalidade
- `/admin-students` (AdminStudentManagement) vs `/gerenciamento-alunos` (GerenciamentoAlunos) -- duas paginas de gestao de alunos
- `/exercises` e `/exercicios` redirecionam para `/exercise-library` (ok, sao aliases)

### 3.2 DashboardShortcuts aponta para rota errada
- Linha 64: `route: "/admin-students"` -- deveria ser `/gerenciamento-alunos`
- Linha 48: `route: "/exercises"` -- deveria ser `/exercise-library` (redireciona, mas e inconsistente)

### 3.3 AlunoDetalhes navega para rota obsoleta
- Linhas 38, 85, 102: `navigate('/admin-students')` -- deveria ser `/gerenciamento-alunos`

### 3.4 AppLayout header mostra "TrainSync" (branding errado)
- Linha 38: `<h1>TrainSync</h1>` -- deveria ser "9FIT"

---

## 4. DADOS MOCK / ESTATICOS

### 4.1 Dashboard.tsx - Dados 100% hardcoded
- Total de Treinos: "124" (hardcoded)
- PSE Medio: "7.8" (hardcoded)
- Carga Total: "2,450kg" (hardcoded)
- Consistencia: "85%" (hardcoded)
- Nao consulta nenhum dado real do banco

### 4.2 DashboardShortcuts - Stats fake
- "24 Modelos", "156 Registros", "489 Exercicios", "43 Alunos", "127 Treinos Ativos" -- tudo hardcoded

### 4.3 PerformanceHistory - provavelmente mock tambem (referenciado no Dashboard)

---

## 5. BOTOES E FUNCIONALIDADES QUEBRADAS

### 5.1 GenerateWorkout.tsx -- Requer `location.state?.aluno`
- Se acessado diretamente pela URL (sem state), mostra "Aluno nao selecionado"
- Nao tem fallback para selecionar aluno

### 5.2 Login.tsx -- Demo login inseguro
- Linhas 62-111: Tenta login com "demo@trainsync.com" / "demo123456"
- Se falha, tenta CRIAR usuario demo via signUp
- Cria usuario sem role definido

### 5.3 MeusTreinos.tsx -- Depende de `userProfile?.id` para carregar alunos
- Linha 52: `if (!userProfile?.id) return` -- se o hook useUserProfile falha, nunca carrega

---

## 6. FLUXO DE INFORMACAO INCORRETO

### 6.1 Dois sistemas de autenticacao paralelos
- **Sistema legado**: `localStorage.getItem("user")` (Navigation, AIConfig, aiService, mockData)
- **Sistema real**: `supabase.auth` (App.tsx, useUserRole, StudentInterface, etc.)
- Usuarios nunca setam localStorage, logo Navigation/AIConfig sempre veem usuario como null

### 6.2 Sidebar faz fetch de auth separado
- `AppSidebar.tsx` linhas 143-146: chama `supabase.auth.getSession()` independentemente
- Deveria receber userId via props/context do App.tsx (ja disponivel)
- Cada montagem do sidebar causa 1 chamada extra de auth + 1 RPC get_user_role

### 6.3 StudentInterface busca aluno por EMAIL
- Linha 87: `.eq('email', user.email)` -- se o aluno foi cadastrado pelo professor com email diferente do auth, nao encontra

---

## 7. TELAS NAO EXISTENTES / ORFAS

- `DocumentacaoSistema.tsx` -- existe no filesystem mas nao tem rota no App.tsx
- `Index.tsx` -- landing page sem rota (nao e usada)
- `/workout-modalities` -- rota existe so para admin, mas `WorkoutModalities.tsx` parece pagina generica
- `/recommended-workout` -- rota admin-only, uso incerto

---

## 8. PLANO DE CORRECOES (por prioridade)

### P0 - Criticos (Seguranca/Funcionalidade)
1. **Corrigir Register.tsx**: professor deve inserir role `'professor'` (nao `'admin'`) no user_roles
2. **Corrigir funcao SQL `is_professor()`**: incluir `role IN ('professor', 'trainer', 'admin')` em vez de so `'admin'`
3. **Remover localStorage auth** de AIConfig, Navigation, aiService, mockData
4. **Unificar triggers**: decidir entre `handle_new_user` e `handle_new_user_role`, manter apenas um

### P1 - Layout/Navegacao
5. **Migrar 4 paginas** (AIConfig, WorkoutHistory, AdminStudentManagement, WorkoutRegister) de Navigation para AppLayout
6. **Corrigir branding**: "TrainSync" → "9FIT" no AppLayout header; remover referencia "Lovelace Fitness" e "10X Training"
7. **Corrigir DashboardShortcuts**: `/admin-students` → `/gerenciamento-alunos`, `/exercises` → `/exercise-library`
8. **Corrigir AlunoDetalhes**: `/admin-students` → `/gerenciamento-alunos`

### P2 - Dados Reais
9. **Dashboard**: substituir dados hardcoded por queries reais (total alunos, treinos, etc.)
10. **DashboardShortcuts**: carregar stats reais do banco

### P3 - Fluxo
11. **GenerateWorkout**: adicionar selector de aluno como fallback quando `location.state` esta vazio
12. **AppSidebar**: receber userId via context em vez de buscar auth separadamente
13. **Remover Login demo** ou configurar corretamente com role

### P4 - Limpeza
14. **Remover/unificar** AdminStudentManagement (duplica GerenciamentoAlunos)
15. **Remover** Navigation.tsx (legado, nao deveria existir)
16. **Remover** Index.tsx ou adicionar rota publica
17. **Adicionar rota** para DocumentacaoSistema se necessario

---

## Arquivos a Criar
Nenhum novo -- apenas correcoes nos existentes.

## Arquivos a Modificar
1. `src/pages/Register.tsx` -- role professor
2. `src/pages/AIConfig.tsx` -- remover Navigation/localStorage, usar AppLayout
3. `src/pages/WorkoutHistory.tsx` -- migrar para AppLayout
4. `src/pages/AdminStudentManagement.tsx` -- migrar ou remover
5. `src/pages/WorkoutRegister.tsx` -- migrar para AppLayout
6. `src/components/AppLayout.tsx` -- branding 9FIT
7. `src/components/DashboardShortcuts.tsx` -- rotas corretas + stats reais
8. `src/components/Navigation.tsx` -- remover
9. `src/pages/AlunoDetalhes.tsx` -- corrigir navegacao
10. `src/pages/Dashboard.tsx` -- dados reais
11. `src/pages/GenerateWorkout.tsx` -- fallback sem state
12. `src/pages/Login.tsx` -- remover/corrigir demo login
13. `src/components/AppSidebar.tsx` -- otimizar auth
14. `src/hooks/useUserRole.ts` -- limpar inconsistencia isStudent

## Migracao SQL
1. **Corrigir `is_professor()`**: `role IN ('professor', 'trainer', 'admin', 'super_admin')`
2. **Unificar triggers** handle_new_user/handle_new_user_role: manter um, usar raw_user_meta_data->>'user_type' para decidir role

