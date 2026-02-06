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

// Project DTO returned by Project APIs
export interface ProjectResponse {
  projectId?: string | number;
  id?: string | number;
  title: string;
  description?: string | null;
  summary?: string | null;
  wordCount?: number;
  updatedAt?: string | null;
  createdAt?: string | null;
  coverImage?: string | null;
  coverImageUrl?: string | null;
  status?: string;
  authorId?: number;
  authorName?: string;
  totalChapters?: number;
  totalChatSessions?: number;
  genres?: Genre[];
}

// Genre DTO
export interface Genre {
  genreId?: number;
  name: string;
  description?: string;
}

// Chapter DTO
export interface ChapterResponse {
  chapterId?: string | number;
  chapterID?: string | number;
  id?: string | number;
  projectId?: string | number;
  projectID?: string | number;
  title: string;
  summary?: string | null;
  chapterNo?: number;
  chapterNumber?: number;
  wordCount?: number;
  status?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
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

// Project API functions
export const projectApi = {
  getMyProjects: async (): Promise<{ message: string; data: Array<{
    id: string;
    title: string;
    description?: string | null;
    wordCount?: number;
    updatedAt?: string;
    createdAt?: string;
    coverImage?: string | null;
  }> }> => {
    return apiClient.get('/api/Project/my-projects');
  },
  getProjectDetail: async (id: string | number): Promise<{ message: string; data: ProjectResponse }> => {
    return apiClient.get(`/api/Project/${id}`);
  },
  createProject: async (payload: {
    title: string;
    summary?: string;
    coverImageUrl?: string;
  }): Promise<{ message: string; data: ProjectResponse }> => {
    const body: Record<string, unknown> = { title: payload.title };
    if (payload.summary !== undefined && payload.summary !== '') {
      body.summary = payload.summary;
    }
    if (payload.coverImageUrl !== undefined) {
      body.coverImageUrl = payload.coverImageUrl;
    }
    return apiClient.post<{ message: string; data: ProjectResponse }>('/api/Project', body);
  },
  updateProject: async (id: string, payload: {
    title?: string;
    summary?: string;
    coverImageUrl?: string | null;
    status?: string;
  }): Promise<{ message: string; data: ProjectResponse }> => {
    const body: Record<string, unknown> = {};
    if (payload.title !== undefined) {
      body.title = payload.title;
    }
    if (payload.summary !== undefined) {
      body.summary = payload.summary;
    }
    if (payload.coverImageUrl !== undefined) {
      body.coverImageUrl = payload.coverImageUrl;
    }
    if (payload.status !== undefined) {
      body.status = payload.status;
    }
    return apiClient.put<{ message: string; data: ProjectResponse }>(`/api/Project/${id}`, body);
  },
};

// Chapter API functions
export const chapterApi = {
  getChaptersByProject: async (projectId: string | number): Promise<{ message: string; data: ChapterResponse[] }> => {
    return apiClient.get(`/api/Chapter/project/${projectId}`);
  },
  createChapter: async (payload: {
    projectId: number;
    title: string;
    summary?: string;
    chapterNo?: number;
  }): Promise<{ message: string; data: ChapterResponse }> => {
    const body: Record<string, unknown> = {
      projectId: payload.projectId,
      title: payload.title,
      summary: payload.summary || '',
    };
    if (payload.chapterNo !== undefined) {
      body.chapterNo = payload.chapterNo;
    }
    return apiClient.post<{ message: string; data: ChapterResponse }>('/api/Chapter', body);
  },
  updateChapter: async (id: string | number, payload: {
    title?: string;
    summary?: string;
    chapterNo?: number;
  }): Promise<{ message: string; data: ChapterResponse }> => {
    return apiClient.put<{ message: string; data: ChapterResponse }>(`/api/Chapter/${id}`, payload);
  },
};
