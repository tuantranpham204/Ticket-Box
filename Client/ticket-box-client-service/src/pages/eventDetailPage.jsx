import React from "react";
import { useParams, Link } from "react-router-dom";
import { useEventByEventId, useEventsByCategory } from "../hooks/useEventHook";
import { useAuthStore } from "../store/useAuthStore";
import {
  useGetTicketsByEventId,
  useLowestTicketPriceByEventId,
} from "../hooks/useTicketHook";
import { useAddToCartMutation } from "../hooks/useCartHook";
import { useUIStore } from "../store/useUiStore";
import {
  MapPin,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  ArrowRight,
  Building2,
  Globe,
  Video,
  Info,
  ExternalLink,
  ShieldCheck,
  FileQuestion
} from "lucide-react";
import EventCard from "../components/eventCard";
import { EVENT_STATUS, formatEventDate } from "../utils/util";

const getStatusConfig = (status) => {
  switch (status) {
    case EVENT_STATUS.UPCOMING:
      return { label: "Upcoming", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    case EVENT_STATUS.RUNNING:
      return { label: "Running", color: "text-green-400 bg-green-500/10 border-green-500/20" };
    case EVENT_STATUS.ENDED:
      return { label: "Ended", color: "text-gray-400 bg-gray-500/10 border-gray-500/20" };
    case EVENT_STATUS.PENDING:
      return { label: "Pending", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
    case EVENT_STATUS.CANCELED:
      return { label: "Canceled", color: "text-red-400 bg-red-500/10 border-red-500/20" };
    case EVENT_STATUS.DECLINED:
      return { label: "Declined", color: "text-red-600 bg-red-600/10 border-red-600/20" };
    default:
      return { label: "Unknown", color: "text-gray-500 bg-gray-500/10 border-gray-500/20" };
  }
};

const LoadingSpinner = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center text-white">
    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
    <span className="mt-4 text-xl font-medium">Loading Event Details...</span>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-red-700/50 bg-red-900/10 backdrop-blur-xl p-8 text-white">
    <AlertCircle className="h-12 w-12 text-red-500" />
    <h2 className="mt-4 text-2xl font-bold tracking-tighter">Error Loading Event</h2>
    <p className="mt-2 text-gray-400 max-w-sm text-center">
      {message || "An unknown error occurred."}
    </p>
    <Link
      to="/"
      className="mt-8 rounded-full bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700 transition-all active:scale-95"
    >
      Back to Home
    </Link>
  </div>
);

const AddressDisplay = ({ addressString, compact = false }) => {
  const addressData = React.useMemo(() => {
    if (!addressString) return null;
    try {
      const parsed = JSON.parse(addressString);
      if (parsed && typeof parsed === "object" && (parsed.venue || parsed.location)) {
        return parsed;
      }
    } catch (e) {
      return { location: addressString, venue: null, city: null };
    }
    return { location: addressString, venue: null, city: null };
  }, [addressString]);

  if (!addressData) return <span>Location TBD</span>;
  if (compact) {
    return (
      <div className="flex flex-col text-xs sm:text-sm">
        {addressData.venue && (
          <span className="font-bold text-white leading-none mb-1">{addressData.venue}</span>
        )}
        <span className="truncate text-gray-400">
          {addressData.location}
          {addressData.city ? `, ${addressData.city}` : ""}
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col space-y-4">
      {addressData.venue && (
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-bold text-white leading-none">{addressData.venue}</span>
            <span className="text-[10px] uppercase font-black tracking-widest text-gray-600 mt-1 block">Venue Name</span>
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400">
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <span className="block text-gray-300 font-medium leading-tight">{addressData.location}</span>
          {addressData.city && (
            <span className="text-xs text-gray-500 font-medium mt-1 block">{addressData.city}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return "TBD";
  return `${price.toLocaleString()} đ`;
};

const EventDetailPage = () => {
  const { eventId } = useParams();
  const { data: event, isLoading: isLoadingEvent, isError: isErrorEvent, error: errorEvent } = useEventByEventId(eventId);
  const { data: tickets, isLoading: isLoadingTickets, isError: isErrorTickets, error: errorTickets } = useGetTicketsByEventId(eventId);
  const { data: priceData, isLoading: isLoadingPrice, isError: isErrorPrice } = useLowestTicketPriceByEventId(eventId);

  const addToCartMutation = useAddToCartMutation();
  const { user } = useAuthStore();
  const { openAuthModal } = useUIStore();

  const canAddToCart = event?.status === EVENT_STATUS.UPCOMING || event?.status === EVENT_STATUS.RUNNING;
  const statusConfig = getStatusConfig(event?.status);

  // Recommendations logic
  const { data: relatedData } = useEventsByCategory(
    event?.categoryId,
    [EVENT_STATUS.UPCOMING, EVENT_STATUS.RUNNING],
    1,
    5
  );

  const relatedEvents = React.useMemo(() => {
    if (!relatedData?.pageContent) return [];
    return relatedData.pageContent
      .filter(e => e.id.toString() !== eventId)
      .slice(0, 4)
      .map(e => ({
        id: e.id,
        title: e.name,
        imageUrl: e.img?.url || `https://placehold.co/400x300/111/fff?text=${e.name}`,
        date: e.startDate
      }));
  }, [relatedData, eventId]);

  const handleAddToCart = (ticketId) => {
    if (!canAddToCart) return;
    if (!user) {
      openAuthModal("login");
      return;
    }
    addToCartMutation.mutate({ ticketId, quantity: 1 });
  };

  const scrollToTickets = () => {
    if (!canAddToCart) return;
    const ticketSection = document.getElementById('tickets');
    if (ticketSection) {
      ticketSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  let displayPrice;
  if (isLoadingPrice) {
    displayPrice = "Loading...";
  } else if (isErrorPrice || priceData === null) {
    displayPrice = "TBD";
  } else {
    displayPrice = priceData ? formatPrice(priceData.lowestPrice) : "TBD";
  }

  if (isLoadingEvent) {
    return (
      <div className="bg-gray-950 min-h-screen pt-20">
        <div className="container mx-auto max-w-7xl px-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isErrorEvent) {
    return (
      <div className="bg-gray-950 min-h-screen pt-20">
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
    thumbnailUrl: event?.img?.url || "https://placehold.co/400x400/111/fff?text=Thumbnail",
    online: event?.online,
    organizer: {
      name: event?.orgName || "Organization Name",
      description: event?.orgInfo || "Organization Information",
      logoUrl: "https://placehold.co/200x200/ffffff/111?text=ORG",
    },
    pdfInfoUrl: (event?.info?.url ? event.info.url.replace(/^http:\/\//i, 'https://') : null) || null,
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* --- Sticky Header --- */}
      <div className="sticky top-20 z-30 border-b border-gray-800/50 bg-gray-950/80 py-3 backdrop-blur-md transition-all duration-300">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4">
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-3">
              <h1 className="truncate text-lg font-black tracking-tight">{mockEvent.title}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest border ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="mt-1 flex items-center text-gray-500">
              {mockEvent.online ? (
                <div className="flex items-center">
                  <Globe className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Online Experience</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <MapPin className="mr-1.5 h-3.5 w-3.5 text-gray-600" />
                  <AddressDisplay addressString={mockEvent.address} compact={true} />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={scrollToTickets}
            disabled={!canAddToCart}
            className={`ml-4 flex-shrink-0 rounded-full px-8 py-2.5 text-sm font-black transition-all ${canAddToCart ? "bg-white text-gray-950 hover:bg-blue-400 hover:text-white shadow-xl shadow-white/5 active:scale-95" : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
              }`}
          >
            {canAddToCart ? "Get Tickets" : "Sale Closed"}
          </button>
        </div>
      </div>

      {/* --- Full-width Horizontal Banner --- */}
      <div className="relative h-[400px] w-full overflow-hidden lighting-effect border-b border-white/5">
        <img
          src={mockEvent.bannerUrl}
          alt={mockEvent.title}
          className="h-full w-full object-cover opacity-60"
          onError={(e) => (e.currentTarget.src = "https://placehold.co/1200x500/111/fff?text=Banner+Unavailable")}
        />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-gray-950 to-transparent"></div>
      </div>

      <div className="container relative mx-auto max-w-7xl px-4 py-12">
        {/* --- Hero Profile Section --- */}
        <div className="relative -mt-40 mb-16 flex flex-col items-center sm:flex-row sm:items-end gap-8">
          {/* Square Thumbnail with Status */}
          <div className="relative h-64 w-64 flex-shrink-0 overflow-hidden rounded-[2.5rem] shadow-2xl ring-4 ring-gray-950 lighting-effect translate-z-0">
            <img
              src={mockEvent.thumbnailUrl}
              alt={mockEvent.title}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              onError={(e) => (e.currentTarget.src = "https://placehold.co/400x400/111/fff?text=Thumbnail")}
            />
            {/* Status Badge at Bottom-Left */}
            <div className={`absolute bottom-4 left-4 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl ${statusConfig.color} shadow-2xl`}>
              {statusConfig.label}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="mb-4 flex flex-wrap justify-center sm:justify-start gap-4">
              {mockEvent.online && (
                <span className="flex items-center gap-2 text-[10px] font-black tracking-widest text-blue-400 uppercase">
                  <Video className="h-4 w-4" /> Virtual Event
                </span>
              )}
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-none mb-6 drop-shadow-lg">{mockEvent.title}</h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="font-bold text-white tracking-tight">{formatEventDate(mockEvent.startDate)}</span>
              </div>
              {!mockEvent.online && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <AddressDisplay addressString={mockEvent.address} compact={true} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-[2rem] liquid-glass p-8 border border-white/5 group hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-2xl bg-blue-500/10 p-4 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-black tracking-widest text-gray-600">Event Interval</span>
                    <span className="text-lg font-black text-white">{formatEventDate(mockEvent.startDate)}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500">to {formatEventDate(mockEvent.endDate)}</p>
              </div>

              <div className="rounded-[2rem] liquid-glass p-8 border border-white/5 group hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-2xl bg-purple-500/10 p-4 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-black tracking-widest text-gray-600">Start Time</span>
                    <span className="text-lg font-black text-white">
                      {new Date(mockEvent.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500">Local time execution</p>
              </div>
            </div>

            {/* Tickets */}
            <div id="tickets" className="overflow-hidden rounded-[2.5rem] liquid-glass shadow-2xl border border-white/5">
              <header className="border-b border-white/5 bg-white/5 p-8 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tighter">Ticket Categories</h3>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <ShieldCheck className="h-4 w-4 text-green-500" /> Secure Checkout
                </div>
              </header>
              <div className="p-2">
                {isLoadingTickets && <div className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Authenticating Ticket Availability...</div>}
                {isErrorTickets && <div className="p-12 text-center text-red-400 font-bold">Failed to load tickets: {errorTickets.message}</div>}
                {tickets?.pageContent?.length === 0 && <div className="p-12 text-center text-gray-500">No tickets currently available.</div>}
                {tickets && tickets?.pageContent?.map((ticket) => (
                  <div key={ticket.id} className="group flex flex-col items-center justify-between gap-6 p-8 transition-all hover:bg-white/5 rounded-[1.5rem] md:flex-row hover:shadow-inner">
                    <div className="w-full md:w-auto">
                      <div className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2 border border-blue-500/20">{ticket.type}</div>
                      <h4 className="text-xl font-black tracking-tight text-white mb-1">{ticket.type}</h4>
                      <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Clock className="h-3 w-3" /> Sale ends {formatEventDate(ticket.endSale)}
                      </p>
                    </div>
                    <div className="flex w-full items-center justify-between gap-8 md:w-auto">
                      <div className="text-right">
                        <span className="block text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Unit Price</span>
                        <span className="text-2xl font-black text-white">{ticket.unitPrice.toLocaleString()} đ</span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(ticket.id)}
                        disabled={addToCartMutation.isPending || !canAddToCart}
                        className={`rounded-2xl px-8 py-3.5 font-black text-sm tracking-tight transition-all shadow-xl ${canAddToCart && !addToCartMutation.isPending ? "bg-gray-800 text-white hover:bg-blue-500 hover:scale-105 active:scale-95 border border-white/10" : "bg-gray-900/50 text-gray-600 cursor-not-allowed"
                          }`}
                      >
                        {addToCartMutation.isPending ? "Syncing..." : (canAddToCart ? "Add to Cart" : "Unavailable")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content / Info */}
            <div id="introduction" className="rounded-[2.5rem] liquid-glass p-10 shadow-2xl border border-white/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-400 shadow-lg border border-orange-500/10">
                  <Info className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter">About the Event</h3>
              </div>
              <p className="mb-10 text-lg leading-relaxed text-gray-300 font-medium">{mockEvent.orgInfo}</p>

              {mockEvent.pdfInfoUrl ? (
                <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 bg-gray-950/50 shadow-2xl transition-all duration-500 hover:border-blue-500/30">
                  <div className="aspect-[3/4] lg:aspect-[16/10] w-full overflow-hidden">
                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(mockEvent.pdfInfoUrl) ? (
                      <img src={mockEvent.pdfInfoUrl} alt="Event Document Preview" className="h-full w-full object-contain p-4" />
                    ) : (
                      <iframe src={mockEvent.pdfInfoUrl} title="Event Details" width="100%" height="100%" className="bg-white grayscale hover:grayscale-0 transition-all duration-700"></iframe>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-950 p-8 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Digital Brochure</span>
                    <a href={mockEvent.pdfInfoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-black uppercase transition-all hover:bg-blue-500 active:scale-95">
                      View Full File <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-[2rem] border border-white/5 bg-white/5 space-y-4">
                  <FileQuestion className="h-12 w-12 text-gray-700 mx-auto" />
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">No additional documents provided</p>
                </div>
              )}
            </div>

            {/* Organizer */}
            <div id="organizer" className="rounded-[2.5rem] liquid-glass p-10 shadow-2xl border border-white/5 hover:border-blue-500/20 transition-colors">
              <h3 className="mb-8 text-2xl font-black tracking-tighter">Hosted by</h3>
              <div className="flex flex-col sm:flex-row items-center gap-10">
                <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-br from-blue-500/30 to-purple-500/30 shadow-2xl">
                  <img src={mockEvent.organizer.logoUrl} alt={mockEvent.organizer.name} className="h-32 w-32 rounded-[2.4rem] object-cover bg-gray-900 border-4 border-gray-950" />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">{mockEvent.organizer.name}</h4>
                  <p className="text-gray-400 font-medium leading-relaxed max-w-lg">{mockEvent.organizer.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Events Section - Now in the "Empty Space" */}
          {relatedEvents.length > 0 && (
            <div className="lg:col-span-2 mt-8">
              <div className="rounded-[2.5rem] liquid-glass p-10 shadow-2xl border border-white/5">
                <div className="mb-10 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2">Curated for you</p>
                    <h3 className="text-3xl font-black tracking-tighter text-white uppercase">You may also like</h3>
                  </div>
                  <Link
                    to={`/category/${event?.categoryId}`}
                    className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                  >
                    View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {relatedEvents.map((e) => (
                    <div key={e.id} className="transform transition-all active:scale-95">
                      <EventCard event={e} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sidebar */}
          <div className="relative lg:col-span-1 space-y-8">
            <div className="sticky top-40 space-y-8">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 mb-6 px-4">Trusted Partner</h3>
                <div className="overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/5 group translate-z-0">
                  <img src="https://placehold.co/400x600/111/fff?text=STAY+TUNED" alt="Sponsor Ad" className="h-auto w-full transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              </div>

              <div className="liquid-glass rounded-[2rem] p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-white">Ticket Guarantee</h4>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Your purchase is safe with us. Authentic tickets, guaranteed delivery, and priority support.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetailPage;
