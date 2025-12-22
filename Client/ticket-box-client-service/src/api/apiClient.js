import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

// Base URL from the API documentation
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_CORE_BASE_URL,
});

// --- Request Interceptor ---
// This interceptor automatically adds the auth token to every request.
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// This interceptor handles 401/403 errors by logging the user out
// and redirecting them to the login page.
apiClient.interceptors.response.use(
  (response) => {
    // All successful 2xx responses will just pass through.
    // We will unwrap the `data` field in the specific API functions.
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("Authentication Error: Logging out user.");
      // Call the logout action from our Zustand store
      useAuthStore.getState().logout();
      // Redirect to login page
      window.location.href = '/login';
    }

    // Global Error Toast for HTTP errors
    const errorMessage = error.response?.data?.message || error.message || "A network error occurred.";
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

/**
 * A helper function to handle API responses.
 * All backend responses are wrapped in { code, message, data }.
 * This function unwraps the `data` field for successful requests.
 * @param {Promise} request - The Axios request promise.
 * @returns {Promise<any>} - The `data` field from the API response.
 */
export const handleApiResponse = async (request) => {
  try {
    const response = await request;
    // `data` here is the Axios response data, which is our backend's ApiResponse object
    const apiResponse = response.data;

    if (apiResponse.code == 200 && apiResponse.data !== undefined) {
      return apiResponse.data;
    } else {
      const msg = apiResponse.message || 'An API error occurred.';
      toast.error(msg); // Toast logical errors too
      throw new Error(msg);
    }
  } catch (error) {
    throw error;
  }
};

export default apiClient;
