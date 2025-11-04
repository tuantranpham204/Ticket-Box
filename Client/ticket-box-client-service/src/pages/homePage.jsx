import React from 'react';
// We would import the hooks to fetch event data
// import { useGetEvents } from '../hooks/useEvents';

// Mock data for event cards
const mockEvents = [
  { id: 1, title: 'Đàm Vĩnh Hưng', img: 'https://placehold.co/400x600/1e293b/ffffff?text=Event+1' },
  { id: 2, title: 'Lệ Văn Duyệt', img: 'https://placehold.co/400x600/1e293b/ffffff?text=Event+2' },
  { id: 3, title: 'Waterbomb 2025', img: 'https://placehold.co/400x600/1e293b/ffffff?text=Event+3' },
  { id: 4, title: 'Ngày Xửa Ngày Xưa', img: 'https://placehold.co/400x600/1e293b/ffffff?text=Event+4' },
  { id: 5, title: 'Richchigga', img: 'https://placehold.co/400x600/1e293b/ffffff?text=Event+5' },
];

function HomePage() {
  // const { data: events, isLoading } = useGetEvents({ categoryId: 'special' });
  // if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Carousel */}
      <div className="relative mb-12 h-[450px] w-full overflow-hidden rounded-2xl bg-gray-800">
        {/* This would be a real carousel component */}
        <img 
          src="https://placehold.co/1200x450/111827/ffffff?text=K-POP+SUPER+CONCERT" 
          alt="K-Pop Super Concert" 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent p-12">
          <h1 className="text-5xl font-bold text-white">K-POP SUPER CONCERT</h1>
          <button className="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200">
            View Details
          </button>
        </div>
      </div>
      
      {/* Special Events Section */}
      <section>
        <h2 className="mb-6 text-3xl font-bold text-white">
          Special Events
        </h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
          {mockEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}

// Simple Event Card Component
const EventCard = ({ event }) => (
  <a href={`/event/${event.id}`} className="group block overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-blue-500/30">
    <img 
      src={event.img}
      alt={event.title}
      className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-110" 
    />
    {/* We could add a title overlay if needed */}
  </a>
);

export default HomePage;
