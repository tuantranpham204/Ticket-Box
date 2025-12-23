import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient, { handleApiResponse } from "../api/apiClient";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";
import { SELF_RELATIONSHIP_ID } from "../utils/util";

const getCartItems = async (userId, pageNo = 1, pageSize = 10, sortBy = 'id', direction = 'asc') => {
    if (!userId) return { pageContent: [], totalPages: 0, totalElements: 0 };
    return await handleApiResponse(apiClient.get(`/order-tickets/cart/${userId}`, {
        params: { pageNo, pageSize, sortBy, direction }
    }));
};

const getCart = async (userId) => {
    if (!userId) return null;
    return await handleApiResponse(apiClient.get(`/orders/cart/${userId}`));
};

const createOrderTicket = async ({ userId, data, user }) => {
    const payload = {
        ownerName: user?.fullName || user?.username || "",
        relationshipId: SELF_RELATIONSHIP_ID,
        ticketId: data.ticketId,
        subQuantity: data.quantity || 1
    };
    return await handleApiResponse(apiClient.post(`/order-tickets/create/${userId}`, payload));
};

const updateOrderTicket = async ({ userId, orderTicketId, data, user }) => {
    const payload = {
        ownerName: data.ownerName || user?.fullName || user?.username || "",
        relationshipId: data.relationshipId || SELF_RELATIONSHIP_ID,
        ticketId: data.ticketId || data.ticket?.id,
        subQuantity: data.subQuantity || data.quantity || 1
    };
    return await handleApiResponse(apiClient.put(`/order-tickets/update/${userId}/${orderTicketId}`, payload));
};

const addToCartLogic = async ({ userId, data, user }) => {
    const cartItemsData = await getCartItems(userId, 1, 100);
    const existingItem = cartItemsData?.pageContent?.find(item =>
        item.ticket?.id === data.ticketId && item.relationshipId === SELF_RELATIONSHIP_ID
    );
    if (existingItem) {
        const currentQty = existingItem.subQuantity || 0;
        const addQty = data.quantity || 1;
        const newQuantity = currentQty + addQty;

        return await updateOrderTicket({
            userId,
            orderTicketId: existingItem.id,
            data: { ...existingItem, subQuantity: newQuantity },
            user
        });
    } else {
        // 4. Create new item
        return await createOrderTicket({ userId, data, user });
    }
};

const removeFromCart = async (orderTicketId) => {
    return await handleApiResponse(apiClient.delete(`/order-tickets/delete/${orderTicketId}`));
};

const purchaseCart = async (userId) => {
    return await handleApiResponse(apiClient.put(`/orders/purchase/${userId}`));
};

export const useCartItems = (pageNo = 1, pageSize = 10, sortBy = 'id', direction = 'asc') => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['cart', user?.id, pageNo, pageSize, sortBy, direction],
        queryFn: async () => await getCartItems(user?.id, pageNo, pageSize, sortBy, direction),
        enabled: !!user?.id,
    });
};

export const useCart = () => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['cart-summary', user?.id],
        queryFn: async () => await getCart(user?.id),
        enabled: !!user?.id,
    });
};

export const useAddToCartMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: (data) => addToCartLogic({ userId: user?.id, data, user }),
        onSuccess: () => {
            toast.success("Cart updated successfully!");
            queryClient.invalidateQueries(['cart', user?.id]);
            queryClient.invalidateQueries(['cart-summary', user?.id]);
        },
    });
};

export const useUpdateOrderTicketMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: ({ orderTicketId, data }) => updateOrderTicket({ userId: user?.id, orderTicketId, data, user }),
        onSuccess: () => {
            return Promise.all([
                queryClient.invalidateQueries(['cart', user?.id]),
                queryClient.invalidateQueries(['cart-summary', user?.id])
            ]);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update quantity.");
        }
    });
};

export const useRemoveFromCartMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: (orderTicketId) => removeFromCart(orderTicketId),
        onSuccess: () => {
            toast.success("Removed from cart.");
            queryClient.invalidateQueries(['cart', user?.id]);
            queryClient.invalidateQueries(['cart-summary', user?.id]);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to remove from cart.");
        }
    });
};

export const usePurchaseCartMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: () => purchaseCart(user?.id),
        onSuccess: () => {
            toast.success("Purchase successful!");
            queryClient.invalidateQueries(['cart', user?.id]);
            queryClient.invalidateQueries(['cart-summary', user?.id]);
        },
        onError: (error) => {
            toast.error(error.message || "Purchase failed.");
        }
    });
};
