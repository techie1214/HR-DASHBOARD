// src/services/appraisalService.ts

import { apiServices } from './apiServices';
import { ApiResponse } from './apiInterfaces';

interface AppraisalTemplate {
  id: number;
  name: string;
  description: string;
  kpi_ids: number[]; // IDs of KPIs included in this template
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface Appraisal {
  id: number;
  template_id: number;
  user_id: number;
  evaluator_id: number; // Manager or evaluator
  period: string; // YYYY-MM or YYYY-Q format
  status: 'draft' | 'in_progress' | 'submitted' | 'evaluated' | 'completed';
  overall_score: number | null;
  evaluator_notes: string | null;
  employee_self_assessment: string | null;
  created_at: string;
  updated_at: string;
}

interface EmployeePerformance {
  id: number;
  user_id: number;
  appraisal_id: number;
  kpi_id: number;
  score: number;
  target_achieved: number;
  evidence: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateAppraisalTemplateRequest {
  name: string;
  description: string;
  kpi_ids: number[];
  is_active: boolean;
}

interface UpdateAppraisalTemplateRequest {
  name?: string;
  description?: string;
  kpi_ids?: number[];
  is_active?: boolean;
}

interface CreateAppraisalRequest {
  template_id: number;
  user_id: number;
  evaluator_id: number;
  period: string;
}

interface UpdateAppraisalRequest {
  status?: 'draft' | 'in_progress' | 'submitted' | 'evaluated' | 'completed';
  overall_score?: number;
  evaluator_notes?: string;
  employee_self_assessment?: string;
}

interface CreateEmployeePerformanceRequest {
  appraisal_id: number;
  kpi_id: number;
  score: number;
  target_achieved: number;
  evidence?: string;
}

interface UpdateEmployeePerformanceRequest {
  score?: number;
  target_achieved?: number;
  evidence?: string;
}

class AppraisalService {
  // Appraisal Template methods
  async getAppraisalTemplates(params?: {
    isActive?: boolean;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ appraisalTemplates: AppraisalTemplate[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/appraisal-templates?${queryString}` : '/appraisal-templates';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching appraisal templates:', error);
      throw error;
    }
  }

  async getAppraisalTemplateById(id: number): Promise<ApiResponse<{ appraisalTemplate: AppraisalTemplate }>> {
    try {
      const response = await apiServices.request(`/appraisal-templates/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching appraisal template with id ${id}:`, error);
      throw error;
    }
  }

  async createAppraisalTemplate(data: CreateAppraisalTemplateRequest): Promise<ApiResponse<{ appraisalTemplate: AppraisalTemplate }>> {
    try {
      const response = await apiServices.request('/appraisal-templates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating appraisal template:', error);
      throw error;
    }
  }

  async updateAppraisalTemplate(id: number, data: UpdateAppraisalTemplateRequest): Promise<ApiResponse<{ appraisalTemplate: AppraisalTemplate }>> {
    try {
      const response = await apiServices.request(`/appraisal-templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Error updating appraisal template with id ${id}:`, error);
      throw error;
    }
  }

  async deleteAppraisalTemplate(id: number): Promise<ApiResponse> {
    try {
      const response = await apiServices.request(`/appraisal-templates/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting appraisal template with id ${id}:`, error);
      throw error;
    }
  }

  // Appraisal methods
  async getAppraisals(params?: {
    userId?: number;
    evaluatorId?: number;
    templateId?: number;
    period?: string;
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ appraisals: Appraisal[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.userId) queryParams.append('userId', params.userId.toString());
      if (params?.evaluatorId) queryParams.append('evaluatorId', params.evaluatorId.toString());
      if (params?.templateId) queryParams.append('templateId', params.templateId.toString());
      if (params?.period) queryParams.append('period', params.period);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/appraisals?${queryString}` : '/appraisals';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching appraisals:', error);
      throw error;
    }
  }

  async getAppraisalById(id: number): Promise<ApiResponse<{ appraisal: Appraisal }>> {
    try {
      const response = await apiServices.request(`/appraisals/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching appraisal with id ${id}:`, error);
      throw error;
    }
  }

  async createAppraisal(data: CreateAppraisalRequest): Promise<ApiResponse<{ appraisal: Appraisal }>> {
    try {
      const response = await apiServices.request('/appraisals', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating appraisal:', error);
      throw error;
    }
  }

  async updateAppraisal(id: number, data: UpdateAppraisalRequest): Promise<ApiResponse<{ appraisal: Appraisal }>> {
    try {
      const response = await apiServices.request(`/appraisals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Error updating appraisal with id ${id}:`, error);
      throw error;
    }
  }

  async deleteAppraisal(id: number): Promise<ApiResponse> {
    try {
      const response = await apiServices.request(`/appraisals/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting appraisal with id ${id}:`, error);
      throw error;
    }
  }

  // Employee Performance methods
  async getEmployeePerformances(params?: {
    appraisalId?: number;
    userId?: number;
    kpiId?: number;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ employeePerformances: EmployeePerformance[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.appraisalId) queryParams.append('appraisalId', params.appraisalId.toString());
      if (params?.userId) queryParams.append('userId', params.userId.toString());
      if (params?.kpiId) queryParams.append('kpiId', params.kpiId.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/employee-performance?${queryString}` : '/employee-performance';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching employee performances:', error);
      throw error;
    }
  }

  async getEmployeePerformanceById(id: number): Promise<ApiResponse<{ employeePerformance: EmployeePerformance }>> {
    try {
      const response = await apiServices.request(`/employee-performance/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching employee performance with id ${id}:`, error);
      throw error;
    }
  }

  async createEmployeePerformance(data: CreateEmployeePerformanceRequest): Promise<ApiResponse<{ employeePerformance: EmployeePerformance }>> {
    try {
      const response = await apiServices.request('/employee-performance', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating employee performance record:', error);
      throw error;
    }
  }

  async updateEmployeePerformance(id: number, data: UpdateEmployeePerformanceRequest): Promise<ApiResponse<{ employeePerformance: EmployeePerformance }>> {
    try {
      const response = await apiServices.request(`/employee-performance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Error updating employee performance with id ${id}:`, error);
      throw error;
    }
  }

  async deleteEmployeePerformance(id: number): Promise<ApiResponse> {
    try {
      const response = await apiServices.request(`/employee-performance/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting employee performance with id ${id}:`, error);
      throw error;
    }
  }

  // Helper methods
  async getAppraisalsForUser(userId: number): Promise<Appraisal[]> {
    try {
      const response = await this.getAppraisals({ userId });
      if (response.success && response.data) {
        return response.data.appraisals;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching appraisals for user ${userId}:`, error);
      throw error;
    }
  }

  async getAppraisalsForEvaluator(evaluatorId: number): Promise<Appraisal[]> {
    try {
      const response = await this.getAppraisals({ evaluatorId });
      if (response.success && response.data) {
        return response.data.appraisals;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching appraisals for evaluator ${evaluatorId}:`, error);
      throw error;
    }
  }

  async getActiveAppraisalsForUser(userId: number): Promise<Appraisal[]> {
    try {
      const response = await this.getAppraisals({ userId, status: 'in_progress' });
      if (response.success && response.data) {
        return response.data.appraisals;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching active appraisals for user ${userId}:`, error);
      throw error;
    }
  }

  async getCompletedAppraisalsForUser(userId: number): Promise<Appraisal[]> {
    try {
      const response = await this.getAppraisals({ userId, status: 'completed' });
      if (response.success && response.data) {
        return response.data.appraisals;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching completed appraisals for user ${userId}:`, error);
      throw error;
    }
  }

  async getEmployeePerformancesForAppraisal(appraisalId: number): Promise<EmployeePerformance[]> {
    try {
      const response = await this.getEmployeePerformances({ appraisalId });
      if (response.success && response.data) {
        return response.data.employeePerformances;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching employee performances for appraisal ${appraisalId}:`, error);
      throw error;
    }
  }

  async getEmployeePerformancesForUser(userId: number): Promise<EmployeePerformance[]> {
    try {
      const response = await this.getEmployeePerformances({ userId });
      if (response.success && response.data) {
        return response.data.employeePerformances;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching employee performances for user ${userId}:`, error);
      throw error;
    }
  }

  async getEmployeePerformancesForKPI(kpiId: number): Promise<EmployeePerformance[]> {
    try {
      const response = await this.getEmployeePerformances({ kpiId });
      if (response.success && response.data) {
        return response.data.employeePerformances;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching employee performances for KPI ${kpiId}:`, error);
      throw error;
    }
  }

  async startAppraisal(templateId: number, userId: number, evaluatorId: number, period: string): Promise<ApiResponse<{ appraisal: Appraisal }>> {
    try {
      return await this.createAppraisal({
        template_id: templateId,
        user_id: userId,
        evaluator_id: evaluatorId,
        period
      });
    } catch (error) {
      console.error('Error starting appraisal:', error);
      throw error;
    }
  }

  async submitAppraisal(appraisalId: number, selfAssessment?: string): Promise<ApiResponse<{ appraisal: Appraisal }>> {
    try {
      return await this.updateAppraisal(appraisalId, {
        status: 'submitted',
        employee_self_assessment: selfAssessment
      });
    } catch (error) {
      console.error(`Error submitting appraisal ${appraisalId}:`, error);
      throw error;
    }
  }

  async evaluateAppraisal(appraisalId: number, overallScore: number, evaluatorNotes?: string): Promise<ApiResponse<{ appraisal: Appraisal }>> {
    try {
      return await this.updateAppraisal(appraisalId, {
        status: 'evaluated',
        overall_score: overallScore,
        evaluator_notes: evaluatorNotes
      });
    } catch (error) {
      console.error(`Error evaluating appraisal ${appraisalId}:`, error);
      throw error;
    }
  }

  async completeAppraisal(appraisalId: number): Promise<ApiResponse<{ appraisal: Appraisal }>> {
    try {
      return await this.updateAppraisal(appraisalId, {
        status: 'completed'
      });
    } catch (error) {
      console.error(`Error completing appraisal ${appraisalId}:`, error);
      throw error;
    }
  }

  async addPerformanceRecord(appraisalId: number, kpiId: number, score: number, targetAchieved: number, evidence?: string): Promise<ApiResponse<{ employeePerformance: EmployeePerformance }>> {
    try {
      return await this.createEmployeePerformance({
        appraisal_id: appraisalId,
        kpi_id: kpiId,
        score,
        target_achieved: targetAchieved,
        evidence
      });
    } catch (error) {
      console.error('Error adding performance record:', error);
      throw error;
    }
  }

  async updatePerformanceRecord(performanceId: number, score: number, targetAchieved: number, evidence?: string): Promise<ApiResponse<{ employeePerformance: EmployeePerformance }>> {
    try {
      return await this.updateEmployeePerformance(performanceId, {
        score,
        target_achieved: targetAchieved,
        evidence
      });
    } catch (error) {
      console.error(`Error updating performance record ${performanceId}:`, error);
      throw error;
    }
  }

  async getAppraisalTemplatesWithKPIs(): Promise<Array<AppraisalTemplate & { kpisSelected: any[] }>> {
    try {
      const response = await this.getAppraisalTemplates({ isActive: true });
      if (response.success && response.data) {
        // This would require additional API calls to get KPI details
        // For now, returning the templates as-is
        return response.data.appraisalTemplates as any;
      }
      return [];
    } catch (error) {
      console.error('Error fetching appraisal templates with KPIs:', error);
      throw error;
    }
  }

}

// Create a singleton instance of the Appraisal service
export const appraisalService = new AppraisalService();

export default AppraisalService;