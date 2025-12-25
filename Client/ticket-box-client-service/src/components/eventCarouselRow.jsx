import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import EventCard from './eventCard';

/**
 * Reusable horizontal scrolling row for events
 */
const EventCarouselRow = ({ title, events, link = "#" }) => (
  <div className="mb-20">
    <div className="mb-8 flex items-end justify-between px-2">
      <h3 className="text-3xl font-black text-white tracking-tighter">{title}</h3>
      <Link to={link} className="flex items-center gap-2 rounded-full bg-white/5 px-5 py-2 text-xs font-bold text-gray-400 hover:bg-blue-500 hover:text-white transition-all border border-white/10 backdrop-blur-md">
        Explore more <ArrowRight className="h-4 w-4" />
      </Link>
    </div>

    {/* Container for horizontal scrolling */}
    <div className="flex flex-nowrap gap-6 overflow-x-auto pb-8 scrollbar-hide px-2">
      {events.map((event) => (
        <div key={event.id} className="w-[300px] flex-shrink-0">
          <EventCard event={event} />
        </div>
      ))}
    </div>
  </div>
);

export default EventCarouselRow;