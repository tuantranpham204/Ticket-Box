import React, { useState } from 'react';
import { useCartItems, useCart, useRemoveFromCartMutation, usePurchaseCartMutation, useUpdateOrderTicketMutation } from '../hooks/useCartHook';
import { Loader2, Trash2, ShoppingCart, CreditCard, ChevronLeft, ChevronRight, Plus, Minus, ArrowUpDown, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SELF_RELATIONSHIP_ID } from '../utils/util';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

const CartPage = () => {
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('desc');
    const [localQuantities, setLocalQuantities] = useState({}); // { orderTicketId: value }

    const { data: cartItemsData, isLoading, isError, error } = useCartItems(pageNo, pageSize, sortBy, sortOrder);
    const { data: cart } = useCart();
    // const { user } = useAuthStore();
    const removeMutation = useRemoveFromCartMutation();
    const purchaseMutation = usePurchaseCartMutation();
    const updateMutation = useUpdateOrderTicketMutation();

    const cartItems = cartItemsData?.pageContent || [];
    const totalPages = cartItemsData?.totalPages || 0;
    const totalElements = cartItemsData?.totalElements || 0;

    const handleQuantityChange = (itemId, newQty) => {
        const qty = parseInt(newQty);
        if (isNaN(qty) || qty < 1) return;
        setLocalQuantities(prev => ({
            ...prev,
            [itemId]: qty
        }));
    };

    const handleSaveQuantity = (item) => {
        const newQty = localQuantities[item.id];
        if (!newQty || newQty === item.subQuantity) return;

        updateMutation.mutate({
            orderTicketId: item.id,
            data: { ...item, subQuantity: newQty }
        }, {
            onSuccess: () => {
                handleQuantityChange(item.id, localQuantities[item.id]);
                toast.success("Quantity updated!");
            }
        });
    };

    const getDisplayQuantity = (item) => {
        return localQuantities[item.id] !== undefined ? localQuantities[item.id] : (item.subQuantity || 1);
    };

    const handleRemove = (id) => {
        if (window.confirm('Are you sure you want to remove this item?')) {
            removeMutation.mutate(id);
        }
    };

    const handlePurchase = () => {
        if (window.confirm('Proceed to purchase all items in cart?')) {
            purchaseMutation.mutate();
        }
    };

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

    // Helper to format currency safely
    const formatCurrency = (amount) => {
        const val = Number(amount);
        return isNaN(val) ? "0" : val.toLocaleString();
    };

    // Helper to parse event address
    const parseAddress = (addressStr) => {
        if (!addressStr) return { location: "", venue: "", city: "" };
        try {
            // Check if it's already an object or a string
            const addr = typeof addressStr === 'string' ? JSON.parse(addressStr) : addressStr;
            return {
                location: addr.location || "",
                venue: addr.venue || "",
                city: addr.city || ""
            };
        } catch (e) {
            console.error("Error parsing address:", e);
            return { location: addressStr, venue: "", city: "" };
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0d1117] text-white">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                    <span className="text-xl font-medium">Loading your cart...</span>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d1117] text-white">
                <div className="rounded-xl border border-red-900/50 bg-red-900/10 p-8 text-center max-w-md">
                    <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Cart</h2>
                    <p className="text-gray-400 mb-6">{error?.message || "Could not fetch cart items. Please try again later."}</p>
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

    const isEmpty = !cartItems || cartItems.length === 0;

    return (
        <div className="min-h-screen bg-[#0d1117] px-4 py-8 text-white selection:bg-blue-500/30">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-10">
                    <h1 className="flex items-center text-4xl font-extrabold tracking-tight">
                        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-500">
                            <ShoppingCart className="h-7 w-7" />
                        </div>
                        Ticket Cart
                        {totalElements > 0 && (
                            <span className="ml-4 text-sm font-medium text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
                                {totalElements} {totalElements === 1 ? 'item' : 'items'}
                            </span>
                        )}
                    </h1>
                </div>

                {isEmpty ? (
                    <div className="rounded-2xl bg-[#161b22] p-16 text-center shadow-2xl border border-gray-800">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-800/50">
                            <ShoppingCart className="h-12 w-12 text-gray-600" />
                        </div>
                        <h2 className="mb-3 text-3xl font-bold text-white">Your cart is empty</h2>
                        <p className="mb-8 text-lg text-gray-400 max-w-md mx-auto">Looks like you haven't added any tickets yet. Start exploring amazing events!</p>
                        <Link
                            to="/"
                            className="inline-flex items-center rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20"
                        >
                            Browse Events
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* Cart Items Table - Datatable Style */}
                        <div className="lg:col-span-8 flex flex-col">
                            <div className="flex-grow overflow-hidden rounded-2xl border border-gray-800 bg-[#161b22] shadow-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-800 bg-[#0d1117]/50 text-xs font-bold uppercase tracking-wider text-gray-500">
                                                <th className="px-4 py-4 cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => handleSort('ticket.event.name')}>
                                                    <div className="flex items-center">
                                                        Event / Ticket <SortIcon field="ticket.event.name" />
                                                    </div>
                                                </th>
                                                <th className="px-4 py-4 text-center cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => handleSort('subQuantity')}>
                                                    <div className="flex items-center justify-center">
                                                        Quantity <SortIcon field="subQuantity" />
                                                    </div>
                                                </th>
                                                <th className="px-4 py-4 text-right cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => handleSort('ticket.unitPrice')}>
                                                    <div className="flex items-center justify-end">
                                                        Unit Price <SortIcon field="ticket.unitPrice" />
                                                    </div>
                                                </th>
                                                <th className="px-4 py-4 text-right">Subtotal Price</th>
                                                <th className="px-4 py-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {cartItems.map((item) => {
                                                const eventAddress = parseAddress(item.ticket?.event?.address);
                                                return (
                                                    <tr key={item.id} className="group transition-colors hover:bg-blue-500/5">
                                                        <td className="px-4 py-3 max-w-[300px]">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 transition-transform group-hover:scale-105 shadow-md">
                                                                    <img
                                                                        src={item.ticket?.event?.banner?.url || "https://placehold.co/64x64/333/fff?text=Ticket"}
                                                                        alt={item.ticket?.event?.name || "Ticket"}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-base font-bold text-white group-hover:text-blue-400 transition-colors truncate" title={item.ticket?.event?.name}>
                                                                        {item.ticket?.event?.name || "Event Name unavailable"}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1 whitespace-nowrap overflow-hidden">
                                                                        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                                                                            {item.ticket?.type || "Standard"}
                                                                        </span>
                                                                        {item.ticket?.event?.orgName && (
                                                                            <span className="text-[11px] text-gray-500 truncate">
                                                                                by {item.ticket.event.orgName}
                                                                            </span>
                                                                        )}
                                                                        {eventAddress.venue && (
                                                                            <span className="text-[11px] text-gray-600 truncate">
                                                                                • {eventAddress.venue}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-center">
                                                                <div className="flex items-center bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                                                                    <button
                                                                        onClick={() => handleQuantityChange(item.id, getDisplayQuantity(item) - 1)}
                                                                        disabled={updateMutation.isPending || getDisplayQuantity(item) <= 1}
                                                                        className="p-1.5 hover:bg-gray-700 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                                                                    >
                                                                        <Minus className="h-4 w-4" />
                                                                    </button>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={getDisplayQuantity(item)}
                                                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                                        disabled={updateMutation.isPending}
                                                                        className="w-12 bg-transparent text-center font-mono text-base font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleQuantityChange(item.id, getDisplayQuantity(item) + 1)}
                                                                        disabled={updateMutation.isPending}
                                                                        className="p-1.5 hover:bg-gray-700 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                                                                    >
                                                                        <Plus className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-gray-400 text-sm">
                                                            {formatCurrency(item.ticket?.unitPrice)} đ
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="text-base font-bold text-green-400">
                                                                {formatCurrency((item.ticket?.unitPrice || 0) * getDisplayQuantity(item))} đ
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                                <button
                                                                    onClick={() => handleRemove(item.id)}
                                                                    disabled={removeMutation.isPending}
                                                                    className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-600 transition-all hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30 active:scale-95"
                                                                    title="Remove Item"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>

                                                                <button
                                                                    onClick={() => handleSaveQuantity(item)}
                                                                    disabled={updateMutation.isPending || localQuantities[item.id] === undefined || localQuantities[item.id] === item.subQuantity}
                                                                    className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all active:scale-95 ${localQuantities[item.id] !== undefined && localQuantities[item.id] !== item.subQuantity
                                                                        ? 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 shadow-lg shadow-blue-500/10'
                                                                        : 'text-gray-600 hover:bg-gray-800 opacity-50'
                                                                        }`}
                                                                    title="Save Changes"
                                                                >
                                                                    {updateMutation.isPending && updateMutation.variables?.orderTicketId === item.id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Save className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Combined Table Footer with Pagination and Page Size selector */}
                                <div className="border-t border-gray-800 bg-[#0d1117]/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center text-sm text-gray-500 order-2 sm:order-1">
                                        <span>Show</span>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                                setPageNo(1);
                                            }}
                                            className="mx-2 bg-[#161b22] border border-gray-700 rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-blue-500 text-xs"
                                        >
                                            {[5, 10, 20, 50].map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                        <span>
                                            entries • Showing <span className="text-gray-300 font-medium">{totalElements === 0 ? 0 : (pageNo - 1) * pageSize + 1}</span> to <span className="text-gray-300 font-medium">{Math.min(pageNo * pageSize, totalElements)}</span> of <span className="text-gray-300 font-medium">{totalElements}</span>
                                        </span>
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex items-center space-x-2 order-1 sm:order-2">
                                            <button
                                                onClick={() => setPageNo(prev => Math.max(1, prev - 1))}
                                                disabled={pageNo === 1}
                                                className="p-2 rounded-lg bg-[#161b22] border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                title="Previous Page"
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
                                                className="p-2 rounded-lg bg-[#161b22] border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                title="Next Page"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Information Section */}
                        <div className="lg:col-span-4">
                            <div className="rounded-2xl border border-gray-800 bg-[#161b22] p-8 shadow-2xl sticky top-24">
                                <h3 className="mb-8 text-2xl font-bold text-white tracking-tight">Order Information</h3>

                                <div className="space-y-4 mb-8">
                                    {cart?.orderCode && (
                                        <div className="flex justify-between text-gray-400">
                                            <span className="text-sm uppercase tracking-wider font-semibold">Order Code</span>
                                            <span className="font-mono text-blue-400 font-bold">{cart.orderCode}</span>
                                        </div>
                                    )}
                                    {cart?.customerName && (
                                        <div className="flex justify-between text-gray-400">
                                            <span className="text-sm uppercase tracking-wider font-semibold">Customer</span>
                                            <span className="text-gray-200">{cart.customerName}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-400">
                                        <span className="text-sm uppercase tracking-wider font-semibold">Total Quantity</span>
                                        <span className="text-gray-200">{cart?.quantity || totalElements} items</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span className="text-sm uppercase tracking-wider font-semibold">Total Price</span>
                                        <span className="font-mono text-gray-300">{formatCurrency(cart?.totalPrice)} đ</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span className="text-sm uppercase tracking-wider font-semibold">Discount</span>
                                        <span className="font-mono text-green-400">0 đ</span>
                                    </div>
                                    <div className="h-px bg-gray-800 my-2"></div>
                                    <div className="flex items-end justify-between py-2">
                                        <div>
                                            <span className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">Final Amount</span>
                                            <span className="text-3xl font-black text-white tracking-tighter">
                                                {formatCurrency(cart?.finalAmount || cart?.totalPrice)} đ
                                            </span>
                                        </div>
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePurchase}
                                    disabled={purchaseMutation.isPending || isEmpty}
                                    className="relative flex w-full h-16 items-center justify-center overflow-hidden rounded-2xl bg-green-600 transition-all hover:bg-green-700 hover:shadow-xl hover:shadow-green-900/20 disabled:opacity-30 disabled:grayscale active:scale-[0.98]"
                                >
                                    {purchaseMutation.isPending ? (
                                        <div className="flex items-center space-x-3">
                                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                                            <span className="text-lg font-bold">Processing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-3">
                                            <CreditCard className="h-6 w-6" />
                                            <span className="text-lg font-bold">Purchase Order</span>
                                        </div>
                                    )}
                                </button>

                                <div className="mt-8 flex flex-col items-center space-y-4 text-center">
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        All transactions are secure and encrypted. <br />
                                        By proceeding, you agree to our <a href="#" className="underline hover:text-gray-300">Terms of Service</a>.
                                    </p>
                                    <div className="flex space-x-4 grayscale opacity-40">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-5" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
