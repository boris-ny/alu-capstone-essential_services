/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Header } from './components/header';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchServices from './components/search';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';
import { Loader2, Globe } from 'lucide-react';
import api from './services/api';
import { Business } from './Home';
import { BusinessCard } from './components/BusinessCard';

interface Category {
  id: number;
  name: string;
}

// Extended Business interface to include source and placeId
interface ExtendedBusiness extends Business {
  source?: 'local' | 'places';
  placeId?: string;
}

export default function Categories() {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [businesses, setBusinesses] = useState<ExtendedBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isPlacesLoading, setIsPlacesLoading] = useState(false);
  const [showPlacesResults, setShowPlacesResults] = useState(true);

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const response = await api.get('/categories');
        setCategories(response.data);

        // Check if a category was passed from the home page
        if (location.state?.selectedCategoryName) {
          const categoryName = location.state.selectedCategoryName;
          const matchedCategory = response.data.find(
            (cat: Category) => cat.name === categoryName
          );

          if (matchedCategory) {
            // Auto-select the category and fetch its businesses
            handleCategoryClick(matchedCategory.id);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [location.state]);

  // Handle search results
  const handleSearchResults = (results: Business[]) => {
    navigate('/search-results', { state: { results } });
  };

  // Get places based on category name
  const fetchPlacesByCategory = async (categoryName: string) => {
    setIsPlacesLoading(true);
    try {
      const response = await api.get('/places/suggestions', {
        params: { input: categoryName },
      });

      // Get places details (limiting to 8 to avoid overwhelming the UI)
      const placesPromises = response.data
        .slice(0, 8)
        .map(async (place: any) => {
          try {
            const detailsResponse = await api.get(`/places/${place.place_id}`);
            return {
              ...detailsResponse.data,
              source: 'places',
              // Store the Google Places ID
              placeId: place.place_id,
              // Mark as external to render differently in UI
              external: true,
            };
          } catch (err) {
            console.error(
              `Failed to fetch details for place ${place.place_id}:`,
              err
            );
            return null;
          }
        });

      const placesResults = (await Promise.all(placesPromises)).filter(Boolean);
      return placesResults;
    } catch (error) {
      console.error('Error fetching places by category:', error);
      return [];
    } finally {
      setIsPlacesLoading(false);
    }
  };

  // Handle category selection
  const handleCategoryClick = async (categoryId: number) => {
    setSelectedCategory(categoryId);
    setIsLoading(true);
    setBusinesses([]); // Clear previous results

    try {
      // Fetch local businesses
      const response = await api.get('/businesses/search', {
        params: { category: categoryId },
      });

      // Mark local businesses
      const localBusinesses = response.data.map((business: Business) => ({
        ...business,
        source: 'local',
      }));

      setBusinesses(localBusinesses);

      // Get category name
      const categoryName = getCategoryName(categoryId);

      // Also fetch from Places API if category name is available
      if (categoryName && showPlacesResults) {
        const placesResults = await fetchPlacesByCategory(categoryName);

        // Combine local and places results
        setBusinesses((prevBusinesses) => [
          ...prevBusinesses,
          ...placesResults,
        ]);
      }
    } catch (error) {
      console.error('Error fetching businesses by category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : '';
  };

  // Toggle showing Places API results
  const togglePlacesResults = () => {
    const newShowPlaces = !showPlacesResults;
    setShowPlacesResults(newShowPlaces);

    // If toggling on and we have a selected category, refetch
    if (newShowPlaces && selectedCategory !== null) {
      handleCategoryClick(selectedCategory);
    } else if (!newShowPlaces) {
      // Filter out places results
      setBusinesses(
        businesses.filter((business) => business.source !== 'places')
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />

      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-r from-indigo-900 to-indigo-700 text-white py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Service Categories
            </h1>
            <p className="text-lg text-indigo-100 max-w-3xl mb-6">
              Find essential services by category or search for specific
              businesses
            </p>

            {/* Search Component */}
            <div className="w-full max-w-3xl bg-white/10 backdrop-blur-sm p-4 rounded-xl shadow-lg">
              <SearchServices onSearchResults={handleSearchResults} />
            </div>
          </div>
        </div>

        {/* Curved bottom edge */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-zinc-50 -mb-1"
          style={{
            borderTopLeftRadius: '50% 100%',
            borderTopRightRadius: '50% 100%',
          }}></div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            All Categories
          </h2>

          {isCategoriesLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={cn(
                    'h-auto py-4 flex items-center justify-center text-lg font-medium transition-all',
                    'bg-indigo-600 hover:bg-indigo-700',
                    selectedCategory === category.id
                      ? 'ring-4 ring-indigo-300 ring-offset-2'
                      : ''
                  )}>
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Businesses Section - Shows when a category is selected */}
      {selectedCategory !== null && (
        <section className="py-8 px-4 bg-white border-t border-gray-100">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold">
                {getCategoryName(selectedCategory)} Services
                <span className="text-lg font-medium text-gray-500 ml-2">
                  ({businesses.length})
                </span>
              </h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={togglePlacesResults}
                  className={cn(
                    'flex items-center gap-2',
                    showPlacesResults
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600'
                  )}>
                  <Globe size={18} />
                  {showPlacesResults
                    ? 'Hide Google Places'
                    : 'Show Google Places'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory(null)}
                  className="text-indigo-600 border-indigo-200">
                  Show All Categories
                </Button>
              </div>
            </div>

            {isLoading || isPlacesLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : businesses.length > 0 ? (
              <div>
                {/* Local Businesses */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Local Listings
                  </h3>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {businesses
                      .filter((business) => business.source === 'local')
                      .map((business) => (
                        <BusinessCard key={business.id} business={business} />
                      ))}
                  </div>
                  {businesses.filter((business) => business.source === 'local')
                    .length === 0 && (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <p className="text-gray-600">
                        No local businesses found in this category
                      </p>
                    </div>
                  )}
                </div>

                {/* Google Places Results */}
                {showPlacesResults &&
                  businesses.some((b) => b.source === 'places') && (
                    <div className="mt-10">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <Globe size={18} className="mr-2 text-indigo-600" />
                        Google Places Results
                      </h3>
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {businesses
                          .filter((business) => business.source === 'places')
                          .map((business) => (
                            <BusinessCard
                              key={business.placeId || business.id}
                              business={business}
                              isExternal={true}
                            />
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <p className="text-xl font-medium text-gray-600 mb-2">
                  No businesses found
                </p>
                <p className="text-gray-500">
                  There are currently no businesses listed in this category
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
