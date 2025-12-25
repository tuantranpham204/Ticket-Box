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
import { EVENT_STATUS, formatEventDate } from "../utils/util";

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
  } = useEventsByCategory(categoryId, [EVENT_STATUS.UPCOMING, EVENT_STATUS.RUNNING]);

  if (isLoading) {
    return (
      <div className="mb-12">
        <h3 className="mb-4 text-2xl font-semibold text-white">{title}</h3>
        <div className="flex h-48 items-center justify-center rounded-2xl bg-gray-800/50 backdrop-blur-md border border-white/5">
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
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-red-700/50 bg-red-900/10 backdrop-blur-md">
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

  const formattedEvents = events.map((event) => ({
    id: event.id,
    title: event.name,
    imageUrl: event.img?.url || `https://placehold.co/400x300/111/fff?text=${event.name}`,
    date: formatEventDate(event.startDate),
  }));

  return (
    <EventCarouselRow title={title} events={formattedEvents} link={link} />
  );
};

const EventCarouselSection = () => {
  const [carouselIndex, setCarouselIndex] = React.useState(0);

  const {
    data: eventData,
    isLoading,
    isError,
  } = useEventsByEventIds({ eventIds: [30004, 30005, 30003, 30002] })


  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex h-[400px] items-center justify-center rounded-2xl bg-gray-800/30 backdrop-blur-lg border border-white/5">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (isError) return null;

  const events = eventData || [];

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    setCarouselIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  return (
    <div className="relative mb-16 w-full overflow-hidden rounded-[2rem] shadow-2xl lighting-effect ring-1 ring-white/10">
      <div
        className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
        style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
      >
        {events.map((event) => (
          <div
            key={event.id}
            className="relative h-[450px] w-full flex-shrink-0"
          >
            <img
              src={event.img?.url || `https://placehold.co/1200x600/111/fff?text=${event.name}`}
              alt={event.name}
              className="h-full w-full object-cover transition-transform duration-10000 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
            <div className="absolute bottom-12 left-12 right-12">
              <div className="inline-block rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 backdrop-blur-md border border-blue-500/30 mb-4 animate-pulse">
                Featured Event
              </div>
              <h2 className="text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">{event.name}</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl font-medium">{formatEventDate(event.startDate)}</p>
              <Link
                to={`/event/${event.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-gray-900 hover:bg-blue-400 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/10"
              >
                Get Tickets
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="absolute right-8 bottom-12 flex gap-3">
        <button
          onClick={prevSlide}
          className="group rounded-xl bg-white/10 p-4 transition-all hover:bg-white/20 hover:scale-110 border border-white/10 backdrop-blur-xl"
        >
          <ChevronLeft className="h-6 w-6 text-white group-hover:-translate-x-1 transition-transform" />
        </button>
        <button
          onClick={nextSlide}
          className="group rounded-xl bg-white/10 p-4 transition-all hover:bg-white/20 hover:scale-110 border border-white/10 backdrop-blur-xl"
        >
          <ChevronRight className="h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute left-1/2 bottom-8 flex -translate-x-1/2 gap-2">
        {events.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${carouselIndex === i ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  return (
    <div className="bg-gray-950">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <EventCarouselSection />

        <div className="space-y-20">
          <EventSection title="🎭 Arts & Theater" categoryId={2} link="/category/2" />
          <EventSection title="⚽ Sports Highlights" categoryId={3} link="/category/3" />

          {/* Premium Ad Banner */}
          <div className="relative overflow-hidden rounded-[2.5rem] liquid-glass p-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <img
              src="https://vnpay.vn/s1/statics.vnpay.vn/2022/6/0t98r20u2ruh1654574469292.jpg"
              alt="Ad Banner"
              className="relative h-64 w-full object-cover rounded-[2.4rem] opacity-90 transition-all duration-700 group-hover:opacity-100 group-hover:scale-[1.01]"
            />
          </div>

          <EventSection title="🎵 Music Festival" categoryId={1} link="/category/1" />

          <div className="mb-12">
            <div className="mb-8 flex items-end justify-between px-2">
              <div>
                <p className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-2">Explore the world</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">
                  Popular Destinations
                </h3>
              </div>
              <Link
                to="/destinations"
                className="flex items-center gap-2 rounded-full bg-gray-800/50 px-6 py-3 text-sm font-bold text-gray-300 hover:bg-gray-800 hover:text-white transition-all border border-white/5 backdrop-blur-md"
              >
                See all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {mockDestinations.map((dest) => (
                <DestinationCard key={dest.id} dest={dest} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
