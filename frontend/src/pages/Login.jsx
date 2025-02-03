import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Loader } from "lucide-react";
import Button from "../components/ui/Button";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "info", message: "Logging in..." });
    setShowResendVerification(false);

    try {
      console.log("Starting login process...");
      await login({ ...formData, rememberMe });
      setStatus({ type: "success", message: "Login successful!" });

      if (rememberMe) {
        console.log("Setting remembered email...");
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        console.log("Removing remembered email...");
        localStorage.removeItem("rememberedEmail");
      }

      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Login failed:", error);
      const errorMsg = error.response?.data?.msg;
      setStatus({ type: "error", message: errorMsg || "Login failed" });

      if (error.response?.data?.isEmailVerified === false) {
        setShowResendVerification(true);
      }

      // Handle password validation errors if they exist
      if (error.response?.data?.errors) {
        setStatus({
          type: "error",
          message: "Password validation failed:",
          errors: error.response.data.errors,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setStatus({ type: "info", message: "Sending verification email..." });

    try {
      await register({ email: formData.email, resendVerification: true });
      setStatus({
        type: "success",
        message: "Verification email sent! Please check your inbox.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.msg || "Failed to send verification email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const inputClassName = `w-full px-3 py-2 bg-gray-50 dark:bg-cyber-black border border-gray-300 
    dark:border-cyber-green rounded focus:ring-1 focus:ring-cyber-green/50 dark:focus:ring-cyber-green 
    focus:border-cyber-green dark:focus:border-cyber-green transition-colors
    selection:bg-cyber-green selection:bg-opacity-30 selection:text-gray-900 dark:selection:text-white`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 space-y-8 bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        {status.message && (
          <div
            className={`p-4 rounded ${
              status.type === "error"
                ? "bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-500"
                : status.type === "success"
                ? "bg-green-50 dark:bg-green-500/10 text-green-500 border border-green-500"
                : "bg-blue-50 dark:bg-blue-500/10 text-blue-500 border border-blue-500"
            }`}
          >
            <p>{status.message}</p>
            {status.errors && (
              <ul className="mt-2 list-disc list-inside">
                {status.errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              className={inputClassName}
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="john@example.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-cyber-green hover:text-cyber-green/80 dark:hover:text-cyber-green/90"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className={inputClassName}
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-cyber-green border-gray-300 rounded focus:ring-0 focus:ring-offset-0 
                dark:checked:bg-cyber-green dark:checked:border-cyber-green dark:checked:hover:bg-cyber-green 
                dark:bg-cyber-black dark:border-cyber-green"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Remember me
            </label>
          </div>

          <Button
            type="submit"
            className="w-full relative"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Processing...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {showResendVerification && (
          <div className="text-center">
            <button
              onClick={handleResendVerification}
              className="text-cyber-green hover:text-cyber-green/80 dark:hover:text-cyber-green/90"
              disabled={isLoading}
            >
              Resend verification email
            </button>
          </div>
        )}

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-cyber-green hover:text-cyber-green/80 dark:hover:text-cyber-green/90"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
