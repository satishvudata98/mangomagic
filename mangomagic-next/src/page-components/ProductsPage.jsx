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
    <section className="mx-auto max-w-6xl space-y-4 sm:space-y-8">
      {/* Hero — compact on mobile */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#9d3f0f] via-primary to-accent px-4 py-5 text-white shadow-2xl shadow-orange-200 sm:rounded-[36px] sm:px-6 sm:py-8 md:px-8 md:py-10">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.25fr,0.75fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full bg-white/14 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-orange-50 ring-1 ring-white/15 sm:px-4 sm:py-2 sm:text-sm">
              {pageCopy.hero.eyebrow}
            </div>
            <h1 className="mt-3 max-w-3xl font-display text-2xl font-black leading-tight sm:mt-5 sm:text-4xl md:text-5xl">
              {pageCopy.hero.title}
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-orange-50/95 sm:mt-4 sm:text-sm sm:leading-7 md:text-base">
              {pageCopy.hero.subtitle}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
              <span className="rounded-full bg-white/14 px-3 py-1.5 text-[10px] font-semibold text-orange-50 ring-1 ring-white/15 sm:px-4 sm:py-2 sm:text-sm">
                {pageCopy.hero.tagFarmToDoor}
              </span>
              <span className="rounded-full bg-white/14 px-3 py-1.5 text-[10px] font-semibold text-orange-50 ring-1 ring-white/15 sm:px-4 sm:py-2 sm:text-sm">
                {pageCopy.hero.tagVarieties(products.length)}
              </span>
              <span className="rounded-full bg-white/14 px-3 py-1.5 text-[10px] font-semibold text-orange-50 ring-1 ring-white/15 sm:px-4 sm:py-2 sm:text-sm">
                {pageCopy.hero.tagOrganic}
              </span>
            </div>
          </div>

          {/* Cart/perk summary — stacked on small, side-by-side on large */}
          <div className="grid gap-2 sm:gap-4">
            <div className="rounded-xl bg-white/14 p-3.5 backdrop-blur sm:rounded-[28px] sm:p-5">
              <p className="text-xs text-orange-100 sm:text-sm">{pageCopy.hero.cartTotal}</p>
              <p className="mt-1 text-2xl font-extrabold sm:mt-2 sm:text-3xl">{formatRupees(cartTotal)}</p>
              <p className="mt-1 text-xs text-orange-50 sm:mt-2 sm:text-sm">{pageCopy.hero.cartSummary(totalWeightKg, cartItems.length)}</p>
            </div>

            <div className="rounded-xl bg-white/14 p-3.5 backdrop-blur sm:rounded-[28px] sm:p-5">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white sm:mt-1 sm:h-11 sm:w-11">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white sm:text-sm">
                    {perkState.nextPerk
                      ? pageCopy.hero.perkUnlock(perkState.remainingWeightKg, perkState.nextPerk.title)
                      : pageCopy.hero.perkUnlocked}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-orange-50/90 sm:mt-1 sm:text-sm sm:leading-6">
                    {perkState.nextPerk?.description || pageCopy.hero.perkDescriptionFallback}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights row — horizontal scroll on mobile, grid on large */}
      <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:gap-4">
        <div className="min-w-[260px] flex-shrink-0 rounded-2xl bg-white p-4 shadow-card sm:min-w-0 sm:rounded-[30px] sm:p-5">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-primary sm:h-11 sm:w-11">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-primary-dark">{pageCopy.highlights.qualityTitle}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted sm:mt-1 sm:text-sm sm:leading-6">{pageCopy.highlights.qualityBody}</p>
            </div>
          </div>
        </div>

        <div className="min-w-[260px] flex-shrink-0 rounded-2xl bg-white p-4 shadow-card sm:min-w-0 sm:rounded-[30px] sm:p-5">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-primary sm:h-11 sm:w-11">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-primary-dark">{pageCopy.highlights.unboxingTitle}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted sm:mt-1 sm:text-sm sm:leading-6">{pageCopy.highlights.unboxingBody}</p>
            </div>
          </div>
        </div>

        <div className="min-w-[260px] flex-shrink-0 rounded-2xl bg-white p-4 shadow-card sm:min-w-0 sm:rounded-[30px] sm:p-5">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-primary sm:h-11 sm:w-11">
              <ArrowRight size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-primary-dark">{pageCopy.highlights.deliveryTitle}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted sm:mt-1 sm:text-sm sm:leading-6">
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
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
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

      {/* Sticky cart bar — compact on mobile */}
      {cartItems.length ? (
        <div className="sticky bottom-16 rounded-2xl bg-white p-3.5 shadow-2xl shadow-orange-100 sm:bottom-28 sm:rounded-[28px] sm:p-5 md:bottom-6">
          <div className="flex items-center justify-between gap-3 sm:flex-row sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-primary sm:h-12 sm:w-12">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-primary-dark">{pageCopy.stickySelected(totalWeightKg)}</p>
                <p className="hidden text-sm text-muted sm:block">
                  {perkState.nextPerk
                    ? pageCopy.stickyUnlock(perkState.remainingWeightKg, perkState.nextPerk.title)
                    : pageCopy.stickyUnlocked}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openCart}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-dark sm:min-h-12 sm:px-6 sm:py-3"
            >
              <span>{pageCopy.reviewCart}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProductsPage;
