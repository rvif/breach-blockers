import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { Eye, EyeOff } from "lucide-react";
import RateLimitTimer from "../components/RateLimitTimer";

export default function Register() {
  const [step, setStep] = useState("register"); // 'register' or 'verify'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [nameError, setNameError] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [rateLimitEnd, setRateLimitEnd] = useState(null);

  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status.type === "success" && countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        navigate("/");
      }
    }
  }, [countdown, status.type]);

  const validateName = (name) => {
    // Only allow letters and spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      return "Name can only contain letters and spaces";
    }

    // Check for consistent capitalization
    const words = name.split(/\s+/);
    const isAllLowerCase = words.every((word) => word === word.toLowerCase());
    const isCapitalized = words.every(
      (word) =>
        word === word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );

    if (!isAllLowerCase && !isCapitalized) {
      return "Name must be either all lowercase (e.g., john doe) or properly capitalized (e.g., John Doe)";
    }

    return "";
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, name }));
    setNameError(validateName(name.trim()));
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    return errors;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData((prev) => ({ ...prev, password }));
    setPasswordErrors(validatePassword(password));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus({ type: "info", message: "Processing..." });
    setRateLimitEnd(null);

    try {
      const nameError = validateName(formData.name.trim());
      if (nameError) {
        setNameError(nameError);
        setStatus({ type: "error", message: "Please fix name format" });
        return;
      }

      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        setPasswordErrors(passwordErrors);
        setStatus({ type: "error", message: "Please fix password errors" });
        return;
      }

      const cleanedName = formData.name.trim().split(/\s+/).join(" ");
      const response = await register({
        ...formData,
        name: cleanedName,
      });

      setStatus({
        type: "success",
        message:
          "Registration successful! Please check your email for OTP verification.",
      });
      setStep("verify");
    } catch (error) {
      if (error.response?.status === 429) {
        setRateLimitEnd(Date.now() + error.rateLimitInfo.retryAfter);
        setStatus({
          type: "error",
          message: error.rateLimitInfo.message,
          attemptsRemaining: error.rateLimitInfo.attemptsRemaining,
        });
      } else {
        setStatus({
          type: "error",
          message: error.response?.data?.msg || "Registration failed",
        });
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setStatus({ type: "info", message: "Verifying..." });

    try {
      await verifyOtp(formData.email, otp);
      setStatus({
        type: "success",
        message: "Email verified! Redirecting to login...",
      });
      setCountdown(3);
    } catch (error) {
      if (error.response?.status === 429) {
        setStatus({
          type: "error",
          message: error.rateLimitInfo.message,
          retryAfter: error.rateLimitInfo.retryAfter,
          attemptsRemaining: error.rateLimitInfo.attemptsRemaining,
        });
      } else {
        setStatus({
          type: "error",
          message: error.response?.data?.msg || "Verification failed",
        });
      }
    }
  };

  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-cyber-green focus:border-cyber-green dark:bg-cyber-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

  if (step === "verify") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md p-6 space-y-8 bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Verify Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter the OTP sent to your email
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
              <div>{status.message}</div>
              {rateLimitEnd && (
                <RateLimitTimer
                  initialTime={rateLimitEnd - Date.now()}
                  onComplete={() => setRateLimitEnd(null)}
                />
              )}
              {status.attemptsRemaining !== undefined && (
                <div className="mt-1 text-sm">
                  {status.attemptsRemaining} attempts remaining
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                required
                className={inputClassName}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
              />
            </div>

            <Button type="submit" className="w-full">
              Verify Email
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the code?{" "}
            <button
              onClick={handleRegister}
              className="text-cyber-green hover:text-cyber-green/80 dark:hover:text-cyber-green/90"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 space-y-8 bg-white dark:bg-cyber-black border border-gray-200 dark:border-cyber-green rounded-lg">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Join Br3achBl0ckers today
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
            <div>{status.message}</div>
            {rateLimitEnd && (
              <RateLimitTimer
                initialTime={rateLimitEnd - Date.now()}
                onComplete={() => setRateLimitEnd(null)}
              />
            )}
            {status.attemptsRemaining !== undefined && (
              <div className="mt-1 text-sm">
                {status.attemptsRemaining} attempts remaining
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              className={`${inputClassName} ${
                nameError ? "border-red-500 dark:border-red-500" : ""
              }`}
              value={formData.name}
              onChange={handleNameChange}
              placeholder="John Doe"
            />
            {nameError ? (
              <p className="mt-1 text-sm text-red-500">{nameError}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Name must be either all lowercase (e.g., john doe) or properly
                capitalized (e.g., John Doe)
              </p>
            )}
          </div>

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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className={`${inputClassName} pr-10`}
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 
                  dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordErrors.length > 0 && (
              <ul className="mt-2 text-sm text-red-500 dark:text-red-400 space-y-1">
                {passwordErrors.map((error, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-cyber-green hover:text-cyber-green/80 dark:hover:text-cyber-green/90"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
