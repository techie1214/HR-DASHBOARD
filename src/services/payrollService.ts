// src/services/payrollService.ts

import { apiServices } from './apiServices';
import { ApiResponse } from './apiInterfaces';

interface PayrollRun {
  id: number;
  run_name: string;
  pay_period: string; // YYYY-MM
  status: 'draft' | 'processing' | 'completed' | 'failed';
  total_employees: number;
  total_amount: number;
  processed_by: number;
  processed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PayrollRecord {
  id: number;
  user_id: number;
  user_name: string;
  payroll_run_id: number;
  pay_period: string; // YYYY-MM
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  payment_status: 'pending' | 'paid' | 'failed';
  processed_at: string | null;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Payslip {
  id: number;
  user_id: number;
  user_name: string;
  pay_period: string; // YYYY-MM
  earnings: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
  deductions: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at: string;
}

interface PaymentType {
  id: number;
  name: string;
  description: string;
  category: 'earning' | 'deduction';
  calculation_method: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StaffPaymentStructure {
  id: number;
  user_id: number;
  payment_type_id: number;
  amount: number;
  effective_from: string;
  effective_to: string | null;
  is_percentage_based: boolean;
  percentage_value: number | null;
  created_at: string;
  updated_at: string;
}

interface CreatePayrollRunRequest {
  run_name: string;
  pay_period: string; // YYYY-MM
  employee_ids?: number[]; // Optional: specific employees
  branch_id?: number; // Optional: specific branch
  process_date?: string; // Optional: specific process date
}

interface CreatePaymentTypeRequest {
  name: string;
  description: string;
  category: 'earning' | 'deduction';
  calculation_method: string;
  is_active: boolean;
}

interface UpdatePaymentTypeRequest {
  name?: string;
  description?: string;
  category?: 'earning' | 'deduction';
  calculation_method?: string;
  is_active?: boolean;
}

interface CreateStaffPaymentStructureRequest {
  user_id: number;
  payment_type_id: number;
  amount: number;
  effective_from: string;
  effective_to?: string | null;
  is_percentage_based?: boolean;
  percentage_value?: number | null;
}

interface UpdateStaffPaymentStructureRequest {
  amount?: number;
  effective_from?: string;
  effective_to?: string | null;
  is_percentage_based?: boolean;
  percentage_value?: number | null;
}

class PayrollService {
  // Payroll Run methods
  async getPayrollRuns(params?: {
    status?: string;
    payPeriod?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ payrollRuns: PayrollRun[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.status) queryParams.append('status', params.status);
      if (params?.payPeriod) queryParams.append('payPeriod', params.payPeriod);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/payroll-runs?${queryString}` : '/payroll-runs';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching payroll runs:', error);
      throw error;
    }
  }

  async getPayrollRunById(id: number): Promise<ApiResponse<{ payrollRun: PayrollRun }>> {
    try {
      const response = await apiServices.request(`/payroll-runs/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching payroll run with id ${id}:`, error);
      throw error;
    }
  }

  async createPayrollRun(data: CreatePayrollRunRequest): Promise<ApiResponse<{ payrollRun: PayrollRun }>> {
    try {
      const response = await apiServices.request('/payroll-runs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating payroll run:', error);
      throw error;
    }
  }

  async updatePayrollRun(id: number, data: Partial<PayrollRun>): Promise<ApiResponse<{ payrollRun: PayrollRun }>> {
    try {
      const response = await apiServices.request(`/payroll-runs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Error updating payroll run with id ${id}:`, error);
      throw error;
    }
  }

  async deletePayrollRun(id: number): Promise<ApiResponse> {
    try {
      const response = await apiServices.request(`/payroll-runs/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting payroll run with id ${id}:`, error);
      throw error;
    }
  }

  async processPayrollRun(id: number): Promise<ApiResponse<{ payrollRun: PayrollRun }>> {
    try {
      // This would typically trigger a background job to process the payroll
      // For now, we'll just update the status
      return await this.updatePayrollRun(id, { status: 'processing' });
    } catch (error) {
      console.error(`Error processing payroll run with id ${id}:`, error);
      throw error;
    }
  }

  // Payroll Record methods
  async getPayrollRecords(params?: {
    userId?: number;
    payPeriod?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ payrollRecords: PayrollRecord[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.userId) queryParams.append('userId', params.userId.toString());
      if (params?.payPeriod) queryParams.append('payPeriod', params.payPeriod);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/payroll-records?${queryString}` : '/payroll-records';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      throw error;
    }
  }

  async getPayrollRecordById(id: number): Promise<ApiResponse<{ payrollRecord: PayrollRecord }>> {
    try {
      const response = await apiServices.request(`/payroll-records/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching payroll record with id ${id}:`, error);
      throw error;
    }
  }

  async updatePayrollRecord(id: number, data: Partial<PayrollRecord>): Promise<ApiResponse<{ payrollRecord: PayrollRecord }>> {
    try {
      const response = await apiServices.request(`/payroll-records/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Error updating payroll record with id ${id}:`, error);
      throw error;
    }
  }

  // Payslip methods
  async getPayslips(params?: {
    userId?: number;
    payPeriod?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ payslips: Payslip[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.userId) queryParams.append('userId', params.userId.toString());
      if (params?.payPeriod) queryParams.append('payPeriod', params.payPeriod);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/payslips?${queryString}` : '/payslips';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching payslips:', error);
      throw error;
    }
  }

  async getPayslipById(id: number): Promise<ApiResponse<{ payslip: Payslip }>> {
    try {
      const response = await apiServices.request(`/payslips/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching payslip with id ${id}:`, error);
      throw error;
    }
  }

  async getPayslipForUserAndPeriod(userId: number, payPeriod: string): Promise<ApiResponse<{ payslip: Payslip }>> {
    try {
      const response = await apiServices.request(`/payslips/${userId}/${payPeriod}`);
      return response;
    } catch (error) {
      console.error(`Error fetching payslip for user ${userId} and period ${payPeriod}:`, error);
      throw error;
    }
  }

  async getMyPayslips(params?: {
    payPeriod?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ payslips: Payslip[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.payPeriod) queryParams.append('payPeriod', params.payPeriod);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/payslips/my?${queryString}` : '/payslips/my';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching my payslips:', error);
      throw error;
    }
  }

  // Payment Type methods
  async getPaymentTypes(): Promise<ApiResponse<{ paymentTypes: PaymentType[] }>> {
    try {
      const response = await apiServices.request('/payment-types');
      return response;
    } catch (error) {
      console.error('Error fetching payment types:', error);
      throw error;
    }
  }

  async getPaymentTypeById(id: number): Promise<ApiResponse<{ paymentType: PaymentType }>> {
    try {
      const response = await apiServices.request(`/payment-types/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching payment type with id ${id}:`, error);
      throw error;
    }
  }

  async createPaymentType(data: CreatePaymentTypeRequest): Promise<ApiResponse<{ paymentType: PaymentType }>> {
    try {
      const response = await apiServices.request('/payment-types', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating payment type:', error);
      throw error;
    }
  }

  async updatePaymentType(id: number, data: UpdatePaymentTypeRequest): Promise<ApiResponse<{ paymentType: PaymentType }>> {
    try {
      const response = await apiServices.request(`/payment-types/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Error updating payment type with id ${id}:`, error);
      throw error;
    }
  }

  async deletePaymentType(id: number): Promise<ApiResponse> {
    try {
      const response = await apiServices.request(`/payment-types/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting payment type with id ${id}:`, error);
      throw error;
    }
  }

  // Staff Payment Structure methods
  async getStaffPaymentStructures(params?: {
    userId?: number;
    paymentTypeId?: number;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ staffPaymentStructures: StaffPaymentStructure[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.userId) queryParams.append('userId', params.userId.toString());
      if (params?.paymentTypeId) queryParams.append('paymentTypeId', params.paymentTypeId.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/staff-payment-structures?${queryString}` : '/staff-payment-structures';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching staff payment structures:', error);
      throw error;
    }
  }

  async getStaffPaymentStructureById(id: number): Promise<ApiResponse<{ staffPaymentStructure: StaffPaymentStructure }>> {
    try {
      const response = await apiServices.request(`/staff-payment-structures/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching staff payment structure with id ${id}:`, error);
      throw error;
    }
  }

  async createStaffPaymentStructure(data: CreateStaffPaymentStructureRequest): Promise<ApiResponse<{ staffPaymentStructure: StaffPaymentStructure }>> {
    try {
      const response = await apiServices.request('/staff-payment-structures', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating staff payment structure:', error);
      throw error;
    }
  }

  async updateStaffPaymentStructure(id: number, data: UpdateStaffPaymentStructureRequest): Promise<ApiResponse<{ staffPaymentStructure: StaffPaymentStructure }>> {
    try {
      const response = await apiServices.request(`/staff-payment-structures/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Error updating staff payment structure with id ${id}:`, error);
      throw error;
    }
  }

  async deleteStaffPaymentStructure(id: number): Promise<ApiResponse> {
    try {
      const response = await apiServices.request(`/staff-payment-structures/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting staff payment structure with id ${id}:`, error);
      throw error;
    }
  }

  // Helper methods
  async getPayrollRecordsForUser(userId: number, payPeriod?: string): Promise<PayrollRecord[]> {
    try {
      const response = await this.getPayrollRecords({ userId, payPeriod });
      if (response.success && response.data) {
        return response.data.payrollRecords;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching payroll records for user ${userId}:`, error);
      throw error;
    }
  }

  async getPayrollRunForPeriod(payPeriod: string): Promise<PayrollRun | null> {
    try {
      const response = await this.getPayrollRuns({ payPeriod });
      if (response.success && response.data && response.data.payrollRuns.length > 0) {
        return response.data.payrollRuns[0];
      }
      return null;
    } catch (error) {
      console.error(`Error fetching payroll run for period ${payPeriod}:`, error);
      throw error;
    }
  }

  async generatePayslipForUser(userId: number, payPeriod: string): Promise<Payslip | null> {
    try {
      const response = await this.getPayslipForUserAndPeriod(userId, payPeriod);
      if (response.success && response.data) {
        return response.data.payslip;
      }
      return null;
    } catch (error) {
      console.error(`Error generating payslip for user ${userId} and period ${payPeriod}:`, error);
      throw error;
    }
  }

  async getPaymentTypesByCategory(category: 'earning' | 'deduction'): Promise<PaymentType[]> {
    try {
      const response = await this.getPaymentTypes();
      if (response.success && response.data) {
        return response.data.paymentTypes.filter(pt => pt.category === category);
      }
      return [];
    } catch (error) {
      console.error(`Error fetching payment types by category ${category}:`, error);
      throw error;
    }
  }

  async getStaffPaymentStructureForUser(userId: number): Promise<StaffPaymentStructure[]> {
    try {
      const response = await this.getStaffPaymentStructures({ userId });
      if (response.success && response.data) {
        return response.data.staffPaymentStructures;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching payment structures for user ${userId}:`, error);
      throw error;
    }
  }

}

// Create a singleton instance of the Payroll service
export const payrollService = new PayrollService();

export default PayrollService;