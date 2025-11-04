import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign } from 'lucide-react';

/**
 * Reusable Event Card
 * This is the correct syntax for a default export.
 */
const EventCard = ({ event }) => (
  <Link 
    to={`/event/${event.id}`} 
    key={event.id}
    className="group w-full flex-shrink-0 overflow-hidden rounded-lg bg-gray-800 shadow-lg"
  >
    <img 
      src={event.imageUrl} 
      alt={event.title} 
      className="h-48 w-full object-cover" 
      onError={(e) => e.currentTarget.src = 'https://placehold.co/400x300/111/fff?text=Image+Error'}
    />
    <div className="p-4">
      <h4 className="truncate text-base font-bold text-white group-hover:text-blue-400">{event.title}</h4>
      {event.price && (
        <div className="mt-2 flex items-center text-sm text-green-400">
          <DollarSign className="mr-1 h-4 w-4" />
          {/* Using "From" as per your code snippet */}
          <span>From {event.price}</span>
        </div>
      )}
      {event.date && (
        <div className="mt-1 flex items-center text-sm text-gray-400">
          <Calendar className="mr-1 h-4 w-4" />
          <span>{event.date}</span>
        </div>
      )}
    </div>
  </Link>
);

export default EventCard;
