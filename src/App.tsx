import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import WorkoutHistory from "./pages/WorkoutHistory";
import AIChat from "./pages/AIChat";
import WorkoutModels from "./pages/WorkoutModels";
import WorkoutModalities from "./pages/WorkoutModalities";
import WorkoutModelsDatabase from "./pages/WorkoutModelsDatabase";
import RecommendedWorkout from "./pages/RecommendedWorkout";
import WorkoutRegister from "./pages/WorkoutRegister";
import ExerciseManagement from "./pages/ExerciseManagement";
import AIConfig from "./pages/AIConfig";
import AdminStudentManagement from "./pages/AdminStudentManagement";
import GerenciamentoAlunos from "./pages/GerenciamentoAlunos";
import StudentInterface from "./pages/StudentInterface";
import PeriodizationUpload from "./pages/PeriodizationUpload";
import Profile from "./pages/Profile";
import MeusTreinos from "./pages/MeusTreinos";
import UserSettings from "./pages/UserSettings";
import AdvancedAnalytics from "./components/AdvancedAnalytics";
import NotFound from "./pages/NotFound";
import AlunoDetalhes from "./pages/AlunoDetalhes";
import RoadmapView from "./pages/RoadmapView";
import WorkoutDetails from "./pages/WorkoutDetails";
import GenerateWorkout from "./pages/GenerateWorkout";
import WorkoutPlan from "./pages/WorkoutPlan";
import StudentAnalytics from "./pages/StudentAnalytics";
import AdvancedStatistics from "./pages/AdvancedStatistics";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Get user type from metadata or set default
        const type = session.user.user_metadata?.user_type || 'admin';
        setUserType(type);
        // User authenticated on initial load
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const type = session.user.user_metadata?.user_type || 'admin';
        setUserType(type);
        // User signed in
      } else {
        setUserType(null);
        // User signed out
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {!user ? (
              // Public routes
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              // Protected routes
              <>
                <Route path="/login" element={<Navigate to={userType === 'student' ? "/student-interface" : "/gerenciamento-alunos"} replace />} />
                <Route path="/register" element={<Navigate to={userType === 'student' ? "/student-interface" : "/gerenciamento-alunos"} replace />} />
                
                {userType === 'student' ? (
                  // Student routes
                  <>
                    <Route path="/student-interface" element={<StudentInterface />} />
                    <Route path="/" element={<Navigate to="/student-interface" replace />} />
                    <Route path="*" element={<Navigate to="/student-interface" replace />} />
                  </>
                ) : (
                  // Admin/trainer routes
                  <>
                    <Route path="/" element={<Navigate to="/gerenciamento-alunos" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/exercise-library" element={<ExerciseLibrary />} />
                    <Route path="/exercises" element={<Navigate to="/exercise-library" replace />} />
                    <Route path="/exercicios" element={<Navigate to="/exercise-library" replace />} />
                    <Route path="/workout-history" element={<WorkoutHistory />} />
                    <Route path="/ai-chat" element={<AIChat />} />
                    <Route path="/workout-models" element={<WorkoutModels />} />
                    <Route path="/workout-modalities" element={<WorkoutModalities />} />
                    <Route path="/workout-models-database" element={<WorkoutModelsDatabase />} />
                    <Route path="/recommended-workout" element={<RecommendedWorkout />} />
                    <Route path="/workout-register" element={<WorkoutRegister />} />
                    <Route path="/exercise-management" element={<ExerciseManagement />} />
                    <Route path="/ai-config" element={<AIConfig />} />
                    <Route path="/admin-students" element={<AdminStudentManagement />} />
                    <Route path="/gerenciamento-alunos" element={<GerenciamentoAlunos />} />
                    <Route path="/aluno/:id" element={<AlunoDetalhes />} />
                    <Route path="/workout-details/:id" element={<WorkoutDetails />} />
                    <Route path="/periodization-upload" element={<PeriodizationUpload />} />
                    <Route path="/periodizacao/upload" element={<Navigate to="/periodization-upload" replace />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/perfil" element={<Navigate to="/profile" replace />} />
                    <Route path="/meus-treinos" element={<MeusTreinos />} />
                    <Route path="/settings" element={<UserSettings />} />
                    <Route path="/analytics" element={<AdvancedAnalytics />} />
                    <Route path="/roadmap" element={<RoadmapView />} />
                    <Route path="/generate-workout" element={<GenerateWorkout />} />
                    <Route path="/workout-plan/:id" element={<WorkoutPlan />} />
                    <Route path="/student-analytics/:id?" element={<StudentAnalytics />} />
                    <Route path="/advanced-statistics/:id?" element={<AdvancedStatistics />} />
                    <Route path="*" element={<NotFound />} />
                  </>
                )}
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
