import axios from "axios";

const BASE_URL =
  `${import.meta.env.VITE_API_URL}/api` || "http://localhost:3000/api";

// Create memory storage for access token
let inMemoryToken = null;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For handling cookies
});

// Add request interceptor to include Authorization header
api.interceptors.request.use(
  (config) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Update response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle rate limit errors (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response.data.remainingTime;
      const message = error.response.data.msg;

      // Add rate limit info to error
      error.rateLimitInfo = {
        message,
        retryAfter,
        attemptsRemaining: error.response.data.attemptsRemaining,
      };
    }

    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        const response = await authApi.refreshToken();
        if (response.accessToken) {
          inMemoryToken = response.accessToken;
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        inMemoryToken = null;
        delete api.defaults.headers.common["Authorization"];

        // Only redirect if not already on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Utility function to check for refresh token cookie
const hasRefreshTokenCookie = () => {
  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith("refreshToken="));
};

export const authApi = {
  clearUserData: () => {
    inMemoryToken = null;
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("username");
    // Clear any other auth-related data
    localStorage.removeItem("user");
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    if (response.data.user?.username) {
      localStorage.setItem("username", response.data.user.username);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", {
      ...credentials,
      rememberMe: credentials.rememberMe, // Send rememberMe to backend
    });

    if (response.data.accessToken) {
      inMemoryToken = response.data.accessToken;
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.accessToken}`;

      // Handle remembered email
      if (credentials.rememberMe) {
        localStorage.setItem("rememberedEmail", credentials.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      inMemoryToken = null;
      delete api.defaults.headers.common["Authorization"];
      // Clear all auth-related data
      authApi.clearUserData();
    }
  },

  // Other auth methods remain the same but remove localStorage token handling
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  verifyResetToken: async (token) => {
    const response = await api.post("/auth/verify-reset-token", { token });
    return response.data;
  },

  updatePassword: async ({ currentPassword, newPassword }) => {
    const response = await api.post("/auth/update-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh-token");
      if (response.data.accessToken) {
        inMemoryToken = response.data.accessToken;
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.accessToken}`;
        return response.data;
      }
      throw new Error("No access token in refresh response");
    } catch (error) {
      inMemoryToken = null;
      delete api.defaults.headers.common["Authorization"];
      throw error;
    }
  },

  checkEmailRole: async (email) => {
    try {
      const response = await api.post("/auth/check-email-role", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Update userApi to not rely on localStorage for tokens
export const userApi = {
  getProfile: async () => {
    const username = localStorage.getItem("username");
    if (!username) {
      throw new Error("Username not found in storage");
    }
    // Keep original case from localStorage
    const displayName = username
      .split(".")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const response = await api.get(
      `/profile/${encodeURIComponent(displayName)}`
    );
    return response.data;
  },

  updateProfile: async (data, currentName) => {
    if (!currentName) {
      throw new Error("Current name is required for profile update");
    }

    // Don't modify the case of the current name
    const response = await api.put(
      `/profile/${encodeURIComponent(currentName)}`,
      data
    );
    return response.data;
  },
};

export default api;
