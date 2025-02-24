import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
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

  const getMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
                <div className="space-y-4">
                  <LocationPicker
                    initialLocation={{
                      lat: business.latitude,
                      lng: business.longitude,
                    }}
                    isEditable={false}
                    variant="default"
                  />

                  {/* Mobile Get Directions Button */}
                  {isMobile && (
                    <a
                      href={getMapsUrl(business.latitude, business.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-blue-500 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                      Open in Google Maps
                    </a>
                  )}

                  {/* QR Code for Desktop */}
                  {!isMobile && (
                    <div className="mt-4 p-4 border rounded-lg bg-white">
                      <h3 className="text-lg font-medium mb-2">
                        Get Directions on Your Phone
                      </h3>
                      <div className="flex items-center justify-center">
                        <QRCodeSVG
                          value={getMapsUrl(
                            business.latitude,
                            business.longitude
                          )}
                          size={200}
                          level="H"
                          includeMargin
                        />
                      </div>
                      <p className="text-sm text-gray-500 text-center mt-2">
                        Scan this QR code to open the location in Google Maps
                      </p>
                    </div>
                  )}
                </div>
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
