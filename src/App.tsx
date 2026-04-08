import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthReady } from "@/hooks/useAuthReady";
import { useUserRole } from "@/hooks/useUserRole";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
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
import SmartTreinoBuilder from "./pages/SmartTreinoBuilder";
import ProtocolCatalog from "./pages/ProtocolCatalog";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isReady } = useAuthReady();
  const { role, loading: roleLoading, defaultRoute, isProfessor, isAdmin } = useUserRole(user?.id);

  // Wait for both auth session and role to load
  if (!isReady || (user && roleLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20 animate-pulse">
            <span className="text-white text-2xl font-bold">9</span>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → public routes only
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated → role-based routes
  const professorOrAdmin = ['admin', 'professor'];
  const allRoles = ['admin', 'professor', 'user', 'student'];

  return (
    <Routes>
      {/* Redirect auth pages to default route */}
      <Route path="/login" element={<Navigate to={defaultRoute} replace />} />
      <Route path="/register" element={<Navigate to={defaultRoute} replace />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />

      {/* Professor & Admin routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/gerenciamento-alunos" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <GerenciamentoAlunos />
        </ProtectedRoute>
      } />
      <Route path="/aluno/:id" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <AlunoDetalhes />
        </ProtectedRoute>
      } />
      <Route path="/workout-models" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <WorkoutModels />
        </ProtectedRoute>
      } />
      <Route path="/workout-modalities" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <WorkoutModalities />
        </ProtectedRoute>
      } />
      <Route path="/workout-models-database" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <WorkoutModelsDatabase />
        </ProtectedRoute>
      } />
      <Route path="/generate-workout" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <GenerateWorkout />
        </ProtectedRoute>
      } />
      <Route path="/smart-treino-builder" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <SmartTreinoBuilder />
        </ProtectedRoute>
      } />
      <Route path="/periodization-upload" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <PeriodizationUpload />
        </ProtectedRoute>
      } />
      <Route path="/student-analytics/:id?" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <StudentAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/advanced-statistics/:id?" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <AdvancedStatistics />
        </ProtectedRoute>
      } />
      <Route path="/exercise-management" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <ExerciseManagement />
        </ProtectedRoute>
      } />
      <Route path="/protocol-catalog" element={
        <ProtectedRoute allowedRoles={professorOrAdmin} userRole={role} defaultRoute={defaultRoute}>
          <ProtocolCatalog />
        </ProtectedRoute>
      } />

      {/* Admin-only routes */}
      <Route path="/ai-config" element={
        <ProtectedRoute allowedRoles={['admin']} userRole={role} defaultRoute={defaultRoute}>
          <AIConfig />
        </ProtectedRoute>
      } />

      {/* Routes accessible to all authenticated users */}
      <Route path="/exercise-library" element={<ExerciseLibrary />} />
      <Route path="/exercises" element={<Navigate to="/exercise-library" replace />} />
      <Route path="/exercicios" element={<Navigate to="/exercise-library" replace />} />
      <Route path="/workout-history" element={<WorkoutHistory />} />
      <Route path="/ai-chat" element={<AIChat />} />
      <Route path="/recommended-workout" element={<RecommendedWorkout />} />
      <Route path="/workout-register" element={<WorkoutRegister />} />
      <Route path="/workout-details/:id" element={<WorkoutDetails />} />
      <Route path="/workout-plan/:id" element={<WorkoutPlan />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/perfil" element={<Navigate to="/profile" replace />} />
      <Route path="/meus-treinos" element={<MeusTreinos />} />
      <Route path="/settings" element={<UserSettings />} />
      <Route path="/analytics" element={<AdvancedAnalytics />} />
      <Route path="/roadmap" element={<RoadmapView />} />
      <Route path="/periodizacao/upload" element={<Navigate to="/periodization-upload" replace />} />
      <Route path="/admin-students" element={<Navigate to="/gerenciamento-alunos" replace />} />

      {/* Student interface */}
      <Route path="/student-interface" element={<StudentInterface />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
