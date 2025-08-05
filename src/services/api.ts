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

  console.log(`🌐 Making API request to: ${url}`, {
    method: options.method || "GET",
    headers: options.headers,
    body: options.body,
  });

  const config: RequestInit = {
    credentials: "include", // This is the key for cookie-based auth
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  console.log("config", config);

  try {
    const response = await fetch(url, config);

    console.log(`📡 API response status: ${response.status} for ${url}`);

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      console.error("❌ API error response:", error);

      // Handle unauthorized errors gracefully
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ API success response:", data);
    return data;
  } catch (error) {
    console.error("🔥 API request failed:", error);
    throw error;
  }
};

// Export an object with all API methods
export const apiService = {
  // Auth API
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
    });
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: any }> | null> => {
    try {
      return await request<ApiResponse<{ user: any }>>("/auth/me");
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return null; // User is not authenticated
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
