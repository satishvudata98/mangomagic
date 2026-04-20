import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { buildApiUrl } from "../lib/api";
import { useAuth } from "./AuthContext";

const DeliveryContext = createContext(null);
const STORAGE_KEY = "mangomagic.delivery-pincode";
const GEO_ATTEMPTED_KEY = "mangomagic.geo-attempted";

function sanitizePincode(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, 6);
}

function readStoredPincode() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return sanitizePincode(window.localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    return "";
  }
}

function writeStoredPincode(pincode) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (pincode) {
      window.localStorage.setItem(STORAGE_KEY, pincode);
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Ignore storage errors and keep the in-memory state usable.
  }
}

function markGeoAttempted() {
  try {
    window.sessionStorage.setItem(GEO_ATTEMPTED_KEY, "1");
  } catch (error) {
    // Ignore.
  }
}

function hasGeoBeenAttempted() {
  try {
    return window.sessionStorage.getItem(GEO_ATTEMPTED_KEY) === "1";
  } catch (error) {
    return false;
  }
}

// --- Geolocation helpers ---

async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`;
  const response = await fetch(url, {
    headers: { "Accept-Language": "en" }
  });

  if (!response.ok) {
    throw new Error("Reverse geocode failed");
  }

  const data = await response.json();
  const postcode = data?.address?.postcode;

  if (!postcode || postcode.replace(/\D/g, "").length !== 6) {
    throw new Error("Could not determine pincode from location");
  }

  return sanitizePincode(postcode);
}

function requestGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
      (error) => reject(error),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  });
}

// geoStatus: "idle" | "detecting" | "success" | "denied" | "failed"

export function DeliveryProvider({ children }) {
  const { profile } = useAuth();
  const [pincode, setPincodeState] = useState(() => readStoredPincode());
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [allPincodes, setAllPincodes] = useState([]);
  const [geoStatus, setGeoStatus] = useState("idle");
  const geoRunning = useRef(false);

  const updatePincode = useCallback((value) => {
    const nextPincode = sanitizePincode(value);
    setPincodeState(nextPincode);
    writeStoredPincode(nextPincode);
  }, []);

  const clearPincode = useCallback(() => {
    setPincodeState("");
    setCheckResult(null);
    writeStoredPincode("");
  }, []);

  // Auto-detect location via browser geolocation
  const autoDetectLocation = useCallback(async () => {
    if (geoRunning.current) {
      return null;
    }

    geoRunning.current = true;
    setGeoStatus("detecting");

    try {
      const coords = await requestGeolocation();
      const detectedPincode = await reverseGeocode(coords.lat, coords.lon);

      setPincodeState(detectedPincode);
      writeStoredPincode(detectedPincode);
      markGeoAttempted();
      setGeoStatus("success");

      return detectedPincode;
    } catch (error) {
      markGeoAttempted();

      if (error?.code === 1) {
        // PERMISSION_DENIED
        setGeoStatus("denied");
      } else {
        setGeoStatus("failed");
      }

      return null;
    } finally {
      geoRunning.current = false;
    }
  }, []);

  // On mount: try auto-detect if no pincode is stored and geo hasn't been attempted this session
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = readStoredPincode();

    if (stored || hasGeoBeenAttempted()) {
      return;
    }

    autoDetectLocation();
  }, [autoDetectLocation]);

  useEffect(() => {
    if (!profile?.pincode || pincode) {
      return;
    }

    const savedPincode = sanitizePincode(profile.pincode);
    setPincodeState(savedPincode);
    writeStoredPincode(savedPincode);
  }, [pincode, profile?.pincode]);

  useEffect(() => {
    let ignore = false;

    fetch(buildApiUrl("/api/pincodes"))
      .then((response) => response.json())
      .then((payload) => {
        if (!ignore) {
          setAllPincodes(payload.pincodes || []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setAllPincodes([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function checkPincode() {
      if (pincode.length !== 6) {
        setCheckResult(null);
        setChecking(false);
        return;
      }

      setChecking(true);

      try {
        const response = await fetch(buildApiUrl(`/api/pincodes/check/${pincode}`));
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to check this pincode.");
        }

        if (!ignore) {
          setCheckResult(payload);
        }
      } catch (error) {
        if (!ignore) {
          setCheckResult(null);
        }
      } finally {
        if (!ignore) {
          setChecking(false);
        }
      }
    }

    checkPincode();

    return () => {
      ignore = true;
    };
  }, [pincode]);

  const hasServiceablePincode = Boolean(checkResult?.serviceable && pincode.length === 6);
  const selectedLocationLabel =
    hasServiceablePincode && checkResult?.area_name && checkResult?.city
      ? `${checkResult.area_name}, ${checkResult.city}`
      : null;

  return (
    <DeliveryContext.Provider
      value={{
        pincode,
        updatePincode,
        clearPincode,
        checkResult,
        checking,
        allPincodes,
        hasServiceablePincode,
        selectedLocationLabel,
        geoStatus,
        autoDetectLocation
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const value = useContext(DeliveryContext);

  if (!value) {
    throw new Error("useDelivery must be used inside DeliveryProvider.");
  }

  return value;
}
