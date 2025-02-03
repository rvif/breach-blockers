export const validateName = (name) => {
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

export const validatePassword = (password) => {
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
