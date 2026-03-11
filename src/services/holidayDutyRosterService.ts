// src/services/holidayDutyRosterService.ts

import { apiServices } from './apiServices';
import {
  HolidayDutyRoster,
  CreateHolidayDutyRosterRequest,
  UpdateHolidayDutyRosterRequest,
  BulkCreateHolidayDutyRosterRequest,
  ApiResponse
} from './apiInterfaces';

class HolidayDutyRosterService {
  // Get all holiday duty rosters
  async getHolidayDutyRosters(params?: {
    holidayId?: number;
    userId?: number;
  }) {
    try {
      const response = await apiServices.getHolidayDutyRosters(params);
      return response;
    } catch (error) {
      console.error('Error fetching holiday duty rosters:', error);
      throw error;
    }
  }

  // Get single roster by ID
  async getHolidayDutyRosterById(id: number) {
    try {
      const response = await apiServices.getHolidayDutyRosterById(id);
      return response;
    } catch (error) {
      console.error(`Error fetching holiday duty roster with id ${id}:`, error);
      throw error;
    }
  }

  // Get rosters for a specific holiday
  async getHolidayDutyRosterByHolidayId(holidayId: number) {
    try {
      const response = await apiServices.getHolidayDutyRosterByHolidayId(holidayId);
      return response;
    } catch (error) {
      console.error(`Error fetching holiday duty roster for holiday ${holidayId}:`, error);
      throw error;
    }
  }

  // Get rosters for a specific user
  async getHolidayDutyRosterByUserId(userId: number) {
    try {
      const response = await apiServices.getHolidayDutyRosterByUserId(userId);
      return response;
    } catch (error) {
      console.error(`Error fetching holiday duty roster for user ${userId}:`, error);
      throw error;
    }
  }

  // Create single roster entry
  async createHolidayDutyRoster(data: CreateHolidayDutyRosterRequest) {
    try {
      const response = await apiServices.createHolidayDutyRoster(data);
      return response;
    } catch (error) {
      console.error('Error creating holiday duty roster:', error);
      throw error;
    }
  }

  // Create bulk roster entries
  async createBulkHolidayDutyRoster(data: BulkCreateHolidayDutyRosterRequest) {
    try {
      const response = await apiServices.createBulkHolidayDutyRoster(data);
      return response;
    } catch (error) {
      console.error('Error creating bulk holiday duty rosters:', error);
      throw error;
    }
  }

  // Update roster entry
  async updateHolidayDutyRoster(id: number, data: UpdateHolidayDutyRosterRequest) {
    try {
      const response = await apiServices.updateHolidayDutyRoster(id, data);
      return response;
    } catch (error) {
      console.error(`Error updating holiday duty roster with id ${id}:`, error);
      throw error;
    }
  }

  // Delete roster entry
  async deleteHolidayDutyRoster(id: number) {
    try {
      const response = await apiServices.deleteHolidayDutyRoster(id);
      return response;
    } catch (error) {
      console.error(`Error deleting holiday duty roster with id ${id}:`, error);
      throw error;
    }
  }

  // Helper: Get all staff assigned to a holiday
  async getStaffForHoliday(holidayId: number) {
    try {
      const response = await this.getHolidayDutyRosterByHolidayId(holidayId);
      return response;
    } catch (error) {
      console.error(`Error fetching staff for holiday ${holidayId}:`, error);
      throw error;
    }
  }

  // Helper: Get all holidays a user is assigned to
  async getHolidaysForUser(userId: number) {
    try {
      const response = await this.getHolidayDutyRosterByUserId(userId);
      return response;
    } catch (error) {
      console.error(`Error fetching holidays for user ${userId}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
export const holidayDutyRosterService = new HolidayDutyRosterService();

export default HolidayDutyRosterService;
