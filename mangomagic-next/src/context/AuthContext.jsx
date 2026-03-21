import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { buildApiUrl } from "../lib/api";
import { firebaseAuth, googleAuthProvider } from "../lib/firebase";
import { useLocalization } from "./LocalizationContext";

const AuthContext = createContext(null);

function mapFirebaseUser(currentUser) {
  if (!currentUser) {
    return null;
  }

  return {
    id: currentUser.uid,
    email: currentUser.email || "",
    name: currentUser.displayName || "",
    phone: currentUser.phoneNumber || "",
    avatar_url: currentUser.photoURL || ""
  };
}

function shouldUseRedirect() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(max-width: 768px)").matches;
}

function mapGoogleAuthError(error, copy) {
  switch (error?.code) {
    case "auth/operation-not-allowed":
      return new Error(copy.auth.errors.signInNotEnabled);
    case "auth/unauthorized-domain":
      return new Error(copy.auth.errors.unauthorizedDomain);
    case "auth/popup-blocked":
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/operation-not-supported-in-this-environment":
      return error;
    default:
      return new Error(error?.message || copy.auth.errors.defaultSignIn);
  }
}

export function AuthProvider({ children }) {
  const { copy } = useLocalization();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const getAuthHeader = useCallback(async () => {
    if (!firebaseAuth.currentUser) {
      throw new Error(copy.auth.errors.loginRequired);
    }

    const idToken = await firebaseAuth.currentUser.getIdToken();
    return {
      Authorization: `Bearer ${idToken}`
    };
  }, [copy.auth.errors.loginRequired]);

  const logout = useCallback(async () => {
    await signOut(firebaseAuth);
    setUser(null);
    setSession(null);
    setProfile(null);
    setProfileLoading(false);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      if (shouldUseRedirect()) {
        await signInWithRedirect(firebaseAuth, googleAuthProvider);
        return { redirecting: true };
      }

      const credential = await signInWithPopup(firebaseAuth, googleAuthProvider);
      return { redirecting: false, user: credential.user };
    } catch (error) {
      if (
        error?.code === "auth/popup-blocked" ||
        error?.code === "auth/popup-closed-by-user" ||
        error?.code === "auth/cancelled-popup-request" ||
        error?.code === "auth/operation-not-supported-in-this-environment"
      ) {
        await signInWithRedirect(firebaseAuth, googleAuthProvider);
        return { redirecting: true };
      }

      throw mapGoogleAuthError(error, copy);
    }
  }, [copy]);

  const refreshProfile = useCallback(async () => {
    if (!firebaseAuth.currentUser) {
      setProfile(null);
      setProfileLoading(false);
      return null;
    }

    setProfileLoading(true);

    try {
      const response = await fetch(buildApiUrl("/api/profile"), {
        headers: await getAuthHeader()
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || copy.auth.errors.loadProfile);
      }

      setProfile(payload.profile);
      return payload.profile;
    } finally {
      setProfileLoading(false);
    }
  }, [copy.auth.errors.loadProfile, getAuthHeader]);

  const authorizedRequest = useCallback(
    async (path, options = {}) => {
      const response = await fetch(buildApiUrl(path), {
        ...options,
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(options.headers || {}),
          ...(await getAuthHeader())
        }
      });

      if (response.status === 401) {
        await logout();
        throw new Error(copy.auth.errors.sessionExpired);
      }

      return response;
    },
    [copy.auth.errors.sessionExpired, getAuthHeader, logout]
  );

  const saveProfile = useCallback(
    async (values) => {
      const response = await authorizedRequest("/api/profile", {
        method: "POST",
        body: JSON.stringify(values)
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || copy.auth.errors.saveProfile);
      }

      setProfile(payload.profile);
      return payload.profile;
    },
    [authorizedRequest, copy.auth.errors.saveProfile]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      setUser(mapFirebaseUser(currentUser));
      setSession(currentUser ? { uid: currentUser.uid } : null);

      if (currentUser) {
        try {
          await refreshProfile();
        } catch (error) {
          setProfile(null);
        }
      } else {
        setProfile(null);
        setProfileLoading(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profile,
        profileLoading,
        loginWithGoogle,
        refreshProfile,
        saveProfile,
        authorizedRequest,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}
