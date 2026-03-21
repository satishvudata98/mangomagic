"use client";

import { ArrowRight, LogIn, MapPin, ShoppingBag, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CartItem from "./CartItem";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useDelivery } from "../context/DeliveryContext";
import { useLocalization } from "../context/LocalizationContext";
import { formatRupees } from "../lib/api";
import { getCartPerkState } from "../lib/cartPerks";

function CartDrawer() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const { copy } = useLocalization();
  const drawerCopy = copy.components.cartDrawer;
  const { pincode, hasServiceablePincode, selectedLocationLabel } = useDelivery();
  const {
    cartItems,
    removeFromCart,
    updateWeight,
    clearCart,
    cartTotal,
    totalWeightKg,
    isCartOpen,
    closeCart,
    syncedAcrossDevices
  } = useCart();
  const perkState = getCartPerkState(totalWeightKg);

  useEffect(() => {
    if (!isCartOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeCart, isCartOpen]);

  if (!isCartOpen) {
    return null;
  }

  function handleCheckout() {
    closeCart();

    if (!session) {
      router.push("/login?next=%2Fcheckout");
      return;
    }

    router.push("/checkout");
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={drawerCopy.closeAria}
        onClick={closeCart}
        className="absolute inset-0 bg-[#2f1605]/45 backdrop-blur-sm"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl animate-drawer-in flex-col bg-[#fffaf3] shadow-panel">
        <div className="border-b border-orange-100 bg-white/90 px-5 py-5 backdrop-blur sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{drawerCopy.eyebrow}</p>
              <h2 className="mt-2 font-display text-3xl font-black text-primary-dark">{drawerCopy.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{drawerCopy.subtitle}</p>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-200 bg-white text-primary-dark transition hover:bg-orange-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {cartItems.length ? (
            <div className="space-y-5">
              <div className="grid gap-3 rounded-[28px] bg-gradient-to-br from-primary to-accent p-5 text-white shadow-card">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">{drawerCopy.cartTotal}</p>
                    <p className="mt-2 text-3xl font-black">{formatRupees(cartTotal)}</p>
                    {syncedAcrossDevices ? (
                      <p className="mt-2 text-xs font-semibold text-orange-50/90">{drawerCopy.synced}</p>
                    ) : null}
                  </div>
                  <div className="rounded-[24px] bg-white/15 px-4 py-3 text-right backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-100">{drawerCopy.selected}</p>
                    <p className="text-xl font-black">{totalWeightKg} kg</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-orange-100 bg-white p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-primary">
                    <Sparkles size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-primary-dark">
                      {perkState.nextPerk
                        ? drawerCopy.perkUnlock(perkState.remainingWeightKg, perkState.nextPerk.title)
                        : drawerCopy.allPerks}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      {perkState.nextPerk?.description || drawerCopy.highestTier}
                    </p>
                    <div className="mt-4 h-2 rounded-full bg-orange-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${perkState.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-orange-100 bg-white p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-primary">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary-dark">
                      {hasServiceablePincode
                        ? drawerCopy.deliveryReady(selectedLocationLabel)
                        : pincode.length === 6
                          ? drawerCopy.pincodeUnavailable
                          : drawerCopy.useHeaderPincode}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {hasServiceablePincode
                        ? drawerCopy.currentPincode(pincode)
                        : drawerCopy.guestBrowsing}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.itemId}
                    item={item}
                    onRemove={removeFromCart}
                    onDecrease={() => {
                      if (item.weight_kg === 1) {
                        removeFromCart(item.itemId);
                        return;
                      }

                      updateWeight(item.itemId, item.weight_kg - 1);
                    }}
                    onIncrease={() => updateWeight(item.itemId, item.weight_kg + 1)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-[32px] border border-dashed border-orange-200 bg-white px-6 py-12 text-center shadow-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-primary">
                <ShoppingBag size={28} />
              </div>
              <h3 className="mt-5 font-display text-3xl font-black text-primary-dark">{drawerCopy.emptyTitle}</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted">{drawerCopy.emptyBody}</p>
            </div>
          )}
        </div>

        <div className="border-t border-orange-100 bg-white/95 px-5 py-5 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted">
                {cartItems.length ? drawerCopy.varietiesSelected(cartItems.length) : drawerCopy.noItemsYet}
              </p>
              <p className="text-2xl font-black text-primary-dark">{formatRupees(cartTotal)}</p>
            </div>
            {cartItems.length ? (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-primary-dark transition hover:bg-orange-50"
              >
                {drawerCopy.clearCart}
              </button>
            ) : null}
          </div>

          <button
            type="button"
            disabled={!cartItems.length}
            onClick={handleCheckout}
            className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-primary px-5 py-4 text-base font-bold text-white shadow-card transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-orange-200"
          >
            {!session ? <LogIn size={18} /> : <ArrowRight size={18} />}
            <span>
              {!cartItems.length
                ? drawerCopy.addMangoes
                : !session
                  ? drawerCopy.signInCheckout
                  : profile?.full_name && profile?.delivery_address && profile?.delivery_phone
                    ? drawerCopy.secureCheckout
                    : drawerCopy.addDeliveryDetails}
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
}

export default CartDrawer;
