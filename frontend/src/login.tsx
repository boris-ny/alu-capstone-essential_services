import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      const response = await axios.post('http://localhost:3000/login', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/');
      }
    } catch (error: unknown) {
      console.error(error);
      alert('Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6">Business Login</h2>
        <form
          onSubmit={handleSubmit(handleLogin)}
          className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Business Name"
            {...register('businessName')}
            className="border p-2 rounded"
          />
          {errors.businessName && (
            <p className="text-red-500">{errors.businessName.message}</p>
          )}

          <input
            type="password"
            placeholder="Password"
            {...register('password')}
            className="border p-2 rounded"
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded font-medium hover:bg-blue-600 transition-colors">
            Login
          </button>

          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-500 hover:underline">
              Register here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
