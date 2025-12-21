import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import apiClient, { handleApiResponse } from '../api/apiClient';
import { useAuthStore } from '../store/useAuthStore'

const getTicketsByEventId = async (eventId) => {
  if (!eventId) return Promise.reject(new Error('Event ID is required.'));
  return await handleApiResponse(apiClient.get(`/tickets/event/${eventId}`, {
    params: {
      pageNo: 1,
      pageSize: 50, // Get up to 50 ticket types
    }
  }));
};
const getLowestPriceByEventId = async (eventId) => {
  if (!eventId) return Promise.reject(new Error('Event ID is required.'));
  return await handleApiResponse(apiClient.get(`/tickets/lowest-price/${eventId}`));
};
const createTicket = async ({ userId, eventId, ticketData }) => {
  // Endpoint: /api/tickets/create/{eventId}/{creatorUserId}
  return await handleApiResponse(
    apiClient.post(`/tickets/create/${eventId}/${userId}`, ticketData)
  );
};


// HOOKS
export const useGetTicketsByEventId = (eventId) => {
  return useQuery({
    queryKey: ['tickets', eventId],
    queryFn: async () => await getTicketsByEventId(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5
  });
};
export const useLowestTicketPriceByEventId = (eventId) => {
  return useQuery({
    queryKey: ['lowestPrice', eventId],
    queryFn: async () => await getLowestPriceByEventId(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};

export const useCreateTicketMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore.getState();

  return useMutation({
    mutationFn: (data) => createTicket({
      userId: user?.id,
      eventId: data.eventId,
      ticketData: data.ticketData
    }),
    onSuccess: () => {
      // Invalidate queries if necessary, though usually we redirect after creation
      queryClient.invalidateQueries(['tickets']);
    },
  });
};


