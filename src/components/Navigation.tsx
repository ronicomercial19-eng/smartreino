
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Menu, X, User, LogOut, Settings, Brain } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast({
      title: "Logout realizado com sucesso!",
      description: "Até logo! Volte sempre para continuar seu progresso.",
    });
    navigate("/");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Lovelace Fitness</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button 
                    variant={isActive("/dashboard") ? "default" : "ghost"}
                    className="text-sm"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link to="/workout-register">
                  <Button 
                    variant={isActive("/workout-register") ? "default" : "ghost"}
                    className="text-sm"
                  >
                    Registrar Treino
                  </Button>
                </Link>
                <Link to="/workout-history">
                  <Button 
                    variant={isActive("/workout-history") ? "default" : "ghost"}
                    className="text-sm"
                  >
                    Histórico
                  </Button>
                </Link>
                <Link to="/exercises">
                  <Button 
                    variant={isActive("/exercises") ? "default" : "ghost"}
                    className="text-sm"
                  >
                    Exercícios
                  </Button>
                </Link>
                <Link to="/ai-chat">
                  <Button 
                    variant={isActive("/ai-chat") ? "default" : "ghost"}
                    className={`text-sm ${isActive("/ai-chat") ? "" : "bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 border-purple-200"}`}
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    Chat IA
                  </Button>
                </Link>
                <Link to="/ai-config">
                  <Button 
                    variant={isActive("/ai-config") ? "default" : "ghost"}
                    className={`text-sm ${isActive("/ai-config") ? "" : "hover:bg-purple-50 text-purple-600"}`}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Config IA
                  </Button>
                </Link>
                
                {/* User Menu */}
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{user.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="text-sm">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant={isActive("/dashboard") ? "default" : "ghost"} 
                      className="w-full justify-start text-sm"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/workout-register" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant={isActive("/workout-register") ? "default" : "ghost"} 
                      className="w-full justify-start text-sm"
                    >
                      Registrar Treino
                    </Button>
                  </Link>
                  <Link to="/workout-history" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant={isActive("/workout-history") ? "default" : "ghost"} 
                      className="w-full justify-start text-sm"
                    >
                      Histórico
                    </Button>
                  </Link>
                  <Link to="/exercises" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant={isActive("/exercises") ? "default" : "ghost"} 
                      className="w-full justify-start text-sm"
                    >
                      Exercícios
                    </Button>
                  </Link>
                  <Link to="/ai-chat" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant={isActive("/ai-chat") ? "default" : "ghost"} 
                      className="w-full justify-start text-sm bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Chat IA
                    </Button>
                  </Link>
                  <Link to="/ai-config" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant={isActive("/ai-config") ? "default" : "ghost"} 
                      className="w-full justify-start text-sm hover:bg-purple-50 text-purple-600"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações IA
                    </Button>
                  </Link>
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center space-x-2 px-3 py-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">{user.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-start text-sm">
                      Cadastrar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
