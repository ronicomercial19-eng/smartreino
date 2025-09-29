
import { PageLayout } from "@/components/shared/PageLayout";
import ContextualAIChat from "@/components/ContextualAIChat";

const AIChat = () => {
  return (
    <PageLayout
      title="🤖 Chat Contextual com IA"
      subtitle="Assistente inteligente que analiza seus dados e oferece sugestões personalizadas"
    >
      <ContextualAIChat />
    </PageLayout>
  );
};

export default AIChat;
