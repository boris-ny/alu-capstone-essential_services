import { useState, useEffect } from 'react';
import { Header } from './components/header';
import { useNavigate } from 'react-router-dom';
import SearchServices from './components/search';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';
import { Loader2 } from 'lucide-react';
import api from './services/api';
import { Business } from './Home';
import { BusinessCard } from './components/BusinessCard';

interface Category {
  id: number;
  name: string;
}

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle search results
  const handleSearchResults = (results: Business[]) => {
    navigate('/search-results', { state: { results } });
  };

  // Handle category selection
  const handleCategoryClick = async (categoryId: number) => {
    setSelectedCategory(categoryId);
    setIsLoading(true);

    try {
      const response = await api.get('/businesses/search', {
        params: { category: categoryId },
      });
      setBusinesses(response.data);
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {getCategoryName(selectedCategory)} Services
                <span className="text-lg font-medium text-gray-500 ml-2">
                  ({businesses.length})
                </span>
              </h2>
              <Button
                variant="outline"
                onClick={() => setSelectedCategory(null)}
                className="text-indigo-600 border-indigo-200">
                Show All Categories
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : businesses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
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
