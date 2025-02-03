import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";
import { authApi } from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [tokenValid, setTokenValid] = useState(true);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false,
  });

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;

      try {
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
          throw new Error("Invalid token format");
        }
        setTokenValid(true);
      } catch (err) {
        setStatus({
          type: "error",
          message: "Invalid reset token format",
        });
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8)
      errors.push("Password must be at least 8 characters long");
    if (!/[A-Z]/.test(password))
      errors.push("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(password))
      errors.push("Password must contain at least one lowercase letter");
    if (!/[0-9]/.test(password))
      errors.push("Password must contain at least one number");
    if (!/[!@#$%^&*]/.test(password))
      errors.push("Password must contain at least one special character");
    return errors;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData((prev) => ({ ...prev, password }));
    setPasswordErrors(validatePassword(password));

    // Check confirm password match whenever password changes
    if (formData.confirmPassword) {
      if (formData.confirmPassword !== password) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value;
    setFormData((prev) => ({ ...prev, confirmPassword }));

    if (confirmPassword) {
      if (confirmPassword !== formData.password) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    } else {
      setConfirmPasswordError("");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match" });
      return;
    }

    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      setStatus({ type: "error", message: "Please fix password errors" });
      return;
    }

    try {
      await authApi.resetPassword(token, formData.password);
      setStatus({
        type: "success",
        message: "Password reset successful! Redirecting to login...",
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to reset password",
      });
    }
  };

  if (status.type === "error" && !tokenValid) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md p-6 space-y-8 bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invalid Reset Link
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{status.message}</p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center text-gray-700 dark:text-cyber-green hover:text-cyber-green dark:hover:text-cyber-green/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 space-y-8 bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Set New Password
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please enter your new password below.
          </p>
        </div>

        {status.message && (
          <div
            className={`p-4 rounded ${
              status.type === "error"
                ? "bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-500"
                : "bg-green-50 dark:bg-green-500/10 text-green-500 border border-green-500"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.password ? "text" : "password"}
                required
                className="w-full px-3 py-2 bg-gray-50 dark:bg-cyber-black border border-gray-300 
                  dark:border-cyber-green rounded focus:ring-1 focus:ring-cyber-green/50 
                  dark:focus:ring-cyber-green focus:border-cyber-green dark:focus:border-cyber-green 
                  transition-colors selection:bg-cyber-green selection:bg-opacity-30 
                  selection:text-gray-900 dark:selection:text-white"
                value={formData.password}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("password")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 
                  dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPasswords.password ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordErrors.length > 0 && (
              <ul className="mt-2 text-sm text-red-500 space-y-1">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                required
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-cyber-black border 
                  ${
                    confirmPasswordError
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-cyber-green"
                  } rounded focus:ring-1 focus:ring-cyber-green/50 
                  dark:focus:ring-cyber-green focus:border-cyber-green dark:focus:border-cyber-green 
                  transition-colors selection:bg-cyber-green selection:bg-opacity-30 
                  selection:text-gray-900 dark:selection:text-white`}
                value={formData.confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 
                  dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="mt-2 text-sm text-red-500">
                {confirmPasswordError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!!confirmPasswordError || passwordErrors.length > 0}
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}
