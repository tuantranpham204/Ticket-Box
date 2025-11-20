import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import EventCard from './eventCard';

/**
 * Reusable horizontal scrolling row for events
 */
const EventCarouselRow = ({ title, events, link = "#" }) => (
  <div className="mb-12">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
      <Link to={link} className="flex items-center text-sm text-blue-400 hover:underline">
        See more <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </div>
    
    {/* Container for horizontal scrolling */}
    <div className="flex flex-nowrap space-x-4 overflow-x-auto pb-4">
      {events.map((event) => (
        // Set a fixed width and prevent shrinking
        <div key={event.id} className="w-[280px] flex-shrink-0">
          <EventCard event={event} />
        </div>
      ))}
    </div>
  </div>
);

export default EventCarouselRow;