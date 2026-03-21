"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import CartDrawer from "./CartDrawer";
import Navbar from "./Navbar";

const HIDE_CHROME_ROUTES = new Set(["/login", "/verify-otp"]);

export function AppShell({ children }) {
  const pathname = usePathname();
  const hideChrome = HIDE_CHROME_ROUTES.has(pathname);

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      {!hideChrome ? <Navbar /> : null}
      <main className={hideChrome ? "min-h-screen" : "min-h-screen px-4 pb-32 pt-40 md:px-6 md:pb-10 md:pt-44"}>
        {children}
      </main>
      {!hideChrome ? <CartDrawer /> : null}
    </>
  );
}
