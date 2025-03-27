import { useState, useEffect } from 'react';
import { Header } from './components/header';
import { useLocation } from 'react-router-dom';
import SearchServices from './components/search';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';
import { Loader2, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { InfoBusinessCard } from './components/infoBusinessCard';
import { Business, Category } from './lib/types';
import { useCategories } from './hooks/useCategories';
import { useBusinessesByCategory } from './hooks/useBusinesses';

// Extended Business interface to include source and placeId
interface ExtendedBusiness extends Business {
  source?: 'local' | 'places';
  placeId?: string;
  external?: boolean;
}

export default function Categories() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [businesses, setBusinesses] = useState<ExtendedBusiness[]>([]);
  const [showPlacesResults, setShowPlacesResults] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Replace direct API call with useCategories hook
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories();

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : '';
  };

  // Use the enhanced useBusinessesByCategory hook with category name
  const {
    data: categoryBusinesses,
    isLoading: isBusinessesLoading,
    refetch: refetchBusinesses,
  } = useBusinessesByCategory(
    selectedCategory,
    selectedCategory ? getCategoryName(selectedCategory) : null,
    currentPage,
    itemsPerPage
  );

  // Check if a category was passed from the home page
  useEffect(() => {
    if (categories.length > 0 && location.state?.selectedCategoryName) {
      const categoryName = location.state.selectedCategoryName;
      const matchedCategory = categories.find(
        (cat: Category) => cat.name === categoryName
      );

      if (matchedCategory) {
        // Auto-select the category and fetch its businesses
        handleCategoryClick(matchedCategory.id);
      }
    }
  }, [categories, location.state]);

  // Update businesses state when categoryBusinesses changes
  useEffect(() => {
    if (categoryBusinesses && !isSearchMode) {
      setBusinesses(categoryBusinesses.data);
    }
  }, [categoryBusinesses, isSearchMode]);

  // Handle category selection
  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setIsSearchMode(false);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (
      categoryBusinesses &&
      currentPage < categoryBusinesses.meta.totalPages
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Toggle showing Places API results
  const togglePlacesResults = () => {
    const newShowPlaces = !showPlacesResults;
    setShowPlacesResults(newShowPlaces);

    // Refetch with the new setting if in category mode
    if (selectedCategory !== null && !isSearchMode) {
      refetchBusinesses();
    }
  };

  // Handle search results
  const handleSearchResults = (results: ExtendedBusiness[]) => {
    setIsSearchMode(true);
    setSelectedCategory(null);
    setBusinesses(results);
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
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

      {/* Businesses Section - Shows when a category is selected or search results are available */}
      {(selectedCategory !== null || businesses.length > 0) && (
        <section className="py-8 px-4 bg-white border-t border-gray-100">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold">
                {selectedCategory !== null
                  ? `${getCategoryName(selectedCategory)} Services`
                  : 'Search Results'}
                <span className="text-lg font-medium text-gray-500 ml-2">
                  {isSearchMode
                    ? `(${businesses.length})`
                    : categoryBusinesses?.meta
                      ? `(${categoryBusinesses.meta.total})`
                      : '(0)'}
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
                {selectedCategory !== null && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory(null)}
                    className="text-indigo-600 border-indigo-200">
                    Show All Categories
                  </Button>
                )}
              </div>
            </div>

            {isBusinessesLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : businesses.length > 0 ? (
              <div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {businesses.map((business) => (
                    <InfoBusinessCard
                      key={business.placeId || business.id}
                      business={business}
                    />
                  ))}
                </div>

                {/* Pagination controls - only show for category results, not search */}
                {!isSearchMode &&
                  categoryBusinesses?.meta &&
                  categoryBusinesses.meta.totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1">
                        <ChevronLeft size={16} />
                        Previous
                      </Button>
                      <span className="mx-4 text-gray-600">
                        Page {currentPage} of{' '}
                        {categoryBusinesses.meta.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={
                          currentPage >= categoryBusinesses.meta.totalPages
                        }
                        className="flex items-center gap-1">
                        Next
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  )}

                {/* Legend for sources */}
                <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
                  {businesses.some((b) => !b.external) && (
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></span>
                      <span>Local listings</span>
                    </div>
                  )}
                  {businesses.some((b) => b.external) && (
                    <div className="flex items-center">
                      <Globe size={14} className="text-gray-500 mr-2" />
                      <span>Google Places results</span>
                    </div>
                  )}
                </div>
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
