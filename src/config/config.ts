
// Use Vite's import.meta.env for environment variables
export const API_ENDPOINT = import.meta.env.VITE_API_Endpoint || 'http://localhost:3000/api';

export const Endpoint = {
  SYSTEM_READINESS: `${API_ENDPOINT}/system-complete/readiness`,
  INITIALIZE_SYSTEM: `${API_ENDPOINT}/system-complete/setup-complete`, // Based on your API documentation
  CHECK_INITIALIZATION_STATUS: `${API_ENDPOINT}/system-complete/readiness`,
  INITIALIZE_SYSTEM_NO_MIGRATIONS: `${API_ENDPOINT}/system/initialize`,
};