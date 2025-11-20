import { useQuery } from '@tanstack/react-query';
import apiClient, { handleApiResponse } from '../api/apiClient';

// API Functions 

const getEventById = async(eventId) => {
  if (!eventId) return Promise.reject(new Error('Event ID is required.'));
  return await handleApiResponse(apiClient.get(`/events/event/${eventId}`));
};

const searchEventsByParams = async(searchParams) => {
  if (!searchParams) return Promise.reject(new Error('Nothing entered to search.'));
  return await handleApiResponse(apiClient.get(`/events/search/${searchParams}`))
}

const getEventsByCategory = async(categoryId, page = 1, pageSize = 10) => {
  if (!categoryId) return Promise.reject(new Error('Category ID is required.'))
  return await handleApiResponse(apiClient.get(`/events/category/${categoryId}`, {
    params: {
      pageNo: page,
      pageSize: pageSize,
      // sortBy: 'startDate' // We can add sorting later
    }
  }));
  // This will return the CustomPage<EventResponse> object
};


// React Query Hooks 
export const useEventByEventId = (eventId) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async() => await getEventById(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
};

export const useEventsByEventIds = ({ eventIds }) => {
  return useQuery({
    queryKey: ['events', eventIds],
    queryFn: async() => {
      if (!eventIds) return Promise.reject(new Error('List of event ids is required.'))
      return await handleApiResponse(apiClient.get(`/events/events`, {
        params: {eventId : eventIds}
      }))
    },
    enabled: !!eventIds,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}

export const useSearchEventsByParams = (searchParams) => {
  return useQuery({
    queryKey: ['params', searchParams],
    queryFn: async() => await searchEventsByParams(searchParams),
    enabled: !!searchParams,
    staleTime: 1000 * 60
  })
}

export const useEventsByCategory = (categoryId) => {
  return useQuery({
    queryKey: ['events', 'category', categoryId],
    queryFn: async() => await getEventsByCategory(categoryId), // Fetches page 1, 10 items
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};





// --- TODO: Add Mutations (Create, Update, Approve) ---
// We will add `useMutation` hooks here for creating, updating,
// and approving events, following the "Golden Rule".