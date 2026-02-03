// src/services/kpiService.ts

import { apiServices } from './apiServices';
import { ApiResponse } from './apiInterfaces';

interface KPI {
  id: number;
  name: string;
  description: string;
  target_value: number;
  unit_of_measurement: string;
  weight: number; // Weight in appraisal
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface KPIScore {
  id: number;
  kpi_id: number;
  user_id: number;
  score: number;
  target_achieved: number;
  period: string; // YYYY-MM or YYYY-Q format
  evidence: string | null;
  reviewer_id: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface KPIAssignment {
  id: number;
  kpi_id: number;
  user_id: number;
  target_value: number;
  assigned_by: number;
  assigned_at: string;
  effective_from: string;
  effective_to: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface Metric {
  id: number;
  name: string;
  description: string;
  kpi_id: number;
  formula: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface Target {
  id: number;
  name: string;
  description: string;
  metric_id: number;
  target_value: number;
  achieved_value: number;
  period: string; // YYYY-MM or YYYY-Q format
  status: 'pending' | 'in_progress' | 'achieved' | 'missed';
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface CreateKPIRequest {
  name: string;
  description: string;
  target_value: number;
  unit_of_measurement: string;
  weight: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  is_active: boolean;
}

interface UpdateKPIRequest {
  name?: string;
  description?: string;
  target_value?: number;
  unit_of_measurement?: string;
  weight?: number;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  is_active?: boolean;
}

interface CreateKPIScoreRequest {
  kpi_id: number;
  user_id: number;
  score: number;
  target_achieved: number;
  period: string;
  evidence?: string;
}

interface UpdateKPIScoreRequest {
  score?: number;
  target_achieved?: number;
  evidence?: string;
  reviewer_id?: number;
}

interface CreateKPIAssignmentRequest {
  kpi_id: number;
  user_id: number;
  target_value: number;
  effective_from: string;
  effective_to?: string | null;
}

interface UpdateKPIAssignmentRequest {
  target_value?: number;
  effective_from?: string;
  effective_to?: string | null;
  status?: 'active' | 'inactive';
}

interface CreateMetricRequest {
  name: string;
  description: string;
  kpi_id: number;
  formula: string;
  is_active: boolean;
}

interface UpdateMetricRequest {
  name?: string;
  description?: string;
  kpi_id?: number;
  formula?: string;
  is_active?: boolean;
}

interface CreateTargetRequest {
  name: string;
  description: string;
  metric_id: number;
  target_value: number;
  period: string;
}

interface UpdateTargetRequest {
  name?: string;
  description?: string;
  target_value?: number;
  achieved_value?: number;
  period?: string;
  status?: 'pending' | 'in_progress' | 'achieved' | 'missed';
}

class KpiService {
  // KPI methods
  async getKPIs(params?: {
    isActive?: boolean;
    userId?: number; // To get KPIs assigned to a specific user
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ kpis: KPI[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.userId) queryParams.append('userId', params.userId.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/kpis?${queryString}` : '/kpis';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw error;
    }
  }

  async getKPIById(id: number): Promise<ApiResponse<{ kpi: KPI }>> {
    try {
      const response = await apiServices.request(`/kpis/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching KPI with id ${id}:`, error);
      throw error;
    }
  }

  async createKPI(data: CreateKPIRequest): Promise<ApiResponse<{ kpi: KPI }>> {
    try {
      const response = await apiServices.request('/kpis', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating KPI:', error);
      throw error;
    }
  }

  async updateKPI(id: number, data: UpdateKPIRequest): Promise<ApiResponse<{ kpi: KPI }>> {
    try {
      const response = await apiServices.request(`/kpis/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Error updating KPI with id ${id}:`, error);
      throw error;
    }
  }

  async deleteKPI(id: number): Promise<ApiResponse> {
    try {
      const response = await apiServices.request(`/kpis/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting KPI with id ${id}:`, error);
      throw error;
    }
  }

  // KPI Score methods
  async getKPIScores(params?: {
    kpiId?: number;
    userId?: number;
    period?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ kpiScores: KPIScore[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.kpiId) queryParams.append('kpiId', params.kpiId.toString());
      if (params?.userId) queryParams.append('userId', params.userId.toString());
      if (params?.period) queryParams.append('period', params.period);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/kpi-scores?${queryString}` : '/kpi-scores';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching KPI scores:', error);
      throw error;
    }
  }

  async getKPIScoreById(id: number): Promise<ApiResponse<{ kpiScore: KPIScore }>> {
    try {
      const response = await apiServices.request(`/kpi-scores/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching KPI score with id ${id}:`, error);
      throw error;
    }
  }

  async createKPIScore(data: CreateKPIScoreRequest): Promise<ApiResponse<{ kpiScore: KPIScore }>> {
    try {
      const response = await apiServices.request('/kpi-scores', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating KPI score:', error);
      throw error;
    }
  }

  async updateKPIScore(id: number, data: UpdateKPIScoreRequest): Promise<ApiResponse<{ kpiScore: KPIScore }>> {
    try {
      const response = await apiServices.request(`/kpi-scores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Error updating KPI score with id ${id}:`, error);
      throw error;
    }
  }

  async deleteKPIScore(id: number): Promise<ApiResponse> {
    try {
      const response = await apiServices.request(`/kpi-scores/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting KPI score with id ${id}:`, error);
      throw error;
    }
  }

  // KPI Assignment methods
  async getKPIAssignments(params?: {
    kpiId?: number;
    userId?: number;
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ kpiAssignments: KPIAssignment[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.kpiId) queryParams.append('kpiId', params.kpiId.toString());
      if (params?.userId) queryParams.append('userId', params.userId.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/kpi-assignments?${queryString}` : '/kpi-assignments';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching KPI assignments:', error);
      throw error;
    }
  }

  async getKPIAssignmentById(id: number): Promise<ApiResponse<{ kpiAssignment: KPIAssignment }>> {
    try {
      const response = await apiServices.request(`/kpi-assignments/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching KPI assignment with id ${id}:`, error);
      throw error;
    }
  }

  async createKPIAssignment(data: CreateKPIAssignmentRequest): Promise<ApiResponse<{ kpiAssignment: KPIAssignment }>> {
    try {
      const response = await apiServices.request('/kpi-assignments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating KPI assignment:', error);
      throw error;
    }
  }

  async updateKPIAssignment(id: number, data: UpdateKPIAssignmentRequest): Promise<ApiResponse<{ kpiAssignment: KPIAssignment }>> {
    try {
      const response = await apiServices.request(`/kpi-assignments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Error updating KPI assignment with id ${id}:`, error);
      throw error;
    }
  }

  async deleteKPIAssignment(id: number): Promise<ApiResponse> {
    try {
      const response = await apiServices.request(`/kpi-assignments/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting KPI assignment with id ${id}:`, error);
      throw error;
    }
  }

  // Metric methods
  async getMetrics(params?: {
    kpiId?: number;
    isActive?: boolean;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ metrics: Metric[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.kpiId) queryParams.append('kpiId', params.kpiId.toString());
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/metrics?${queryString}` : '/metrics';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  }

  async getMetricById(id: number): Promise<ApiResponse<{ metric: Metric }>> {
    try {
      const response = await apiServices.request(`/metrics/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching metric with id ${id}:`, error);
      throw error;
    }
  }

  async createMetric(data: CreateMetricRequest): Promise<ApiResponse<{ metric: Metric }>> {
    try {
      const response = await apiServices.request('/metrics', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating metric:', error);
      throw error;
    }
  }

  async updateMetric(id: number, data: UpdateMetricRequest): Promise<ApiResponse<{ metric: Metric }>> {
    try {
      const response = await apiServices.request(`/metrics/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Error updating metric with id ${id}:`, error);
      throw error;
    }
  }

  async deleteMetric(id: number): Promise<ApiResponse> {
    try {
      const response = await apiServices.request(`/metrics/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting metric with id ${id}:`, error);
      throw error;
    }
  }

  // Target methods
  async getTargets(params?: {
    metricId?: number;
    status?: string;
    period?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ targets: Target[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.metricId) queryParams.append('metricId', params.metricId.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.period) queryParams.append('period', params.period);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/targets?${queryString}` : '/targets';

      const response = await apiServices.request(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching targets:', error);
      throw error;
    }
  }

  async getTargetById(id: number): Promise<ApiResponse<{ target: Target }>> {
    try {
      const response = await apiServices.request(`/targets/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching target with id ${id}:`, error);
      throw error;
    }
  }

  async createTarget(data: CreateTargetRequest): Promise<ApiResponse<{ target: Target }>> {
    try {
      const response = await apiServices.request('/targets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating target:', error);
      throw error;
    }
  }

  async updateTarget(id: number, data: UpdateTargetRequest): Promise<ApiResponse<{ target: Target }>> {
    try {
      const response = await apiServices.request(`/targets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error(`Error updating target with id ${id}:`, error);
      throw error;
    }
  }

  async deleteTarget(id: number): Promise<ApiResponse> {
    try {
      const response = await apiServices.request(`/targets/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting target with id ${id}:`, error);
      throw error;
    }
  }

  // Helper methods
  async getKPIsForUser(userId: number): Promise<KPI[]> {
    try {
      const response = await this.getKPIs({ userId });
      if (response.success && response.data) {
        return response.data.kpis;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching KPIs for user ${userId}:`, error);
      throw error;
    }
  }

  async getKPIScoresForUser(userId: number, period?: string): Promise<KPIScore[]> {
    try {
      const response = await this.getKPIScores({ userId, period });
      if (response.success && response.data) {
        return response.data.kpiScores;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching KPI scores for user ${userId}:`, error);
      throw error;
    }
  }

  async getKPIScoresForKPI(kpiId: number, period?: string): Promise<KPIScore[]> {
    try {
      const response = await this.getKPIScores({ kpiId, period });
      if (response.success && response.data) {
        return response.data.kpiScores;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching KPI scores for KPI ${kpiId}:`, error);
      throw error;
    }
  }

  async getKPIAssignmentsForUser(userId: number): Promise<KPIAssignment[]> {
    try {
      const response = await this.getKPIAssignments({ userId });
      if (response.success && response.data) {
        return response.data.kpiAssignments;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching KPI assignments for user ${userId}:`, error);
      throw error;
    }
  }

  async getActiveKPIAssignmentsForUser(userId: number): Promise<KPIAssignment[]> {
    try {
      const response = await this.getKPIAssignments({ userId, status: 'active' });
      if (response.success && response.data) {
        return response.data.kpiAssignments;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching active KPI assignments for user ${userId}:`, error);
      throw error;
    }
  }

  async getMetricsForKPI(kpiId: number): Promise<Metric[]> {
    try {
      const response = await this.getMetrics({ kpiId });
      if (response.success && response.data) {
        return response.data.metrics;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching metrics for KPI ${kpiId}:`, error);
      throw error;
    }
  }

  async getTargetsForMetric(metricId: number): Promise<Target[]> {
    try {
      const response = await this.getTargets({ metricId });
      if (response.success && response.data) {
        return response.data.targets;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching targets for metric ${metricId}:`, error);
      throw error;
    }
  }

  async getTargetsForPeriod(period: string): Promise<Target[]> {
    try {
      const response = await this.getTargets({ period });
      if (response.success && response.data) {
        return response.data.targets;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching targets for period ${period}:`, error);
      throw error;
    }
  }

  async calculateKPIScore(kpiId: number, userId: number, achievedValue: number, period: string): Promise<number> {
    try {
      // This would typically be calculated on the backend
      // For now, we'll return a simple calculation
      const kpi = await this.getKPIById(kpiId);
      if (kpi.success && kpi.data) {
        const target = kpi.data.kpi.target_value;
        return Math.min(100, Math.round((achievedValue / target) * 100));
      }
      return 0;
    } catch (error) {
      console.error(`Error calculating KPI score for KPI ${kpiId}, user ${userId}:`, error);
      throw error;
    }
  }

  async submitKPIScore(data: CreateKPIScoreRequest): Promise<ApiResponse<{ kpiScore: KPIScore }>> {
    try {
      return await this.createKPIScore(data);
    } catch (error) {
      console.error('Error submitting KPI score:', error);
      throw error;
    }
  }

  async reviewKPIScore(scoreId: number, reviewerId: number, notes?: string): Promise<ApiResponse<{ kpiScore: KPIScore }>> {
    try {
      return await this.updateKPIScore(scoreId, {
        reviewer_id: reviewerId,
        evidence: notes
      });
    } catch (error) {
      console.error(`Error reviewing KPI score ${scoreId}:`, error);
      throw error;
    }
  }

}

// Create a singleton instance of the KPI service
export const kpiService = new KpiService();

export default KpiService;