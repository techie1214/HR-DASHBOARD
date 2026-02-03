// src/services/holidayService.ts

import { apiServices } from './apiServices';
import {
  Holiday,
  CreateHolidayRequest,
  UpdateHolidayRequest,
  ApiResponse
} from './apiInterfaces';

class HolidayService {
  async getHolidays(params?: {
    branchId?: number;
    date?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
  }) {
    try {
      const response = await apiServices.getHolidays(params);
      return response;
    } catch (error) {
      console.error('Error fetching holidays:', error);
      throw error;
    }
  }

  async getHolidayById(id: number) {
    try {
      const response = await apiServices.getHolidayById(id);
      return response;
    } catch (error) {
      console.error(`Error fetching holiday with id ${id}:`, error);
      throw error;
    }
  }

  async createHoliday(data: CreateHolidayRequest) {
    try {
      const response = await apiServices.createHoliday(data);
      return response;
    } catch (error) {
      console.error('Error creating holiday:', error);
      throw error;
    }
  }

  async updateHoliday(id: number, data: UpdateHolidayRequest) {
    try {
      const response = await apiServices.updateHoliday(id, data);
      return response;
    } catch (error) {
      console.error(`Error updating holiday with id ${id}:`, error);
      throw error;
    }
  }

  async deleteHoliday(id: number) {
    try {
      const response = await apiServices.deleteHoliday(id);
      return response;
    } catch (error) {
      console.error(`Error deleting holiday with id ${id}:`, error);
      throw error;
    }
  }

  // Helper methods
  async getHolidaysForDate(date: string) {
    try {
      const response = await apiServices.getHolidays({ date });
      return response;
    } catch (error) {
      console.error(`Error fetching holidays for date ${date}:`, error);
      throw error;
    }
  }

  async getHolidaysForDateRange(startDate: string, endDate: string) {
    try {
      const response = await apiServices.getHolidays({ startDate, endDate });
      return response;
    } catch (error) {
      console.error(`Error fetching holidays for date range ${startDate} to ${endDate}:`, error);
      throw error;
    }
  }

  async getHolidaysForBranch(branchId: number) {
    try {
      const response = await apiServices.getHolidays({ branchId });
      return response;
    } catch (error) {
      console.error(`Error fetching holidays for branch ${branchId}:`, error);
      throw error;
    }
  }

  // Check if a specific date is a holiday
  async isHoliday(date: string): Promise<boolean> {
    try {
      const response = await apiServices.getHolidays({ date });
      if (response.success && response.data) {
        return response.data.holidays.length > 0;
      }
      return false;
    } catch (error) {
      console.error(`Error checking if ${date} is a holiday:`, error);
      return false;
    }
  }

}

// Create a singleton instance of the Holiday service
export const holidayService = new HolidayService();

export default HolidayService;