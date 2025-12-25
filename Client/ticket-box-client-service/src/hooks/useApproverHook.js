import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import apiClient, { handleApiResponse } from '../api/apiClient';
import { useAuthStore } from '../store/useAuthStore';

// API Functions

const approveEvent = async ({ eventId, approverId }) => {
    return await handleApiResponse(apiClient.put(`/events/approve/${eventId}/${approverId}`));
};

const declineEvent = async ({ eventId, approverId }) => {
    return await handleApiResponse(apiClient.put(`/events/decline/${eventId}/${approverId}`));
};

const getEventContract = async (eventId) => {
    return await handleApiResponse(apiClient.get(`/events/contract/${eventId}`));
};

const validateTicket = async (token) => {
    return await handleApiResponse(apiClient.put(`/order-tickets/validate-token`, null, {
        params: { token }
    }));
};

// React Query Hooks

export const useApproveEventMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore.getState();

    return useMutation({
        mutationFn: async (eventId) => {
            if (!user?.id) throw new Error("User ID not found");
            return await approveEvent({ eventId, approverId: user.id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['events']); // Refresh event lists
        },
    });
};

export const useDeclineEventMutation = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore.getState();

    return useMutation({
        mutationFn: async (eventId) => {
            if (!user?.id) throw new Error("User ID not found");
            return await declineEvent({ eventId, approverId: user.id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['events']);
        },
    });
};

export const useEventContract = (eventId) => {
    return useQuery({
        queryKey: ['contract', eventId],
        queryFn: async () => await getEventContract(eventId),
        enabled: !!eventId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useValidateTicketMutation = () => {
    return useMutation({
        mutationFn: validateTicket
    });
};
