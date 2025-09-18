export interface User {
  id: string;
  email: string;
  role: 'admin' | 'member';
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subscription_plan: 'free' | 'pro';
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  userId: string;
  email: string;
  role: 'admin' | 'member';
  tenantId: string;
  tenantSlug: string;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  tenant: Tenant;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}