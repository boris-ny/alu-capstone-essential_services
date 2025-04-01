// src/profile.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Header } from '@/components/header';
import { useAuth } from '@/contexts/useAuth';
import LocationPicker from '@/components/LocationPicker';
import {
  Building,
  Phone,
  AtSign,
  Globe,
  FileText,
  MapPin,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Edit,
  Info,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from './services/api';
import ProfileField from './components/profileField';
import { Business, Category } from './lib/types';
import FeedbackSection from './components/feedback';

// Create schema for business profile update
const profileSchema = z.object({
  businessName: z
    .string()
    .min(3, { message: 'Business Name must be at least 3 characters' }),
  description: z.string().optional(),
  categoryId: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: 'Please select a category',
  }),
  contactNumber: z
    .string()
    .min(8, { message: 'Contact Number must be at least 8 digits' }),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  website: z.string().url({ message: 'Invalid URL' }).optional(),
  openingHours: z.string().optional(),
  closingHours: z.string().optional(),
});

// Type for business profile data
type ProfileFormData = z.infer<typeof profileSchema> & {
  latitude?: number;
  longitude?: number;
};

function BusinessProfile() {
  const { business } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Fetch business details and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get JWT token from localStorage
        const token = localStorage.getItem('token');
        if (!token || !business?.id) {
          throw new Error('Authentication required');
        }

        // Fetch business details
        const businessResponse = await api.get<Business>(
          `/businesses/${business.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch categories for dropdown
        const categoriesResponse = await api.get('/categories');

        const formattedData: ProfileFormData = {
          businessName: businessResponse.data.businessName,
          description: businessResponse.data.description || '',
          categoryId: String(businessResponse.data.categoryId), // Convert to string
          contactNumber: businessResponse.data.contactNumber,
          email: businessResponse.data.email || '',
          website: businessResponse.data.website || '',
          openingHours: businessResponse.data.openingHours || '',
          closingHours: businessResponse.data.closingHours || '',
          latitude: businessResponse.data.latitude,
          longitude: businessResponse.data.longitude,
        };

        setProfileData(formattedData);
        setCategories(categoriesResponse.data);

        // Set form default values
        reset(formattedData);

        // Set location if available
        if (businessResponse.data.latitude && businessResponse.data.longitude) {
          setLocation({
            lat: businessResponse.data.latitude,
            lng: businessResponse.data.longitude,
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setErrorMessage('Failed to load your business profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [business?.id, reset]);

  const handleLocationSelect = (newLocation: { lat: number; lng: number }) => {
    setLocation(newLocation);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token || !business?.id) {
        throw new Error('Authentication required');
      }

      const response = await api.put(
        `/businesses/${business.id}`,
        {
          ...data,
          categoryId: parseInt(data.categoryId),
          latitude: location?.lat,
          longitude: location?.lng,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfileData(response.data);
      setSuccessMessage('Business profile updated successfully!');
      setIsEditing(false);

      // Show success message for 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(
        'Failed to update your business profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    // Reset form with current data when toggling edit mode
    if (!isEditing && profileData) {
      reset({
        businessName: profileData.businessName,
        description: profileData.description || '',
        categoryId: String(profileData.categoryId),
        contactNumber: profileData.contactNumber,
        email: profileData.email || '',
        website: profileData.website || '',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">
              Loading your business profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-6 py-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Business Profile
                </h2>
                <p className="text-indigo-200">
                  Manage your business information
                </p>
              </div>

              <button
                onClick={toggleEditMode}
                className={cn(
                  'mt-4 md:mt-0 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors',
                  isEditing
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'bg-white text-indigo-700 hover:bg-indigo-50'
                )}>
                <Edit size={18} />
                <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mx-6 mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <ProfileField
                label="Business Name"
                icon={<Building className="h-5 w-5 text-gray-400" />}
                error={errors.businessName?.message}
                readOnly={!isEditing}>
                <input
                  type="text"
                  placeholder="Your business name"
                  {...register('businessName')}
                  disabled={!isEditing}
                  className={inputClasses(!isEditing, !!errors.businessName)}
                />
              </ProfileField>

              {/* Category */}
              <ProfileField
                label="Business Category"
                icon={<Building className="h-5 w-5 text-gray-400" />}
                error={errors.categoryId?.message}
                readOnly={!isEditing}>
                <select
                  {...register('categoryId')}
                  disabled={!isEditing}
                  className={inputClasses(!isEditing, !!errors.categoryId)}>
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {!isEditing && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </ProfileField>

              {/* Contact Number */}
              <ProfileField
                label="Contact Number"
                icon={<Phone className="h-5 w-5 text-gray-400" />}
                error={errors.contactNumber?.message}
                readOnly={!isEditing}>
                <input
                  type="tel"
                  placeholder="Your contact number"
                  {...register('contactNumber')}
                  disabled={!isEditing}
                  className={inputClasses(!isEditing, !!errors.contactNumber)}
                />
              </ProfileField>

              {/* Email */}
              <ProfileField
                label="Email Address"
                icon={<AtSign className="h-5 w-5 text-gray-400" />}
                error={errors.email?.message}
                optional={true}
                readOnly={!isEditing}>
                <input
                  type="email"
                  placeholder="Your email address (optional)"
                  {...register('email')}
                  disabled={!isEditing}
                  className={inputClasses(!isEditing, !!errors.email)}
                />
              </ProfileField>

              {/* Website */}
              <ProfileField
                label="Website"
                icon={<Globe className="h-5 w-5 text-gray-400" />}
                error={errors.website?.message}
                optional={true}
                readOnly={!isEditing}>
                <input
                  type="url"
                  placeholder="Your website URL (optional)"
                  {...register('website')}
                  disabled={!isEditing}
                  className={inputClasses(!isEditing, !!errors.website)}
                />
              </ProfileField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opening Hours */}
              <ProfileField
                label="Opening Hours"
                icon={<Clock className="h-5 w-5 text-gray-400" />}
                error={errors.openingHours?.message}
                optional={true}
                readOnly={!isEditing}>
                <input
                  type="text"
                  placeholder="e.g., 9:00 AM"
                  {...register('openingHours')}
                  disabled={!isEditing}
                  className={inputClasses(!isEditing, !!errors.openingHours)}
                />
              </ProfileField>

              {/* Closing Hours */}
              <ProfileField
                label="Closing Hours"
                icon={<Clock className="h-5 w-5 text-gray-400" />}
                error={errors.closingHours?.message}
                optional={true}
                readOnly={!isEditing}>
                <input
                  type="text"
                  placeholder="e.g., 5:00 PM"
                  {...register('closingHours')}
                  disabled={!isEditing}
                  className={inputClasses(!isEditing, !!errors.closingHours)}
                />
              </ProfileField>
            </div>
            {/* Description - Full width */}
            <div className="mt-6">
              <ProfileField
                label="Business Description"
                icon={<FileText className="h-5 w-5 text-gray-400" />}
                error={errors.description?.message}
                optional={true}
                readOnly={!isEditing}>
                <textarea
                  placeholder="Describe your business and services..."
                  {...register('description')}
                  disabled={!isEditing}
                  rows={4}
                  className={cn(
                    inputClasses(!isEditing, !!errors.description),
                    'resize-none'
                  )}
                />
              </ProfileField>
            </div>

            {/* Location */}
            <div className="mt-6 space-y-2">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Business Location
                  </label>
                  <p className="text-sm text-gray-500">
                    {isEditing
                      ? 'Click on the map to update your business location'
                      : 'Your business location on the map'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                <LocationPicker
                  initialLocation={location || undefined}
                  isEditable={isEditing}
                  onLocationSelect={handleLocationSelect}
                  variant="small"
                  className="shadow-sm rounded-md overflow-hidden w-full h-[300px]"
                />
              </div>

              {isEditing && (
                <div className="flex items-center text-sm">
                  <Info className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-gray-600">
                    {location
                      ? 'Location updated'
                      : 'Click on the map to set your location'}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button - Only show when editing */}
            {isEditing && (
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg text-white transition-colors',
                    isSubmitting
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  )}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Feedback Section */}
      {!isLoading && business?.id && (
        <div className="container max-w-4xl mx-auto px-4 mt-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-6 py-4 text-white">
              <h3 className="text-xl font-bold">Customer Feedback</h3>
              <p className="text-indigo-200 text-sm">
                Review customer feedback for your business
              </p>
            </div>
            <div className="p-6">
              <FeedbackSection
                hideReviewButton={true}
                businessId={business.id.toString()}
                businessType="LOCAL_BUSINESS"
                googleReviews={[]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for input classes
function inputClasses(readOnly: boolean, hasError: boolean) {
  return cn(
    'pl-10 pr-4 py-3 border rounded-lg w-full',
    readOnly
      ? 'bg-gray-100 text-gray-700'
      : 'bg-gray-50 focus:outline-none focus:ring-2',
    hasError
      ? 'border-red-300 focus:ring-red-200'
      : readOnly
        ? 'border-gray-300'
        : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
  );
}

// ChevronDown icon component
function ChevronDown({
  className,
  ...props
}: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      {...props}>
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default BusinessProfile;
