import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from '@/components/header';
import { Business } from '@/Home';
import LocationPicker from './components/LocationPicker';

const BusinessDetails = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/businesses/${id}`
        );
        setBusiness(response.data);
      } catch (error) {
        console.error('Error fetching business details:', error);
        setError('Failed to load business details');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            {error || 'Business not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold mb-6">{business.businessName}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              <p className="text-gray-600 mb-6">{business.description}</p>

              <h2 className="text-2xl font-semibold mb-4">
                Contact Information
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Phone:</span>{' '}
                  {business.contactNumber}
                </p>
                {business.email && (
                  <p>
                    <span className="font-medium">Email:</span> {business.email}
                  </p>
                )}
                {business.website && (
                  <p>
                    <span className="font-medium">Website:</span>{' '}
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline">
                      {business.website}
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Business Hours</h2>
              <p className="text-gray-600">Coming soon...</p>

              <h2 className="text-2xl font-semibold mb-4 mt-6">Location</h2>
              {business.latitude && business.longitude ? (
                <LocationPicker
                  initialLocation={{
                    lat: business.latitude,
                    lng: business.longitude,
                  }}
                  isEditable={false}
                  variant="default"
                />
              ) : (
                <p className="text-gray-600">
                  No location information available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
