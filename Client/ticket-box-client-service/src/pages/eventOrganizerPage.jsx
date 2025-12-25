import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useEventsByCreator, useCancelEventMutation } from "../hooks/useEventHook";
import { EVENT_STATUS, formatEventDate } from "../utils/util";
import { toast } from "sonner";
import {
    PlusCircle,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    Eye,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar,
    Edit2,
    Trash2
} from "lucide-react";

const EventOrganizerPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [selectedStatus, setSelectedStatus] = useState(EVENT_STATUS.UPCOMING);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const {
        data: eventsData,
        isLoading,
        isError,
        error
    } = useEventsByCreator(user?.id, selectedStatus, currentPage, pageSize);

    const cancelEventMutation = useCancelEventMutation();

    const handleCancelEvent = async (eventId) => {
        if (window.confirm("Are you sure you want to cancel this event creation request? This action cannot be undone.")) {
            try {
                await cancelEventMutation.mutateAsync(eventId);
                toast.success("Event canceled successfully!");
            } catch (err) {
                toast.error(err.message || "Failed to cancel event.");
            }
        }
    };

    const statusTabs = [
        { id: EVENT_STATUS.PENDING, label: "Pending", icon: Clock, color: "text-yellow-400" },
        { id: EVENT_STATUS.UPCOMING, label: "Upcoming", icon: CheckCircle, color: "text-green-400" },
        { id: EVENT_STATUS.RUNNING, label: "Running", icon: CheckCircle, color: "text-blue-400" },
        { id: EVENT_STATUS.DECLINED, label: "Declined", icon: XCircle, color: "text-red-400" },
        { id: EVENT_STATUS.ENDED, label: "Ended", icon: Clock, color: "text-gray-400" },
        { id: EVENT_STATUS.CANCELED, label: "Canceled", icon: XCircle, color: "text-gray-500" },
    ];

    const events = eventsData?.pageContent || [];
    const totalPages = eventsData?.totalPages || 1;

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-12 text-white lighting-effect-purple">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Management Console</h1>
                        <p className="text-gray-500 mt-2 font-medium tracking-tight uppercase text-xs">Orchestrate your active event portfolio and monitor deployment status.</p>
                    </div>
                    <Link
                        to="/create-event"
                        className="flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-black text-gray-950 hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-2xl shadow-white/5"
                    >
                        <PlusCircle className="h-5 w-5" />
                        CREATE NEW EVENT
                    </Link>
                </div>

                {/* --- Tabs --- */}
                <div className="mb-10 flex space-x-2 border-b border-white/5 pb-6 overflow-x-auto scrollbar-hide">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setSelectedStatus(tab.id);
                                setCurrentPage(1);
                            }}
                            className={`flex items-center space-x-3 whitespace-nowrap rounded-2xl px-6 py-3 transition-all duration-300 ${selectedStatus === tab.id
                                ? "liquid-glass text-white shadow-xl scale-105"
                                : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                                }`}
                        >
                            <tab.icon className={`h-5 w-5 ${selectedStatus === tab.id ? tab.color : "opacity-50"}`} />
                            <span className="font-black text-xs uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* --- Content --- */}
                {isLoading ? (
                    <div className="flex h-96 flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">Loading events...</span>
                    </div>
                ) : isError ? (
                    <div className="rounded-[2.5rem] liquid-glass p-12 text-center border border-red-500/20">
                        <XCircle className="h-16 w-16 text-red-500/50 mx-auto mb-6" />
                        <h3 className="text-2xl font-black tracking-tighter text-red-400">Error</h3>
                        <p className="mt-2 text-gray-500 font-medium">{error?.message || "An unexpected error occurred."}</p>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-8">
                        <div className="overflow-hidden rounded-[2.5rem] liquid-glass shadow-2xl border border-white/5 lighting-effect">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] table-auto text-left text-sm text-gray-400">
                                    <thead className="bg-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">
                                        <tr>
                                            <th scope="col" className="px-8 py-5 w-[40%]">Event Name</th>
                                            <th scope="col" className="px-8 py-5 w-[20%]">Date & Time</th>
                                            <th scope="col" className="px-8 py-5 w-[25%]">Location</th>
                                            <th scope="col" className="px-8 py-5 text-center w-[15%]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {events.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-24 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-600">
                                                        <Calendar className="h-16 w-16 mb-6 opacity-10" />
                                                        <p className="text-xl font-black tracking-tighter">No Events Found</p>
                                                        <p className="text-sm font-medium mt-1">Create your first event to begin.</p>
                                                        <Link to="/create-event" className="text-blue-400 font-black text-xs uppercase tracking-widest hover:text-blue-300 mt-6 block">Create your first event</Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            events.map((event) => (
                                                <tr key={event.id} className="hover:bg-white/5 transition-all duration-300 group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-6">
                                                            <div className="h-24 w-24 overflow-hidden rounded-3xl bg-gray-900 flex-shrink-0 shadow-2xl ring-1 ring-white/10 group-hover:ring-blue-500/30 transition-all">
                                                                <img
                                                                    src={event.img?.url || event.banner?.url || "https://placehold.co/100x100/333/fff?text=No+Image"}
                                                                    alt={event.name}
                                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-white text-lg tracking-tighter leading-tight mb-1 group-hover:text-blue-400 transition-colors uppercase">{event.name}</span>
                                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Event ID: {event.id.toString().substring(0, 12)}...</span>
                                                                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
                                                                    {event.category?.name || "General"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center text-white font-bold tracking-tight">
                                                                <Calendar className="mr-2 h-4 w-4 text-blue-400/70" />
                                                                {formatEventDate(event.startDate)}
                                                            </div>
                                                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-6">
                                                                {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-start max-w-[220px]">
                                                            <MapPin className="mr-3 h-4 w-4 text-purple-500/70 flex-shrink-0 mt-0.5" />
                                                            <span className="text-gray-400 text-sm font-medium tracking-tight line-clamp-2">
                                                                {(() => {
                                                                    try {
                                                                        const parsed = JSON.parse(event.address);
                                                                        return parsed.venue || parsed.location || event.address;
                                                                    } catch {
                                                                        return event.address;
                                                                    }
                                                                })()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <Link
                                                                to={`/event/${event.id}`}
                                                                className="p-3 rounded-2xl bg-white/5 text-gray-400 hover:bg-white hover:text-gray-950 transition-all shadow-lg hover:scale-110 active:scale-95 border border-white/5"
                                                                title="View Event"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </Link>

                                                            {event.status === EVENT_STATUS.PENDING && (
                                                                <>
                                                                    <Link
                                                                        to={`/update-event/${event.id}`}
                                                                        className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95 border border-blue-500/20"
                                                                        title="Edit Event"
                                                                    >
                                                                        <Edit2 className="h-5 w-5" />
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleCancelEvent(event.id)}
                                                                        className="p-3 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95 border border-red-500/20"
                                                                        title="Cancel Event"
                                                                        disabled={cancelEventMutation.isPending}
                                                                    >
                                                                        {cancelEventMutation.isPending ? (
                                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                                        ) : (
                                                                            <Trash2 className="h-5 w-5" />
                                                                        )}
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* --- Pagination Controls --- */}
                        {events.length > 0 && (
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                                    Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="flex items-center rounded-2xl liquid-glass px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed border border-white/5"
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        PREV
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages}
                                        className="flex items-center rounded-2xl liquid-glass px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed border border-white/5"
                                    >
                                        NEXT
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventOrganizerPage;
