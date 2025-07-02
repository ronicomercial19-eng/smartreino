
import Navigation from "@/components/Navigation";
import ContextualAIChat from "@/components/ContextualAIChat";

const AIChat = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Chat Contextual com IA
          </h1>
          <p className="text-gray-600">
            Assistente inteligente que analisa seus dados e oferece sugestões personalizadas
          </p>
        </div>

        <ContextualAIChat />
      </div>
    </div>
  );
};

export default AIChat;
