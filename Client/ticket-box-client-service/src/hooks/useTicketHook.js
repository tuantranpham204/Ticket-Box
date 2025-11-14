import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { handleApiResponse } from '../api/apiClient';

export const useGetTicketsByEventId = (eventId) => {
  return useQuery({
    queryKey: ['event', eventId], // Unique key for this query
    queryFn: handleApiResponse(apiClient.get(`/api/tickets/event/${eventId}`)),
    enabled: !!eventId, // Only run if eventId is provided
  });
};
