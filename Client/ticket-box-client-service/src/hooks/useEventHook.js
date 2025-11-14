import { useQuery } from '@tanstack/react-query';
import apiClient, { handleApiResponse } from '../api/apiClient';

// --- API Functions ---

/**
 * Fetches public details for a single event.
 * GET /api/events/event/{eventId}
 */
const getEventById = (eventId) => {
  if (!eventId) return Promise.reject(new Error('Event ID is required.'));
  return handleApiResponse(apiClient.get(`/events/event/${eventId}`));
};

/**
 * Fetches approved tickets for a single event.
 * GET /api/tickets/event/{eventId}
 * Note: Your API doc shows this is paginated.
 */
const getTicketsByEventId = (eventId) => {
  if (!eventId) return Promise.reject(new Error('Event ID is required.'));
  // Fetches the first page of tickets
  return handleApiResponse(apiClient.get(`/tickets/event/${eventId}`, {
    params: {
      pageNo: 1,
      pageSize: 50, // Get up to 50 ticket types
    }
  }));
};

/**
 * --- NEW ---
 * Fetches a paginated list of approved events by category.
 * GET /api/events/category/{catId}
 */
const getEventsByCategory = (categoryId, page = 1, pageSize = 10) => {
  if (!categoryId) return Promise.reject(new Error('Category ID is required.'));
  
  return handleApiResponse(apiClient.get(`/events/category/${categoryId}`, {
    params: {
      pageNo: page,
      pageSize: pageSize,
      // sortBy: 'startDate' // We can add sorting later
    }
  }));
  // This will return the CustomPage<EventResponse> object
};


// --- React Query Hooks ---

/**
 * Hook to fetch details for a single event.
 * Caches the data with the key ['event', eventId]
 */
export const useEventDetails = (eventId) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEventById(eventId),
    enabled: !!eventId, // Only run the query if eventId is not null/undefined
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

/**
 * Hook to fetch tickets for a single event.
 * Caches data with key ['eventTickets', eventId]
 */
export const useEventTickets = (eventId) => {
  return useQuery({
    queryKey: ['eventTickets', eventId],
    queryFn: () => getTicketsByEventId(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes (tickets change more often)
  });
};

/**
 * --- NEW ---
 * Hook to fetch events for a specific category.
 * Caches data with key ['events', 'category', categoryId]
 */
export const useEventsByCategory = (categoryId) => {
  return useQuery({
    queryKey: ['events', 'category', categoryId],
    queryFn: () => getEventsByCategory(categoryId), // Fetches page 1, 10 items
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// --- TODO: Add Mutations (Create, Update, Approve) ---
// We will add `useMutation` hooks here for creating, updating,
// and approving events, following the "Golden Rule".