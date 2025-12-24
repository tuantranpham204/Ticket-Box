import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEventsByCategory } from '../hooks/useEventHook';
import EventCard from '../components/eventCard';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, LayoutGrid, ChevronDown } from 'lucide-react';
import { CAT, EVENT_STATUS } from '../utils/util';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [isPageSizeDropdownOpen, setIsPageSizeDropdownOpen] = useState(false);
    const pageSizeDropdownTimeoutRef = useRef(null);

    const catId = parseInt(categoryId);

    const {
        data: eventData,
        isLoading,
        isError,
        error,
        isPlaceholderData
    } = useEventsByCategory(
        catId,
        [EVENT_STATUS.UPCOMING, EVENT_STATUS.RUNNING],
        pageNo,
        pageSize
    );

    // Reset page number when category changes
    useEffect(() => {
        setPageNo(1);
    }, [categoryId]);

    const events = eventData?.pageContent || [];
    const totalPages = eventData?.totalPages || 0;
    const totalElements = eventData?.totalElements || 0;

    const getCategoryName = (id) => {
        const entry = Object.entries(CAT).find(([_, value]) => value === id);
        if (!entry) return "Events";
        return entry[0].charAt(0) + entry[0].slice(1).toLowerCase().replace('art', ' & Art');
    };

    const categoryName = getCategoryName(catId);

    const handlePageSizeMouseEnter = () => {
        if (pageSizeDropdownTimeoutRef.current) {
            clearTimeout(pageSizeDropdownTimeoutRef.current);
        }
        setIsPageSizeDropdownOpen(true);
    };

    const handlePageSizeMouseLeave = () => {
        pageSizeDropdownTimeoutRef.current = setTimeout(() => {
            setIsPageSizeDropdownOpen(false);
        }, 300);
    };

    const handlePageSizeSelect = (size) => {
        setPageSize(size);
        setPageNo(1);
        setIsPageSizeDropdownOpen(false);
    };

    if (isLoading && !eventData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0d1117] text-white">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                    <span className="text-xl font-medium">Loading {categoryName} events...</span>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-[#0d1117] px-4 py-8 text-white">
                <div className="container mx-auto max-w-7xl">
                    <div className="rounded-xl border border-red-900/50 bg-red-900/10 p-8 text-center">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                        <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Events</h2>
                        <p className="text-gray-400 mb-6">{error?.message || "Something went wrong."}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d1117] px-4 py-8 text-white selection:bg-blue-500/30">
            <div className="container mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-800 pb-8">
                    <div>
                        <nav className="mb-4 flex text-sm text-gray-500">
                            <Link to="/" className="hover:text-blue-400">Home</Link>
                            <span className="mx-2">/</span>
                            <span className="text-gray-300">Category</span>
                        </nav>
                        <h1 className="flex items-center text-4xl font-extrabold tracking-tight">
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-500">
                                <LayoutGrid className="h-7 w-7" />
                            </div>
                            {categoryName}
                        </h1>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
                        <span className="text-gray-300 font-bold mr-1">{totalElements}</span>
                        <span>events found</span>
                    </div>
                </div>

                {/* Content Section */}
                {events.length === 0 ? (
                    <div className="rounded-3xl bg-[#161b22] p-20 text-center shadow-2xl border border-gray-800">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-800/50">
                            <LayoutGrid className="h-12 w-12 text-gray-600" />
                        </div>
                        <h2 className="mb-3 text-3xl font-bold text-white">No events in this category yet</h2>
                        <p className="mb-8 text-lg text-gray-400 max-w-md mx-auto">We couldn't find any upcoming {categoryName.toLowerCase()} events. Check back later or browse other categories.</p>
                        <Link
                            to="/"
                            className="inline-flex items-center rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20"
                        >
                            Browse All events
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Event Grid */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {events.map((event) => (
                                <div key={event.id} className="transform transition-all hover:scale-[1.02]">
                                    <EventCard
                                        event={{
                                            id: event.id,
                                            title: event.name,
                                            imageUrl: event.img?.url || `https://placehold.co/400x300/111/fff?text=${event.name}`,
                                            date: new Date(event.startDate).toLocaleDateString(),
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Pagination Section */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-800 pt-8">
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span>Show</span>
                                <div
                                    className="relative"
                                    onMouseEnter={handlePageSizeMouseEnter}
                                    onMouseLeave={handlePageSizeMouseLeave}
                                >
                                    <button
                                        className="flex items-center gap-2 rounded-lg bg-[#161b22] border border-gray-700 px-3 py-1.5 text-xs text-gray-200 transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        onClick={() => setIsPageSizeDropdownOpen(!isPageSizeDropdownOpen)}
                                    >
                                        {pageSize} per page
                                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${isPageSizeDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isPageSizeDropdownOpen && (
                                        <div className="absolute bottom-full left-0 z-50 mb-2 w-32 animate-bounce-in">
                                            <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900/90 p-1 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                                                {[8, 12, 24, 48].map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => handlePageSizeSelect(size)}
                                                        className={`flex w-full items-center justify-center rounded-lg px-2 py-2 text-xs font-medium transition-all ${pageSize === size
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        {size} per page
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPageNo(prev => Math.max(1, prev - 1))}
                                        disabled={pageNo === 1}
                                        className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#161b22] border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let p = i + 1;
                                            if (totalPages > 5 && pageNo > 3) {
                                                p = pageNo - 2 + i;
                                                if (p > totalPages) p = totalPages - (4 - i);
                                            }
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => setPageNo(p)}
                                                    className={`h-10 w-10 rounded-xl text-sm font-bold transition-all ${pageNo === p
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                                        : 'bg-[#161b22] border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setPageNo(prev => Math.min(totalPages, prev + 1))}
                                        disabled={pageNo === totalPages}
                                        className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#161b22] border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            )}

                            <div className="text-sm text-gray-500 font-medium">
                                Page <span className="text-gray-300">{pageNo}</span> of {totalPages}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
