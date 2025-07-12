
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WorkoutRegister from "./pages/WorkoutRegister";
import WorkoutHistory from "./pages/WorkoutHistory";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import AIChat from "./pages/AIChat";
import AIConfig from "./pages/AIConfig";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout-register" element={<WorkoutRegister />} />
          <Route path="/workout-history" element={<WorkoutHistory />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/ai-config" element={<AIConfig />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
