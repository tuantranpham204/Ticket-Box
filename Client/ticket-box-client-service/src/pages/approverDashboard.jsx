import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useEventsByStatus } from "../hooks/useEventHook";
import { useApproveEventMutation, useDeclineEventMutation, useEventContract } from "../hooks/useApproverHook";
import { EVENT_STATUS } from "../utils/util";
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
    X
} from "lucide-react";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="relative flex h-[85vh] w-full max-w-5xl flex-col rounded-xl bg-gray-900 border border-gray-700 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-800 p-4">
                    <h2 className="text-xl font-bold text-white">Event Contract</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden p-1 bg-gray-800">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                            <span className="ml-4 text-lg text-gray-300">Loading contract...</span>
                        </div>
                    ) : isError ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                                <p className="text-lg text-red-500">Failed to load contract.</p>
                                <p className="text-sm text-gray-500 mt-2">{error?.message}</p>
                            </div>
                        </div>
                    ) : isImage(contractUrl) ? (
                        <div className="flex h-full w-full items-center justify-center overflow-auto bg-black/50">
                            <img
                                src={contractUrl}
                                alt="Contract"
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center bg-gray-800 p-8 text-center">
                            <FileText className="mb-4 h-16 w-16 text-gray-500" />
                            <h3 className="mb-2 text-xl font-semibold text-white">Document Preview Not Available</h3>
                            <p className="mb-6 max-w-md text-gray-400">
                                This document format cannot be previewed directly in the browser. Please download it to view.
                            </p>
                            <a
                                href={contractUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                <FileText className="mr-2 h-5 w-5" />
                                Download / View Document
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
        { id: EVENT_STATUS.PENDING, label: "Pending", icon: Clock, color: "text-yellow-400" },
        { id: EVENT_STATUS.UPCOMING, label: "Approved/Upcoming", icon: CheckCircle, color: "text-green-400" },
        { id: EVENT_STATUS.DECLINED, label: "Declined", icon: XCircle, color: "text-red-400" },
        { id: EVENT_STATUS.ENDED, label: "Ended", icon: Clock, color: "text-gray-400" },
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
        <div className="min-h-screen bg-gray-900 px-4 py-8 text-white">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Approver Dashboard</h1>
                </div>

                {/* --- Tabs --- */}
                <div className="mb-8 flex space-x-4 border-b border-gray-700 pb-4 overflow-x-auto">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setSelectedStatus(tab.id);
                                setCurrentPage(1); // Reset to page 1 on status change
                            }}
                            className={`flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors ${selectedStatus === tab.id
                                ? "bg-gray-800 text-white shadow-md"
                                : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                                }`}
                        >
                            <tab.icon className={`h-5 w-5 ${tab.color}`} />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* --- Content --- */}
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        <span className="ml-4 text-lg text-gray-400">Loading events...</span>
                    </div>
                ) : isError ? (
                    <div className="rounded-lg border border-red-800 bg-red-900/20 p-8 text-center">
                        <h3 className="text-xl font-semibold text-red-500">Error loading events</h3>
                        <p className="mt-2 text-gray-400">{error?.message || "An unexpected error occurred."}</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="overflow-hidden rounded-lg bg-gray-800 shadow-md">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] table-auto text-left text-sm text-gray-400">
                                    <thead className="bg-gray-700 text-xs uppercase text-gray-200">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 w-[40%]">Event Name</th>
                                            <th scope="col" className="px-6 py-4 w-[20%]">Organizer</th>
                                            <th scope="col" className="px-6 py-4 w-[10%]">Date</th>
                                            <th scope="col" className="px-6 py-4 w-[15%]">Location</th>
                                            <th scope="col" className="px-6 py-4 text-center w-[15%]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {events.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-lg text-gray-500">
                                                    No events found for this status.
                                                </td>
                                            </tr>
                                        ) : (
                                            events.map((event) => (
                                                <tr key={event.id} className="hover:bg-gray-700/50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-4">
                                                            <img
                                                                src={event.banner?.url || "https://placehold.co/50x50/333/fff?text=Img"}
                                                                alt={event.name}
                                                                className="h-24 w-24 rounded-lg object-cover flex-shrink-0"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-white text-base">{event.name}</span>
                                                                <span className="text-xs text-gray-500">{event.id}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {event.orgName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Calendar className="mr-2 h-4 w-4 text-blue-400" />
                                                            {new Date(event.startDate).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center max-w-xs truncate">
                                                            <MapPin className="mr-2 h-4 w-4 text-red-400 flex-shrink-0" />
                                                            <span className="truncate">
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
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <Link
                                                                to={`/event/${event.id}`}
                                                                className="inline-flex items-center rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600 transition-colors"
                                                            >
                                                                <Eye className="mr-1 h-3 w-3" />
                                                                View
                                                            </Link>

                                                            <button
                                                                onClick={() => setSelectedContractEventId(event.id)}
                                                                className="inline-flex items-center rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600 transition-colors"
                                                            >
                                                                <FileText className="mr-1 h-3 w-3" />
                                                                Contract
                                                            </button>

                                                            {selectedStatus === EVENT_STATUS.PENDING && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApprove(event.id)}
                                                                        disabled={approveMutation.isPending}
                                                                        className="inline-flex items-center rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                                    >
                                                                        {approveMutation.isPending ? "..." : "Approve"}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDecline(event.id)}
                                                                        disabled={declineMutation.isPending}
                                                                        className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                                    >
                                                                        {declineMutation.isPending ? "..." : "Decline"}
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
                            <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-4">
                                <div className="text-sm text-gray-400">
                                    Showing page <span className="font-semibold text-white">{currentPage}</span> of <span className="font-semibold text-white">{totalPages}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="flex items-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <ChevronRight className="ml-1 h-4 w-4" />
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
            </div>
        </div>
    );
};

export default ApproverDashboard;
