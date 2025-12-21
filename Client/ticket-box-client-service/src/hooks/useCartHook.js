import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient, { handleApiResponse } from "../api/apiClient";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";

const getCartItems = async (userId, pageNo = 1, pageSize = 10) => {
    if (!userId) return { pageContent: [], totalPages: 0, totalElements: 0 };
    return await handleApiResponse(apiClient.get(`/order-tickets/cart/${userId}`, {
        params: { pageNo, pageSize, sortBy: 'id' }
    }));
};

const addToCart = async ({ userId, data }) => {
    // data should be { ticketId, quantity }
    // Backend requires subQuantity (usually 1 for individual additions or same as quantity)
    const payload = {
        ...data,
        subQuantity: 1 // Explicitly setting subQuantity as requested
    };
    return await handleApiResponse(apiClient.post(`/order-tickets/create/${userId}`, payload));
};

const removeFromCart = async (orderTicketId) => {
    return await handleApiResponse(apiClient.delete(`/order-tickets/delete/${orderTicketId}`));
};

const purchaseCart = async (userId) => {
    return await handleApiResponse(apiClient.put(`/orders/purchase/${userId}`));
};

export const useCartItems = (pageNo = 1, pageSize = 10) => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['cart', user?.id, pageNo, pageSize],
        queryFn: async () => await getCartItems(user?.id, pageNo, pageSize),
        enabled: !!user?.id,
    });
};

export const useAddToCartMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: (data) => addToCart({ userId: user?.id, data }),
        onSuccess: () => {
            toast.success("Added to cart successfully!");
            queryClient.invalidateQueries(['cart', user?.id]);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add to cart.");
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
            // You might want to navigate to history or show a success modal here
        },
        onError: (error) => {
            toast.error(error.message || "Purchase failed.");
        }
    });
};
