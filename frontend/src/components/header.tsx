import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, business, logout } = useAuth();

  // Get initials from business name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={cn(
        'sticky top-0 w-full z-50 transition-all duration-300',
        scrolled ? 'bg-indigo-950 shadow-md' : 'bg-indigo-900'
      )}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <Link to="/" className="text-white font-bold text-xl">
            Essential Services
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <NavLink to="/" active={isActive('/')}>
            Home
          </NavLink>
          <NavLink to="/search-results" active={isActive('/search-results')}>
            Search
          </NavLink>

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-white">
                  <AvatarFallback className="bg-indigo-700 text-white">
                    {business ? getInitials(business.name) : '??'}
                  </AvatarFallback>
                </Avatar>
                <button onClick={logout} className="text-white hover:underline">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" active={isActive('/login')}>
                Login
              </NavLink>
              <NavLink to="/register" active={isActive('/register')} highlight>
                Register Business
              </NavLink>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          onClick={toggleMenu}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu">
          <span className="sr-only">Open main menu</span>
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true">
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300',
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        aria-hidden={!mobileMenuOpen}>
        <div
          className={cn(
            'fixed top-[72px] right-0 bottom-0 w-64 bg-white transform transition-transform duration-300 ease-in-out',
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}>
          <nav className="flex flex-col p-4 space-y-3">
            <MobileNavLink to="/" active={isActive('/')}>
              Home
            </MobileNavLink>
            <MobileNavLink
              to="/search-results"
              active={isActive('/search-results')}>
              Search
            </MobileNavLink>

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-indigo-700 text-white text-sm">
                      {business ? getInitials(business.name) : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-800">
                    {business?.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-3 rounded-md block text-left text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" active={isActive('/login')}>
                  Login
                </MobileNavLink>
                <MobileNavLink to="/register" active={isActive('/register')}>
                  Register Business
                </MobileNavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

// Helper components for navigation
const NavLink = ({
  to,
  children,
  active,
  highlight,
}: {
  to: string;
  children: React.ReactNode;
  active?: boolean;
  highlight?: boolean;
}) => (
  <Link
    to={to}
    className={cn(
      'px-4 py-2 rounded-full transition-colors font-medium',
      active
        ? 'bg-white text-indigo-900'
        : highlight
          ? 'bg-white text-indigo-900 hover:bg-indigo-100'
          : 'text-white hover:bg-indigo-800'
    )}>
    {children}
  </Link>
);

const MobileNavLink = ({
  to,
  children,
  active,
}: {
  to: string;
  children: React.ReactNode;
  active?: boolean;
}) => (
  <Link
    to={to}
    className={cn(
      'px-4 py-3 rounded-md block transition-colors',
      active
        ? 'bg-indigo-100 text-indigo-900 font-medium'
        : 'text-gray-800 hover:bg-indigo-50'
    )}>
    {children}
  </Link>
);
