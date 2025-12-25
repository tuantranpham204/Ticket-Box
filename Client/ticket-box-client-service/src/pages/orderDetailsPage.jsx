import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderById, useOrderTicketsByOrderId, useTicketTokenMutation } from '../hooks/useOrderHistoryHook';
import { useVerifyPasswordMutation } from '../hooks/useAuthHook';
import { useAuthStore } from '../store/useAuthStore';
import {
    Loader2, Receipt, CreditCard, ChevronLeft, ChevronRight,
    ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Ticket,
    QrCode, Download, ShieldCheck, Lock, AlertTriangle, X
} from 'lucide-react';
import { ORDER_STATUS, ORDER_TICKET_STATUS } from '../utils/util';
import { toast } from 'sonner';
import { QRCode } from 'react-qrcode';
import { motion, AnimatePresence } from 'framer-motion';

const OrderDetailsPage = () => {
    const { orderId } = useParams();
    const { user } = useAuthStore();
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('desc');
    const [isPageSizeDropdownOpen, setIsPageSizeDropdownOpen] = useState(false);
    const pageSizeDropdownTimeoutRef = useRef(null);

    // QR Modal State
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [verificationPassword, setVerificationPassword] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [qrToken, setQrToken] = useState(null);

    const { data: order, isLoading: isLoadingOrder, isError: isErrorOrder } = useOrderById(orderId);
    const { data: ticketsData, isLoading: isLoadingTickets, isError: isErrorTickets } = useOrderTicketsByOrderId(orderId, pageNo, pageSize, sortBy, sortOrder);

    const verifyPasswordMutation = useVerifyPasswordMutation();
    const ticketTokenMutation = useTicketTokenMutation();

    const tickets = ticketsData?.pageContent || [];
    const totalPages = ticketsData?.totalPages || 0;
    const totalElements = ticketsData?.totalElements || 0;

    const handleOpenQRModal = (ticket) => {
        setSelectedTicket(ticket);
        setIsQRModalOpen(true);
        setIsVerified(false);
        setVerificationPassword('');
        setQrToken(null);
    };

    const handleCloseQRModal = () => {
        setIsQRModalOpen(false);
        setSelectedTicket(null);
        setIsVerified(false);
        setVerificationPassword('');
    };

    const handleVerifyPassword = async (e) => {
        e.preventDefault();
        try {
            await verifyPasswordMutation.mutateAsync(verificationPassword);
            const tokenResponse = await ticketTokenMutation.mutateAsync({
                orderTicketId: selectedTicket.id,
                buyerId: user.id
            });
            setQrToken(tokenResponse);
            setIsVerified(true);
        } catch (error) {
            // Error managed by mutation hooks or toast
        }
    };

    const handleDownloadQR = () => {
        const svg = document.getElementById('ticket-qr-code');
        if (!svg) {
            toast.error("QR Code not found for download");
            return;
        }

        // 1. Get SVG content and add namespace if missing
        let svgData = new XMLSerializer().serializeToString(svg);
        if (!svgData.includes('xmlns="http://www.w3.org/2000/svg"')) {
            svgData = svgData.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        // Ensure the SVG has explicit width and height for canvas rendering
        if (!svgData.includes('width="')) {
            svgData = svgData.replace('<svg', '<svg width="200" height="200"');
        }

        // 2. Create a canvas to draw the SVG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            // Give it some padding
            const padding = 60;
            const size = 200; // Match the QRCode size
            canvas.width = size + padding;
            canvas.height = size + padding;

            // White background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw QR code centered
            ctx.drawImage(img, padding / 2, padding / 2, size, size);

            // Trigger download
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `Ticket-Gate-QR-${selectedTicket.id}.png`;
            downloadLink.href = pngFile;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Cleanup
            URL.revokeObjectURL(url);
            toast.success("QR Code downloaded successfully!");
        };

        img.onerror = () => {
            toast.error("Failed to process QR Code for download");
            URL.revokeObjectURL(url);
        };

        img.src = url;
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

    const getOrderStatusLabel = (status) => {
        switch (status) {
            case ORDER_STATUS.PURCHASED: return 'PURCHASED';
            case ORDER_STATUS.PENDING: return 'PENDING';
            case ORDER_STATUS.NOT_PURCHASED: return 'NOT PURCHASED';
            case ORDER_STATUS.DECLINED: return 'DECLINED';
            default: return 'UNKNOWN';
        }
    };

    const getOrderStatusColor = (status) => {
        const label = getOrderStatusLabel(status);
        switch (label) {
            case 'PURCHASED': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'DECLINED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    const getTicketStatusLabel = (status) => {
        switch (status) {
            case ORDER_TICKET_STATUS.INACTIVE: return 'INACTIVE';
            case ORDER_TICKET_STATUS.ACTIVE: return 'ACTIVE';
            case ORDER_TICKET_STATUS.USED: return 'USED';
            case ORDER_TICKET_STATUS.PENDING: return 'PENDING';
            default: return 'UNKNOWN';
        }
    };

    const getTicketStatusColor = (status) => {
        const label = getTicketStatusLabel(status);
        switch (label) {
            case 'ACTIVE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'USED': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'INACTIVE': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    if (isLoadingOrder || isLoadingTickets) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0d1117] text-white">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>
        );
    }

    if (isErrorOrder || !order) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d1117] text-white">
                <h2 className="text-2xl font-bold text-red-500">Error Loading Order</h2>
                <Link to="/order-history" className="mt-4 text-blue-400 hover:underline">Back to History</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d1117] px-4 py-12 text-white">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <Link to="/order-history" className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors">
                            <ChevronLeft className="h-4 w-4" /> BACK TO HISTORY
                        </Link>
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Order Details</h1>
                        <p className="mt-2 text-xs font-black uppercase tracking-widest text-gray-500">
                            Order ID: <span className="text-blue-400 font-mono">#{order.id}</span> • {formatDate(order.purchaseDate)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Tickets Table */}
                    <div className="lg:col-span-8">
                        <div className="rounded-[2rem] border border-white/5 bg-[#161b22] shadow-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-[#0d1117]/50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <th className="px-6 py-5">Ticket Info</th>
                                            <th className="px-6 py-5 text-center">Status</th>
                                            <th className="px-6 py-5 text-right">Price</th>
                                            <th className="px-6 py-5 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {tickets.map((ticket) => (
                                            <tr key={ticket.id} className="group transition-colors hover:bg-blue-500/[0.02]">
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                                                            <Ticket className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-white uppercase tracking-tight">{ticket.ticket?.type || 'Standard'}</p>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase">ID: {ticket.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${getTicketStatusColor(ticket.status)}`}>
                                                        {getTicketStatusLabel(ticket.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-right font-mono text-sm font-bold text-white">
                                                    {formatCurrency(ticket.ticket?.unitPrice)} đ
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    {ticket.status === ORDER_TICKET_STATUS.ACTIVE && (
                                                        <button
                                                            onClick={() => handleOpenQRModal(ticket)}
                                                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all active:scale-95"
                                                            title="View QR Code"
                                                        >
                                                            <QrCode className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="bg-[#0d1117]/30 px-6 py-4 flex items-center justify-between border-t border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    Total: {totalElements} Tickets
                                </span>
                                {totalPages > 1 && (
                                    <div className="flex gap-2">
                                        <button onClick={() => setPageNo(p => Math.max(1, p - 1))} disabled={pageNo === 1} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30">
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => setPageNo(p => Math.min(totalPages, p + 1))} disabled={pageNo === totalPages} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="rounded-[2.5rem] liquid-glass p-10 border border-white/5 shadow-2xl space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                    <Receipt className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tighter uppercase">Manifest</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Current Status</span>
                                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${getOrderStatusColor(order.status)}`}>
                                        {getOrderStatusLabel(order.status)}
                                    </span>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-white/5">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Total Quantity</span>
                                        <span className="text-white font-black">{order.quantity} Units</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Base Valuation</span>
                                        <span className="text-gray-400 font-bold font-mono">{formatCurrency(order.totalPrice)} đ</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Total Settlement</div>
                                    <div className="text-4xl font-black text-white tracking-tighter">
                                        {formatCurrency(order.finalAmount || order.totalPrice)} đ
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/5">
                                        <CreditCard className="h-5 w-5 text-gray-500" />
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction Finalized</div>
                                    </div>
                                    <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
                                        This manifest serves as official proof of acquisition.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            <AnimatePresence>
                {isQRModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseQRModal}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-gray-900 shadow-2xl shadow-blue-500/10"
                        >
                            <div className="flex items-center justify-between border-b border-white/5 p-8">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Ticket Gate</h2>
                                <button onClick={handleCloseQRModal} className="text-gray-500 hover:text-white transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-10">
                                {!isVerified ? (
                                    <form onSubmit={handleVerifyPassword} className="space-y-6">
                                        <div className="flex flex-col items-center gap-4 text-center">
                                            <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                                <Lock className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tight">Security Verification</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Enter account password to authorize QR generation</p>
                                        </div>

                                        <div className="space-y-2">
                                            <input
                                                type="password"
                                                className="w-full rounded-2xl border border-white/5 bg-white/5 p-4 text-center font-bold tracking-widest text-white placeholder-gray-600 focus:border-blue-500/50 focus:bg-white/10 focus:outline-none"
                                                placeholder="••••••••"
                                                value={verificationPassword}
                                                onChange={(e) => setVerificationPassword(e.target.value)}
                                                autoFocus
                                            />
                                        </div>

                                        <button
                                            disabled={verifyPasswordMutation.isPending || !verificationPassword}
                                            className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {verifyPasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                            Authorize Access
                                        </button>
                                    </form>
                                ) : (
                                    <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
                                        <div className="relative rounded-3xl bg-white p-6 shadow-2xl">
                                            {ticketTokenMutation.isPending ? (
                                                <div className="h-[200px] w-[200px] flex items-center justify-center">
                                                    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                                                </div>
                                            ) : (
                                                <QRCode
                                                    id="ticket-qr-code"
                                                    value={qrToken?.token || "ERROR"}
                                                    size={200}
                                                    renderAs="svg"
                                                />
                                            )}
                                        </div>

                                        <div className="rounded-2xl bg-yellow-500/10 p-5 border border-yellow-500/20 max-w-[320px]">
                                            <div className="flex gap-4">
                                                <AlertTriangle className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-yellow-500/80">
                                                    You should download or capture this QR code for event entrance purpose or further validation process.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleDownloadQR}
                                            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            <Download className="h-5 w-5" />
                                            Download QR Asset
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderDetailsPage;
