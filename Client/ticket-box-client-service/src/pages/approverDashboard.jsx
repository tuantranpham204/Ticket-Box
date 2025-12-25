import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useEventsByStatus } from "../hooks/useEventHook";
import { useApproveEventMutation, useDeclineEventMutation, useEventContract } from "../hooks/useApproverHook";
import { EVENT_STATUS, formatEventDate } from "../utils/util";
import {
    CheckCircle,
    XCircle,
    FileText,
    Clock,
    Loader2,
    Eye,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar,
    X,
    QrCode
} from "lucide-react";
import TicketScannerModal from "../components/TicketScannerModal";

const ContractModal = ({ eventId, onClose }) => {
    const { data: rawContractData, isLoading, isError, error } = useEventContract(eventId);

    // Ensure the URL is HTTPS to avoid mixed content warnings and improve security
    const contractUrl = rawContractData?.url ? rawContractData.url.replace(/^http:\/\//i, 'https://') : null;

    if (!eventId) return null;

    const isImage = (url) => {
        if (!url) return false;
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
            <div className="relative flex h-[85vh] w-full max-w-5xl flex-col rounded-[2.5rem] liquid-glass border border-white/10 shadow-2xl lighting-effect ring-1 ring-white/20">
                <div className="flex items-center justify-between border-b border-white/5 p-8">
                    <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Contract Preview</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden p-6 bg-gray-950/40">
                    {isLoading ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Loading Document...</span>
                        </div>
                    ) : isError ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center p-12 rounded-3xl bg-red-500/5 border border-red-500/20 max-w-md">
                                <XCircle className="mx-auto h-16 w-16 text-red-500/50 mb-6" />
                                <p className="text-xl font-black tracking-tighter text-red-400 uppercase">Error</p>
                                <p className="text-sm text-gray-500 mt-2 font-medium">{error?.message}</p>
                            </div>
                        </div>
                    ) : isImage(contractUrl) ? (
                        <div className="flex h-full w-full items-center justify-center overflow-auto rounded-2xl bg-black/20 ring-1 ring-white/5">
                            <img
                                src={contractUrl}
                                alt="Contract"
                                className="max-h-full max-w-full object-contain p-4"
                            />
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center bg-transparent p-12 text-center">
                            <div className="rounded-full bg-blue-500/10 p-8 mb-8 ring-1 ring-blue-500/20">
                                <FileText className="h-16 w-16 text-blue-400/50" />
                            </div>
                            <h3 className="mb-2 text-2xl font-black tracking-tighter text-white uppercase leading-none">Download Required</h3>
                            <p className="mb-10 max-w-md text-gray-500 font-medium tracking-tight">
                                This document cannot be previewed. Please download it to review.
                            </p>
                            <a
                                href={contractUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center rounded-2xl bg-white px-10 py-5 font-black text-gray-950 uppercase tracking-widest text-xs transition-all hover:bg-blue-500 hover:text-white shadow-2xl active:scale-95"
                            >
                                <FileText className="mr-3 h-5 w-5" />
                                VIEW CONTRACT
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ApproverDashboard = () => {
    const [selectedStatus, setSelectedStatus] = useState(EVENT_STATUS.PENDING);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedContractEventId, setSelectedContractEventId] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const pageSize = 10;

    // Use the hook with pagination
    const {
        data: eventsData,
        isLoading,
        isError,
        error
    } = useEventsByStatus(selectedStatus, currentPage, pageSize);

    const approveMutation = useApproveEventMutation();
    const declineMutation = useDeclineEventMutation();

    const handleApprove = (eventId) => {
        if (window.confirm("Are you sure you want to approve this event?")) {
            approveMutation.mutate(eventId);
        }
    };

    const handleDecline = (eventId) => {
        if (window.confirm("Are you sure you want to decline this event?")) {
            declineMutation.mutate(eventId);
        }
    };

    const statusTabs = [
        { id: EVENT_STATUS.PENDING, label: "Pending Approval", icon: Clock, color: "text-amber-400" },
        { id: EVENT_STATUS.UPCOMING, label: "Approved Events", icon: CheckCircle, color: "text-emerald-400" },
        { id: EVENT_STATUS.DECLINED, label: "Declined Events", icon: XCircle, color: "text-rose-400" },
        { id: EVENT_STATUS.ENDED, label: "Ended Events", icon: Clock, color: "text-gray-500" },
    ];

    const events = eventsData?.pageContent || [];

    let totalPages = eventsData?.totalPages;
    if (!totalPages || totalPages === 0) {
        if (eventsData?.totalElements) {
            totalPages = Math.ceil(eventsData.totalElements / pageSize);
        } else {
            totalPages = 1;
        }
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-12 text-white lighting-effect">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Approver Command Center</h1>
                        <p className="text-gray-500 mt-2 font-medium tracking-tight uppercase text-xs">Review and validate incoming event registrations for platform inclusion.</p>
                    </div>

                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className="group flex items-center gap-4 rounded-3xl liquid-glass px-8 py-4 border border-blue-500/20 shadow-2xl shadow-blue-500/10 hover:bg-blue-600 transition-all active:scale-95"
                    >
                        <div className="h-10 w-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                            <QrCode className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-start pr-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Entry Point</span>
                            <span className="text-sm font-black uppercase tracking-tighter text-blue-400 group-hover:text-white transition-colors">Validate Ticket</span>
                        </div>
                    </button>
                </div>

                {/* --- Tabs --- */}
                <div className="mb-10 flex space-x-2 border-b border-white/5 pb-6 overflow-x-auto scrollbar-hide">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setSelectedStatus(tab.id);
                                setCurrentPage(1); // Reset to page 1 on status change
                            }}
                            className={`flex items-center space-x-3 whitespace-nowrap rounded-2xl px-6 py-3 transition-all duration-300 ${selectedStatus === tab.id
                                ? "liquid-glass text-white shadow-xl scale-105"
                                : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                                }`}
                        >
                            <tab.icon className={`h-5 w-5 ${selectedStatus === tab.id ? tab.color : "opacity-30"}`} />
                            <span className="font-black text-[10px] uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* --- Content --- */}
                {isLoading ? (
                    <div className="flex h-96 flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Loading requests...</span>
                    </div>
                ) : isError ? (
                    <div className="rounded-[2.5rem] liquid-glass p-12 text-center border border-red-500/20">
                        <XCircle className="h-16 w-16 text-red-500/50 mx-auto mb-6" />
                        <h3 className="text-2xl font-black tracking-tighter text-red-400">Error</h3>
                        <p className="mt-2 text-gray-500 font-medium italic">{error?.message || "Failed to load approval requests."}</p>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-8">
                        <div className="overflow-hidden rounded-[2.5rem] liquid-glass shadow-2xl border border-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] table-auto text-left text-sm text-gray-400">
                                    <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                        <tr>
                                            <th scope="col" className="px-8 py-5 w-[40%]">Event Name</th>
                                            <th scope="col" className="px-8 py-5 w-[20%]">Organizer</th>
                                            <th scope="col" className="px-8 py-5 w-[10%]">Date</th>
                                            <th scope="col" className="px-8 py-5 w-[15%]">Category</th>
                                            <th scope="col" className="px-8 py-5 text-center w-[15%]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {events.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-24 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-600">
                                                        <Clock className="h-16 w-16 mb-6 opacity-10" />
                                                        <p className="text-xl font-black tracking-tighter uppercase italic">No Pending Requests</p>
                                                        <p className="text-sm font-medium mt-1">There are no events waiting for approval.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            events.map((event) => (
                                                <tr key={event.id} className="hover:bg-white/5 transition-all duration-300 group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-6">
                                                            <div className="h-24 w-24 overflow-hidden rounded-3xl bg-gray-900 flex-shrink-0 shadow-2xl ring-1 ring-white/10 group-hover:ring-emerald-500/30 transition-all">
                                                                <img
                                                                    src={event.banner?.url || "https://placehold.co/50x50/333/fff?text=Img"}
                                                                    alt={event.name}
                                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-white text-lg tracking-tighter uppercase leading-tight mb-1 group-hover:text-amber-400 transition-colors">{event.name}</span>
                                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Event ID: {event.id.toString().substring(0, 12)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 whitespace-nowrap align-middle">
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-black text-xs uppercase tracking-widest">{event.orgName}</span>
                                                            <span className="text-[10px] text-gray-600 mt-1 uppercase whitespace-normal">Organizer</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center text-white font-bold tracking-tight">
                                                                <Calendar className="mr-2 h-4 w-4 text-emerald-400/70" />
                                                                {formatEventDate(event.startDate)}
                                                            </div>
                                                            <span className="text-[10px] font-black text-gray-600 mt-1 uppercase tracking-widest leading-none ml-6">Start Date</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center max-w-xs truncate">
                                                            <MapPin className="mr-3 h-4 w-4 text-rose-500/70 flex-shrink-0" />
                                                            <span className="text-gray-400 text-sm font-medium tracking-tight line-clamp-1 uppercase">
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
                                                        <div className="flex items-center justify-center space-x-3">
                                                            <Link
                                                                to={`/event/${event.id}`}
                                                                className="p-3 rounded-2xl bg-white/5 text-gray-400 hover:bg-white hover:text-gray-950 transition-all shadow-lg hover:scale-110 active:scale-95 border border-white/5"
                                                                title="View Event"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </Link>

                                                            <button
                                                                onClick={() => setSelectedContractEventId(event.id)}
                                                                className="p-3 rounded-2xl bg-white/5 text-gray-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95 border border-white/5"
                                                                title="View Contract"
                                                            >
                                                                <FileText className="h-5 w-5" />
                                                            </button>

                                                            {selectedStatus === EVENT_STATUS.PENDING && (
                                                                <div className="flex gap-2 pl-4 border-l border-white/5">
                                                                    <button
                                                                        onClick={() => handleApprove(event.id)}
                                                                        disabled={approveMutation.isPending}
                                                                        className="h-11 w-11 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95 border border-emerald-500/20"
                                                                        title="Approve"
                                                                    >
                                                                        {approveMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDecline(event.id)}
                                                                        disabled={declineMutation.isPending}
                                                                        className="h-11 w-11 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95 border border-rose-500/20"
                                                                        title="Decline"
                                                                    >
                                                                        {declineMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                                                                    </button>
                                                                </div>
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
                                        disabled={currentPage === totalPages}
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

                {/* Contract Modal */}
                {selectedContractEventId && (
                    <ContractModal
                        eventId={selectedContractEventId}
                        onClose={() => setSelectedContractEventId(null)}
                    />
                )}

                {/* Scanner Modal */}
                {isScannerOpen && (
                    <TicketScannerModal
                        onClose={() => setIsScannerOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default ApproverDashboard;
