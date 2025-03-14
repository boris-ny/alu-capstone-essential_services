import { useState } from 'react';
import { Header } from './components/header';
import { useNavigate } from 'react-router-dom';
import SearchServices from './components/search';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';
import {
  Search,
  MapPin,
  Building,
  Heart,
  Star,
  Clock,
  Map,
  ChevronRight,
} from 'lucide-react';

export type Business = {
  reviews: boolean;
  regularHours: boolean;
  priceLevel: string;
  id: number;
  placeId?: string;
  businessName: string;
  description?: string;
  categoryId: number;
  contactNumber: string;
  latitude?: number;
  openingHours?: string;
  closingHours?: string;
  longitude?: number;
  email?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
};

const categories = [
  {
    name: 'Healthcare',
    color: 'bg-blue-500 hover:bg-blue-600',
    icon: <Heart className="w-5 h-5 mr-2" />,
  },
  {
    name: 'Education',
    color: 'bg-emerald-500 hover:bg-emerald-600',
    icon: <Building className="w-5 h-5 mr-2" />,
  },
  {
    name: 'Transportation',
    color: 'bg-amber-500 hover:bg-amber-600',
    icon: <MapPin className="w-5 h-5 mr-2" />,
  },
  {
    name: 'Finance',
    color: 'bg-purple-500 hover:bg-purple-600',
    icon: <Building className="w-5 h-5 mr-2" />,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSearchResults = (results: Business[]) => {
    navigate('/search-results', { state: { results } });
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    // Navigate to Categories page with the selected category name
    navigate('/categories', { state: { selectedCategoryName: category } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-900 to-indigo-700 text-white py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your Gateway to Essential Services in Kigali
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mb-8">
              Find and connect with the services you need, all in one place.
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

      {/* Categories Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Popular Categories
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {categories.map((category) => (
              <Button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={cn(
                  'h-auto py-4 md:py-6 flex items-center justify-center text-lg md:text-xl font-medium transition-all',
                  category.color,
                  activeCategory === category.name ? 'ring-4 ring-offset-2' : ''
                )}>
                {category.icon}
                {category.name}
              </Button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              className="text-indigo-700 font-medium"
              onClick={() => navigate('/categories')}>
              See all Categories
              <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
            <div className="md:w-1/3">
              <h2 className="text-3xl md:text-5xl font-bold text-indigo-900 mb-4 md:mb-0">
                About Our Platform
              </h2>
            </div>
            <div className="md:w-2/3">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                This is more than just a platform, it's a community resource.
                We're committed to connecting the residents of Kigali with the
                essential services they need to live healthy, productive lives.
                We believe in the power of collaboration and feedback, and we're
                constantly working to improve our platform based on the needs of
                our users. Join us in building a stronger, more connected
                Kigali.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Key Features
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Search className="w-8 h-8" />}
              title="Search & Filter"
              description="A robust search engine with filtering options to help users quickly locate the services they need."
            />
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="User Feedback"
              description="Features that allow users to provide feedback and ratings on services, ensuring continuous improvements."
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Service Details"
              description="Dedicated pages displaying detailed information, such as descriptions, contact details, and operating hours."
            />
            <FeatureCard
              icon={<Map className="w-8 h-8" />}
              title="Geolocation"
              description="Integration with Google API to enable users to find nearby service providers based on their location."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-indigo-900 text-white text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to discover essential services?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of Kigali residents who are finding the services they
            need every day.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-indigo-900 hover:bg-gray-100"
              onClick={() => navigate('/search-results')}>
              <Search className="mr-2 w-5 h-5" />
              Find Services
            </Button>
            <Button
              size="lg"
              className="border-white text-white hover:bg-white/10"
              onClick={() => navigate('/register')}>
              Register Your Business
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">
                Essential Services
              </h3>
              <p className="mb-4">
                Connecting Kigali with the services that matter.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/search-results" className="hover:text-white">
                    Search
                  </a>
                </li>
                <li>
                  <a href="/register" className="hover:text-white">
                    Register
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Contact</h3>
              <p>Kigali, Rwanda</p>
              <p>info@essentialservices.rw</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>
              © {new Date().getFullYear()} Essential Services. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
      <div className="text-indigo-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
