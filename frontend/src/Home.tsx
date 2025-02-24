import { Header } from './components/header';
import { useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import SearchServices from './components/search';

export type Business = {
  id: number;
  businessName: string;
  description?: string;
};
export default function Home() {
  const navigate = useNavigate();

  const handleSearchResults = (results: Business[]) => {
    navigate('/search-results', { state: { results } });
  };
  return (
    <div className="flex gap-20 overflow-hidden flex-col bg-zinc-100 ">
      <Header />
      <h1 className="md:text-6xl font-bold text-center mt-4">
        Your Gateway to Essential Services in <br />
        Kigali
      </h1>
      <section className="flex align-center justify-center   gap-4 my-4">
        <Button variant="default" size="lg" className="text-4xl">
          Healthcare
        </Button>
        <Button size={'lg'} variant="default" className="text-4xl">
          Education
        </Button>
        <Button size={'lg'} variant="default" className="text-4xl">
          Transportation
        </Button>
        <Button size={'lg'} variant="default" className="text-4xl">
          Finance
        </Button>
      </section>

      <section className="flex flex-col justify-center items-center mt-6 gap-4 w-full max-w-4xl mx-auto">
        <SearchServices onSearchResults={handleSearchResults} />
        <button className="mt-4 text-xl text-blue-950 underline">
          See all Categories
        </button>
      </section>

      <section className="flex flex-col sm:flex-row justify-center items-center gap-28 w-full md:max-w-5xl mx-auto mt-6 my-4">
        <h2 className="text-6xl font-bold">About</h2>
        <p className="md:w-3/4 mx-auto text-justify md:text-2xl">
          This is more than just a platform, it's a community resource. We're
          committed to connecting the residents of Kigali with the essential
          services they need to live healthy, productive lives. We believe in
          the power of collaboration and feedback, and we're constantly working
          to improve our platform based on the needs of our users. Join us in
          building a stronger, more connected Kigali
        </p>
      </section>
      <section className="grid gap-10 px-5 py-0 mx-auto my-0 grid-cols-[repeat(2,1fr)] max-w-[1200px] max-md:grid-cols-[1fr]">
        <div className="p-4 w-2/4p-6 bg-white rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] ">
          <h3 className="font-bold text-xl mb-2">Search & Filter </h3>
          <p className="">
            A robust search engine with filtering options to help users quickly
            locate the services they need.
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
          <h3 className="font-bold text-xl mb-2">User Feedback </h3>
          <p>
            Features that allow users to provide feedback and ratings on
            services, ensuring continuous improvements based on user
            experiences.
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
          <h3 className="font-bold text-xl mb-2">Service Details Pages</h3>
          <p>
            For each listed service, dedicated pages displaying detailed
            information, such as descriptions, contact details, operating hours,
            and location on a map.
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
          <h3 className="font-bold text-xl mb-2">Geolocation</h3>
          <p>
            Integration with Google API to enable users to find nearby service
            providers based on their location.
          </p>
        </div>
      </section>
    </div>
  );
}
