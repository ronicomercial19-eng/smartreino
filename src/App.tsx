
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import WorkoutModels from "@/pages/WorkoutModels";
import WorkoutModelsDatabase from "@/pages/WorkoutModelsDatabase";
import PeriodizationUpload from "@/pages/PeriodizationUpload";
import ExerciseLibrary from "@/pages/ExerciseLibrary";
import AIChat from "@/pages/AIChat";
import AIConfig from "@/pages/AIConfig";
import AdminStudentManagement from "@/pages/AdminStudentManagement";
import StudentInterface from "@/pages/StudentInterface";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            } 
          />
          <Route 
            path="/workout-models" 
            element={
              <AppLayout>
                <WorkoutModels />
              </AppLayout>
            } 
          />
          <Route 
            path="/workout-models-database" 
            element={
              <AppLayout>
                <WorkoutModelsDatabase />
              </AppLayout>
            } 
          />
          <Route 
            path="/periodization-upload" 
            element={
              <AppLayout>
                <PeriodizationUpload />
              </AppLayout>
            } 
          />
          <Route 
            path="/exercises" 
            element={
              <AppLayout>
                <ExerciseLibrary />
              </AppLayout>
            } 
          />
          <Route 
            path="/ai-chat" 
            element={
              <AppLayout>
                <AIChat />
              </AppLayout>
            } 
          />
          <Route 
            path="/ai-config" 
            element={
              <AppLayout>
                <AIConfig />
              </AppLayout>
            } 
          />
          <Route 
            path="/admin-students" 
            element={
              <AppLayout>
                <AdminStudentManagement />
              </AppLayout>
            } 
          />
          <Route 
            path="/student-interface" 
            element={
              <AppLayout>
                <StudentInterface />
              </AppLayout>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
