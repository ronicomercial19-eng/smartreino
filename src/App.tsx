import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import WorkoutHistory from "./pages/WorkoutHistory";
import WorkoutRegister from "./pages/WorkoutRegister";
import WorkoutModels from "./pages/WorkoutModels";
import WorkoutModelsDatabase from "./pages/WorkoutModelsDatabase";
import PeriodizationUpload from "./pages/PeriodizationUpload";
import AIChat from "./pages/AIChat";
import AIConfig from "./pages/AIConfig";
import NotFound from "./pages/NotFound";
import AdminStudentManagement from "./pages/AdminStudentManagement";
import StudentInterface from "./pages/StudentInterface";
import WorkoutModalities from "./pages/WorkoutModalities";
import RecommendedWorkout from "./pages/RecommendedWorkout";
import ExerciseManagement from "./pages/ExerciseManagement";

const queryClient = new QueryClient();

function App() {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserType(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserType(session.user.id);
      } else {
        setUserType(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUserType = async (userId: string) => {
    try {
      // First try to get from user_profiles_extended
      const { data: profileData } = await supabase
        .from('user_profiles_extended')
        .select('user_type')
        .eq('user_id', userId)
        .single();

      if (profileData?.user_type) {
        setUserType(profileData.user_type);
        setLoading(false);
        return;
      }

      // If not found, check if user is a professor in students table
      const { data: studentData } = await supabase
        .from('students')
        .select('professor_id')
        .eq('professor_id', userId)
        .limit(1);

      if (studentData && studentData.length > 0) {
        setUserType('admin');
      } else {
        // Check if user is a student
        const { data: { user } } = await supabase.auth.getUser();
        const { data: isStudent } = await supabase
          .from('students')
          .select('id')
          .eq('email', user?.email)
          .single();

        setUserType(isStudent ? 'student' : 'admin');
      }
    } catch (error) {
      console.error('Error getting user type:', error);
      setUserType('admin'); // Default to admin
    } finally {
      setLoading(false);
    }
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  };

  const DashboardRedirect = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    // Redirect based on user type
    if (userType === 'student') {
      return <Navigate to="/student-interface" replace />;
    } else {
      return <Navigate to="/admin-students" replace />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes with layout */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            
            <Route
              path="/admin-students"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AdminStudentManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/student-interface"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <StudentInterface />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/modelos"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <WorkoutModalities />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/treino/recomendado"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <RecommendedWorkout />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/exercicios"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ExerciseManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Existing protected routes */}
            <Route
              path="/exercise-library"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ExerciseLibrary />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/workout-history"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <WorkoutHistory />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/workout-register"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <WorkoutRegister />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/workout-models"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <WorkoutModels />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/workout-models-database"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <WorkoutModelsDatabase />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/periodizacao/upload"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PeriodizationUpload />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat-ia"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AIChat />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/ai-config"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AIConfig />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
