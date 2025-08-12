const API_BASE_URL = "https://ai-document-editor-backend.onrender.com/api";

export interface ApiResponse<T> {
  data?: T;
  user?: T;
  message?: string;
  success?: boolean;
}

// Private helper function for making requests
const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));

      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("🔥 API request failed:", error);
    throw error;
  }
};

export const apiService = {
  login: async (credentials: { email: string; password: string }) => {
    return request<ApiResponse<{ user: any }>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    return request<ApiResponse<{ user: any }>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    return request<ApiResponse<void>>("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: any }> | null> => {
    try {
      return await request<ApiResponse<{ user: any }>>("/auth/me");
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return null;
      }
      throw error;
    }
  },

  // Documents API
  getDocuments: async () => {
    return request<ApiResponse<{ documents: any[] }>>("/documents");
  },

  createDocument: async (documentData: { title: string; content?: string }) => {
    return request<ApiResponse<{ document: any }>>("/documents", {
      method: "POST",
      body: JSON.stringify(documentData),
    });
  },

  updateDocument: async (id: string, updates: any) => {
    return request<ApiResponse<{ document: any }>>(`/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  deleteDocument: async (id: string) => {
    return request<ApiResponse<void>>(`/documents/${id}`, {
      method: "DELETE",
    });
  },

  // Chat API
  sendChatMessage: async (message: string) => {
    return request<ApiResponse<{ chat: any }>>("/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  getChatHistory: async () => {
    return request<ApiResponse<{ chats: any[] }>>("/chat");
  },

  // Test endpoint
  healthCheck: async () => {
    return request<{ message: string }>("/health");
  },
};
