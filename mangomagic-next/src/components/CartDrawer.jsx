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
        {/* Header — compact on mobile */}
        <div className="border-b border-orange-100 bg-white/90 px-4 py-3.5 backdrop-blur sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary sm:text-sm">{drawerCopy.eyebrow}</p>
              <h2 className="mt-1 font-display text-xl font-black text-primary-dark sm:mt-2 sm:text-3xl">{drawerCopy.title}</h2>
              <p className="mt-1 hidden text-sm leading-6 text-muted sm:block">{drawerCopy.subtitle}</p>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-primary-dark transition hover:bg-orange-50 sm:h-12 sm:w-12"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {cartItems.length ? (
            <div className="space-y-3 sm:space-y-5">
              {/* Total summary card — compact */}
              <div className="grid gap-2 rounded-2xl bg-gradient-to-br from-primary to-accent p-3.5 text-white shadow-card sm:gap-3 sm:rounded-[28px] sm:p-5">
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-100 sm:text-sm">{drawerCopy.cartTotal}</p>
                    <p className="mt-1 text-2xl font-black sm:mt-2 sm:text-3xl">{formatRupees(cartTotal)}</p>
                    {syncedAcrossDevices ? (
                      <p className="mt-1 text-[10px] font-semibold text-orange-50/90 sm:mt-2 sm:text-xs">{drawerCopy.synced}</p>
                    ) : null}
                  </div>
                  <div className="rounded-xl bg-white/15 px-3 py-2 text-right backdrop-blur sm:rounded-[24px] sm:px-4 sm:py-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-orange-100 sm:text-xs">{drawerCopy.selected}</p>
                    <p className="text-lg font-black sm:text-xl">{totalWeightKg} kg</p>
                  </div>
                </div>
              </div>

              {/* Perk progress — compact */}
              <div className="rounded-2xl border border-orange-100 bg-white p-3 shadow-card sm:rounded-[28px] sm:p-4">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-primary sm:mt-1 sm:h-11 sm:w-11">
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-primary-dark sm:text-sm">
                      {perkState.nextPerk
                        ? drawerCopy.perkUnlock(perkState.remainingWeightKg, perkState.nextPerk.title)
                        : drawerCopy.allPerks}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-muted sm:mt-1 sm:text-sm sm:leading-6">
                      {perkState.nextPerk?.description || drawerCopy.highestTier}
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-orange-100 sm:mt-4 sm:h-2">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 sm:h-2"
                        style={{ width: `${perkState.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery info — compact */}
              <div className="rounded-2xl border border-orange-100 bg-white p-3 shadow-card sm:rounded-[28px] sm:p-4">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-primary sm:mt-1 sm:h-11 sm:w-11">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary-dark sm:text-sm">
                      {hasServiceablePincode
                        ? drawerCopy.deliveryReady(selectedLocationLabel)
                        : pincode.length === 6
                          ? drawerCopy.pincodeUnavailable
                          : drawerCopy.useHeaderPincode}
                    </p>
                    <p className="mt-0.5 text-xs text-muted sm:mt-1 sm:text-sm">
                      {hasServiceablePincode
                        ? drawerCopy.currentPincode(pincode)
                        : drawerCopy.guestBrowsing}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cart items */}
              <div className="space-y-3 sm:space-y-4">
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
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-white px-4 py-8 text-center shadow-card sm:rounded-[32px] sm:px-6 sm:py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-primary sm:h-16 sm:w-16">
                <ShoppingBag size={24} />
              </div>
              <h3 className="mt-4 font-display text-xl font-black text-primary-dark sm:mt-5 sm:text-3xl">{drawerCopy.emptyTitle}</h3>
              <p className="mt-2 max-w-sm text-xs leading-5 text-muted sm:mt-3 sm:text-sm sm:leading-6">{drawerCopy.emptyBody}</p>
            </div>
          )}
        </div>

        {/* Footer — compact on mobile */}
        <div className="border-t border-orange-100 bg-white/95 px-4 py-3.5 backdrop-blur sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-xs text-muted sm:text-sm">
                {cartItems.length ? drawerCopy.varietiesSelected(cartItems.length) : drawerCopy.noItemsYet}
              </p>
              <p className="text-xl font-black text-primary-dark sm:text-2xl">{formatRupees(cartTotal)}</p>
            </div>
            {cartItems.length ? (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-full border border-orange-200 px-3 py-1.5 text-xs font-semibold text-primary-dark transition hover:bg-orange-50 sm:px-4 sm:py-2 sm:text-sm"
              >
                {drawerCopy.clearCart}
              </button>
            ) : null}
          </div>

          <button
            type="button"
            disabled={!cartItems.length}
            onClick={handleCheckout}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-card transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-orange-200 sm:mt-4 sm:min-h-14 sm:rounded-[22px] sm:px-5 sm:py-4 sm:text-base"
          >
            {!session ? <LogIn size={16} /> : <ArrowRight size={16} />}
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
