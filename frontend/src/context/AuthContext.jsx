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
    try {
      const response = await authApi.refreshToken();
      if (response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // Silently handle expected auth errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        setUser(null);
      } else {
        // Only log unexpected errors
        console.error("Unexpected error during auth check:", error);
        setUser(null);
      }
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

      if (response.user) {
        // Store username in localStorage right after successful login
        localStorage.setItem("username", response.user.username);
        setUser(response.user);
      } else {
        console.error("No user data in login response");
      }

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
