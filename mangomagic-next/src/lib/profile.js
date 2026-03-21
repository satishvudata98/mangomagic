export function sanitizeDeliveryPhoneInput(value) {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) {
    return "";
  }

  const hasPlusPrefix = trimmedValue.startsWith("+");
  const digitsOnly = trimmedValue.replace(/\D/g, "");
  const normalizedDigits = digitsOnly.slice(0, 12);

  return hasPlusPrefix ? `+${normalizedDigits}` : normalizedDigits;
}

export function normalizeIndianMobileNumber(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return "";
  }

  const digitsOnly = rawValue.replace(/\D/g, "");

  if (/^[6-9]\d{9}$/.test(digitsOnly)) {
    return `+91${digitsOnly}`;
  }

  if (/^91[6-9]\d{9}$/.test(digitsOnly)) {
    return `+${digitsOnly}`;
  }

  if (/^\+91[6-9]\d{9}$/.test(rawValue.replace(/\s+/g, ""))) {
    return rawValue.replace(/\s+/g, "");
  }

  return "";
}

export function isValidIndianMobileNumber(value) {
  return Boolean(normalizeIndianMobileNumber(value));
}
