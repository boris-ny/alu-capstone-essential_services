import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useEffect, useState } from 'react';
import LocationPicker from '@/components/LocationPicker';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from './lib/utils';
import { Header } from './components/header';
import {
  Building,
  MapPin,
  AtSign,
  Phone,
  Globe,
  Lock,
  FileText,
  Loader2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
} from 'lucide-react';
import api from './services/api';

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
  openingHours: z.string().optional(),
  closingHours: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

interface Category {
  id: number;
  name: string;
}

function Register() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    resolver: zodResolver(createBusinessSchema),
  });

  const handleLocationSelect = (newLocation: { lat: number; lng: number }) => {
    setLocation(newLocation);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await api.get('/categories');
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

  const nextStep = async () => {
    // To this (using type assertion):
    const fieldsToValidate = (
      currentStep === 1
        ? ['businessName', 'password', 'categoryId']
        : currentStep === 2
          ? ['contactNumber', 'email', 'website']
          : ['description']
    ) as Array<keyof BusinessFormData>;

    const result = await trigger(fieldsToValidate);
    if (result) {
      setFormData({ ...formData, ...getValues() });
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  interface BusinessFormData {
    businessName: string;
    password: string;
    description?: string;
    categoryId: string;
    contactNumber: string;
    email?: string;
    website?: string;
    latitude?: number;
    longitude?: number;
  }

  interface BusinessResponse {
    id: number;
    businessName: string;
    categoryId: number;
    description?: string;
    contactNumber: string;
    email?: string;
    website?: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    updatedAt: string;
  }

  const handleSubmitForm = async (data: BusinessFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      const response = await api.post<BusinessResponse>('/businesses', {
        ...data,
        categoryId: parseInt(data.categoryId),
        latitude: location?.lat,
        longitude: location?.lng,
      });
      console.log('Created business:', response.data);
      alert('Business created successfully!');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('Error creating business');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrationSubmit = async () => {
    // Make sure we have location data
    if (!location) {
      alert('Please select a location on the map');
      return;
    }

    // Validate the final step fields
    const isValid = await trigger(['description']);
    if (!isValid) return;

    // Get all form data
    const formData = getValues();

    // Now manually handle submission
    setIsSubmitting(true);
    try {
      const response = await api.post('/businesses', {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        latitude: location.lat,
        longitude: location.lng,
      });
      console.log('Created business:', response.data);
      alert('Business created successfully!');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('Error creating business');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Progress Header */}
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-6 py-6 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Register Your Business
            </h2>
            <p className="text-indigo-200">
              Join our network of essential services in Kigali
            </p>

            {/* Progress Indicator */}
            <div className="mt-6 flex items-center">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={cn(
                      'rounded-full h-8 w-8 flex items-center justify-center font-medium transition-colors',
                      index + 1 === currentStep
                        ? 'bg-white text-indigo-700'
                        : index + 1 < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-indigo-600/50 text-indigo-200'
                    )}>
                    {index + 1 < currentStep ? <Check size={16} /> : index + 1}
                  </div>
                  {index < totalSteps - 1 && (
                    <div
                      className={cn(
                        'h-1 w-10 md:w-16',
                        index + 1 < currentStep
                          ? 'bg-green-500'
                          : 'bg-indigo-600/50'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Title */}
            <div className="mt-4 text-center md:text-left">
              <h3 className="font-medium">
                {currentStep === 1 && 'Basic Information'}
                {currentStep === 2 && 'Contact Information'}
                {currentStep === 3 && 'Business Details & Location'}
              </h3>
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit(handleSubmitForm)}
            className="p-6 md:p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <FormField
                  label="Business Name"
                  error={errors.businessName?.message}
                  icon={<Building className="h-5 w-5 text-gray-400" />}>
                  <input
                    type="text"
                    placeholder="Enter your business name"
                    {...register('businessName')}
                    className={cn(
                      'pl-10 pr-4 py-3 bg-gray-50 border rounded-lg w-full focus:outline-none focus:ring-2',
                      errors.businessName
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
                    )}
                  />
                </FormField>

                <FormField
                  label="Password"
                  error={errors.password?.message}
                  icon={<Lock className="h-5 w-5 text-gray-400" />}>
                  <input
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    {...register('password')}
                    className={cn(
                      'pl-10 pr-4 py-3 bg-gray-50 border rounded-lg w-full focus:outline-none focus:ring-2',
                      errors.password
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
                    )}
                  />
                </FormField>

                <FormField
                  label="Business Category"
                  error={errors.categoryId?.message || categoriesError}
                  icon={<Building className="h-5 w-5 text-gray-400" />}>
                  <select
                    {...register('categoryId')}
                    className={cn(
                      'pl-10 pr-4 py-3 bg-gray-50 border rounded-lg w-full focus:outline-none focus:ring-2 appearance-none',
                      categoriesLoading ? 'bg-gray-100 text-gray-500' : '',
                      errors.categoryId || categoriesError
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </FormField>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <FormField
                  label="Contact Number"
                  error={errors.contactNumber?.message}
                  icon={<Phone className="h-5 w-5 text-gray-400" />}>
                  <input
                    type="tel"
                    placeholder="e.g., +250 78 123 4567"
                    {...register('contactNumber')}
                    className={cn(
                      'pl-10 pr-4 py-3 bg-gray-50 border rounded-lg w-full focus:outline-none focus:ring-2',
                      errors.contactNumber
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
                    )}
                  />
                </FormField>

                <FormField
                  label="Email Address"
                  error={errors.email?.message}
                  icon={<AtSign className="h-5 w-5 text-gray-400" />}
                  optional={true}>
                  <input
                    type="email"
                    placeholder="your@email.com (optional)"
                    {...register('email')}
                    className={cn(
                      'pl-10 pr-4 py-3 bg-gray-50 border rounded-lg w-full focus:outline-none focus:ring-2',
                      errors.email
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
                    )}
                  />
                </FormField>

                <FormField
                  label="Website"
                  error={errors.website?.message}
                  icon={<Globe className="h-5 w-5 text-gray-400" />}
                  optional={true}>
                  <input
                    type="url"
                    placeholder="https://example.com (optional)"
                    {...register('website')}
                    className={cn(
                      'pl-10 pr-4 py-3 bg-gray-50 border rounded-lg w-full focus:outline-none focus:ring-2',
                      errors.website
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
                    )}
                  />
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Opening Hours"
                    error={errors.openingHours?.message}
                    icon={<Clock className="h-5 w-5 text-gray-400" />}
                    optional={true}>
                    <input
                      type="text"
                      placeholder="e.g., 9:00 AM"
                      {...register('openingHours')}
                      className={cn(
                        'pl-10 pr-4 py-3 bg-gray-50 border rounded-lg w-full focus:outline-none focus:ring-2',
                        errors.openingHours
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Closing Hours"
                    error={errors.closingHours?.message}
                    icon={<Clock className="h-5 w-5 text-gray-400" />}
                    optional={true}>
                    <input
                      type="text"
                      placeholder="e.g., 5:00 PM"
                      {...register('closingHours')}
                      className={cn(
                        'pl-10 pr-4 py-3 bg-gray-50 border rounded-lg w-full focus:outline-none focus:ring-2',
                        errors.closingHours
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
                      )}
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* Step 3: Description & Location */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <FormField
                  label="Business Description"
                  error={errors.description?.message}
                  icon={<FileText className="h-5 w-5 text-gray-400" />}>
                  <textarea
                    placeholder="Describe your business and the services you offer..."
                    {...register('description')}
                    rows={4}
                    className={cn(
                      'pl-10 pr-4 py-3 bg-gray-50 border rounded-lg w-full focus:outline-none focus:ring-2 resize-none',
                      errors.description
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
                    )}
                  />
                </FormField>

                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Business Location
                      </label>
                      <p className="text-sm text-gray-500">
                        Click on the map to set your business location
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <LocationPicker
                      isEditable={true}
                      onLocationSelect={handleLocationSelect}
                      variant={window.innerWidth < 768 ? 'small' : 'default'}
                      className="shadow-sm rounded-md overflow-hidden w-full"
                    />
                  </div>

                  <div className="flex items-center text-sm">
                    <Info className="h-4 w-4 text-amber-500 mr-1" />
                    <span
                      className={
                        location ? 'text-gray-600' : 'text-red-500 font-medium'
                      }>
                      {location
                        ? 'Location selected'
                        : 'Please select a location (required)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Navigation */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  <span>Previous</span>
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className={cn(
                    'w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg text-white transition-colors',
                    'bg-indigo-600 hover:bg-indigo-700',
                    currentStep === 1 && 'sm:ml-auto'
                  )}>
                  <span>Next</span>
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  type="button" // Changed from type="submit" to type="button"
                  disabled={isSubmitting || !location} // Disable if no location selected
                  onClick={handleRegistrationSubmit} // New handler function
                  className={cn(
                    'w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg text-white transition-colors',
                    isSubmitting || !location
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700',
                    'sm:ml-auto'
                  )}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <span>Register Business</span>
                      <Check className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-600 hover:underline font-medium">
                Login here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Form Field Component
const FormField = ({
  label,
  error,
  icon,
  children,
  optional = false,
}: {
  label: string;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  optional?: boolean;
}) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {optional && <span className="text-xs text-gray-500">Optional</span>}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        {children}
      </div>

      {error && (
        <div className="flex items-center text-sm text-red-500 mt-1">
          <X className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// ChevronDown component with className support
const ChevronDown = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={cn(className)}
    {...props}>
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

export default Register;
