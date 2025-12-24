import React, { useState, useRef } from 'react';
import { useOrderHistory } from '../hooks/useOrderHistoryHook';
import { Loader2, Receipt, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderHistoryPage = () => {
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('desc');
    const [isPageSizeDropdownOpen, setIsPageSizeDropdownOpen] = useState(false);
    const pageSizeDropdownTimeoutRef = useRef(null);

    const { data: orderHistoryData, isLoading, isError, error } = useOrderHistory(pageNo, pageSize, sortBy, sortOrder);

    const orders = orderHistoryData?.pageContent || [];
    const totalPages = orderHistoryData?.totalPages || 0;
    const totalElements = orderHistoryData?.totalElements || 0;

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setPageNo(1);
    };

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
        return sortOrder === 'asc'
            ? <ArrowUp className="ml-1 h-3 w-3 text-blue-500" />
            : <ArrowDown className="ml-1 h-3 w-3 text-blue-500" />;
    };

    const formatCurrency = (amount) => {
        const val = Number(amount);
        return isNaN(val) ? "0" : val.toLocaleString();
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'PENDING':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'CANCELLED':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            default:
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

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

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0d1117] text-white">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                    <span className="text-xl font-medium">Loading your orders...</span>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d1117] text-white">
                <div className="rounded-xl border border-red-900/50 bg-red-900/10 p-8 text-center max-w-md">
                    <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Orders</h2>
                    <p className="text-gray-400 mb-6">{error?.message || "Could not fetch your order history."}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const isEmpty = !orders || orders.length === 0;

    return (
        <div className="min-h-screen bg-[#0d1117] px-4 py-8 text-white selection:bg-blue-500/30">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-10">
                    <h1 className="flex items-center text-4xl font-extrabold tracking-tight">
                        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-500">
                            <Receipt className="h-7 w-7" />
                        </div>
                        Order History
                        {totalElements > 0 && (
                            <span className="ml-4 text-sm font-medium text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
                                {totalElements} {totalElements === 1 ? 'order' : 'orders'}
                            </span>
                        )}
                    </h1>
                </div>

                {isEmpty ? (
                    <div className="rounded-2xl bg-[#161b22] p-16 text-center shadow-2xl border border-gray-800">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-800/50">
                            <Receipt className="h-12 w-12 text-gray-600" />
                        </div>
                        <h2 className="mb-3 text-3xl font-bold text-white">No orders found</h2>
                        <p className="mb-8 text-lg text-gray-400 max-w-md mx-auto">You haven't made any purchases yet. Your completed orders will appear here.</p>
                        <Link
                            to="/"
                            className="inline-flex items-center rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20"
                        >
                            Explore Events
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="rounded-2xl border border-gray-800 bg-[#161b22] shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-800 bg-[#0d1117]/50 text-xs font-bold uppercase tracking-wider text-gray-500">
                                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => handleSort('orderCode')}>
                                                <div className="flex items-center">
                                                    Order Code <SortIcon field="orderCode" />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => handleSort('purchasedAt')}>
                                                <div className="flex items-center">
                                                    Date <SortIcon field="purchasedAt" />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-center cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => handleSort('quantity')}>
                                                <div className="flex items-center justify-center">
                                                    Tickets <SortIcon field="quantity" />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => handleSort('finalAmount')}>
                                                <div className="flex items-center justify-end">
                                                    Total Price <SortIcon field="finalAmount" />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-center cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => handleSort('status')}>
                                                <div className="flex items-center justify-center">
                                                    Status <SortIcon field="status" />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-center">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="group transition-colors hover:bg-blue-500/5">
                                                <td className="px-6 py-4 font-mono text-sm font-bold text-blue-400">
                                                    {order.orderCode}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-400">
                                                    {formatDate(order.purchasedAt)}
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium text-gray-200">
                                                    {order.quantity}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="text-base font-bold text-white">
                                                        {formatCurrency(order.finalAmount)} đ
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-xs">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold border ${getStatusColor(order.status)}`}>
                                                        {order.status || 'SUCCESS'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button className="p-2 rounded-lg text-gray-500 hover:text-blue-400 transition-colors">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="border-t border-gray-800 bg-[#0d1117]/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center text-sm text-gray-500">
                                    <div
                                        className="relative mx-2"
                                        onMouseEnter={handlePageSizeMouseEnter}
                                        onMouseLeave={handlePageSizeMouseLeave}
                                    >
                                        <button
                                            className="flex items-center gap-2 rounded-lg bg-[#161b22] border border-gray-700 px-3 py-1.5 text-xs text-gray-300 transition-all hover:bg-gray-800 focus:outline-none focus:border-blue-500"
                                            onClick={() => setIsPageSizeDropdownOpen(!isPageSizeDropdownOpen)}
                                        >
                                            {pageSize}
                                            <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform duration-300 ${isPageSizeDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isPageSizeDropdownOpen && (
                                            <div className="absolute bottom-full left-0 z-50 mb-2 w-20 animate-bounce-in">
                                                <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900/90 p-1 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                                                    {[5, 10, 20, 50].map(size => (
                                                        <button
                                                            key={size}
                                                            onClick={() => handlePageSizeSelect(size)}
                                                            className={`flex w-full items-center justify-center rounded-lg px-2 py-2 text-xs font-medium transition-all ${pageSize === size
                                                                ? 'bg-blue-600 text-white'
                                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                                }`}
                                                        >
                                                            {size}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <span>
                                        entries • Showing <span className="text-gray-300 font-medium">{totalElements === 0 ? 0 : (pageNo - 1) * pageSize + 1}</span> to <span className="text-gray-300 font-medium">{Math.min(pageNo * pageSize, totalElements)}</span> of <span className="text-gray-300 font-medium">{totalElements}</span>
                                    </span>
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setPageNo(prev => Math.max(1, prev - 1))}
                                            disabled={pageNo === 1}
                                            className="p-2 rounded-lg bg-[#161b22] border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 transition-all"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>

                                        <div className="flex items-center space-x-1">
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
                                                        className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${pageNo === p
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-[#161b22] border border-gray-700 text-gray-400 hover:border-gray-500'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setPageNo(prev => Math.min(totalPages, prev + 1))}
                                            disabled={pageNo === totalPages}
                                            className="p-2 rounded-lg bg-[#161b22] border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 transition-all"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;
