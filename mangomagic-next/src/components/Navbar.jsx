"use client";

import { CheckCircle2, Home, Loader2, LogIn, LogOut, MapPin, Phone, ReceiptIndianRupee, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useDelivery } from "../context/DeliveryContext";
import { useLocalization } from "../context/LocalizationContext";
import { SHOP_CONFIG } from "../lib/shopConfig";

function buildLoginHref(nextPath) {
  return `/login?next=${encodeURIComponent(nextPath || "/products")}`;
}

function IconLink({ to, label, icon, badge, mobile = false }) {
  const pathname = usePathname();
  const isActive = pathname === to;

  return (
    <Link
      href={to}
      className={
        mobile
          ? `relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 py-1.5 text-[10px] font-semibold transition ${
              isActive ? "bg-primary text-white shadow-lg shadow-orange-200/60" : "text-muted hover:bg-orange-50 hover:text-primary-dark"
            }`
          : `relative flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
              isActive ? "bg-primary text-white" : "text-muted hover:bg-orange-50 hover:text-primary-dark"
            }`
      }
    >
      {mobile ? (
        <>
          <span className="relative flex h-5 w-5 items-center justify-center">
            {icon}
            {badge ? (
              <span className="absolute -right-2 -top-2 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black leading-none text-primary shadow-md ring-1 ring-orange-100">
                {badge}
              </span>
            ) : null}
          </span>
          <span className="leading-none">{label}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{label}</span>
          {badge ? (
            <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-bold text-primary">
              {badge}
            </span>
          ) : null}
        </>
      )}
    </Link>
  );
}

function ActionLink({ label, icon, onClick, badge, mobile = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        mobile
          ? "relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 py-1.5 text-[10px] font-semibold text-muted transition hover:bg-orange-50 hover:text-primary-dark"
          : "relative flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-muted transition hover:bg-orange-50 hover:text-primary-dark"
      }
    >
      {mobile ? (
        <>
          <span className="relative flex h-5 w-5 items-center justify-center">
            {icon}
            {badge ? (
              <span className="absolute -right-2 -top-2 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-black leading-none text-white shadow-md">
                {badge}
              </span>
            ) : null}
          </span>
          <span className="leading-none">{label}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{label}</span>
          {badge ? (
            <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-white">
              {badge}
            </span>
          ) : null}
        </>
      )}
    </button>
  );
}

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, session, profile, logout } = useAuth();
  const { cartCount, totalWeightKg, openCart } = useCart();
  const { copy } = useLocalization();
  const navCopy = copy.components.navbar;
  const {
    pincode,
    updatePincode,
    clearPincode,
    checkResult,
    checking,
    hasServiceablePincode,
    selectedLocationLabel,
    geoStatus,
    autoDetectLocation
  } = useDelivery();

  const [showManualInput, setShowManualInput] = useState(false);
  const [pincodeVisible, setPincodeVisible] = useState(true);
  const hideTimerRef = useRef(null);
  const toastFiredRef = useRef(false);

  const identityLabel = user?.name || user?.email || (user?.phone ? user.phone.slice(-4) : null);
  const loginHref = useMemo(() => buildLoginHref(pathname || "/products"), [pathname]);

  // Fire toasts when pincode check result arrives
  useEffect(() => {
    if (checking || !pincode || pincode.length !== 6 || !checkResult) {
      return;
    }

    // Avoid duplicate toasts for the same pincode
    const toastKey = `${pincode}-${checkResult.serviceable}`;

    if (toastFiredRef.current === toastKey) {
      return;
    }

    toastFiredRef.current = toastKey;

    if (checkResult.serviceable) {
      const label =
        checkResult.area_name && checkResult.city
          ? `${checkResult.area_name}, ${checkResult.city}`
          : pincode;
      toast.success(navCopy.toastServiceable(label, pincode), { duration: 3500 });
    } else {
      toast.error(navCopy.toastNotServiceable(pincode), { duration: 4000 });
    }
  }, [checking, pincode, checkResult, navCopy]);

  // Auto-hide the pincode section 2.5s after a serviceable pincode is confirmed
  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (hasServiceablePincode) {
      hideTimerRef.current = setTimeout(() => {
        setPincodeVisible(false);
        setShowManualInput(false);
      }, 2500);
    } else {
      setPincodeVisible(true);
    }

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [hasServiceablePincode]);

  // Show toasts for geo-detection results
  useEffect(() => {
    if (geoStatus === "denied") {
      toast(navCopy.geoDenied, { icon: "📍", duration: 3000 });
      setShowManualInput(true);
    } else if (geoStatus === "failed") {
      toast(navCopy.geoFailed, { icon: "⚠️", duration: 3000 });
      setShowManualInput(true);
    }
  }, [geoStatus, navCopy]);

  async function handleLogout() {
    await logout();
    router.push("/products");
  }

  function handleShowManualInput() {
    setPincodeVisible(true);
    setShowManualInput(true);
  }

  const handleDetect = useCallback(async () => {
    toast.loading(navCopy.geoDetecting, { id: "geo-detect" });
    await autoDetectLocation();
    toast.dismiss("geo-detect");
  }, [autoDetectLocation, navCopy]);

  // Determine what to show in the pincode area
  const showPincodeBlock = pincodeVisible && (showManualInput || geoStatus === "detecting" || (!hasServiceablePincode && geoStatus !== "idle"));
  const showLocationChip = hasServiceablePincode && !pincodeVisible;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-orange-100 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-3 py-2 sm:px-4 sm:py-3 md:px-6">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <Link href="/products" className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-black text-white shadow-lg shadow-orange-200 sm:h-12 sm:w-12 sm:text-sm">
                MG
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-black text-primary-dark sm:text-2xl">{SHOP_CONFIG.name}</p>
                <p className="hidden truncate text-[11px] uppercase tracking-[0.26em] text-muted sm:block">{navCopy.brandTagline}</p>
              </div>
            </Link>

            {/* Location chip – shown when pincode is confirmed and input is hidden */}
            {showLocationChip ? (
              <button
                type="button"
                onClick={handleShowManualInput}
                className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 ring-1 ring-green-200 transition hover:bg-green-100 sm:text-sm md:hidden"
              >
                <CheckCircle2 size={14} />
                <span className="max-w-[120px] truncate">{selectedLocationLabel}</span>
              </button>
            ) : null}

            <nav className="hidden items-center gap-2 md:flex">
              <IconLink to="/products" label={navCopy.home} icon={<Home size={18} />} />
              <IconLink to="/contact" label={navCopy.contact} icon={<Phone size={18} />} />
              {session ? <IconLink to="/orders" label={navCopy.orders} icon={<ReceiptIndianRupee size={18} />} /> : null}
              <ActionLink
                label={navCopy.cart}
                icon={<ShoppingCart size={18} />}
                badge={cartCount ? cartCount : null}
                onClick={openCart}
              />
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              {identityLabel ? (
                <span className="max-w-[220px] truncate rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-primary-dark">
                  {identityLabel}
                </span>
              ) : null}
              {session ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-12 items-center gap-2 rounded-full border border-orange-200 px-5 py-3 text-sm font-semibold text-primary-dark transition hover:bg-orange-50"
                >
                  <LogOut size={16} />
                  {navCopy.logout}
                </button>
              ) : (
                <Link
                  href={loginHref}
                  className="flex min-h-12 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  <LogIn size={16} />
                  {navCopy.signIn}
                </Link>
              )}
            </div>
          </div>

          {/* --- Desktop: Compact confirmed delivery banner --- */}
          {hasServiceablePincode && !showManualInput ? (
            <div className="mt-2 hidden flex-col gap-2 rounded-2xl border border-green-200 bg-green-50/90 px-4 py-2.5 shadow-sm md:mt-3 md:flex md:flex-row md:items-center md:justify-between md:rounded-[24px] md:p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-green-700 shadow-sm md:h-10 md:w-10">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">{navCopy.compactDeliveryTitle(selectedLocationLabel)}</p>
                  <p className="mt-0.5 text-xs text-green-700 md:text-sm">{navCopy.compactDeliveryBody(pincode)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setPincodeVisible(true); setShowManualInput(true); }}
                className="rounded-full border border-green-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-800 transition hover:bg-green-100 md:px-4 md:py-2 md:text-sm"
              >
                {navCopy.changePincode}
              </button>
            </div>
          ) : null}

          {/* --- Pincode input block: auto-hides on mobile, compact everywhere --- */}
          {showPincodeBlock || showManualInput ? (
            <div className="mt-2 rounded-2xl border border-orange-100 bg-[#fff7ed]/80 p-2.5 shadow-sm sm:mt-3 sm:rounded-[28px] sm:p-4">
              <div className="grid gap-2 sm:gap-4 lg:grid-cols-[1.1fr,1fr] lg:items-center">
                {/* Hide descriptive text on mobile */}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{navCopy.pincodeEyebrow}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{navCopy.pincodePrompt}</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr,auto] sm:gap-3">
                  <div className="flex h-10 items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 sm:min-h-12 sm:gap-3 sm:rounded-[22px] sm:px-4">
                    <MapPin size={16} className="shrink-0 text-primary" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={pincode}
                      onChange={(event) => {
                        setShowManualInput(true);
                        setPincodeVisible(true);
                        updatePincode(event.target.value);
                      }}
                      placeholder={navCopy.pincodePlaceholder}
                      className="w-full bg-transparent text-sm font-semibold text-primary-dark outline-none placeholder:text-muted"
                    />
                    {pincode ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowManualInput(true);
                          setPincodeVisible(true);
                          clearPincode();
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-orange-50 hover:text-primary-dark"
                        aria-label={navCopy.clearPincodeAria}
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDetect}
                        className="flex shrink-0 items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold text-primary-dark transition hover:bg-orange-200 sm:text-xs"
                      >
                        <MapPin size={12} />
                        {navCopy.detectLocation}
                      </button>
                    )}
                  </div>

                  <div
                    className={`flex h-10 items-center justify-center rounded-xl px-3 text-xs font-semibold sm:min-h-12 sm:rounded-[22px] sm:px-4 sm:text-sm ${
                      checking
                        ? "bg-orange-100 text-primary-dark"
                        : hasServiceablePincode
                          ? "bg-green-100 text-green-700"
                          : checkResult && !checkResult.serviceable
                            ? "bg-red-100 text-red-700"
                            : "bg-white text-muted ring-1 ring-orange-100"
                    }`}
                  >
                    {checking ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 size={14} className="animate-spin" />
                        {navCopy.checking}
                      </span>
                    ) : hasServiceablePincode ? (
                      navCopy.deliveringTo(selectedLocationLabel)
                    ) : checkResult && !checkResult.serviceable ? (
                      navCopy.notServiceable
                    ) : profile?.pincode ? (
                      navCopy.savedPincode(profile.pincode)
                    ) : (
                      navCopy.optionalBrowsing
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Geo detecting shimmer (mobile only, before manual input) */}
          {geoStatus === "detecting" && !showManualInput ? (
            <div className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-primary-dark md:hidden">
              <Loader2 size={14} className="animate-spin" />
              {navCopy.geoDetecting}
            </div>
          ) : null}
        </div>
      </header>

      {/* Mobile bottom nav – compact */}
      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-orange-100 bg-white/95 p-1.5 shadow-2xl backdrop-blur sm:inset-x-4 sm:bottom-4 sm:rounded-[30px] sm:p-2 md:hidden">
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          <IconLink to="/products" label={navCopy.home} icon={<Home size={16} />} mobile />
          <IconLink to="/contact" label={navCopy.contact} icon={<Phone size={16} />} mobile />
          {session ? (
            <IconLink to="/orders" label={navCopy.orders} icon={<ReceiptIndianRupee size={16} />} mobile />
          ) : (
            <IconLink to={loginHref} label={navCopy.signIn} icon={<LogIn size={16} />} mobile />
          )}
          <ActionLink
            label={navCopy.cart}
            icon={<ShoppingCart size={16} />}
            badge={cartCount ? cartCount : null}
            onClick={openCart}
            mobile
          />
        </div>
      </nav>

      {/* REMOVED: floating "X kg selected" mobile badge – cart icon badge is sufficient */}

      {session ? null : (
        <Link
          href={buildLoginHref("/checkout")}
          className="fixed right-4 top-[8.75rem] z-30 hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-dark shadow-card ring-1 ring-orange-100 transition hover:bg-orange-50 lg:inline-flex"
        >
          {navCopy.floatingSignIn}
        </Link>
      )}
    </>
  );
}

export default Navbar;
