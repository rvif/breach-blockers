import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import {
  User,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Pencil,
  ChevronDown,
} from "lucide-react";
import { authApi } from "../services/api";
import { userApi } from "../services/api";
import Alert from "../components/ui/Alert";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
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
  const [submitStatus, setSubmitStatus] = useState({
    type: "",
    message: "",
    timestamp: null,
  });
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [isEditing, setIsEditing] = useState({
    name: false,
    bio: false,
  });

  const [originalValues, setOriginalValues] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
  });

  const alertKey = useMemo(() => {
    return submitStatus.message
      ? `${submitStatus.type}-${submitStatus.message}`
      : null;
  }, [submitStatus.type, submitStatus.message]);

  const hasChanges = useMemo(() => {
    return (
      profileForm.name.trim() !== originalValues.name.trim() ||
      profileForm.bio.trim() !== originalValues.bio.trim()
    );
  }, [profileForm, originalValues]);

  useEffect(() => {
    if (user) {
      setOriginalValues({
        name: user.name || "",
        bio: user.bio || "",
      });
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const [apiResponse, setApiResponse] = useState(null);

  const handleAlertClose = useCallback(() => {
    setApiResponse(null);
  }, []);

  const alertProps = useMemo(() => {
    if (!apiResponse) return null;

    return {
      type: apiResponse.type,
      message: apiResponse.message,
      onClose: handleAlertClose,
      duration: 4000,
    };
  }, [apiResponse, handleAlertClose]);

  const securityAlertProps = useMemo(() => {
    if (!submitStatus.message) return null;

    return {
      message: submitStatus.message,
      type: submitStatus.type,
      timestamp: submitStatus.timestamp,
    };
  }, [submitStatus]);

  const validateName = (name) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      return "Name can only contain letters and spaces";
    }

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
      const currentName = user?.name;

      if (!currentName) {
        setApiResponse({
          type: "error",
          message: "Current user name not found",
          timestamp: Date.now(),
        });
        return;
      }

      const cleanedName = profileForm.name.trim().split(/\s+/).join(" ");

      const nameError = validateName(cleanedName);
      if (nameError) {
        setApiResponse({
          type: "error",
          message: nameError,
          timestamp: Date.now(),
        });
        return;
      }

      const response = await userApi.updateProfile(
        {
          name: cleanedName,
          bio: profileForm.bio,
        },
        currentName
      );

      setApiResponse({
        type: "success",
        message: response.msg || "Profile updated successfully!",
        timestamp: Date.now(),
      });

      const newUsername = cleanedName.toLowerCase().replace(/\s+/g, ".");

      updateUser({
        ...user,
        name: cleanedName,
        bio: profileForm.bio,
        username: newUsername,
        ...response.user,
      });

      localStorage.setItem("username", newUsername);
      setIsEditing({ name: false, bio: false });

      // Update original values after successful save
      setOriginalValues({
        name: cleanedName,
        bio: profileForm.bio,
      });
    } catch (error) {
      setApiResponse({
        type: "error",
        message: error.response?.data?.msg || "Failed to update profile",
        timestamp: Date.now(),
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

  const [passwordSuccessAlert, setPasswordSuccessAlert] = useState({
    show: false,
    message: "",
    timestamp: null,
  });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: "", message: "", timestamp: Date.now() });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSubmitStatus({
        type: "error",
        message: "New passwords do not match",
        timestamp: Date.now(),
      });
      return;
    }

    const errors = validatePassword(passwordForm.newPassword);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      setSubmitStatus({
        type: "error",
        message: "Please fix password errors",
        timestamp: Date.now(),
      });
      return;
    }

    try {
      await authApi.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setSubmitStatus({
        type: "success",
        message: "Password updated successfully!",
        timestamp: Date.now(),
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || "Failed to update password";
      setSubmitStatus({
        type: "error",
        message: errorMessage,
        timestamp: Date.now(),
      });

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

  const handleEditToggle = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const MAX_BIO_LENGTH = 150;

  const handleBioChange = (e) => {
    const value = e.target.value.slice(0, MAX_BIO_LENGTH);
    setProfileForm((prev) => ({ ...prev, bio: value }));
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
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4 md:px-0">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>

      {/* Desktop Tabs */}
      <div className="hidden md:flex space-x-4 border-b border-gray-200 dark:border-gray-800">
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

      {/* Mobile Tabs */}
      <div className="md:hidden space-y-4">
        {tabs.map((tab) => (
          <div key={tab.id}>
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-4 rounded-lg ${
                activeTab === tab.id
                  ? "bg-cyber-green/10 text-cyber-green"
                  : "bg-gray-50 dark:bg-cyber-black text-gray-700 dark:text-gray-300"
              }`}
            >
              <div className="flex items-center space-x-3">
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  activeTab === tab.id ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Alert Component */}
      {apiResponse && (
        <Alert key={`alert-${apiResponse.timestamp}`} {...alertProps} />
      )}

      {/* Content Section */}
      <div className="space-y-6">
        {/* Profile Section */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                {isEditing.name ? (
                  <input
                    type="text"
                    className="w-full px-3 py-3 bg-gray-50 dark:bg-cyber-black border border-gray-300 
                      dark:border-cyber-green rounded-lg focus:ring-1 focus:ring-cyber-green/50"
                    value={profileForm.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                ) : (
                  <div
                    className="w-full px-3 py-3 bg-gray-50 dark:bg-cyber-black border border-gray-300 
                    dark:border-cyber-green rounded-lg"
                  >
                    {profileForm.name}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleEditToggle("name")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Pencil className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Email Input - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div
                  className="w-full px-3 py-3 bg-gray-50 dark:bg-cyber-black border border-gray-300 
                  dark:border-cyber-green rounded-lg flex items-center justify-between"
                >
                  <span className="text-gray-500">{profileForm.email}</span>
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <div className="relative">
                {isEditing.bio ? (
                  <textarea
                    value={profileForm.bio}
                    onChange={handleBioChange}
                    rows={4}
                    maxLength={MAX_BIO_LENGTH}
                    className="w-full resize-none px-3 py-3 bg-gray-50 dark:bg-cyber-black border 
                      border-gray-300 dark:border-cyber-green rounded-lg focus:ring-1 
                      focus:ring-cyber-green/50 pr-10"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div
                    className="w-full px-3 py-3 bg-gray-50 dark:bg-cyber-black border 
                    border-gray-300 dark:border-cyber-green rounded-lg min-h-[96px] pr-10 whitespace-pre-wrap"
                  >
                    {profileForm.bio || "No bio added yet"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleEditToggle("bio")}
                  className="absolute right-3 top-3"
                >
                  <Pencil className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
                {isEditing.bio && (
                  <span className="absolute bottom-2 right-2 text-xs text-gray-500">
                    {profileForm.bio.length}/{MAX_BIO_LENGTH}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons - Only show when editing and has changes */}
            {(isEditing.name || isEditing.bio) && hasChanges && (
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setProfileForm({
                      ...originalValues,
                      email: user?.email || "",
                    });
                    setIsEditing({ name: false, bio: false });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            )}
          </form>
        )}

        {/* Security Section */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {submitStatus.message && (
              <Alert
                key={`security-alert-${submitStatus.timestamp}`}
                {...securityAlertProps}
              />
            )}

            {/* Show success alert separately */}
            {passwordSuccessAlert.show && (
              <Alert
                type="success"
                message={passwordSuccessAlert.message}
                onClose={() =>
                  setPasswordSuccessAlert({
                    show: false,
                    message: "",
                    timestamp: null,
                  })
                }
                duration={4000}
              />
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

        {/* Notifications Section */}
        {activeTab === "notifications" && (
          <div className="bg-gray-50 dark:bg-cyber-black p-4 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              Notification settings will be available soon.
            </p>
          </div>
        )}

        {/* Privacy Section */}
        {activeTab === "privacy" && (
          <div className="bg-gray-50 dark:bg-cyber-black p-4 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              Privacy settings will be available soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
