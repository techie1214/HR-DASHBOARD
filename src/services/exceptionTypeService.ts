import axios from 'axios';
import { API_ENDPOINT } from '../config/config';

export interface ExceptionType {
  id: number;
  name: string;
  code: string;
  description?: string;
  icon: string;
  color: string;
  default_start_time?: string;
  default_end_time?: string;
  default_break_duration: number;
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateExceptionTypeRequest {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  default_start_time?: string;
  default_end_time?: string;
  default_break_duration?: number;
  sort_order?: number;
}

export interface UpdateExceptionTypeRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  default_start_time?: string;
  default_end_time?: string;
  default_break_duration?: number;
  sort_order?: number;
}

class ExceptionTypeService {
  /**
   * Get all exception types
   */
  async getExceptionTypes(activeOnly: boolean = false) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${API_ENDPOINT}/shift-exception-types?activeOnly=${activeOnly}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching exception types:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch exception types',
      };
    }
  }

  /**
   * Get exception type by ID
   */
  async getExceptionTypeById(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${API_ENDPOINT}/shift-exception-types/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching exception type ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch exception type',
      };
    }
  }

  /**
   * Create new exception type
   */
  async createExceptionType(data: CreateExceptionTypeRequest) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_ENDPOINT}/shift-exception-types`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating exception type:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create exception type',
      };
    }
  }

  /**
   * Update exception type
   */
  async updateExceptionType(id: number, data: UpdateExceptionTypeRequest) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `${API_ENDPOINT}/shift-exception-types/${id}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error updating exception type ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update exception type',
      };
    }
  }

  /**
   * Delete exception type
   */
  async deleteExceptionType(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(
        `${API_ENDPOINT}/shift-exception-types/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting exception type ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete exception type',
      };
    }
  }

  /**
   * Toggle exception type active status
   */
  async toggleExceptionTypeActive(id: number) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.patch(
        `${API_ENDPOINT}/shift-exception-types/${id}/toggle`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error toggling exception type ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to toggle exception type',
      };
    }
  }
}

// Create a singleton instance
export const exceptionTypeService = new ExceptionTypeService();
export default ExceptionTypeService;
