import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

// --- Component Imports ---
import EventCard from '../components/EventCard';
import EventCarouselRow from '../components/EventCarouselRow';
import DestinationCard from '../components/DestinationCard';

// --- Hook Imports ---
import { useEventsByCategory } from '../hooks/useEventHook';

// --- Mock Data (as planned) ---
// We keep the top carousel mock data until a "featured" API is available
const mockCarouselEvents = [
  { id: 100, title: "K-POP SUPER CONCERT 2025", date: "18:00 / 22.11.2025", imageUrl: "https://placehold.co/800x400/0a2a40/ffffff?text=K-POP+SUPER+CONCERT", price: "From 1.800.000đ" },
  { id: 101, title: "Übermensch - G-Dragon 2025 World Tour", date: "NOV 2025 @ QUY NHON, HCMC", imageUrl: "https://placehold.co/800x400/c0a080/000000?text=G-DRAGON+TOUR", price: "From 2.500.000đ" },
];

// We keep the destinations mock data until a "destinations" API is available
const mockDestinations = [
  { id: 1, name: "Ho Chi Minh City", imageUrl: "https://placehold.co/400x500/c02020/ffffff?text=Ho+Chi+Minh+City" },
  { id: 2, name: "Hanoi", imageUrl: "https://placehold.co/400x500/20c020/ffffff?text=Hanoi" },
  { id: 3, name: "Da Lat", imageUrl: "https://placehold.co/400x500/2020c0/ffffff?text=Da+Lat" },
  { id: 4, name: "Other Destinations", imageUrl: "https://placehold.co/400x500/c0c020/ffffff?text=Other" },
];
// --- End Mock Data ---


/**
 * EventSection Component
 * A smart component that fetches its own data by category.
 */
const EventSection = ({ title, categoryId, link = "#" }) => {
  const { data: eventData, isLoading, isError, error } = useEventsByCategory(categoryId);

  if (isLoading) {
    return (
      <div className="mb-12">
        <h3 className="mb-4 text-2xl font-semibold text-white">{title}</h3>
        <div className="flex h-48 items-center justify-center rounded-lg bg-gray-800">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-4 text-lg text-gray-300">Loading events...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mb-12">
        <h3 className="mb-4 text-2xl font-semibold text-white">{title}</h3>
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-red-700 bg-red-900/20">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="mt-2 text-red-400">Error loading events: {error.message}</p>
        </div>
      </div>
    );
  }
  
  // The API returns a CustomPage object. The events are in `pageContent`.
  const events = eventData?.pageContent || [];
  
  // Do not render the section if there are no events and no error
  if (events.length === 0) {
    return null;
  }

  // Format data for the EventCard component
  const formattedEvents = events.map(event => ({
    id: event.id,
    title: event.name,
    imageUrl: event.img?.url || `https://placehold.co/400x300/111/fff?text=${event.name}`,
    price: `${event.minPrice?.toLocaleString() || 'TBD'} đ`,
    date: new Date(event.startDate).toLocaleDateString(),
  }));

  return <EventCarouselRow title={title} events={formattedEvents} link={link} />;
};


/**
 * Main Home Page Component
 */
const HomePage = () => {
  // Simple state for the top carousel
  const [carouselIndex, setCarouselIndex] = React.useState(0);

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev === mockCarouselEvents.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev === 0 ? mockCarouselEvents.length - 1 : prev - 1));
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      
      {/* === Top Carousel (Mock Data) === */}
      <div className="relative mb-12 w-full overflow-hidden rounded-xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
        >
          {mockCarouselEvents.map((event) => (
            <div key={event.id} className="relative h-[400px] w-full flex-shrink-0">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <h2 className="text-3xl font-bold text-white">{event.title}</h2>
                <p className="text-gray-200">{event.date}</p>
                <Link to={`/event/${event.id}`} className="mt-4 inline-block rounded-full bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        {/* Carousel Controls */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* === Dynamic Event Sections (Live API Data) === */}
      {/* We pass the actual category IDs from your database here.
        I'm using placeholders (1, 2, 3) as examples.
      */}
      <EventSection title="This Weekend" categoryId={1} link="/category/1" />
      <EventSection title="Music" categoryId={2} link="/category/2" />

      {/* === Ad Banner (from screenshots) === */}
      <div className="mb-12 overflow-hidden rounded-lg">
        <img 
          src="https://placehold.co/1200x300/0a4a60/ffffff?text=ZaloPay+|+TicketBox+Banner" 
          alt="Ad Banner" 
          className="h-auto w-full"
        />
      </div>

      {/* === More Dynamic Sections === */}
      <EventSection title="Arts & Theater" categoryId={3} link="/category/3" />
      <EventSection title="Other Events" categoryId={4} link="/category/4" />

      {/* === Destinations (Mock Data) === */}
      <div className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-white">Popular Destinations</h3>
          <Link to="/destinations" className="flex items-center text-sm text-blue-400 hover:underline">
            See all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {mockDestinations.map((dest) => (
            <DestinationCard key={dest.id} dest={dest} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default HomePage;