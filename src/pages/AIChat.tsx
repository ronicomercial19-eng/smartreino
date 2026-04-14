
import { PageLayout } from "@/components/shared/PageLayout";
import RealTimeAIChat from "@/components/RealTimeAIChat";

const AIChat = () => {
  return (
    <PageLayout
      title="🤖 Coach IA em Tempo Real"
      subtitle="Assistente inteligente com streaming — treinos, nutrição e análise personalizada"
    >
      <RealTimeAIChat />
    </PageLayout>
  );
};

export default AIChat;
