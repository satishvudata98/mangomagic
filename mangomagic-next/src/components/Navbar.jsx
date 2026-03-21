"use client";

import { CheckCircle2, Home, LogIn, LogOut, MapPin, Phone, ReceiptIndianRupee, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
          ? `relative flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-2 text-[11px] font-semibold transition ${
              isActive ? "bg-primary text-white shadow-lg shadow-orange-200/60" : "text-muted hover:bg-orange-50 hover:text-primary-dark"
            }`
          : `relative flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
              isActive ? "bg-primary text-white" : "text-muted hover:bg-orange-50 hover:text-primary-dark"
            }`
      }
    >
      {mobile ? (
        <>
          <span className="relative flex h-6 w-6 items-center justify-center">
            {icon}
            {badge ? (
              <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-black leading-none text-primary shadow-md ring-1 ring-orange-100">
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
          ? "relative flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-2 text-[11px] font-semibold text-muted transition hover:bg-orange-50 hover:text-primary-dark"
          : "relative flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-muted transition hover:bg-orange-50 hover:text-primary-dark"
      }
    >
      {mobile ? (
        <>
          <span className="relative flex h-6 w-6 items-center justify-center">
            {icon}
            {badge ? (
              <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-black leading-none text-white shadow-md">
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
  const { pincode, updatePincode, clearPincode, checkResult, checking, hasServiceablePincode, selectedLocationLabel } =
    useDelivery();
  const [editingPincode, setEditingPincode] = useState(false);
  const identityLabel = user?.name || user?.email || (user?.phone ? user.phone.slice(-4) : null);
  const loginHref = useMemo(() => buildLoginHref(pathname || "/products"), [pathname]);

  useEffect(() => {
    if (hasServiceablePincode) {
      setEditingPincode(false);
    }
  }, [hasServiceablePincode]);

  async function handleLogout() {
    await logout();
    router.push("/products");
  }

  const showCompactPincodeBanner = hasServiceablePincode && !editingPincode;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-orange-100 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/products" className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-black text-white shadow-lg shadow-orange-200">
                MG
              </div>
              <div className="min-w-0">
                <p className="font-display text-2xl font-black text-primary-dark">{SHOP_CONFIG.name}</p>
                <p className="truncate text-[11px] uppercase tracking-[0.26em] text-muted">{navCopy.brandTagline}</p>
              </div>
            </Link>

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

          {showCompactPincodeBanner ? (
            <div className="mt-4 flex flex-col gap-3 rounded-[24px] border border-green-200 bg-green-50/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-green-700 shadow-sm">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">{navCopy.compactDeliveryTitle(selectedLocationLabel)}</p>
                  <p className="mt-1 text-sm text-green-700">{navCopy.compactDeliveryBody(pincode)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingPincode(true)}
                className="rounded-full border border-green-300 bg-white px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-100"
              >
                {navCopy.changePincode}
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-[28px] border border-orange-100 bg-[#fff7ed]/80 p-4 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1.1fr,1fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{navCopy.pincodeEyebrow}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{navCopy.pincodePrompt}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
                  <div className="flex min-h-12 items-center gap-3 rounded-[22px] border border-orange-200 bg-white px-4">
                    <MapPin size={18} className="text-primary" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={pincode}
                      onChange={(event) => {
                        setEditingPincode(true);
                        updatePincode(event.target.value);
                      }}
                      placeholder={navCopy.pincodePlaceholder}
                      className="w-full bg-transparent text-sm font-semibold text-primary-dark outline-none placeholder:text-muted"
                    />
                    {pincode ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPincode(true);
                          clearPincode();
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-orange-50 hover:text-primary-dark"
                        aria-label={navCopy.clearPincodeAria}
                      >
                        <X size={16} />
                      </button>
                    ) : null}
                  </div>

                  <div
                    className={`flex min-h-12 items-center justify-center rounded-[22px] px-4 text-sm font-semibold ${
                      checking
                        ? "bg-orange-100 text-primary-dark"
                        : hasServiceablePincode
                          ? "bg-green-100 text-green-700"
                          : checkResult && !checkResult.serviceable
                            ? "bg-red-100 text-red-700"
                            : "bg-white text-muted ring-1 ring-orange-100"
                    }`}
                  >
                    {checking
                      ? navCopy.checking
                      : hasServiceablePincode
                        ? navCopy.deliveringTo(selectedLocationLabel)
                        : checkResult && !checkResult.serviceable
                          ? navCopy.notServiceable
                          : profile?.pincode
                            ? navCopy.savedPincode(profile.pincode)
                            : navCopy.optionalBrowsing}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <nav className="fixed inset-x-4 bottom-4 z-40 rounded-[30px] border border-orange-100 bg-white/95 p-2 shadow-2xl backdrop-blur md:hidden">
        <div className="grid grid-cols-4 gap-2">
          <IconLink to="/products" label={navCopy.home} icon={<Home size={18} />} mobile />
          <IconLink to="/contact" label={navCopy.contact} icon={<Phone size={18} />} mobile />
          {session ? (
            <IconLink to="/orders" label={navCopy.orders} icon={<ReceiptIndianRupee size={18} />} mobile />
          ) : (
            <IconLink to={loginHref} label={navCopy.signIn} icon={<LogIn size={18} />} mobile />
          )}
          <ActionLink
            label={navCopy.cart}
            icon={<ShoppingCart size={18} />}
            badge={cartCount ? cartCount : null}
            onClick={openCart}
            mobile
          />
        </div>
      </nav>

      {cartCount ? (
        <div className="fixed bottom-24 left-4 z-30 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-200 md:hidden">
          {navCopy.mobileSelected(totalWeightKg)}
        </div>
      ) : null}

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
