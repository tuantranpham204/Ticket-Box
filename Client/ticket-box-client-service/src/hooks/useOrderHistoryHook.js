import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient, { handleApiResponse } from "../api/apiClient";
import { useAuthStore } from "../store/useAuthStore";

const getOrderHistory = async (userId, pageNo = 1, pageSize = 10, sortBy = 'id', direction = 'desc') => {
    if (!userId) return { pageContent: [], totalPages: 0, totalElements: 0 };
    return await handleApiResponse(apiClient.get(`/orders/history/${userId}`, {
        params: { pageNo, pageSize, sortBy, direction }
    }));
};

const getOrderById = async (orderId) => {
    if (!orderId) return null;
    return await handleApiResponse(apiClient.get(`/orders/order/${orderId}`));
};

const getOrderTicketsByOrderId = async (orderId, pageNo = 1, pageSize = 50, sortBy = 'id', direction = 'desc') => {
    if (!orderId) return { pageContent: [], totalPages: 0, totalElements: 0 };
    return await handleApiResponse(apiClient.get(`/order-tickets/order/${orderId}`, {
        params: { pageNo, pageSize, sortBy, direction }
    }));
};

const getTicketToken = async (orderTicketId, buyerId) => {
    if (!orderTicketId || !buyerId) return null;
    return await handleApiResponse(apiClient.get(`/order-tickets/token/${orderTicketId}/${buyerId}`));
};

export const useOrderHistory = (pageNo = 1, pageSize = 10, sortBy = 'id', direction = 'desc') => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['order-history', user?.id, pageNo, pageSize, sortBy, direction],
        queryFn: async () => await getOrderHistory(user?.id, pageNo, pageSize, sortBy, direction),
        enabled: !!user?.id,
    });
};

export const useOrderById = (orderId) => {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => await getOrderById(orderId),
        enabled: !!orderId,
    });
};

export const useOrderTicketsByOrderId = (orderId, pageNo = 1, pageSize = 50, sortBy = 'id', direction = 'desc') => {
    return useQuery({
        queryKey: ['order-tickets', orderId, pageNo, pageSize, sortBy, direction],
        queryFn: async () => await getOrderTicketsByOrderId(orderId, pageNo, pageSize, sortBy, direction),
        enabled: !!orderId,
    });
};

export const useTicketTokenMutation = () => {
    return useMutation({
        mutationFn: ({ orderTicketId, buyerId }) => getTicketToken(orderTicketId, buyerId),
    });
};
