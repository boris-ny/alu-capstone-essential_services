import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useEffect, useState } from 'react';
import LocationPicker from '@/components/LocationPicker';
import { useNavigate } from 'react-router-dom';
import { cn } from './lib/utils';

interface Category {
  id: number;
  name: string;
}

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
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

function Register() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const navigate = useNavigate();
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createBusinessSchema),
  });

  const handleLocationSelect = (newLocation: { lat: number; lng: number }) => {
    setLocation(newLocation);
  };
  // Add useEffect to fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/categories');
        setCategories(response.data);
        setCategoriesError('');
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesError('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);
  const handleCreateBusiness = async (
    data: z.infer<typeof createBusinessSchema>
  ) => {
    try {
      const response = await axios.post('http://localhost:3000/businesses', {
        ...data,
        categoryId: parseInt(data.categoryId),
        latitude: location?.lat,
        longitude: location?.lng,
      });
      console.log('Created business:', response.data);
      alert('Business created successfully!');
      navigate('/login');
    } catch (error: unknown) {
      console.error(error);
      alert('Error creating business');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <h2 className="text-3xl font-bold mb-6">Register Business</h2>
        <form
          onSubmit={handleSubmit(handleCreateBusiness)}
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

          <textarea
            placeholder="Business Description"
            {...register('description')}
            className="border p-2 rounded h-24 resize-none"
          />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}

          <select
            {...register('categoryId')}
            className={cn(
              'border p-2 rounded w-full',
              categoriesLoading && 'bg-gray-100',
              categoriesError && 'border-red-500'
            )}
            defaultValue=""
            disabled={categoriesLoading}>
            <option value="" disabled>
              {categoriesLoading
                ? 'Loading categories...'
                : categoriesError
                  ? 'Failed to load categories'
                  : 'Select Category'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
          {categoriesError && (
            <p className="text-red-500 text-sm">{categoriesError}</p>
          )}
          {errors.categoryId && (
            <p className="text-red-500">{errors.categoryId.message}</p>
          )}

          <input
            type="tel"
            placeholder="Contact Number"
            {...register('contactNumber')}
            className="border p-2 rounded"
          />
          {errors.contactNumber && (
            <p className="text-red-500">{errors.contactNumber.message}</p>
          )}

          <input
            type="email"
            placeholder="Email (optional)"
            {...register('email')}
            className="border p-2 rounded"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}

          <input
            type="url"
            placeholder="Website (optional)"
            {...register('website')}
            className="border p-2 rounded"
          />
          {errors.website && (
            <p className="text-red-500">{errors.website.message}</p>
          )}

          <div className="mt-4 w-full">
            <label className="block text-sm font-medium text-gray-700">
              Business Location
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Click on the map to set your business location
            </p>
            <div className="w-full flex justify-center">
              <LocationPicker
                isEditable={true}
                onLocationSelect={handleLocationSelect}
                variant="large"
                className="shadow-lg w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-green-500 text-white p-3 rounded font-medium hover:bg-green-600 transition-colors">
            Register Business
          </button>

          <p className="text-center text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-500 hover:underline">
              Login here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
