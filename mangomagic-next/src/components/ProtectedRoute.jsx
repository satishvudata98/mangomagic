"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useLocalization } from "../context/LocalizationContext";

function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading, profileLoading } = useAuth();
  const { copy } = useLocalization();

  useEffect(() => {
    if (loading || session) {
      return;
    }

    router.replace(`/login?next=${encodeURIComponent(pathname || "/products")}`);
  }, [loading, pathname, router, session]);

  if (loading || (session && profileLoading) || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label={copy.components.protectedRoute.loading} />
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
