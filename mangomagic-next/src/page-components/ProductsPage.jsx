"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useDelivery } from "../context/DeliveryContext";
import { useLocalization } from "../context/LocalizationContext";
import { buildApiUrl, formatRupees } from "../lib/api";
import { getCartPerkState } from "../lib/cartPerks";

function ProductsPage({ initialProducts = null }) {
  const { copy } = useLocalization();
  const pageCopy = copy.pages.products;
  const { cartItems, addToCart, cartTotal, totalWeightKg, openCart } = useCart();
  const { hasServiceablePincode, pincode, selectedLocationLabel } = useDelivery();
  const hasInitialProducts = Array.isArray(initialProducts);
  const [products, setProducts] = useState(() => (hasInitialProducts ? initialProducts : []));
  const [loading, setLoading] = useState(() => !hasInitialProducts);
  const perkState = getCartPerkState(totalWeightKg);

  useEffect(() => {
    if (hasInitialProducts) {
      return;
    }

    async function loadProducts() {
      try {
        const response = await fetch(buildApiUrl("/api/products"));
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || pageCopy.loadError);
        }

        setProducts(payload.products || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [hasInitialProducts, pageCopy.loadError]);

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <div className="overflow-hidden rounded-[36px] bg-gradient-to-br from-[#9d3f0f] via-primary to-accent px-6 py-8 text-white shadow-2xl shadow-orange-200 md:px-8 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.25fr,0.75fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full bg-white/14 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-orange-50 ring-1 ring-white/15">
              {pageCopy.hero.eyebrow}
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-black leading-tight md:text-5xl">
              {pageCopy.hero.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-orange-50/95 md:text-base">
              {pageCopy.hero.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/14 px-4 py-2 text-sm font-semibold text-orange-50 ring-1 ring-white/15">
                {pageCopy.hero.tagFarmToDoor}
              </span>
              <span className="rounded-full bg-white/14 px-4 py-2 text-sm font-semibold text-orange-50 ring-1 ring-white/15">
                {pageCopy.hero.tagVarieties(products.length)}
              </span>
              <span className="rounded-full bg-white/14 px-4 py-2 text-sm font-semibold text-orange-50 ring-1 ring-white/15">
                {pageCopy.hero.tagOrganic}
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] bg-white/14 p-5 backdrop-blur">
              <p className="text-sm text-orange-100">{pageCopy.hero.cartTotal}</p>
              <p className="mt-2 text-3xl font-extrabold">{formatRupees(cartTotal)}</p>
              <p className="mt-2 text-sm text-orange-50">{pageCopy.hero.cartSummary(totalWeightKg, cartItems.length)}</p>
            </div>

            <div className="rounded-[28px] bg-white/14 p-5 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {perkState.nextPerk
                      ? pageCopy.hero.perkUnlock(perkState.remainingWeightKg, perkState.nextPerk.title)
                      : pageCopy.hero.perkUnlocked}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-orange-50/90">
                    {perkState.nextPerk?.description || pageCopy.hero.perkDescriptionFallback}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[30px] bg-white p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-primary">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="font-bold text-primary-dark">{pageCopy.highlights.qualityTitle}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{pageCopy.highlights.qualityBody}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-primary">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="font-bold text-primary-dark">{pageCopy.highlights.unboxingTitle}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{pageCopy.highlights.unboxingBody}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-primary">
              <ArrowRight size={18} />
            </div>
            <div>
              <p className="font-bold text-primary-dark">{pageCopy.highlights.deliveryTitle}</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {hasServiceablePincode
                  ? pageCopy.highlights.deliveryReady(selectedLocationLabel, pincode)
                  : pageCopy.highlights.deliveryPending}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner label={pageCopy.loading} />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cartItem={cartItems.find((item) => item.product_id === product.id) || null}
              onAddToCart={(selectedProduct, weight) => {
                addToCart(selectedProduct, weight);
                toast.success(pageCopy.addedToast(weight, selectedProduct.name));
              }}
            />
          ))}
        </div>
      )}

      {cartItems.length ? (
        <div className="sticky bottom-28 rounded-[28px] bg-white p-5 shadow-2xl shadow-orange-100 md:bottom-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-primary">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="font-bold text-primary-dark">{pageCopy.stickySelected(totalWeightKg)}</p>
                <p className="text-sm text-muted">
                  {perkState.nextPerk
                    ? pageCopy.stickyUnlock(perkState.remainingWeightKg, perkState.nextPerk.title)
                    : pageCopy.stickyUnlocked}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openCart}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-dark"
            >
              <span>{pageCopy.reviewCart}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProductsPage;
