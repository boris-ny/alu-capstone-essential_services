import { useState } from 'react';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="relative bg-indigo-950">
      <div className="flex justify-between items-center px-20 py-7 max-md:px-5">
        <div className="flex gap-10 text-2xl font-bold text-white max-md:flex-1">
          <div className="px-14 py-1.5 bg-white text-black rounded-3xl max-md:px-5">
            Home
          </div>
          <div className="px-11 py-1.5 bg-white text-black rounded-3xl max-md:px-5">
            Search
          </div>
        </div>
        <div className="hidden md:block">
          <div className="px-8 py-3 text-2xl bg-white font-bold text-black rounded-3xl">
            Register Business
          </div>
        </div>
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
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
      {mobileMenuOpen && (
        <nav className="md:hidden flex flex-col gap-4 px-5 pb-5">
          <div className="px-14 py-1.5 bg-white text-black rounded-3xl max-md:px-5">
            HOME
          </div>
          <div className="px-11 py-1.5 bg-white text-black rounded-3xl max-md:px-5">
            SEARCH
          </div>
          <div className="px-8 py-3 text-sm bg-white text-black rounded-3xl max-md:px-5">
            Register Business
          </div>
        </nav>
      )}
    </header>
  );
};
