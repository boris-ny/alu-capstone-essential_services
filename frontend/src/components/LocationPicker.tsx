import { useState, useCallback } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { cn } from '@/lib/utils';
import { Location } from '@/lib/types';

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
    (event: MapMouseEvent) => {
      if (!isEditable || !event.detail.latLng) return;

      const newLocation = {
        lat: event.detail.latLng.lat,
        lng: event.detail.latLng.lng,
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
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_ID;

  if (!googleAPI || !mapId) {
    return (
      <div className="text-red-500">
        {!googleAPI
          ? 'Google Maps API key is not configured.'
          : 'Google Maps ID is not configured.'}
      </div>
    );
  }

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

      <APIProvider apiKey={googleAPI}>
        <Map
          className={cn(mapStyles[variant], className)}
          center={marker}
          mapId={mapId}
          disableDefaultUI={!isEditable}
          defaultZoom={20}
          zoomControl={true}
          scrollwheel={true}
          gestureHandling="default"
          onClick={handleMapClick}>
          <AdvancedMarker
            position={marker}
            draggable={isEditable}
            onDragEnd={(e) => {
              if (e.latLng) {
                const newLocation = {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                };
                setMarker(newLocation);
                onLocationSelect?.(newLocation);
              }
            }}>
            <Pin
              background={'#3b82f6'}
              borderColor={'#1d4ed8'}
              glyphColor={'#ffffff'}
              scale={1.2}
            />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
};

export default LocationPicker;
