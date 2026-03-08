import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  /** At least one of these roles is required */
  allowedRoles: string[];
  userRole: string | null;
  defaultRoute: string;
  loading?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  userRole,
  defaultRoute,
  loading,
}: ProtectedRouteProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    );
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
}
