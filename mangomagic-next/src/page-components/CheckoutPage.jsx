"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useDelivery } from "../context/DeliveryContext";
import { useLocalization } from "../context/LocalizationContext";
import { formatRupees } from "../lib/api";
import { getCartPerkState } from "../lib/cartPerks";
import { normalizeIndianMobileNumber, sanitizeDeliveryPhoneInput } from "../lib/profile";

function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart, totalWeightKg } = useCart();
  const { profile, user, saveProfile, authorizedRequest } = useAuth();
  const { copy } = useLocalization();
  const pageCopy = copy.pages.checkout;
  const { pincode, updatePincode, checkResult, checking, hasServiceablePincode, selectedLocationLabel } =
    useDelivery();
  const [paying, setPaying] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [editingAddress, setEditingAddress] = useState(
    !Boolean(profile?.full_name && profile?.delivery_address && profile?.pincode && profile?.delivery_phone)
  );
  const [formState, setFormState] = useState({
    full_name: profile?.full_name || user?.name || "",
    delivery_address: profile?.delivery_address || "",
    delivery_phone: profile?.delivery_phone || user?.phone || "",
    pincode: profile?.pincode || pincode || ""
  });
  const perkState = getCartPerkState(totalWeightKg);

  useEffect(() => {
    if (!cartItems.length) {
      router.replace("/products");
    }
  }, [cartItems.length, router]);

  useEffect(() => {
    setFormState((current) => ({
      full_name: profile?.full_name || current.full_name || user?.name || "",
      delivery_address: profile?.delivery_address || current.delivery_address || "",
      delivery_phone: profile?.delivery_phone || current.delivery_phone || user?.phone || "",
      pincode: profile?.pincode || current.pincode || ""
    }));
    setEditingAddress(
      !Boolean(profile?.full_name && profile?.delivery_address && profile?.pincode && profile?.delivery_phone)
    );
  }, [profile?.delivery_address, profile?.delivery_phone, profile?.full_name, profile?.pincode, user?.name, user?.phone]);

  useEffect(() => {
    if (profile?.pincode || !pincode) {
      return;
    }

    setFormState((current) => ({
      ...current,
      pincode: current.pincode || pincode
    }));
  }, [formState.pincode, pincode, profile?.pincode]);

  if (!cartItems.length) {
    return null;
  }

  const hasSavedDeliveryDetails = Boolean(
    profile?.full_name && profile?.delivery_address && profile?.pincode && profile?.delivery_phone
  );

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleSaveDeliveryDetails(event) {
    event.preventDefault();

    if (!formState.full_name.trim()) {
      toast.error(pageCopy.validation.fullName);
      return;
    }

    if (!formState.delivery_address.trim()) {
      toast.error(pageCopy.validation.address);
      return;
    }

    const normalizedDeliveryPhone = normalizeIndianMobileNumber(formState.delivery_phone);

    if (!normalizedDeliveryPhone) {
      toast.error(pageCopy.validation.phone);
      return;
    }

    if (!/^\d{6}$/.test(formState.pincode)) {
      toast.error(pageCopy.validation.pincode);
      return;
    }

    if (!hasServiceablePincode) {
      toast.error(pageCopy.validation.serviceablePincode);
      return;
    }

    setSavingDetails(true);

    try {
      await saveProfile({
        full_name: formState.full_name.trim(),
        delivery_address: formState.delivery_address.trim(),
        delivery_phone: normalizedDeliveryPhone,
        pincode: formState.pincode
      });
      setEditingAddress(false);
      toast.success(pageCopy.saveSuccess);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingDetails(false);
    }
  }

  async function handlePayment() {
    if (!hasSavedDeliveryDetails) {
      toast.error(pageCopy.validation.saveBeforePayment);
      return;
    }

    setPaying(true);

    try {
      const orderResponse = await authorizedRequest("/api/payment/create-order", {
        method: "POST",
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            product_id: item.product_id,
            weight_kg: item.weight_kg
          }))
        })
      });
      const orderPayload = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderPayload.error || pageCopy.createOrderError);
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(pageCopy.razorpayLoadError);
      }

      const razorpay = new window.Razorpay({
        key: orderPayload.key_id,
        amount: orderPayload.amount,
        currency: "INR",
        name: "MangoMagic",
        description: pageCopy.razorpayDescription,
        order_id: orderPayload.razorpay_order_id,
        prefill: {
          name: profile?.full_name || user?.name || "",
          email: user?.email || profile?.email || "",
          contact: profile?.delivery_phone || user?.phone || profile?.phone || ""
        },
        theme: {
          color: "#F5811A"
        },
        modal: {
          ondismiss: () => {
            toast.error(pageCopy.paymentCancelled);
            setPaying(false);
          }
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await authorizedRequest("/api/payment/verify", {
              method: "POST",
              body: JSON.stringify({
                ...paymentResponse,
                delivery_address: profile?.delivery_address || "",
                delivery_phone: profile?.delivery_phone || "",
                pincode: profile?.pincode || "",
                items: cartItems.map((item) => ({
                  product_id: item.product_id,
                  weight_kg: item.weight_kg
                }))
              })
            });
            const verifyPayload = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyPayload.error || pageCopy.verifyError);
            }

            clearCart();
            toast.success(pageCopy.paymentVerified);
            router.replace(`/order-confirm/${verifyPayload.order_id}`);
          } catch (error) {
            toast.error(error.message);
          } finally {
            setPaying(false);
          }
        }
      });

      razorpay.on("payment.failed", () => {
        toast.error(pageCopy.paymentFailed);
        setPaying(false);
      });

      razorpay.open();
    } catch (error) {
      toast.error(error.message);
      setPaying(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{pageCopy.pageEyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-black text-primary-dark">{pageCopy.pageTitle}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{pageCopy.pageSubtitle}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr,0.9fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-card">
          <h2 className="text-xl font-bold text-primary-dark">{pageCopy.summaryTitle}</h2>

          <div className="mt-5 rounded-[28px] border border-orange-100 bg-[#fff8ef] p-4">
            <p className="text-sm font-bold text-primary-dark">
              {perkState.nextPerk
                ? pageCopy.perkUnlock(perkState.remainingWeightKg, perkState.nextPerk.title)
                : pageCopy.perkUnlocked}
            </p>
            <p className="mt-1 text-sm text-muted">
              {perkState.nextPerk?.description || pageCopy.perkDescriptionFallback}
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {cartItems.map((item) => (
              <div key={item.itemId} className="flex items-center justify-between gap-4 rounded-2xl bg-orange-50 p-4">
                <div>
                  <p className="font-bold text-textPrimary">{item.product_name}</p>
                  <p className="text-sm text-muted">{item.weight_kg} kg</p>
                </div>
                <p className="font-bold text-primary-dark">{formatRupees(item.unit_price * item.weight_kg)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-primary-dark">{pageCopy.deliveryTitle}</h2>
            {hasSavedDeliveryDetails ? (
              <button
                type="button"
                onClick={() => setEditingAddress(true)}
                className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-primary-dark transition hover:bg-orange-50"
              >
                {pageCopy.edit}
              </button>
            ) : null}
          </div>

          {hasSavedDeliveryDetails && !editingAddress ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-3xl bg-orange-50 p-4">
                <p className="font-bold text-textPrimary">{profile?.full_name}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{profile?.delivery_address}</p>
                <p className="mt-2 text-sm font-semibold text-primary-dark">
                  {pageCopy.labels.mobile}: {profile?.delivery_phone}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary-dark">
                  {pageCopy.labels.pincode}: {profile?.pincode}
                </p>
              </div>

              <div
                className={`rounded-3xl p-4 ${
                  hasServiceablePincode ? "bg-green-50 text-green-700" : "bg-orange-50 text-primary-dark"
                }`}
              >
                <p className="font-bold">
                  {hasServiceablePincode
                    ? pageCopy.deliveryConfirmed(selectedLocationLabel)
                    : profile?.pincode
                      ? pageCopy.savedPincode(profile.pincode)
                      : pageCopy.updatePincodeHint}
                </p>
              </div>
            </div>
          ) : (
            <form className="mt-4 space-y-4" onSubmit={handleSaveDeliveryDetails}>
              <input
                type="text"
                placeholder={pageCopy.fields.fullName}
                value={formState.full_name}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    full_name: event.target.value
                  }))
                }
                className="min-h-12 w-full rounded-2xl border border-orange-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100"
              />
              <textarea
                rows={4}
                placeholder={pageCopy.fields.address}
                value={formState.delivery_address}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    delivery_address: event.target.value
                  }))
                }
                className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100"
              />
              <input
                type="tel"
                inputMode="tel"
                placeholder={pageCopy.fields.phone}
                value={formState.delivery_phone}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    delivery_phone: sanitizeDeliveryPhoneInput(event.target.value)
                  }))
                }
                className="min-h-12 w-full rounded-2xl border border-orange-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder={pageCopy.fields.pincode}
                value={formState.pincode}
                onChange={(event) => {
                  const nextPincode = event.target.value.replace(/\D/g, "").slice(0, 6);
                  setFormState((current) => ({
                    ...current,
                    pincode: nextPincode
                  }));
                  updatePincode(nextPincode);
                }}
                className="min-h-12 w-full rounded-2xl border border-orange-200 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100"
              />

              <div
                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                  checking
                    ? "bg-orange-100 text-primary-dark"
                    : hasServiceablePincode
                      ? "bg-green-100 text-green-700"
                      : checkResult && !checkResult.serviceable
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-50 text-muted"
                }`}
              >
                {checking
                  ? pageCopy.pincodeChecking
                  : hasServiceablePincode
                    ? pageCopy.pincodeDelivering(selectedLocationLabel)
                    : checkResult && !checkResult.serviceable
                      ? pageCopy.pincodeUnavailable
                      : pageCopy.pincodePending}
              </div>

              <button
                type="submit"
                disabled={savingDetails}
                className="min-h-12 w-full rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary-dark disabled:bg-orange-200"
              >
                {savingDetails ? copy.common.saving : pageCopy.saveButton}
              </button>
            </form>
          )}

          <div className="mt-6 rounded-3xl border border-orange-100 bg-background p-4">
            <p className="text-sm text-muted">{pageCopy.totalPayable}</p>
            <p className="mt-2 text-4xl font-extrabold text-primary-dark">{formatRupees(cartTotal)}</p>
            <p className="mt-2 text-sm text-muted">{pageCopy.totalWeight(totalWeightKg)}</p>
          </div>

          <button
            type="button"
            onClick={handlePayment}
            disabled={paying || !hasSavedDeliveryDetails}
            className="mt-6 min-h-12 w-full rounded-full bg-primary px-6 py-4 text-lg font-bold text-white transition hover:bg-primary-dark disabled:bg-orange-200"
          >
            {paying
              ? pageCopy.preparingPayment(formatRupees(cartTotal))
              : hasSavedDeliveryDetails
                ? pageCopy.pay(formatRupees(cartTotal))
                : pageCopy.saveToContinue}
          </button>
        </div>
      </div>
    </section>
  );
}

export default CheckoutPage;
