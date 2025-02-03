import axios from "axios";

const BASE_URL =
  `${import.meta.env.VITE_API_URL}/api` || "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for handling cookies
});

// Add auth header to all requests if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.withCredentials = true; // Important for cookies
  return config;
});

// Update response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await authApi.refreshToken();
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    return response.data;
  },

  login: async (credentials) => {
    console.log("Login attempt with rememberMe:", !!credentials.rememberMe);
    const response = await api.post("/auth/login", credentials);
    if (response.data.accessToken) {
      console.log("Setting access token...");
      localStorage.setItem("accessToken", response.data.accessToken);
      console.log("Setting username:", response.data.user.username);
      localStorage.setItem("username", response.data.user.username);
      if (credentials.rememberMe) {
        console.log("Setting remembered email...");
        localStorage.setItem("rememberedEmail", credentials.email);
      }
    }
    return response.data;
  },

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

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("username");
    }
  },

  updatePassword: async ({ currentPassword, newPassword }) => {
    const response = await api.post("/auth/update-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  refreshToken: async () => {
    console.log("Attempting token refresh...");
    try {
      const response = await api.post("/auth/refresh-token");
      if (response.data.accessToken) {
        console.log("New token received, updating storage...");
        localStorage.setItem("accessToken", response.data.accessToken);
        if (response.data.user?.username) {
          console.log("Storing username:", response.data.user.username);
          localStorage.setItem("username", response.data.user.username);
        } else {
          console.error("No username in refresh token response");
        }
      }
      return response.data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  },
};

export const userApi = {
  getProfile: async () => {
    const username = localStorage.getItem("username");
    if (!username) {
      throw new Error("Username not found in storage");
    }
    // Convert from john.doe to John Doe
    const displayName = username
      .split(".")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    console.log("Getting profile for username:", displayName);
    const response = await api.get(
      `/profile/${encodeURIComponent(displayName)}`
    );
    return response.data;
  },

  updateProfile: async (data, originalUsername) => {
    // Use the original username for the API route
    const displayName = originalUsername
      .split(".")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    console.log("Updating profile for username:", displayName);
    const response = await api.put(
      `/profile/${encodeURIComponent(displayName)}`,
      data
    );
    return response.data;
  },
};

export default api;
