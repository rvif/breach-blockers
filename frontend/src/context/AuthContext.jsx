import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";
import { userApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
  };

  const checkAuth = async () => {
    console.log("Starting checkAuth...");
    try {
      const token = localStorage.getItem("accessToken");
      console.log("Token exists:", !!token);

      if (token) {
        try {
          console.log("Attempting to refresh token...");
          const response = await authApi.refreshToken();
          if (response.accessToken) {
            console.log("Token refresh successful");
            if (response.user?.name) {
              const urlFriendlyUsername = response.user.name
                .toLowerCase()
                .replace(/\s+/g, ".");
              console.log("Storing username:", urlFriendlyUsername);
              localStorage.setItem("username", urlFriendlyUsername);
            }
            setUser({
              ...response.user,
              token: response.accessToken,
            });
          }
        } catch (error) {
          console.error("Auth check failed completely:", error);
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("rememberedEmail");
            localStorage.removeItem("username");
          }
        }
      } else {
        console.log("No token, clearing storage");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("username");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("username");
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authApi.register(userData);
      return response;
    } catch (error) {
      setError(error.response?.data?.msg || "Registration failed");
      throw error;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      setError(null);
      const response = await authApi.verifyOtp(email, otp);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.response?.data?.msg || "OTP verification failed");
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authApi.login(credentials);
      console.log("Login response:", response);

      if (response.user?.username) {
        console.log("Storing username:", response.user.username);
        localStorage.setItem("username", response.user.username);
      } else {
        console.error("No username in login response");
      }

      setUser({
        ...response.user,
        token: response.accessToken,
      });
      return response;
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.msg || "Login failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      return await authApi.forgotPassword(email);
    } catch (error) {
      setError(error.response?.data?.msg || "Failed to send reset email");
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      return await authApi.resetPassword(token, newPassword);
    } catch (error) {
      setError(error.response?.data?.msg || "Password reset failed");
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    verifyOtp,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
