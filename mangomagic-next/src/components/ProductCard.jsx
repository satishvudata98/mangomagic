import { Check, MapPin, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocalization } from "../context/LocalizationContext";
import { formatRupees } from "../lib/api";

const weightOptions = [1, 3, 5, 8];

function ProductCard({ product, cartItem, onAddToCart }) {
  const { copy } = useLocalization();
  const cardCopy = copy.components.productCard;
  const [selectedWeight, setSelectedWeight] = useState(3);
  const [flashAdded, setFlashAdded] = useState(false);
  const pricePerKg = Math.round(Number(product.price_5kg || 0) / 5);
  const cartWeight = cartItem?.weight_kg || 0;

  function handleAdd() {
    onAddToCart(product, selectedWeight);
    setFlashAdded(true);
    window.setTimeout(() => {
      setFlashAdded(false);
    }, 700);
  }

  return (
    <article
      className={`group overflow-hidden rounded-3xl surface-card shadow-card ring-1 ring-orange-100/70 transition duration-300 sm:rounded-[32px] ${
        product.available ? "hover:-translate-y-1.5 hover:shadow-panel" : "opacity-70"
      }`}
    >
      <div className="relative">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#281102]/60 via-[#281102]/10 to-transparent sm:h-28" />

        {!product.available ? (
          <span className="absolute left-3 top-3 rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-semibold text-white sm:left-4 sm:top-4 sm:px-4 sm:py-2 sm:text-sm">
            {cardCopy.outOfStock}
          </span>
        ) : null}

        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-primary-dark shadow-lg sm:bottom-4 sm:left-4 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs">
          <Sparkles size={12} className="text-primary sm:hidden" />
          <Sparkles size={14} className="hidden text-primary sm:block" />
          {product.taste_profile}
        </div>

        {cartWeight ? (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-primary-dark shadow-lg sm:right-4 sm:top-4 sm:px-4 sm:py-2 sm:text-sm">
            {cardCopy.inCart(cartWeight)}
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-3.5 sm:space-y-5 sm:p-5">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary sm:text-xs">{product.name}</p>
              <h3 className="mt-0.5 font-display text-xl font-black text-primary-dark sm:mt-1 sm:text-3xl">{product.variety}</h3>
            </div>

            <div className="rounded-xl bg-orange-50 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-dark sm:rounded-[22px] sm:px-3 sm:py-2 sm:text-xs">
              <div className="flex items-center gap-1">
                <MapPin size={11} className="sm:hidden" />
                <MapPin size={13} className="hidden sm:block" />
                <span>{product.origin.split(",")[0]}</span>
              </div>
            </div>
          </div>

          <p className="text-xs leading-5 text-muted sm:text-sm sm:leading-6">{product.description}</p>

          <div className="grid gap-2 rounded-2xl bg-[#fff7ed] px-3 py-3 ring-1 ring-orange-100 sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-4 sm:grid-cols-[1fr,auto] sm:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-xs">{cardCopy.priceLabel}</p>
              <p className="mt-0.5 text-2xl font-black text-primary-dark sm:mt-1 sm:text-3xl">{formatRupees(pricePerKg)}</p>
              <p className="text-xs text-muted sm:text-sm">{cardCopy.perKg}</p>
            </div>
            <div className="text-xs text-muted sm:text-sm sm:text-right">
              <p className="font-semibold text-primary-dark">{formatRupees(product.price_5kg)}</p>
              <p>{cardCopy.referenceBox}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-[#fff9f1] via-white to-[#fff4dd] p-3 sm:rounded-[28px] sm:p-4">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-xs">{cardCopy.selectWeight}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted sm:mt-1 sm:text-sm sm:leading-6">{cardCopy.selectWeightHelp}</p>
            </div>
            <div className="shrink-0 rounded-xl bg-white px-2.5 py-1.5 text-right shadow-sm ring-1 ring-orange-100 sm:rounded-[22px] sm:px-4 sm:py-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">{cardCopy.current}</p>
              <p className="whitespace-nowrap text-base font-black text-primary-dark sm:text-xl">{selectedWeight} kg</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5 sm:mt-4 sm:gap-2">
            {weightOptions.map((weight) => {
              const selected = selectedWeight === weight;

              return (
                <button
                  key={weight}
                  type="button"
                  disabled={!product.available}
                  onClick={() => setSelectedWeight(weight)}
                  className={`flex h-14 flex-col items-center justify-center rounded-xl px-2 py-2 text-center transition sm:min-h-[76px] sm:rounded-[22px] sm:px-3 sm:py-3 ${
                    selected
                      ? "bg-primary text-white shadow-lg shadow-orange-200"
                      : "border border-orange-200 bg-white text-primary-dark hover:-translate-y-0.5 hover:bg-orange-50"
                  } disabled:cursor-not-allowed disabled:bg-orange-100 disabled:text-orange-300`}
                >
                  <span className="text-sm font-black sm:text-base">{weight} kg</span>
                  <span className={`mt-0.5 text-[10px] font-semibold sm:mt-1 sm:text-[11px] ${selected ? "text-orange-100" : "text-muted"}`}>
                    {formatRupees(pricePerKg * weight)}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!product.available}
            onClick={handleAdd}
            aria-label={cardCopy.addAria({ weight: selectedWeight, name: product.name })}
            className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-lg transition sm:mt-4 sm:min-h-14 sm:rounded-[22px] sm:px-5 sm:py-4 sm:text-base ${
              flashAdded ? "animate-soft-bounce bg-success" : "bg-primary hover:bg-primary-dark"
            } disabled:cursor-not-allowed disabled:bg-orange-100 disabled:text-orange-300 disabled:shadow-none`}
          >
            {flashAdded ? <Check size={18} /> : <Plus size={18} />}
            <span>{flashAdded ? cardCopy.addedToBox(selectedWeight) : cardCopy.addToBox(selectedWeight)}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
