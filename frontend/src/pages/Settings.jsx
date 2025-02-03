import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { User, Lock, Bell, Shield, Eye, EyeOff, Pencil } from "lucide-react";
import { authApi } from "../services/api";
import { Link } from "react-router-dom";
import { userApi } from "../services/api";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "Learning to help you be cybersecure <3",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [isEditing, setIsEditing] = useState({
    name: false,
    bio: false,
  });

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const username = localStorage.getItem("username");
      if (!username) {
        console.error("No username in localStorage");
        throw new Error("No username found. Please log in again.");
      }

      // Clean and validate the new name
      const cleanedName = profileForm.name.trim().split(/\s+/).join(" ");

      // Validate name format
      const nameError = validateName(cleanedName);
      if (nameError) {
        setStatus({
          type: "error",
          message: nameError,
        });
        return;
      }

      console.log("Submitting profile update for username:", username);

      const response = await userApi.updateProfile(
        {
          name: cleanedName,
          bio: profileForm.bio,
        },
        username
      );

      // Update the local user state with the response data
      updateUser({
        ...user,
        name: cleanedName,
        bio: profileForm.bio,
        username: cleanedName.toLowerCase().replace(/\s+/g, "."),
        ...response,
      });

      // Update localStorage with URL-friendly username
      localStorage.setItem(
        "username",
        cleanedName.toLowerCase().replace(/\s+/g, ".")
      );

      setStatus({
        type: "success",
        message: "Profile updated successfully!",
      });

      setIsEditing({ name: false, bio: false });
    } catch (error) {
      console.error("Profile update error:", error);
      setStatus({
        type: "error",
        message: error.response?.data?.msg || "Failed to update profile",
      });
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8)
      errors.push("Password must be at least 8 characters");
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
    const newPassword = e.target.value;
    setPasswordForm((prev) => ({ ...prev, newPassword }));
    setPasswordErrors(validatePassword(newPassword));

    // Check confirm password match
    if (passwordForm.confirmPassword) {
      if (passwordForm.confirmPassword !== newPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value;
    setPasswordForm((prev) => ({ ...prev, confirmPassword }));

    if (confirmPassword) {
      if (confirmPassword !== passwordForm.newPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    } else {
      setConfirmPasswordError("");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatus({ type: "error", message: "New passwords do not match" });
      return;
    }

    // Validate password requirements
    const errors = validatePassword(passwordForm.newPassword);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      setStatus({ type: "error", message: "Please fix password errors" });
      return;
    }

    try {
      await authApi.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // Show success message and clear form
      setStatus({
        type: "success",
        message: "Password updated successfully!",
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      // Handle specific error messages from backend
      const errorMessage =
        error.response?.data?.msg || "Failed to update password";
      setStatus({
        type: "error",
        message: errorMessage,
      });

      // Only clear new password fields on error, keep current password
      if (errorMessage === "Current password is incorrect") {
        setPasswordForm((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
      }
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Lock },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "privacy", name: "Privacy", icon: Shield },
  ];

  const inputClassName =
    "w-full px-3 py-2 bg-white dark:bg-cyber-black border border-gray-300 dark:border-cyber-green rounded focus:ring-1 focus:ring-cyber-green text-gray-900 dark:text-white";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-cyber-green text-cyber-green"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Profile Settings */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <div className="relative">
              <input
                type="text"
                className={`${inputClassName} ${
                  !isEditing.name && "bg-gray-100 dark:bg-gray-800"
                }`}
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                disabled={!isEditing.name}
              />
              <button
                type="button"
                onClick={() =>
                  setIsEditing((prev) => ({ ...prev, name: !prev.name }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 
                  dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Name must be either all lowercase (e.g., john doe) or properly
              capitalized (e.g., John Doe)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              className={`${inputClassName} bg-gray-100 dark:bg-gray-800`}
              value={profileForm.email}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <div className="relative">
              <textarea
                className={`${inputClassName} ${
                  !isEditing.bio && "bg-gray-100 dark:bg-gray-800"
                } h-[200px] resize-none scrollbar-none`}
                rows="4"
                value={profileForm.bio}
                onChange={(e) => {
                  const bio = e.target.value;
                  if (bio.length <= 100) {
                    setProfileForm((prev) => ({ ...prev, bio }));
                  }
                }}
                disabled={!isEditing.bio}
              />
              <button
                type="button"
                onClick={() =>
                  setIsEditing((prev) => ({ ...prev, bio: !prev.bio }))
                }
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 
                  dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {profileForm.bio.length}/100 characters
              </div>
            </div>
          </div>

          <Button type="submit" disabled={!isEditing.name && !isEditing.bio}>
            Save Changes
          </Button>
        </form>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                className={inputClassName}
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 
                  dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                className={`${inputClassName} ${
                  passwordErrors.length > 0 ? "border-red-500" : ""
                }`}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 
                  dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPasswords.new ? (
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
                className={`${inputClassName} ${
                  confirmPasswordError ? "border-red-500" : ""
                }`}
                value={passwordForm.confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
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
            disabled={!!confirmPasswordError || passwordErrors.length > 0}
          >
            Update Password
          </Button>
        </form>
      )}

      {/* Notifications Settings */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Notification settings will be available soon.
          </p>
        </div>
      )}

      {/* Privacy Settings */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Privacy settings will be available soon.
          </p>
        </div>
      )}
    </div>
  );
}
