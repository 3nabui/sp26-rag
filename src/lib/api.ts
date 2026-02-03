const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sp26-rag-ai-reading-web.onrender.com';

export interface AuthResponse {
  userId: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'Author' | 'Staff';
  token: string;
  avatarUrl?: string;
}

export interface LoginResponse {
  message: string;
  data: AuthResponse;
  refreshToken: string;
}

export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  createdAt: string;
  isActive: boolean;
}

export interface AdminUserListItem {
  userId: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  totalProjects: number;
}

export interface AdminUserListResponse {
  message: string;
  data: AdminUserListItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// API Client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const connectionError = new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        connectionError.name = 'ConnectionError';
        throw connectionError;
      }
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã xảy ra lỗi không xác định');
    }
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Auth API functions
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/api/Auth/login', {
      Email: email,
      Password: password,
    });
  },

  register: async (
    fullName: string,
    email: string,
    password: string,
    avatarUrl?: string
  ): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/api/Auth/register', {
      FullName: fullName,
      Email: email,
      Password: password,
      AvatarUrl: avatarUrl,
    });
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/api/Auth/refresh-token', {
      RefreshToken: refreshToken,
    });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/api/Auth/forgot-password', {
      Email: email,
    });
  },

  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/api/Auth/reset-password', {
      Token: token,
      NewPassword: newPassword,
      ConfirmPassword: newPassword,
    });
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/api/Auth/change-password', {
      CurrentPassword: currentPassword,
      NewPassword: newPassword,
      ConfirmPassword: newPassword,
    });
  },
};

// User API functions
export const userApi = {
  getProfile: async (): Promise<{ message: string; data: UserProfile }> => {
    return apiClient.get<{ message: string; data: UserProfile }>('/api/User/profile');
  },

  updateProfile: async (
    fullName: string,
    avatarUrl?: string | null
  ): Promise<{ message: string; data: UserProfile }> => {
    return apiClient.put<{ message: string; data: UserProfile }>('/api/User/profile', {
      FullName: fullName,
      AvatarUrl: avatarUrl,
    });
  },
};

// Admin API functions
export const adminApi = {
  getUsers: async (params?: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    role?: string;
    includeInactive?: boolean;
  }): Promise<AdminUserListResponse> => {
    const query = new URLSearchParams();
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.searchTerm) query.set('searchTerm', params.searchTerm);
    if (params?.role) query.set('role', params.role);
    if (typeof params?.includeInactive === 'boolean') {
      query.set('includeInactive', String(params.includeInactive));
    }

    const qs = query.toString();
    const endpoint = qs ? `/api/Admin/users?${qs}` : '/api/Admin/users';

    return apiClient.get<AdminUserListResponse>(endpoint);
  },
};
