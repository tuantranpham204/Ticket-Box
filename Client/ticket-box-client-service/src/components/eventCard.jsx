import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Loader2 } from 'lucide-react';
import { useLowestTicketPriceByEventId } from '../hooks/useTicketHook';
import { formatEventDate } from '../utils/util';

const EventCard = ({ event }) => {
  const shouldFetch = !!event.id && !event.price;

  const { data: priceData, isLoading, isError } = useLowestTicketPriceByEventId(
    shouldFetch ? event.id : null
  );

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "TBD";
    return `${price.toLocaleString()} đ`;
  };

  let displayPrice;
  if (event.price) {
    displayPrice = event.price;
  } else if (isLoading) {
    displayPrice = "Loading...";
  } else if (isError || priceData === null) {
    displayPrice = "TBD";
  } else {
    displayPrice = priceData ? formatPrice(priceData.lowestPrice) : 'TBD';
  }

  return (
    <Link
      to={`/event/${event.id}`}
      className="group block w-full flex-shrink-0 overflow-hidden rounded-2xl bg-gray-900/40 backdrop-blur-md border border-white/5 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-blue-500/10"
    >
      <div className="relative h-48 w-full overflow-hidden translate-z-0">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 transform-gpu"
          onError={(e) => e.currentTarget.src = 'https://placehold.co/400x300/111/fff?text=Image+Error'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent"></div>
        <div className="absolute top-3 right-3 rounded-full bg-blue-500/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-blue-400 border border-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
          Hot Event
        </div>
      </div>

      <div className="relative z-10 -mt-px p-5">
        <h4 className="truncate text-lg font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight">
          {event.title}
        </h4>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm font-bold text-blue-400">
            {isLoading && !event.price ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <span>{displayPrice}</span>
            )}
          </div>

          {event.date && (
            <div className="flex items-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              <Calendar className="mr-1.5 h-3 w-3" />
              <span>{formatEventDate(event.date)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
