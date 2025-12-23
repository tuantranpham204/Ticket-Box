import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import apiClient, { handleApiResponse } from '../api/apiClient';
import { useAuthStore } from '../store/useAuthStore'
// API Functions 

const getEventById = async (eventId) => {
  if (!eventId) return Promise.reject(new Error('Event ID is required.'));
  return await handleApiResponse(apiClient.get(`/events/event/${eventId}`));
};

const searchEventsByParams = async (searchParams) => {
  if (!searchParams) return Promise.reject(new Error('Nothing entered to search.'));
  return await handleApiResponse(apiClient.get(`/events/search/${searchParams}`))
}

const getEventsByCategory = async (categoryId, status, page = 1, pageSize = 10) => {
  if (!categoryId) return Promise.reject(new Error('Category ID is required.'))

  // Handle array of statuses
  if (Array.isArray(status)) {
    try {
      const promises = status.map(s => getEventsByCategory(categoryId, s, page, pageSize));
      const results = await Promise.all(promises);

      // Merge pageContent from all results
      const allEvents = results.reduce((acc, result) => {
        return acc.concat(result?.pageContent || []);
      }, []);

      // Sort by startDate (ascending)
      allEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      // Return a synthetic page object
      return {
        pageContent: allEvents,
        totalPages: 1,
        totalElements: allEvents.length
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // If status is provided, append it to the path
  const url = status !== undefined
    ? `/events/category/${categoryId}/${status}`
    : `/events/category/${categoryId}`;

  return await handleApiResponse(apiClient.get(url, {
    params: {
      pageNo: page,
      pageSize: pageSize,
    }
  }));
};

const getEventsByStatus = async (status, page = 1, pageSize = 10) => {
  if (status === undefined) return Promise.reject(new Error('Status is required.'));
  return await handleApiResponse(apiClient.get(`/events/${status}`, {
    params: {
      pageNo: page,
      pageSize: pageSize
    }
  }));
};

const createEvent = async ({ creatorUserId, eventData }) => {
  // Sends JSON data to create the event entity
  return await handleApiResponse(
    apiClient.post(`/events/create/${creatorUserId}`, eventData)
  );
};
const uploadEventFiles = async ({ eventId, formData }) => {
  // Sends files (images, PDFs) to the specific upload endpoint
  return await handleApiResponse(
    apiClient.put(`/events/upload/${eventId}`, formData)
  );
};



// React Query Hooks 
export const useEventByEventId = (eventId) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => await getEventById(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
};

export const useEventsByEventIds = ({ eventIds }) => {
  return useQuery({
    queryKey: ['events', eventIds],
    queryFn: async () => {
      if (!eventIds) return Promise.reject(new Error('List of event ids is required.'))
      return await handleApiResponse(apiClient.get(`/events/events`, {
        params: { eventId: eventIds }
      }))
    },
    enabled: !!eventIds,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}

export const useSearchEventsByParams = (searchParams) => {
  return useQuery({
    queryKey: ['params', searchParams],
    queryFn: async () => await searchEventsByParams(searchParams),
    enabled: !!searchParams,
    staleTime: 1000 * 60
  })
}
export const useEventsByCategory = (categoryId, status, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['events', 'category', categoryId, status, page, pageSize],
    queryFn: async () => await getEventsByCategory(categoryId, status, page, pageSize),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useEventsByStatus = (status, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['events', 'status', status, page, pageSize],
    queryFn: async () => await getEventsByStatus(status, page, pageSize),
    enabled: status !== undefined,
    staleTime: 1000 * 60 * 5,
  });
};
export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore.getState();
  return useMutation({
    mutationFn: async ({ generalData, formData }) => {
      // Step 1: Create the event entity (Text fields)
      const eventResponse = await createEvent({
        creatorUserId: user?.id,
        eventData: generalData
      });
      if (!eventResponse?.id) {
        throw new Error("Failed to create event: No ID returned.");
      }
      const newEventId = eventResponse.id;
      // Step 2: Upload files to the new event ID
      // We check if the formData has any entries before sending
      if (formData) {
        await uploadEventFiles({
          eventId: newEventId,
          formData: formData
        });
      }
      return eventResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
    },
  });
};

