import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Base URL from the API documentation
const CORE_BASE_URL = import.meta.env.CORE_BASE_URL;

const apiClient = axios.create({
  baseURL: CORE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
      // We'll use window.location as this is outside React's context.
      window.location.href = '/login';
    }
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
    
    if (apiResponse.code === 0 && apiResponse.data !== undefined) {
      return apiResponse.data;
    } else {
      // Handle business logic errors (e.g., code: 1001, message: "Username taken")
      throw new Error(apiResponse.message || 'An API error occurred.');
    }
  } catch (error) {
    // Handle network/interceptor errors
    throw error;
  }
};

export default apiClient;
