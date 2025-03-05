import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { ReactElement } from 'react';

export // Create a ProtectedRoute component
const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
