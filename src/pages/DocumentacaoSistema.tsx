/**
 * Página de documentação do sistema
 * Contém organograma e fluxogramas das funcionalidades
 */

import { PageLayout } from '@/components/shared/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DocumentacaoSistema() {
  return (
    <PageLayout
      title="Documentação do Sistema"
      subtitle="Organogramas e fluxogramas das funcionalidades"
    >
      <Tabs defaultValue="organograma" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organograma">Organograma</TabsTrigger>
          <TabsTrigger value="fluxo-aluno">Fluxo - Aluno</TabsTrigger>
          <TabsTrigger value="fluxo-treino">Fluxo - Treino</TabsTrigger>
          <TabsTrigger value="fluxo-ia">Fluxo - IA</TabsTrigger>
        </TabsList>

        {/* ORGANOGRAMA GERAL */}
        <TabsContent value="organograma">
          <Card>
            <CardHeader>
              <CardTitle>Organograma de Funcionalidades</CardTitle>
              <CardDescription>
                Estrutura hierárquica de todas as funcionalidades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <pre className="text-sm">
{`graph TD
    A[Sistema TrainSync] --> B[Gestão de Alunos]
    A --> C[Gestão de Treinos]
    A --> D[Análises IA]
    A --> E[Avaliações Físicas]
    A --> F[Histórico]
    
    B --> B1[Cadastrar Aluno]
    B --> B2[Listar Alunos]
    B --> B3[Editar Aluno]
    B --> B4[Excluir Aluno]
    B --> B5[Visualizar Perfil]
    
    C --> C1[Criar Plano de Treino]
    C --> C2[Enviar Treino para Aluno]
    C --> C3[Gerenciar Modelos]
    C --> C4[Acompanhar Progresso]
    C --> C5[Ajustar Periodização]
    
    D --> D1[Análise de Perfil]
    D --> D2[Análise de Progresso]
    D --> D3[Recomendações]
    D --> D4[Predição de Resultados]
    D --> D5[Identificação de Riscos]
    
    E --> E1[Cadastrar Avaliação]
    E --> E2[Histórico de Avaliações]
    E --> E3[Comparar Avaliações]
    E --> E4[Gráficos de Evolução]
    
    F --> F1[Treinos Realizados]
    F --> F2[Frequência]
    F --> F3[Volume Total]
    F --> F4[Relatórios]`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FLUXO DE GESTÃO DE ALUNO */}
        <TabsContent value="fluxo-aluno">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Gestão de Alunos</CardTitle>
              <CardDescription>
                Processo completo de gestão de alunos no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  Fluxo completo desde o acesso do professor até a conclusão das operações de gestão de alunos.
                </p>
                <ul className="space-y-2 text-sm">
                  <li><strong>→ Cadastro:</strong> Formulário → Validação → Salvar no BD</li>
                  <li><strong>→ Listagem:</strong> Buscar alunos → Exibir tabela → Ações (visualizar, editar, excluir, enviar treino)</li>
                  <li><strong>→ Edição:</strong> Formulário com dados atuais → Validação → Atualizar BD</li>
                  <li><strong>→ Exclusão:</strong> Confirmação → Soft delete (status inativo)</li>
                  <li><strong>→ Envio de Treino:</strong> Dialog → Criar plano → Salvar e notificar</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FLUXO DE TREINO */}
        <TabsContent value="fluxo-treino">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Gestão de Treinos</CardTitle>
              <CardDescription>
                Processo de criação, envio e acompanhamento de treinos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  Fluxo desde a seleção do aluno até a conclusão e relatório final do plano de treino.
                </p>
                <ul className="space-y-2 text-sm">
                  <li><strong>1. Seleção:</strong> Escolher aluno → Buscar perfil</li>
                  <li><strong>2. Criação Manual:</strong> Formulário → Validar → Salvar plano</li>
                  <li><strong>3. Criação por IA:</strong> Análise de perfil → Gerar recomendações → Aprovação do professor → Salvar</li>
                  <li><strong>4. Atribuição:</strong> Vincular ao aluno → Notificar → Plano ativo</li>
                  <li><strong>5. Acompanhamento:</strong> Registrar treinos → Avaliar progresso → Ajustar se necessário</li>
                  <li><strong>6. Progressão:</strong> Avançar semanas → Verificar conclusão → Gerar relatório final</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FLUXO DE IA */}
        <TabsContent value="fluxo-ia">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Análises IA</CardTitle>
              <CardDescription>
                Processo de análise individual por perfil usando IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">🔍 Análise de Perfil</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Coletar: Dados pessoais + Objetivo + Restrições → IA → Resultado
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Insights sobre o perfil</li>
                    <li>• Recomendações gerais</li>
                    <li>• Alertas de atenção</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">📈 Análise de Progresso</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Coletar: Treinos realizados + Avaliações + Frequência → IA → Resultado
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Tendência de evolução</li>
                    <li>• Pontos fortes</li>
                    <li>• Áreas de atenção</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">💡 Recomendações Personalizadas</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Coletar: Perfil completo + Progresso + Objetivo → IA → Resultado
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Ajustes no treino</li>
                    <li>• Sugestões nutricionais</li>
                    <li>• Recuperação</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">⚠️ Análise de Riscos</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Identificar padrões: Lesões + Overtraining + Dropout → IA → Resultado
                  </p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Nível de risco calculado</li>
                    <li>• Ações preventivas recomendadas</li>
                  </ul>
                </div>

                <div className="p-4 bg-primary/10 border border-primary rounded-lg">
                  <p className="text-sm font-semibold">
                    ✨ Todas as análises são individuais por perfil e salvas no histórico do aluno
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
