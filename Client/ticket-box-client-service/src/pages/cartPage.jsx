import React, { useState } from 'react';
import { useCartItems, useRemoveFromCartMutation, usePurchaseCartMutation } from '../hooks/useCartHook';
import { Loader2, Trash2, ShoppingCart, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartPage = () => {
    const [pageNo, setPageNo] = useState(1);
    const pageSize = 10;
    const { data: cartData, isLoading, isError, error } = useCartItems(pageNo, pageSize);
    const removeMutation = useRemoveFromCartMutation();
    const purchaseMutation = usePurchaseCartMutation();

    const cartItems = cartData?.pageContent || [];
    const totalPages = cartData?.totalPages || 0;
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

    const calculateTotal = () => {
        if (!cartItems) return 0;
        return cartItems.reduce((total, item) => {
            // Assuming item has ticket.unitPrice and quantity
            // Adjust based on actual API response structure
            const price = item.ticket?.unitPrice || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <span className="ml-4 text-xl">Loading Cart...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
                <div className="rounded-lg border border-red-700 bg-red-900/20 p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Cart</h2>
                    <p className="text-gray-300">{error?.message || "Could not fetch cart items."}</p>
                </div>
            </div>
        );
    }

    const isEmpty = !cartItems || cartItems.length === 0;

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8 text-white">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="flex items-center text-3xl font-bold">
                        <ShoppingCart className="mr-3 h-8 w-8 text-blue-500" />
                        Ticket Cart
                    </h1>
                </div>

                {isEmpty ? (
                    <div className="rounded-lg bg-gray-800 p-12 text-center shadow-lg">
                        <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                        <h2 className="mb-2 text-2xl font-semibold text-white">Your cart is empty</h2>
                        <p className="mb-6 text-gray-400">Looks like you haven't added any tickets yet.</p>
                        <Link
                            to="/"
                            className="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            Browse Events
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden rounded-lg bg-gray-800 shadow-lg">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-700 text-xs uppercase text-gray-300">
                                            <tr>
                                                <th className="px-6 py-4">Event / Ticket</th>
                                                <th className="px-6 py-4 text-center">Quantity</th>
                                                <th className="px-6 py-4 text-right">Price</th>
                                                <th className="px-6 py-4 text-right">Total</th>
                                                <th className="px-6 py-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700 text-sm">
                                            {cartItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-700/50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-4">
                                                            {/* Assuming item.ticket.event.banner.url exists */}
                                                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-700">
                                                                <img
                                                                    src={item.ticket?.event?.banner?.url || "https://placehold.co/64x64/333/fff?text=IMG"}
                                                                    alt={item.ticket?.event?.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-white">{item.ticket?.event?.name || "Unknown Event"}</p>
                                                                <p className="text-blue-400">{item.ticket?.type || "Ticket"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-medium text-white">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-gray-300">
                                                        {item.ticket?.unitPrice?.toLocaleString()} đ
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-green-400">
                                                        {(item.ticket?.unitPrice * item.quantity)?.toLocaleString()} đ
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleRemove(item.id)}
                                                            disabled={removeMutation.isPending}
                                                            className="rounded-full p-2 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                                                            title="Remove Item"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-4">
                                    <div className="text-sm text-gray-400">
                                        Page <span className="font-semibold text-white">{pageNo}</span> of <span className="font-semibold text-white">{totalPages}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setPageNo(prev => Math.max(1, prev - 1))}
                                            disabled={pageNo === 1}
                                            className="flex items-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setPageNo(prev => Math.min(totalPages, prev + 1))}
                                            disabled={pageNo === totalPages}
                                            className="flex items-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary Section */}
                        <div className="lg:col-span-1">
                            <div className="rounded-lg bg-gray-800 p-6 shadow-lg sticky top-24">
                                <h3 className="mb-6 text-xl font-bold text-white">Order Summary</h3>
                                <div className="mb-4 flex justify-between border-b border-gray-700 pb-4 text-gray-300">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>{calculateTotal().toLocaleString()} đ</span>
                                </div>
                                <div className="mb-8 flex justify-between text-xl font-bold text-white">
                                    <span>Total</span>
                                    <span className="text-green-400">{calculateTotal().toLocaleString()} đ</span>
                                </div>
                                <button
                                    onClick={handlePurchase}
                                    disabled={purchaseMutation.isPending}
                                    className="flex w-full items-center justify-center rounded-lg bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {purchaseMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-5 w-5" />
                                            Checkout
                                        </>
                                    )}
                                </button>
                                <div className="mt-4 text-center text-xs text-gray-400">
                                    <p>By proceeding, you agree to our Terms of Service.</p>
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
