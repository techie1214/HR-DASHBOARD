import axios from 'axios';
import { Endpoint } from '../config/config';

interface AdminCredentials {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Service to check system readiness
export const checkSystemReadiness = async (): Promise<{ ready?: boolean; initialized?: boolean; }> => {
  try {
    console.log('Making API call to:', Endpoint.CHECK_INITIALIZATION_STATUS);
    const response = await axios.get(Endpoint.CHECK_INITIALIZATION_STATUS);
    console.log('API Response:', response.data);

    // Extract the isInitialized value from the new response format
    const isInitialized = response.data.data?.isInitialized || false;
    return { ready: isInitialized, initialized: isInitialized };
  } catch (error) {
    console.error('Error checking system readiness:', error);
    // If there's a network error, check localStorage as a fallback
    const systemInitialized = localStorage.getItem("systemInitialized") === "true";
    console.log('Using fallback, systemInitialized:', systemInitialized);
    return { ready: systemInitialized, initialized: systemInitialized };
  }
};

// Service to initialize the system
export const initializeSystem = async (credentials: AdminCredentials): Promise<ApiResponse> => {
  try {
    console.log('Making API call to:', Endpoint.INITIALIZE_SYSTEM, 'with data:', credentials);
    const response = await axios.post(Endpoint.INITIALIZE_SYSTEM, credentials);
    console.log('API Response:', response.data);

    // Update localStorage on success
    if (response.data.success) {
      localStorage.setItem("systemInitialized", "true");
      localStorage.setItem("adminEmail", credentials.email);
    }

    return response.data;
  } catch (error: any) {
    console.error('Error initializing system:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred during system initialization',
    };
  }
};

// Generic API service function for other endpoints
export const apiCall = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('API call error:', error);
    return { success: false, error: error.message || 'An error occurred' };
  }
};