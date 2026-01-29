// Service initialization module
// This file initializes all the services used in the application

import { initializeAuth } from './authService';
import { initializeSystem } from './systemApi';

// Initialize all services
export const initServices = async () => {
  try {
    console.log('Initializing services...');
    
    // Initialize authentication service
    await initializeAuth();
    
    // Initialize system service
    await initializeSystem();
    
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Error initializing services:', error);
    throw error;
  }
};