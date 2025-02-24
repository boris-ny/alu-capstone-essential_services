import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/header';
import { Business } from '@/Home';
import SearchServices from '@/components/search';
import { useState } from 'react';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<Business[]>(
    location.state?.results || []
  );

  const handleNewSearch = (newResults: Business[]) => {
    setSearchResults(newResults);
    navigate('/search-results', {
      state: { results: newResults },
      replace: true,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchServices onSearchResults={handleNewSearch} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-3xl text-center font-bold mb-6">
            Search Results
          </h2>
          {searchResults.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((business: Business) => (
                <Link
                  to={`/business/${business.id}`}
                  key={business.id}
                  className="block bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold mb-2">
                    {business.businessName}
                  </h3>
                  <p className="text-gray-600">{business.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500">
                Start searching using the search bar above!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
