import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading, rolesLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for BOTH auth and roles to finish loading
    if (!loading && !rolesLoading) {
      if (!isAuthenticated) {
        navigate('/auth');
      } else if (requireAdmin && !isAdmin) {
        navigate('/');
      }
    }
  }, [isAuthenticated, isAdmin, loading, rolesLoading, requireAdmin, navigate]);

  // Show loading while auth OR roles are loading
  if (loading || (requireAdmin && rolesLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
