import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { buildApiUrl } from "../lib/api";
import { useAuth } from "./AuthContext";

const DeliveryContext = createContext(null);
const STORAGE_KEY = "mangomagic.delivery-pincode";

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

export function DeliveryProvider({ children }) {
  const { profile } = useAuth();
  const [pincode, setPincodeState] = useState(() => readStoredPincode());
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [allPincodes, setAllPincodes] = useState([]);

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
        selectedLocationLabel
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
