// src/services/shiftSchedulingService.ts

import { apiServices } from './apiServices';
import {
  ShiftTemplate,
  CreateShiftTemplateRequest,
  UpdateShiftTemplateRequest,
  EmployeeShiftAssignment,
  AssignShiftToEmployeeRequest,
  UpdateEmployeeShiftAssignmentRequest,
  ScheduleRequest,
  CreateScheduleRequestRequest,
  UpdateScheduleRequestRequest,
  TimeOffBank,
  CreateTimeOffBankRequest,
  ApiResponse
} from './apiInterfaces';

class ShiftSchedulingService {
  // Shift Template methods
  async getShiftTemplates() {
    try {
      const response = await apiServices.getShiftTemplates();
      return response;
    } catch (error) {
      console.error('Error fetching shift templates:', error);
      throw error;
    }
  }

  async getShiftTemplateById(id: number) {
    try {
      const response = await apiServices.getShiftTemplateById(id);
      return response;
    } catch (error) {
      console.error(`Error fetching shift template with id ${id}:`, error);
      throw error;
    }
  }

  async createShiftTemplate(data: CreateShiftTemplateRequest) {
    try {
      const response = await apiServices.createShiftTemplate(data);
      return response;
    } catch (error) {
      console.error('Error creating shift template:', error);
      throw error;
    }
  }

  async updateShiftTemplate(id: number, data: UpdateShiftTemplateRequest) {
    try {
      const response = await apiServices.updateShiftTemplate(id, data);
      return response;
    } catch (error) {
      console.error(`Error updating shift template with id ${id}:`, error);
      throw error;
    }
  }

  async deleteShiftTemplate(id: number) {
    try {
      const response = await apiServices.deleteShiftTemplate(id);
      return response;
    } catch (error) {
      console.error(`Error deleting shift template with id ${id}:`, error);
      throw error;
    }
  }

  // Employee Shift Assignment methods
  async getEmployeeShiftAssignments() {
    try {
      const response = await apiServices.getEmployeeShiftAssignments();
      return response;
    } catch (error) {
      console.error('Error fetching employee shift assignments:', error);
      throw error;
    }
  }

  async getEmployeeShiftAssignmentById(id: number) {
    try {
      const response = await apiServices.getEmployeeShiftAssignmentById(id);
      return response;
    } catch (error) {
      console.error(`Error fetching employee shift assignment with id ${id}:`, error);
      throw error;
    }
  }

  async assignShiftToEmployee(data: AssignShiftToEmployeeRequest) {
    try {
      const response = await apiServices.assignShiftToEmployee(data);
      return response;
    } catch (error) {
      console.error('Error assigning shift to employee:', error);
      throw error;
    }
  }

  async updateEmployeeShiftAssignment(id: number, data: UpdateEmployeeShiftAssignmentRequest) {
    try {
      const response = await apiServices.updateEmployeeShiftAssignment(id, data);
      return response;
    } catch (error) {
      console.error(`Error updating employee shift assignment with id ${id}:`, error);
      throw error;
    }
  }

  async bulkAssignShifts(assignments: AssignShiftToEmployeeRequest[]) {
    try {
      const response = await apiServices.bulkAssignShifts(assignments);
      return response;
    } catch (error) {
      console.error('Error bulk assigning shifts:', error);
      throw error;
    }
  }

  // Schedule Request methods
  async getScheduleRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    requestType?: string;
    userId?: number;
  }) {
    try {
      const response = await apiServices.getScheduleRequests(params);
      return response;
    } catch (error) {
      console.error('Error fetching schedule requests:', error);
      throw error;
    }
  }

  async getScheduleRequestById(id: number) {
    try {
      const response = await apiServices.getScheduleRequestById(id);
      return response;
    } catch (error) {
      console.error(`Error fetching schedule request with id ${id}:`, error);
      throw error;
    }
  }

  async createScheduleRequest(data: CreateScheduleRequestRequest) {
    try {
      const response = await apiServices.createScheduleRequest(data);
      return response;
    } catch (error) {
      console.error('Error creating schedule request:', error);
      throw error;
    }
  }

  async updateScheduleRequest(id: number, data: UpdateScheduleRequestRequest) {
    try {
      const response = await apiServices.updateScheduleRequest(id, data);
      return response;
    } catch (error) {
      console.error(`Error updating schedule request with id ${id}:`, error);
      throw error;
    }
  }

  async cancelScheduleRequest(id: number) {
    try {
      const response = await apiServices.cancelScheduleRequest(id);
      return response;
    } catch (error) {
      console.error(`Error cancelling schedule request with id ${id}:`, error);
      throw error;
    }
  }

  async approveScheduleRequest(id: number) {
    try {
      const response = await apiServices.approveScheduleRequest(id);
      return response;
    } catch (error) {
      console.error(`Error approving schedule request with id ${id}:`, error);
      throw error;
    }
  }

  async rejectScheduleRequest(id: number) {
    try {
      const response = await apiServices.rejectScheduleRequest(id);
      return response;
    } catch (error) {
      console.error(`Error rejecting schedule request with id ${id}:`, error);
      throw error;
    }
  }

  // Shift Schedule methods
  async getShiftSchedules(params?: {
    date?: string;
    department?: string;
    limit?: number;
    page?: number;
  }) {
    try {
      const response = await apiServices.getShiftSchedules(params);
      return response;
    } catch (error) {
      console.error('Error fetching shift schedules:', error);
      throw error;
    }
  }

  async createShiftSchedule(data: {employee_id: number, shift_type: string, date: string, start_time: string, end_time: string, department: string, status: string}) {
    try {
      const response = await apiServices.createShiftSchedule(data);
      return response;
    } catch (error) {
      console.error('Error creating shift schedule:', error);
      throw error;
    }
  }

  async updateShiftSchedule(id: number, data: {employee_id?: number, shift_type?: string, date?: string, start_time?: string, end_time?: string, department?: string, status?: string}) {
    try {
      const response = await apiServices.updateShiftSchedule(id, data);
      return response;
    } catch (error) {
      console.error(`Error updating shift schedule with id ${id}:`, error);
      throw error;
    }
  }

  async deleteShiftSchedule(id: number) {
    try {
      const response = await apiServices.deleteShiftSchedule(id);
      return response;
    } catch (error) {
      console.error(`Error deleting shift schedule with id ${id}:`, error);
      throw error;
    }
  }

  // Time Off Bank methods
  async getTimeOffBanks(params?: {
    userId?: number;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await apiServices.getTimeOffBanks(params);
      return response;
    } catch (error) {
      console.error('Error fetching time off banks:', error);
      throw error;
    }
  }

  async getMyTimeOffBankBalance() {
    try {
      const response = await apiServices.getMyTimeOffBankBalance();
      return response;
    } catch (error) {
      console.error('Error fetching my time off bank balance:', error);
      throw error;
    }
  }

  async createTimeOffBank(data: CreateTimeOffBankRequest) {
    try {
      const response = await apiServices.createTimeOffBank(data);
      return response;
    } catch (error) {
      console.error('Error creating time off bank:', error);
      throw error;
    }
  }

  // Helper methods
  async getShiftAssignmentsForUser(userId: number) {
    try {
      const allAssignments = await this.getEmployeeShiftAssignments();
      if (allAssignments.success && allAssignments.data) {
        const filteredAssignments = allAssignments.data.employeeShiftAssignments.filter(
          assignment => assignment.user_id === userId
        );
        return {
          success: true,
          message: 'User shift assignments retrieved successfully',
          data: { employeeShiftAssignments: filteredAssignments }
        };
      }
      return allAssignments;
    } catch (error) {
      console.error(`Error fetching shift assignments for user ${userId}:`, error);
      throw error;
    }
  }

  async getActiveShiftAssignmentForUser(userId: number) {
    try {
      const userAssignments = await this.getShiftAssignmentsForUser(userId);
      if (userAssignments.success && userAssignments.data) {
        const activeAssignment = userAssignments.data.employeeShiftAssignments.find(
          assignment => assignment.status === 'active'
        );
        return {
          success: true,
          message: 'Active shift assignment retrieved successfully',
          data: { employeeShiftAssignment: activeAssignment }
        };
      }
      return userAssignments;
    } catch (error) {
      console.error(`Error fetching active shift assignment for user ${userId}:`, error);
      throw error;
    }
  }

  async getScheduleRequestsForUser(userId: number) {
    try {
      const response = await this.getScheduleRequests({ userId });
      return response;
    } catch (error) {
      console.error(`Error fetching schedule requests for user ${userId}:`, error);
      throw error;
    }
  }

  async getTimeOffBanksForUser(userId: number) {
    try {
      const response = await this.getTimeOffBanks({ userId });
      return response;
    } catch (error) {
      console.error(`Error fetching time off banks for user ${userId}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance of the Shift Scheduling service
export const shiftSchedulingService = new ShiftSchedulingService();

export default ShiftSchedulingService;