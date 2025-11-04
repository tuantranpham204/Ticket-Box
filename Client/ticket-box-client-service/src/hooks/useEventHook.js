import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { handleApiResponse } from '../api/apiClient';

// --- API Functions ---
// These functions define how to fetch/mutate data.

const getEventById = (eventId) => {
  return handleApiResponse(apiClient.get(`/api/events/event/${eventId}`));
};

const updateEvent = ({ eventId, creatorUserId, formData }) => {
  // We send formData directly as it's multipart/form-data
  return handleApiResponse(
    apiClient.put(`/api/events/update/${eventId}/${creatorUserId}`, formData, {
      headers: {
        // Axios will automatically set the correct Content-Type for FormData
        'Content-Type': 'multipart/form-data',
      },
    })
  );
};

const approveEvent = ({ eventId, approverUserId }) => {
  return handleApiResponse(
    apiClient.put(`/api/events/approve/${eventId}/${approverUserId}`)
  );
};

// --- React Query Hooks ---
// These hooks are used by our components to interact with the API.

/**
 * Hook to fetch public details for a single event.
 * @param {number} eventId
 */
export const useGetEvent = (eventId) => {
  return useQuery({
    queryKey: ['event', eventId], // Unique key for this query
    queryFn: () => getEventById(eventId),
    enabled: !!eventId, // Only run if eventId is provided
  });
};

/**
 * Hook to update an event.
 * This demonstrates the "GOLDEN RULE" of cache invalidation.
 */
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEvent, // The function that performs the update
    onSuccess: (data, variables) => {
      // --- THE GOLDEN RULE ---
      // The PUT was successful. The backend's Redis cache is cleared.
      // Now, we MUST invalidate our client-side cache to force a refetch.
      console.log('Update successful, invalidating event cache...');
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      
      // We can also invalidate lists where this event appears.
      queryClient.invalidateQueries({ queryKey: ['events', 'creator'] });
    },
    onError: (error) => {
      // Handle mutation errors (e.g., show a toast notification)
      console.error('Failed to update event:', error.message);
    },
  });
};

/**
 * Hook for an Approver to approve an event.
 * This also follows the "Golden Rule".
 */
export const useApproveEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveEvent,
    onSuccess: (data, variables) => {
      // --- THE GOLDEN RULE ---
      console.log('Approve successful, invalidating caches...');
      
      // 1. Invalidate the specific event
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      
      // 2. Invalidate the approver's "to-do" list
      queryClient.invalidateQueries({ queryKey: ['events', 'approver'] });
    },
    onError: (error) => {
      console.error('Failed to approve event:', error.message);
    },
  });
};

// ... We would create similar hooks for all other endpoints ...
// - useGetEventsByCategory(categoryId, pageNo, pageSize)
// - useCreateEvent()
// - useGetCart(userId)
// - useAddToCart()
// - usePurchaseCart()
// - useValidateQrCode()
// - useConfirmQrCode()
