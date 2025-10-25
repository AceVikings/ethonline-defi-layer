import { API_URL } from '../config/constants';

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_URL;
    this.token = localStorage.getItem('vincentJWT');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('vincentJWT', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('vincentJWT');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login() {
    return this.request<{ success: boolean; user: any }>('/api/auth/login', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request<{ success: boolean; user: any }>('/api/auth/profile');
  }

  // Workflow endpoints
  async getWorkflows() {
    return this.request<{ success: boolean; workflows: any[] }>('/api/workflows');
  }

  async getWorkflow(id: string) {
    return this.request<{ success: boolean; workflow: any }>(`/api/workflows/${id}`);
  }

  async createWorkflow(data: any) {
    return this.request<{ success: boolean; workflow: any }>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkflow(id: string, data: any) {
    return this.request<{ success: boolean; workflow: any }>(`/api/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patchWorkflow(id: string, data: any) {
    return this.request<{ success: boolean; workflow: any }>(`/api/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(id: string) {
    return this.request<{ success: boolean; message: string }>(`/api/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  async executeWorkflow(id: string) {
    return this.request<{ success: boolean; executionId: string; message: string }>(
      `/api/workflows/${id}/execute`,
      {
        method: 'POST',
      }
    );
  }

  async getAllExecutions() {
    return this.request<{ success: boolean; executions: any[] }>('/api/workflows/executions');
  }

  async getExecutionHistory(workflowId: string) {
    return this.request<{ success: boolean; executions: any[] }>(
      `/api/workflows/${workflowId}/executions`
    );
  }
}

export const apiClient = new ApiClient();
