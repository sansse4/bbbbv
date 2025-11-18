import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, hasAccess } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAccess(location.pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-xl text-muted-foreground mb-6">
            You don't have permission to access this section.
          </p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}