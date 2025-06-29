
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">10X Training</span>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">com IA</span>
          </div>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Sistema de Treino
          <span className="text-blue-600"> 10X </span>
          com IA
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Revolucione seus treinos com inteligência artificial. 
          Monitore sua carga interna, receba sugestões personalizadas 
          e alcance seus objetivos mais rapidamente.
        </p>
        <div className="space-x-4">
          <Link to="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              Começar Agora - Grátis
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Por que escolher o Sistema 10X?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nossa plataforma combina metodologia científica com inteligência artificial 
            para otimizar seus resultados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">🎯</div>
              <CardTitle className="text-blue-600">Método 10X</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sistema científico de alta intensidade com 10 séries por exercício 
                para máximos resultados em menos tempo
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">🤖</div>
              <CardTitle className="text-blue-600">IA Personalizada</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Assistente virtual que analisa sua carga interna e oferece 
                sugestões personalizadas para otimizar sua recuperação
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">📊</div>
              <CardTitle className="text-blue-600">Monitoramento Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Acompanhe sua evolução com gráficos detalhados de carga interna, 
                PSE e performance ao longo do tempo
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">🏋️</div>
              <CardTitle className="text-blue-600">Biblioteca de Exercícios</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Acesso completo a exercícios com vídeos demonstrativos, 
                tanto com peso corporal quanto com carga
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">📱</div>
              <CardTitle className="text-blue-600">Interface Intuitiva</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Design moderno e responsivo que funciona perfeitamente 
                em qualquer dispositivo, desktop ou mobile
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">💬</div>
              <CardTitle className="text-blue-600">Chat com IA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Tire dúvidas sobre treino, alimentação e bem-estar com 
                nossa assistente virtual disponível 24/7
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para transformar seus treinos?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de pessoas que já estão usando o Sistema 10X
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Criar Conta Gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="opacity-75">
            © 2024 Sistema de Treino 10X com IA. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
