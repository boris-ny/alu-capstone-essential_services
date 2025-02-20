import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

// Define Zod schema for Register Business form
const createBusinessSchema = z.object({
  businessName: z
    .string()
    .min(3, { message: 'Business Name must be at least 3 characters' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  description: z.string().optional(),
  categoryId: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: 'Category ID must be a number',
  }),
  contactNumber: z
    .string()
    .min(8, { message: 'Contact Number must be at least 8 digits' }),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  website: z.string().url({ message: 'Invalid URL' }).optional(),
});

// Define Zod schema for Login form
const loginSchema = z.object({
  businessName: z
    .string()
    .min(3, { message: 'Business Name must be at least 3 characters' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

function Login() {
  // Register Business Form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors },
  } = useForm({
    resolver: zodResolver(createBusinessSchema),
  });

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const handleCreateBusiness = async (
    data: z.infer<typeof createBusinessSchema>
  ) => {
    try {
      const response = await axios.post('http://localhost:3000/businesses', {
        ...data,
        categoryId: parseInt(data.categoryId),
      });
      console.log('Created business:', response.data);
      alert('Business created successfully!');
    } catch (error: unknown) {
      console.error(error);
      alert('Error creating business');
    }
  };

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      const response = await axios.post('http://localhost:3000/login', data);
      if (response.data.token) {
        console.log('Logged in token:', response.data.token);
        alert('Login successful!');
      } else {
        alert('Invalid credentials');
      }
    } catch (error: unknown) {
      console.error(error);
      alert('Login error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Register Business Form */}
      <div className="mt-8">
        <h2 className="text-2xl mb-4">Register Business</h2>
        <form
          onSubmit={handleSubmitCreate(handleCreateBusiness)}
          className="flex flex-col space-y-2">
          <input
            type="text"
            placeholder="Business Name"
            {...registerCreate('businessName')}
            className="border p-2"
          />
          {createErrors.businessName && (
            <p className="text-red-500">{createErrors.businessName.message}</p>
          )}

          <input
            type="password"
            placeholder="Password"
            {...registerCreate('password')}
            className="border p-2"
          />
          {createErrors.password && (
            <p className="text-red-500">{createErrors.password.message}</p>
          )}

          <input
            type="text"
            placeholder="Description"
            {...registerCreate('description')}
            className="border p-2"
          />
          {createErrors.description && (
            <p className="text-red-500">{createErrors.description.message}</p>
          )}

          <input
            type="text"
            placeholder="Category ID"
            {...registerCreate('categoryId')}
            className="border p-2"
          />
          {createErrors.categoryId && (
            <p className="text-red-500">{createErrors.categoryId.message}</p>
          )}

          <input
            type="text"
            placeholder="Contact Number"
            {...registerCreate('contactNumber')}
            className="border p-2"
          />
          {createErrors.contactNumber && (
            <p className="text-red-500">{createErrors.contactNumber.message}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            {...registerCreate('email')}
            className="border p-2"
          />
          {createErrors.email && (
            <p className="text-red-500">{createErrors.email.message}</p>
          )}

          <input
            type="text"
            placeholder="Website"
            {...registerCreate('website')}
            className="border p-2"
          />
          {createErrors.website && (
            <p className="text-red-500">{createErrors.website.message}</p>
          )}

          <button type="submit" className="bg-green-500 text-white p-2 rounded">
            Register Business
          </button>
        </form>
      </div>

      {/* Login Form */}
      <div className="mt-12">
        <h2 className="text-2xl mb-4">Business Login</h2>
        <form
          onSubmit={handleSubmitLogin(handleLogin)}
          className="flex flex-col space-y-2">
          <input
            type="text"
            placeholder="Business Name"
            {...registerLogin('businessName')}
            className="border p-2"
          />
          {loginErrors.businessName && (
            <p className="text-red-500">{loginErrors.businessName.message}</p>
          )}

          <input
            type="password"
            placeholder="Password"
            {...registerLogin('password')}
            className="border p-2"
          />
          {loginErrors.password && (
            <p className="text-red-500">{loginErrors.password.message}</p>
          )}

          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
