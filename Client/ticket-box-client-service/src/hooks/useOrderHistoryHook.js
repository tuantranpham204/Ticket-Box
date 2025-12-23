import { useQuery } from "@tanstack/react-query";
import apiClient, { handleApiResponse } from "../api/apiClient";
import { useAuthStore } from "../store/useAuthStore";

const getOrderHistory = async (userId, pageNo = 1, pageSize = 10, sortBy = 'id', direction = 'desc') => {
    if (!userId) return { pageContent: [], totalPages: 0, totalElements: 0 };
    return await handleApiResponse(apiClient.get(`/orders/history/${userId}`, {
        params: { pageNo, pageSize, sortBy, direction }
    }));
};

export const useOrderHistory = (pageNo = 1, pageSize = 10, sortBy = 'id', direction = 'desc') => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['order-history', user?.id, pageNo, pageSize, sortBy, direction],
        queryFn: async () => await getOrderHistory(user?.id, pageNo, pageSize, sortBy, direction),
        enabled: !!user?.id,
    });
};
