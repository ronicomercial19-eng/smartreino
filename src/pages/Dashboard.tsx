
import { DashboardShortcuts } from "@/components/DashboardShortcuts";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-heading gradient-text">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de periodização e treinos.
        </p>
      </div>
      
      <DashboardShortcuts />
    </div>
  );
}
