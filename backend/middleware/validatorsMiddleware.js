function validateCountryCode(code) {
  code = (code || "").trim();

  if (!code) {
    return { valid: false, message: "Country code is required." };
  }
  if (!/^\+[1-9]\d{0,3}$/.test(code)) {
    return { valid: false, message: "Select a valid country code, e.g. +91." };
  }
  return { valid: true };
}

function validateMobileNumber(mobile) {
  mobile = (mobile || "").trim();

  if (!mobile) {
    return { valid: false, message: "Mobile number is required." };
  }
  if (!/^\d{6,14}$/.test(mobile)) {
    return { valid: false, message: "Mobile number must be 6-14 digits, no symbols or spaces." };
  }
  if (mobile[0] === "0") {
    return { valid: false, message: "Mobile number should not start with 0." };
  }
  return { valid: true };
}

function validateEmail(email) {
  email = (email || "").trim();

  if (!email) {
    return { valid: false, message: "Email is required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, message: "Enter a valid email address." };
  }
  return { valid: true };
}

function validatePassword(password) {
  password = password || "";

  if (!password) {
    return { valid: false, message: "Password is required." };
  }
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number." };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character." };
  }
  return { valid: true };
}

export {
  validateCountryCode,
  validateMobileNumber,
  validateEmail,
  validatePassword,
};