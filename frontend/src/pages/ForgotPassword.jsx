import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../services/api";
import Button from "../components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "info", message: "Processing..." });

    try {
      await authApi.forgotPassword(email);
      setStatus({
        type: "success",
        message: "Reset link sent! Please check your email.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to send reset link",
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-6 space-y-8 bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your
            password.
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
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 bg-gray-50 dark:bg-cyber-black border border-gray-300 
                dark:border-cyber-green rounded focus:ring-1 focus:ring-cyber-green/50 
                dark:focus:ring-cyber-green focus:border-cyber-green dark:focus:border-cyber-green 
                transition-colors selection:bg-cyber-green selection:bg-opacity-30 
                selection:text-gray-900 dark:selection:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>

        <Link
          to="/login"
          className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
