import { useState, useCallback } from 'react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
import { cn } from '@/lib/utils';

interface Location {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  initialLocation?: Location;
  onLocationSelect?: (location: Location) => void;
  isEditable?: boolean;
  variant?: 'default' | 'small' | 'large';
  className?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation = { lat: -1.9441, lng: 30.0619 }, // Default to Kigali coordinates
  onLocationSelect,
  isEditable = false,
  variant = 'default',
  className,
}) => {
  const [marker, setMarker] = useState<Location>(initialLocation);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setMarker(newLocation);
        onLocationSelect?.(newLocation);
        setLoading(false);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, [onLocationSelect]);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!isEditable || !e.latLng) return;

      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      setMarker(newLocation);
      onLocationSelect?.(newLocation);
    },
    [isEditable, onLocationSelect]
  );

  const mapStyles = {
    default: 'h-[500px] w-full rounded-lg',
    small: 'h-[300px] w-full rounded-lg',
    large: 'h-[700px] w-full rounded-lg',
  };

  const googleAPI = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <div className={cn('space-y-4', className)}>
      {isEditable && (
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className={cn(
            'px-4 py-2 rounded-md transition-colors',
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          )}>
          {loading ? 'Getting Location...' : 'Use Current Location'}
        </button>
      )}

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <LoadScript googleMapsApiKey={googleAPI}>
        <GoogleMap
          mapContainerClassName={cn(mapStyles[variant], className)}
          center={marker}
          zoom={13}
          onClick={handleMapClick}>
          <Marker position={marker} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default LocationPicker;
