import { LoginRequest, LoginResponse, ApiResponse, Note, CreateNoteRequest, UpdateNoteRequest, Tenant } from '@/types';

interface UserListItem {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

// Use relative URLs for API calls - works in both development and production
const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Better error handling for network issues
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server');
      }
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    console.log('API Client: Attempting login with credentials:', { email: credentials.email });
    try {
      const result = await this.request<LoginResponse>('/auth', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      console.log('API Client: Login successful');
      return result;
    } catch (error) {
      console.error('API Client: Login failed:', error);
      throw error;
    }
  }

  // Notes
  async getNotes(): Promise<ApiResponse<Note[]>> {
    return this.request<Note[]>('/notes');
  }

  async getNote(id: string): Promise<ApiResponse<Note>> {
    return this.request<Note>(`/notes/${id}`);
  }

  async createNote(note: CreateNoteRequest): Promise<ApiResponse<Note>> {
    return this.request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async updateNote(id: string, note: UpdateNoteRequest): Promise<ApiResponse<Note>> {
    return this.request<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    });
  }

  async deleteNote(id: string): Promise<ApiResponse> {
    return this.request(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // Tenant management
  async upgradeTenant(slug: string): Promise<ApiResponse<Tenant>> {
    return this.request<Tenant>(`/tenants/${slug}/upgrade`, {
      method: 'POST',
    });
  }

  // User management (Admin only)
  async getUsers(): Promise<ApiResponse<UserListItem[]>> {
    return this.request<UserListItem[]>('/users');
  }

  // Development seeding
  async seedDatabase(): Promise<ApiResponse> {
    return this.request('/seed', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();