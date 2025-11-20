import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import EventCarouselRow from "../components/eventCarouselRow";
import DestinationCard from "../components/destinationCard";
import {
  useEventsByEventIds,
  useEventsByCategory,
} from "../hooks/useEventHook";

// Destinations mock data
const mockDestinations = [
  {
    id: 1,
    name: "Ho Chi Minh City",
    imageUrl: "https://placehold.co/400x500/c02020/ffffff?text=Ho+Chi+Minh+City",
  },
  {
    id: 2,
    name: "Hanoi",
    imageUrl: "https://placehold.co/400x500/20c020/ffffff?text=Hanoi",
  },
  {
    id: 3,
    name: "Da Lat",
    imageUrl: "https://placehold.co/400x500/2020c0/ffffff?text=Da+Lat",
  },
  {
    id: 4,
    name: "Other Destinations",
    imageUrl: "https://placehold.co/400x500/c0c020/ffffff?text=Other",
  },
];

/**
 * EventSection Component
 */
const EventSection = ({ title, categoryId, link = "#" }) => {
  const {
    data: eventData,
    isLoading,
    isError,
    error,
  } = useEventsByCategory(categoryId);

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
          <p className="mt-2 text-red-400">
            Error loading events: {error.message}
          </p>
        </div>
      </div>
    );
  }
  
  const events = eventData?.pageContent || [];

  if (events.length === 0) {
    return null;
  }

  // FIX: Removed the hook call from inside .map()
  const formattedEvents = events.map((event) => ({
    id: event.id,
    title: event.name,
    imageUrl: event.img?.url || `https://placehold.co/400x300/111/fff?text=${event.name}`,
    // We do NOT pass 'price' here. The EventCard component will fetch it.
    date: new Date(event.startDate).toLocaleDateString(),
  }));

  return (
    <EventCarouselRow title={title} events={formattedEvents} link={link} />
  );
};

const EventCarouselSection = () => {
  const [carouselIndex, setCarouselIndex] = React.useState(0);
  
  // Note: Ensure useEventsByEventIds is implemented in useEventHook if you use it here
  // For now, this assumes it returns a list of events similar to the other hooks
  const {
    data: eventData,
    isLoading,
    isError,
    error,
  } = useEventsByEventIds({ eventIds: [30004, 30005, 30003, 30002] })


  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex h-48 items-center justify-center rounded-lg bg-gray-800">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-4 text-lg text-gray-300">Loading featured events...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return null;
  };

  const events = eventData || [];
  
  const formattedFeaturedEvents = events.map((event) => ({
    id: event.id,
    title: event.name,
    imageUrl: event.img?.url || `https://placehold.co/400x300/111/fff?text=${event.name}`,
    // Carousel might display price differently or fetch it similarly
    // For the carousel, let's assume we pass the ID and let a child component handle it, 
    // or we skip price for the big banner to keep it simple.
    date: new Date(event.startDate).toLocaleDateString(),
  }));

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    setCarouselIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  return (
    <div className="relative mb-12 w-full overflow-hidden rounded-xl">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
      >
        {formattedFeaturedEvents.map((event) => (
          <div
            key={event.id}
            className="relative h-[400px] w-full flex-shrink-0"
          >
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-8 left-8">
              <h2 className="text-3xl font-bold text-white">{event.title}</h2>
              <p className="text-gray-200">{event.date}</p>
              <Link
                to={`/event/${event.id}`}
                className="mt-4 inline-block rounded-full bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
};

const HomePage = () => {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      
      <EventCarouselSection />

      <EventSection title="This Weekend" categoryId={1} link="/category/1" />
      <EventSection title="Arts & Theater" categoryId={2} link="/category/2" />
      <EventSection title="Sports" categoryId={3} link="/category/3" />

      <div className="mb-12 overflow-hidden rounded-lg">
        <img
          src="https://vnpay.vn/s1/statics.vnpay.vn/2022/6/0t98r20u2ruh1654574469292.jpg"
          alt="Ad Banner"
          className="h-auto w-full"
        />
      </div>
      
      <EventSection title="Music" categoryId={1} link="/category/1" />
      <EventSection title="Other Events" categoryId={4} link="/category/4" />

      <div className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-white">
            Popular Destinations
          </h3>
          <Link
            to="/destinations"
            className="flex items-center text-sm text-blue-400 hover:underline"
          >
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