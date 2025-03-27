import { useMutation } from '@tanstack/react-query';
import { login, register } from '@/services/authService';
import { jwtDecode } from 'jwt-decode';
import { useAuth as useAuthContext } from '@/contexts/useAuth';
import { useNavigate } from 'react-router-dom';

export function useLogin() {
  const { updateAuthState } = useAuthContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Store token
      const token = data.token;
      localStorage.setItem('token', token);

      // Update auth context
      try {
        const decoded = jwtDecode<{ id: number; name: string }>(token);
        updateAuthState(decoded.id, decoded.name);
        navigate('/');
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  });
}

// Register hook
export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate('/login');
    }
  });
}