
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600">10X Training</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/dashboard") 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/workout-register" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/workout-register") 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Registrar Treino
            </Link>
            <Link 
              to="/exercises" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/exercises") 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Exercícios
            </Link>
            <Link 
              to="/workout-history" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/workout-history") 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Histórico
            </Link>
            <Link 
              to="/ai-chat" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/ai-chat") 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Chat IA
            </Link>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Sair
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
