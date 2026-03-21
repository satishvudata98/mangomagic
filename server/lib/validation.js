function normalizeIndianMobileNumber(value) {
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

function isValidIndianMobileNumber(value) {
  return Boolean(normalizeIndianMobileNumber(value));
}

module.exports = {
  isValidIndianMobileNumber,
  normalizeIndianMobileNumber
};
