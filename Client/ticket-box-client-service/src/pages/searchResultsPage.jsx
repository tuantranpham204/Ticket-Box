import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSearchEventsByParams } from "../hooks/useEventHook";
import { Loader2, AlertCircle, Eye, Calendar, MapPin } from "lucide-react";

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const {
        data: searchResults,
        isLoading,
        isError,
        error,
    } = useSearchEventsByParams(query);

    const events = searchResults || []; // The API likely returns a list or a page object. Adjust if it returns { pageContent: [...] }

    // Adjust for potential different response structure (List vs Page)
    const eventList = Array.isArray(events) ? events : events.pageContent || [];

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8 text-white">
            <div className="container mx-auto max-w-7xl">
                <h1 className="mb-8 text-3xl font-bold">
                    Search Results for "{query}"
                </h1>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        <span className="ml-4 text-lg text-gray-400">Searching...</span>
                    </div>
                ) : isError ? (
                    <div className="rounded-lg border border-red-800 bg-red-900/20 p-8 text-center">
                        <h3 className="text-xl font-semibold text-red-500">
                            Error searching events
                        </h3>
                        <p className="mt-2 text-gray-400">
                            {error?.message || "An unexpected error occurred."}
                        </p>
                    </div>
                ) : eventList.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        <p className="text-xl">No events found matching your search.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg bg-gray-800 shadow-md">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] table-auto text-left text-sm text-gray-400">
                                <thead className="bg-gray-700 text-xs uppercase text-gray-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Event Name</th>
                                        <th scope="col" className="px-6 py-4">Organizer</th>
                                        <th scope="col" className="px-6 py-4">Date</th>
                                        <th scope="col" className="px-6 py-4">Location</th>
                                        <th scope="col" className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {eventList.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-700/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={event.banner?.url || event.img?.url || "https://placehold.co/50x50/333/fff?text=Img"}
                                                        alt={event.name}
                                                        className="h-10 w-10 rounded object-cover"
                                                    />
                                                    <span className="font-medium text-white">{event.name}</span>
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
                                                        {/* Assuming address is a JSON string or simple string. Need to handle potential JSON. */}
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
                                                <Link
                                                    to={`/event/${event.id}`}
                                                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                                                >
                                                    <Eye className="mr-1 h-3 w-3" />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 text-xs text-center text-gray-500 border-t border-gray-700">
                            Showing {eventList.length} results
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;
