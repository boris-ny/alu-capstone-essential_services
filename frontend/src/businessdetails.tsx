import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import LocationPicker from './components/LocationPicker';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Calendar,
  Share2,
  Smartphone,
  ArrowLeft,
  Building,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import api from '@/services/api';
import FeedbackSection from './components/feedback';
import { Business } from './lib/types';

const BusinessDetails = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('about');

  const getMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleShare = async () => {
    if (navigator.share && business) {
      try {
        await navigator.share({
          title: business.businessName,
          text: `Check out ${business.businessName} on Essential Services!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        console.log('Fetching business with ID:', id);
        // Check if this is a Google Place ID
        if (id?.startsWith('place_')) {
          const placeId = id.replace('place_', '');
          console.log('Fetching place with ID:', placeId);
          const response = await api.get(`/places/${placeId}`);
          console.log('Place API response:', response.data);
          setBusiness(response.data);
        } else if (id) {
          console.log('Fetching business with ID:', id);
          const response = await api.get(`/businesses/${id}`);
          console.log('Business API response:', response.data);
          setBusiness(response.data);
        } else {
          setError('Invalid ID provided');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Error fetching business details:', error);
        if (error.response) {
          console.error('API error response:', error.response.data);
          console.error('API error status:', error.response.status);
        }
        setError('Failed to load business details');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="animate-pulse max-w-6xl mx-auto w-full px-4 py-8">
          {/* Hero skeleton */}
          <div className="h-40 bg-gray-200 rounded-xl w-full mb-8"></div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>

              <div className="h-8 bg-gray-200 rounded w-1/4 mt-6 mb-4"></div>
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto max-w-6xl px-4 py-16 text-center">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-lg mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
              <MapPin className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {error || 'Business not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find the business you're looking for. It may have been
              removed or the URL might be incorrect.
            </p>
            <Link
              to="/search-results"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to search results
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Back button - Mobile only */}
      <div className="md:hidden px-4 py-3 border-b">
        <Link
          to="/search-results"
          className="inline-flex items-center text-indigo-600">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center">
                <Link
                  to="/search-results"
                  className="hidden md:inline-flex items-center text-indigo-200 hover:text-white mr-3">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span>Back</span>
                </Link>
                {business.category?.name && (
                  <span className="text-xs font-medium bg-indigo-800/50 text-indigo-100 px-3 py-1 rounded-full">
                    {business.category.name}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {business.businessName}
              </h1>
              <div className="flex items-center text-indigo-100 text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Listed since {formatDate(business.createdAt)}</span>
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
              {business.latitude && business.longitude && (
                <a
                  href={getMapsUrl(business.latitude, business.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Get Directions</span>
                </a>
              )}

              <button
                onClick={handleShare}
                className="inline-flex items-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Mobile Tab Navigation - ALWAYS at the top on mobile */}
        <div className="block md:hidden mb-6">
          <div className="flex border-b overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('about')}
              className={cn(
                'px-4 py-2 font-medium whitespace-nowrap',
                activeTab === 'about'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600'
              )}>
              About
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={cn(
                'px-4 py-2 font-medium whitespace-nowrap',
                activeTab === 'contact'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600'
              )}>
              Contact Info
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={cn(
                'px-4 py-2 font-medium whitespace-nowrap',
                activeTab === 'location'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600'
              )}>
              Location
            </button>
          </div>
        </div>

        {/* AFTER the tabs, render the appropriate content */}

        {/* Desktop layout - Always visible on md+ screens */}
        <div className="hidden md:grid md:grid-cols-5 md:gap-6 mb-8">
          {/* Main Content - 3/5 columns */}
          <div className="col-span-3 space-y-8">
            {/* About Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
              <div className="bg-white rounded-xl shadow-sm p-6">
                {business.description ? (
                  <p className="text-gray-700 leading-relaxed">
                    {business.description}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">
                    No description available for this business.
                  </p>
                )}
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Contact Information
              </h2>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="space-y-6">
                  {business.contactNumber && (
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                        <Phone className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a
                          href={`tel:${business.contactNumber}`}
                          className="font-medium text-indigo-600 hover:text-indigo-800">
                          {business.contactNumber}
                        </a>
                      </div>
                    </div>
                  )}

                  {business.email && (
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                        <Mail className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a
                          href={`mailto:${business.email}`}
                          className="font-medium text-indigo-600 hover:text-indigo-800">
                          {business.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {business.website && (
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                        <Globe className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Website</p>
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-indigo-600 hover:text-indigo-800 break-all">
                          {business.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Business Hours
              </h3>

              {/* Only show this section if regularHours is NOT available */}
              {(!Array.isArray(business.regularHours) ||
                business.regularHours.length === 0) && (
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    {business.openingHours || business.closingHours ? (
                      <div>
                        <p className="text-sm text-gray-500">Hours</p>
                        <p className="font-medium">
                          {business.openingHours || 'N/A'} -{' '}
                          {business.closingHours || 'N/A'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Hours not specified</p>
                    )}
                  </div>
                </div>
              )}

              {/* Show detailed hours if available */}
              {Array.isArray(business.regularHours) &&
                business.regularHours.length > 0 && (
                  <div className="space-y-2">
                    {business.regularHours.map((hours, index) => (
                      <div key={index} className="flex">
                        <Clock className="w-4 h-4 text-indigo-500 mr-2 mt-1" />
                        <span>{hours}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* Sidebar - 2/5 columns for wider map */}
          <div className="col-span-2 space-y-6">
            {/* Location Map */}
            {business.latitude && business.longitude ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Location
                </h3>
                <LocationPicker
                  initialLocation={{
                    lat: business.latitude,
                    lng: business.longitude,
                  }}
                  isEditable={false}
                  variant="small"
                  className="mb-4 h-[400px] w-full" // Taller map
                />

                {/* Desktop interaction options */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <a
                    href={getMapsUrl(business.latitude, business.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    <MapPin className="w-5 h-5" />
                    <span>Open in Maps</span>
                  </a>

                  <Drawer>
                    <DrawerTrigger asChild>
                      <button className="flex items-center justify-center gap-2 border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors">
                        <Smartphone className="w-5 h-5" />
                        <span>Show QR Code</span>
                      </button>
                    </DrawerTrigger>
                    <DrawerContent className="px-4 pb-6">
                      <DrawerHeader>
                        <DrawerTitle className="text-center">
                          Scan with your phone
                        </DrawerTitle>
                      </DrawerHeader>

                      <div className="flex flex-col items-center justify-center p-4">
                        <div className="inline-block p-3 bg-white border rounded-lg shadow-sm">
                          <QRCodeSVG
                            value={getMapsUrl(
                              business.latitude,
                              business.longitude
                            )}
                            size={220}
                            level="H"
                            includeMargin
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                          Opens location in Google Maps
                        </p>

                        <DrawerClose className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                          Close
                        </DrawerClose>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Location
                </h3>
                <p className="text-gray-500">
                  No location information available for this business.
                </p>
              </div>
            )}

            {/* Business Category */}
            {business.category?.name && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Category
                </h3>
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <Building className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="font-medium">{business.category.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Content - Show based on active tab */}
        <div className="block md:hidden">
          {/* Location tab content */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              {business.latitude && business.longitude ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Location
                  </h3>
                  <LocationPicker
                    initialLocation={{
                      lat: business.latitude,
                      lng: business.longitude,
                    }}
                    isEditable={false}
                    variant="small"
                    className="mb-4 h-[400px] w-full" // Good height for mobile
                  />

                  {/* Mobile Get Directions */}
                  <a
                    href={getMapsUrl(business.latitude, business.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    <MapPin className="w-5 h-5" />
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Location
                  </h3>
                  <p className="text-gray-500">
                    No location information available for this business.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* About tab content */}
          {activeTab === 'about' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  {business.description ? (
                    <p className="text-gray-700 leading-relaxed">
                      {business.description}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      No description available for this business.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact Info tab content */}
          {activeTab === 'contact' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Contact Information
                </h2>
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                  {business.contactNumber && (
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                        <Phone className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a
                          href={`tel:${business.contactNumber}`}
                          className="font-medium text-indigo-600 hover:text-indigo-800">
                          {business.contactNumber}
                        </a>
                      </div>
                    </div>
                  )}

                  {business.email && (
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                        <Mail className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a
                          href={`mailto:${business.email}`}
                          className="font-medium text-indigo-600 hover:text-indigo-800">
                          {business.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {business.website && (
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                        <Globe className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Website</p>
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-indigo-600 hover:text-indigo-800 break-all">
                          {business.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Business Hours
                </h3>

                {/* Only show this section if regularHours is NOT available */}
                {(!Array.isArray(business.regularHours) ||
                  business.regularHours.length === 0) && (
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                      <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      {business.openingHours || business.closingHours ? (
                        <div>
                          <p className="text-sm text-gray-500">Hours</p>
                          <p className="font-medium">
                            {business.openingHours || 'N/A'} -{' '}
                            {business.closingHours || 'N/A'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500">Hours not specified</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Show detailed hours if available */}
                {Array.isArray(business.regularHours) &&
                  business.regularHours.length > 0 && (
                    <div className="space-y-2">
                      {business.regularHours.map((hours, index) => (
                        <div key={index} className="flex">
                          <Clock className="w-4 h-4 text-indigo-500 mr-2 mt-1" />
                          <span>{hours}</span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Feedback Section - Always visible for both layouts */}
        <div className="mt-12">
          <FeedbackSection
            businessId={id as string}
            googleReviews={
              Array.isArray(business.reviews) ? business.reviews : []
            }
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
