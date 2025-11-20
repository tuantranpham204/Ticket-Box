import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEventByEventId } from '../hooks/useEventHook';
import { useGetTicketsByEventId, useLowestTicketPriceByEventId } from '../hooks/useTicketHook'; 
import { MapPin, Calendar, Clock, Loader2, AlertCircle, ArrowRight, Building2, Map } from 'lucide-react';
import EventCard from '../components/eventCard'; // For "You may also like"

// --- Mock Data for "You may also like" ---
// In a real app, this might come from a `useRelatedEvents` hook
const mockRelatedEvents = [
  { id: 16, title: "[FLOWER 1969'S] WORKSHOP SOLID PERFUME", date: "08 Tháng 11, 2025", imageUrl: "https://placehold.co/400x300/d0c0b0/333?text=Solid+Perfume", price: "279.000đ" },
  { id: 17, title: "COUNTDOWN PARTY 2026 - SAIGON'S BIGGEST BOLLYWOOD BASH", date: "31 Tháng 12, 2025", imageUrl: "https://placehold.co/400x300/a02040/fff?text=BOLLYWOOD+BASH", price: "500.000đ" },
  { id: 18, title: "VIEWING PARTY Chung Kết Tổng CKTG 2025", date: "09 Tháng 11, 2025", imageUrl: "https://placehold.co/400x300/201040/fff?text=VIEWING+PARTY", price: "299.000đ" },
  { id: 19, title: "COUNTDOWN PARTY 2026 - PHUQUOC'S BIGGEST BOLLYWOOD BASH", date: "31 Tháng 12, 2025", imageUrl: "https://placehold.co/400x300/a02040/fff?text=BOLLYWOOD+BASH", price: "500.000đ" },
];

const LoadingSpinner = () => (
  <div className="flex min-h-[50vh] items-center justify-center text-white">
    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
    <span className="ml-4 text-xl">Loading Event Details...</span>
  </div>
);
const ErrorDisplay = ({ message }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-red-700 bg-red-900/20 p-8 text-white">
    <AlertCircle className="h-12 w-12 text-red-500" />
    <h2 className="mt-4 text-2xl font-semibold">Error Loading Event</h2>
    <p className="mt-2 text-gray-300">{message || "An unknown error occurred."}</p>
    <Link to="/" className="mt-6 rounded-full bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700">
      Back to Home
    </Link>
  </div>
);
const AddressDisplay = ({ addressString, compact = false }) => {
  // Parse the address JSON safely
  const addressData = React.useMemo(() => {
    if (!addressString) return null;
    try {
      // Try parsing as JSON
      const parsed = JSON.parse(addressString);
      // Basic validation to ensure it has expected keys
      if (parsed && typeof parsed === 'object' && (parsed.venue || parsed.location)) {
        return parsed;
      }
    } catch (e) {
      // If parsing fails, treat it as a plain legacy string
      return { location: addressString, venue: null, city: null };
    }
    return { location: addressString, venue: null, city: null };
  }, [addressString]);

  if (!addressData) return <span>Location TBD</span>;

  // Compact View (for Sticky Header)
  if (compact) {
    return (
      <div className="flex flex-col text-xs sm:text-sm">
        {addressData.venue && (
          <span className="font-bold text-white">{addressData.venue}</span>
        )}
        <span className="truncate text-gray-400">
          {addressData.location}
          {addressData.city ? `, ${addressData.city}` : ''}
        </span>
      </div>
    );
  }

  // Full View (for Info Box)
  return (
    <div className="flex flex-col space-y-1">
      {addressData.venue && (
        <div className="flex items-start gap-2">
          <Building2 className="h-5 w-5 flex-shrink-0 text-blue-400 mt-0.5" />
          <div>
            <span className="block font-bold text-white">{addressData.venue}</span>
            <span className="text-sm text-gray-400">Venue</span>
          </div>
        </div>
      )}
      <div className="flex items-start gap-2">
        <MapPin className="h-5 w-5 flex-shrink-0 text-blue-400 mt-0.5" />
        <div>
          <span className="block text-gray-300">{addressData.location}</span>
          {addressData.city && <span className="text-sm text-gray-500">{addressData.city}</span>}
        </div>
      </div>
    </div>
  );
};

const EventDetailPage = () => {
  const { eventId } = useParams();
  const { 
    data: event, 
    isLoading: isLoadingEvent, 
    isError: isErrorEvent, 
    error: errorEvent 
  } = useEventByEventId(eventId);
  const { 
    data: tickets, 
    isLoading: isLoadingTickets, 
    isError: isErrorTickets, 
    error: errorTickets 
  } = useGetTicketsByEventId(eventId);
  const { 
    data: priceData, 
    isLoading: isLoadingPrice, 
    isError: isErrorPrice } = useLowestTicketPriceByEventId(eventId);

    // formatting helper
    const formatPrice = (price) => {
      if (price === null || price === undefined) return "TBD";
      return `${price.toLocaleString()} đ`;
    };
  
    let displayPrice;
    if (isLoadingPrice) {
      displayPrice = "Loading...";
    } else if (isErrorPrice || priceData === null) {
      displayPrice = "Contact for price";
    } else {
      displayPrice = priceData ? formatPrice(priceData.lowestPrice) : '';
    }

  


  if (isLoadingEvent) {
    return (
      <div className="bg-gray-900 py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isErrorEvent) {
    return (
      <div className="bg-gray-900 py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <ErrorDisplay message={errorEvent?.message} />
        </div>
      </div>
    );
  }


  const mockEvent = {
    ...event,
    title: event?.name || "Event Title",
    bannerUrl: event?.banner?.url || "https://placehold.co/1200x500/1a1a1a/ffffff?text=Event+Banner",
    organizer: {
      name: event?.orgName || "Organization Name",
      description: event?.orgInfo || "Nơi âm nhạc và cảm xúc thăng hoa",
      logoUrl: "https://placehold.co/200x200/ffffff/111?text=MAY"
    },
    pdfInfoUrl: event?.info || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" // Using a dummy PDF
  };

return (
    <div className="bg-gray-900 text-white">
      {/* --- Sticky Header --- */}
      <div className="sticky top-20 z-30 border-b border-gray-700 bg-gray-900/90 py-3 backdrop-blur-md">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4">
          <div className="flex flex-col overflow-hidden">
            <h1 className="truncate text-lg font-bold">{mockEvent.title}</h1>
            {/* Use Compact Address Display */}
            <div className="mt-1 flex items-center text-gray-400">
              <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0" />
              <AddressDisplay addressString={mockEvent.address} compact={true} />
            </div>
          </div>
          <button className="ml-4 flex-shrink-0 rounded-full bg-green-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-700">
            Buy Tickets
          </button>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        
        <div className="relative mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Banner */}
          <div className="overflow-hidden rounded-lg lg:col-span-2">
            <img 
              src={mockEvent.bannerUrl} 
              alt={mockEvent.title}
              className="h-auto w-full object-cover"
              onError={(e) => e.currentTarget.src = 'https://placehold.co/1200x500/1a1a1a/ffffff?text=Event+Banner'}
            />
          </div>

          {/* Sticky Info Box */}
          <div className="relative lg:col-span-1">
            <div className="sticky top-32 rounded-lg bg-gray-800 p-6 shadow-lg">
              <h2 className="text-2xl font-bold">{mockEvent.title}</h2>
              
              <div className="mt-6 space-y-4">
                {/* Date */}
                <div className="flex items-center space-x-3 text-gray-300">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <div>
                    <span className="block font-medium text-white">Date</span>
                    <span>{new Date(mockEvent.startDate).toLocaleDateString()} - {new Date(mockEvent.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Time */}
                <div className="flex items-center space-x-3 text-gray-300">
                  <Clock className="h-5 w-5 text-blue-400" />
                   <div>
                    <span className="block font-medium text-white">Time</span>
                    <span>{new Date(mockEvent.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Full Address Display */}
                <div className="border-t border-gray-700 pt-4">
                   <AddressDisplay addressString={mockEvent.address} compact={false} />
                </div>
              </div>

              <div className="my-6 border-t border-gray-600"></div>

              <p className="text-sm text-gray-400">Starting from</p>
              <p className="text-3xl font-bold text-green-400">
                {displayPrice}
              </p>

              <button className="mt-6 w-full rounded-full bg-green-600 py-3 text-lg font-semibold text-white transition-colors hover:bg-green-700">
                Buy Tickets
              </button>
            </div>
          </div>
        </div>

        {/* --- Bottom Sections (Unchanged) --- */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Ticket List */}
            <div id="tickets" className="mb-12 rounded-lg bg-gray-800 shadow-lg">
              <h3 className="border-b border-gray-700 p-6 text-xl font-semibold">Ticket Information</h3>
              <div className="flex flex-col">
                {isLoadingTickets && <p className="p-6 text-gray-400">Loading tickets...</p>}
                {isErrorTickets && <p className="p-6 text-red-400">Error loading tickets: {errorTickets.message}</p>}
                {tickets && tickets?.pageContent?.map((ticket) => (
                  <div key={ticket.id} className="flex flex-col items-center justify-between border-b border-gray-700 p-4 last:border-b-0 md:flex-row">
                    <div className="mb-4 w-full md:mb-0 md:w-auto">
                      <h4 className="text-lg font-semibold text-white">{ticket.type}</h4>
                      <p className="text-sm text-gray-400">
                        Sale ends: {new Date(ticket.endSale).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex w-full items-center justify-between space-x-4 md:w-auto md:justify-end">
                      <span className="text-xl font-bold text-green-400">{ticket.unitPrice.toLocaleString()} đ</span>
                      <button className="rounded-full bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700">
                        Buy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Introduction / PDF Embed */}
            <div id="introduction" className="mb-12 rounded-lg bg-gray-800 p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-semibold">Introduction</h3>
              <p className="mb-4 text-gray-300">{mockEvent.orgInfo}</p>
              <div className="h-[800px] w-full overflow-hidden rounded-lg border border-gray-700">
                <iframe 
                  src={mockEvent.pdfInfoUrl} 
                  title="Event Details"
                  width="100%"
                  height="100%"
                  className="bg-white"
                >
                  Your browser does not support PDFs. Please download the PDF to view it.
                </iframe>
              </div>
            </div>

            {/* Organizer Info */}
            <div id="organizer" className="mb-12 rounded-lg bg-gray-800 p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-semibold">Organizer</h3>
              <div className="flex items-center">
                <img 
                  src={mockEvent.organizer.logoUrl} 
                  alt={mockEvent.organizer.name}
                  className="h-24 w-24 rounded-full border-2 border-gray-700 object-cover"
                />
                <div className="ml-6">
                  <h4 className="text-lg font-bold text-white">{mockEvent.organizer.name}</h4>
                  <p className="text-gray-400">{mockEvent.organizer.description}</p>
                  <button className="mt-2 text-sm font-semibold text-blue-400 hover:underline">
                    Follow
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column: Ad */}
          <div className="relative lg:col-span-1">
            <div className="sticky top-32">
              <h3 className="mb-4 text-xl font-semibold">Sponsors</h3>
              <div className="overflow-hidden rounded-lg shadow-lg">
                <img 
                  src="https://placehold.co/400x600/6a0dad/ffffff?text=TPBank+Ad" 
                  alt="Sponsor Ad" 
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        <div className="mt-12 border-t border-gray-700 pt-12">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-white">You may also like</h3>
            <Link to="/events/all" className="flex items-center text-sm text-blue-400 hover:underline">
              See more <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {mockRelatedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetailPage;