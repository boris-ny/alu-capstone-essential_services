import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from './components/header';
import { cn } from './lib/utils';
import {
  Building,
  Lock,
  Loader2,
  AlertCircle,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import api from './services/api';
import { useAuth } from './contexts/useAuth';
import { jwtDecode } from 'jwt-decode';

const loginSchema = z.object({
  businessName: z
    .string()
    .min(3, { message: 'Business Name must be at least 3 characters' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { updateAuthState } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const response = await api.post('/businesses/login', data);
      if (response.data.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);

        // IMPORTANT: Update auth state before navigation
        try {
          const decoded = jwtDecode<{ id: number; name: string }>(token);
          updateAuthState(decoded.id, decoded.name);
        } catch (decodeError) {
          console.error('Failed to decode token:', decodeError);
        }

        // Now navigate after auth state has been updated
        navigate('/');
      }
    } catch (error: unknown) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setLoginError('Invalid business name or password');
      } else {
        setLoginError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-6 py-8 text-white text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome Back
              </h2>
              <p className="text-indigo-200">Sign in to manage your business</p>
            </div>

            {/* Form Section */}
            <div className="p-6 md:p-8">
              {/* Error Alert */}
              {loginError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                {/* Business Name Field */}
                <div className="space-y-1">
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-gray-700">
                    Business Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="businessName"
                      type="text"
                      placeholder="Enter your business name"
                      {...register('businessName')}
                      disabled={isLoading}
                      className={cn(
                        'pl-10 pr-4 py-3 bg-gray-50 border rounded-lg w-full focus:outline-none focus:ring-2 transition-colors',
                        errors.businessName
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
                      )}
                    />
                  </div>
                  {errors.businessName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.businessName.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-sm text-indigo-600 hover:text-indigo-800">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      {...register('password')}
                      disabled={isLoading}
                      className={cn(
                        'pl-10 pr-4 py-3 bg-gray-50 border rounded-lg w-full focus:outline-none focus:ring-2 transition-colors',
                        errors.password
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
                      )}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium transition-all',
                    isLoading
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'hover:bg-indigo-700 transform hover:scale-[1.02]'
                  )}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>

                {/* Registration Link */}
                <div className="pt-4 text-center">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-indigo-600 hover:text-indigo-800 font-medium group">
                      Register your business
                      <ArrowRight className="inline-block ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-gray-500 text-sm mt-8">
            Need assistance? Contact support at{' '}
            <a
              href="mailto:support@essentialservices.com"
              className="text-indigo-600 hover:underline">
              support@essentialservices.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
