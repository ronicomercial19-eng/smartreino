Plano de correção

1. Gestão de Alunos usando fonte canônica
- Alterar `AlunosService.listarAlunos()` para ler `public.vw_alunos_canonical` em vez de `alunos`.
- Mapear o retorno da view para o formato do app:
  - `id` = `vw_alunos_canonical.id` / `fitpro_student_id`
  - `athlete_id` = vínculo interno UUID quando existir
  - `objetivo`, `nivel`, `fase_atual`, `status`
- Atualizar `obterEstatisticas()` para calcular os números com a mesma view, não com `alunos`.
- Manter criação/edição local em `alunos` apenas como fallback administrativo, sem misturar com a listagem FitPro.

2. Tabela da página `/gerenciamento-alunos`
- Ajustar `TabelaAlunos` para mostrar exatamente as colunas pedidas:
  - ID
  - Objetivo
  - Nível
  - Status
- Remover dependência visual de nome/email/idade/peso nessa tela quando a fonte for `vw_alunos_canonical`.
- Usar textos “Aluno”, não “Atleta”.
- Desabilitar/ajustar ações que exigem um UUID local quando o aluno vier apenas com `fitpro_student_id` e não tiver `athlete_id`.

3. Permissão da view canônica no Supabase
- Criar migração para liberar leitura autenticada da view `vw_alunos_canonical`.
- Verificar se a view permanece protegida por autenticação e não fica pública.
- Observação importante: a consulta atual mostrou que `vw_alunos_canonical` existe, mas retornou 0 linhas. Vou corrigir o acesso e o consumo no app; se continuar vazia, o problema estará na alimentação da `fitpro_student_map`/integração FitPro.

4. SmartTreino Builder reconhecendo alunos canônicos
- Trocar a busca manual em `athletes` + `alunos` por `vw_alunos_canonical`.
- Usar `athlete_id` quando o fluxo técnico exigir UUID interno.
- Usar `id`/`fitpro_student_id` quando o fluxo vier do FitPro.
- Alterar rótulos para “Aluno”.
- Quando não houver `athlete_id`, exibir estado claro informando que falta vínculo FitPro → SmartTreino, em vez de falhar silenciosamente.

5. Periodização automática vinda do SmartPeriodizer
- No SmartTreino, parar de exigir que o usuário insira manualmente dados periodizados quando já existem na fonte canônica/SmartPeriodizer.
- Ler `objetivo`, `nivel`, `fase_atual`, `volume_level`, `intensity_level`, `recovery_status`, `adherence_level`, `fatigue_level` da `vw_alunos_canonical`.
- Pré-preencher o Builder com esses dados e deixar o SmartTreino focado apenas em elaborar o treino.

6. Geração de treino e entrega ao aluno
- Ajustar `generate-smart-treino` para aceitar o aluno vindo da view canônica.
- Fazer a função buscar contexto por `athlete_id` quando existir e por `fitpro_student_id` quando o fluxo vier do FitPro.
- Corrigir mensagens de erro para indicar exatamente o que está faltando: aluno não vinculado, periodização ausente, biblioteca vazia ou API indisponível.

7. Banco de exercícios 9FIT/FitPro
- Centralizar a leitura da biblioteca 9FIT na fonte existente (`exercise_library`/API FitPro conforme disponível no banco).
- Evitar usar dados mockados.
- Se a API FitPro estiver indisponível, o app deve mostrar erro operacional claro e não fingir que gerou treino.

Validação após implementar
- Abrir `/gerenciamento-alunos` e confirmar que a tabela consulta `vw_alunos_canonical`.
- Testar o SmartTreino Builder com aluno canônico.
- Testar geração de treino com contexto de periodização automática.
- Conferir logs/retornos quando não houver dados na view ou quando a API/biblioteca estiver indisponível.