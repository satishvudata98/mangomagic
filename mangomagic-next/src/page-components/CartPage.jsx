"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CartItem from "../components/CartItem";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLocalization } from "../context/LocalizationContext";
import { formatRupees } from "../lib/api";

function CartPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateWeight, cartTotal, totalWeightKg } = useCart();
  const { profile, saveProfile } = useAuth();
  const { copy } = useLocalization();
  const pageCopy = copy.pages.cart;
  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [formState, setFormState] = useState({
    full_name: "",
    delivery_address: "",
    pincode: ""
  });

  useEffect(() => {
    setFormState({
      full_name: profile?.full_name || "",
      delivery_address: profile?.delivery_address || "",
      pincode: profile?.pincode || ""
    });
  }, [profile]);

  const hasAddress = Boolean(profile?.full_name && profile?.delivery_address && profile?.pincode);

  async function handleSaveAddress(event) {
    event.preventDefault();
    setSavingAddress(true);

    try {
      await saveProfile({
        ...formState,
        delivery_phone: profile?.delivery_phone || ""
      });
      setEditingAddress(false);
      toast.success(pageCopy.saveSuccess);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingAddress(false);
    }
  }

  if (!cartItems.length) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-[32px] bg-white px-6 py-16 text-center shadow-card">
        <div className="text-7xl">M</div>
        <h1 className="mt-5 text-3xl font-extrabold text-primary-dark">{pageCopy.emptyTitle}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{pageCopy.emptyBody}</p>
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="mt-8 min-h-12 rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary-dark"
        >
          {pageCopy.browse}
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{pageCopy.pageEyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold text-primary-dark">{pageCopy.pageTitle}</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr,0.9fr]">
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

        <div className="space-y-5">
          <div className="rounded-[32px] bg-white p-6 shadow-card">
            <h2 className="text-xl font-bold text-primary-dark">{pageCopy.deliveryTitle}</h2>

            {hasAddress && !editingAddress ? (
              <div className="mt-4 space-y-2 rounded-3xl bg-orange-50 p-4">
                <p className="font-bold text-textPrimary">{profile.full_name}</p>
                <p className="text-sm leading-6 text-muted">{profile.delivery_address}</p>
                <p className="text-sm font-semibold text-primary-dark">
                  {pageCopy.labels.pincode}: {profile.pincode}
                </p>
                <button
                  type="button"
                  onClick={() => setEditingAddress(true)}
                  className="mt-2 min-h-12 rounded-full border border-orange-200 px-4 py-3 text-sm font-semibold text-primary-dark transition hover:bg-white"
                >
                  {pageCopy.editAddress}
                </button>
              </div>
            ) : (
              <form className="mt-4 space-y-4" onSubmit={handleSaveAddress}>
                <input
                  type="text"
                  placeholder={pageCopy.fields.fullName}
                  value={formState.full_name}
                  onChange={(event) => setFormState((current) => ({ ...current, full_name: event.target.value }))}
                  className="min-h-12 w-full rounded-2xl border border-orange-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100"
                />
                <textarea
                  rows={4}
                  placeholder={pageCopy.fields.address}
                  value={formState.delivery_address}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, delivery_address: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={pageCopy.fields.pincode}
                  value={formState.pincode}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      pincode: event.target.value.replace(/\D/g, "").slice(0, 6)
                    }))
                  }
                  className="min-h-12 w-full rounded-2xl border border-orange-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100"
                />
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="min-h-12 w-full rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary-dark disabled:bg-orange-200"
                >
                  {savingAddress ? copy.common.saving : pageCopy.saveButton}
                </button>
              </form>
            )}
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-card">
            <p className="text-sm text-muted">{pageCopy.orderTotal}</p>
            <p className="mt-2 text-4xl font-extrabold text-primary-dark">{formatRupees(cartTotal)}</p>
            <p className="mt-2 text-sm text-muted">{pageCopy.totalWeight(totalWeightKg)}</p>
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              disabled={!hasAddress}
              className="mt-6 min-h-12 w-full rounded-full bg-primary px-6 py-4 text-lg font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-orange-200"
            >
              {pageCopy.proceedToPay}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
