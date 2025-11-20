import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Loader2 } from 'lucide-react';
import { useLowestTicketPriceByEventId } from '../hooks/useTicketHook';

const EventCard = ({ event }) => {
  // Only fetch if we have an ID and no pre-supplied price
  const shouldFetch = !!event.id && !event.price;
  
  const { data: priceData, isLoading, isError } = useLowestTicketPriceByEventId(
    shouldFetch ? event.id : null
  );

  // formatting helper
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "TBD";
    return `${price.toLocaleString()} đ`;
  };

  // Determine what price to show
  let displayPrice;
  if (event.price) {
    displayPrice = event.price; // Use prop if available (e.g. mock data)
  } else if (isLoading) {
    displayPrice = "Loading...";
  } else if (isError || priceData === null) {
    displayPrice = "Contact for price";
  } else {
    displayPrice = priceData ? formatPrice(priceData.lowestPrice) : '';
  }

  return (
    <Link 
      to={`/event/${event.id}`} 
      className="group block w-full flex-shrink-0 overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-transform hover:-translate-y-1"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
          onError={(e) => e.currentTarget.src = 'https://placehold.co/400x300/111/fff?text=Image+Error'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-60"></div>
      </div>
      
      <div className="p-4">
        <h4 className="truncate text-base font-bold text-white group-hover:text-blue-400">
          {event.title}
        </h4>
        
        <div className="mt-2 flex items-center text-sm text-green-400">
          <DollarSign className="mr-1 h-4 w-4" />
          {isLoading && !event.price ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span>From {displayPrice}</span>
          )}
        </div>
        
        {event.date && (
          <div className="mt-1 flex items-center text-sm text-gray-400">
            <Calendar className="mr-1 h-4 w-4" />
            <span>{event.date}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default EventCard;