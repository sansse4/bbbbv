import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isDataLoaded, hasAccess, getDefaultRoute } = useAuth();
  const location = useLocation();

  // Show loading while auth state is being determined OR while user data is being fetched
  if (loading || (user && !isDataLoaded)) {
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
    // Redirect to appropriate dashboard instead of showing error
    return <Navigate to={getDefaultRoute()} replace />;
  }

  return <>{children}</>;
}