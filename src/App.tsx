
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import WorkoutModels from "@/pages/WorkoutModels";
import PeriodizationUpload from "@/pages/PeriodizationUpload";
import ExerciseLibrary from "@/pages/ExerciseLibrary";
import AIChat from "@/pages/AIChat";
import AIConfig from "@/pages/AIConfig";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout-models" element={<WorkoutModels />} />
          <Route path="/periodization-upload" element={<PeriodizationUpload />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/ai-config" element={<AIConfig />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
