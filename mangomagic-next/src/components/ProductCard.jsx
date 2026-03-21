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
      className={`group overflow-hidden rounded-[32px] surface-card shadow-card ring-1 ring-orange-100/70 transition duration-300 ${
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
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#281102]/60 via-[#281102]/10 to-transparent" />

        {!product.available ? (
          <span className="absolute left-4 top-4 rounded-full bg-slate-900/85 px-4 py-2 text-sm font-semibold text-white">
            {cardCopy.outOfStock}
          </span>
        ) : null}

        <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-primary-dark shadow-lg">
          <Sparkles size={14} className="text-primary" />
          {product.taste_profile}
        </div>

        {cartWeight ? (
          <span className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-primary-dark shadow-lg">
            {cardCopy.inCart(cartWeight)}
          </span>
        ) : null}
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{product.name}</p>
              <h3 className="mt-1 font-display text-3xl font-black text-primary-dark">{product.variety}</h3>
            </div>

            <div className="rounded-[22px] bg-orange-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-dark">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} />
                <span>{product.origin.split(",")[0]}</span>
              </div>
            </div>
          </div>

          <p className="text-sm leading-6 text-muted">{product.description}</p>

          <div className="grid gap-3 rounded-3xl bg-[#fff7ed] px-4 py-4 ring-1 ring-orange-100 sm:grid-cols-[1fr,auto] sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{cardCopy.priceLabel}</p>
              <p className="mt-1 text-3xl font-black text-primary-dark">{formatRupees(pricePerKg)}</p>
              <p className="text-sm text-muted">{cardCopy.perKg}</p>
            </div>
            <div className="text-sm text-muted sm:text-right">
              <p className="font-semibold text-primary-dark">{formatRupees(product.price_5kg)}</p>
              <p>{cardCopy.referenceBox}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-orange-100 bg-gradient-to-br from-[#fff9f1] via-white to-[#fff4dd] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{cardCopy.selectWeight}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{cardCopy.selectWeightHelp}</p>
            </div>
            <div className="shrink-0 rounded-[22px] bg-white px-4 py-3 text-right shadow-sm ring-1 ring-orange-100">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{cardCopy.current}</p>
              <p className="whitespace-nowrap text-xl font-black text-primary-dark">{selectedWeight} kg</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {weightOptions.map((weight) => {
              const selected = selectedWeight === weight;

              return (
                <button
                  key={weight}
                  type="button"
                  disabled={!product.available}
                  onClick={() => setSelectedWeight(weight)}
                  className={`flex min-h-[76px] flex-col items-center justify-center rounded-[22px] px-3 py-3 text-center transition ${
                    selected
                      ? "bg-primary text-white shadow-lg shadow-orange-200"
                      : "border border-orange-200 bg-white text-primary-dark hover:-translate-y-0.5 hover:bg-orange-50"
                  } disabled:cursor-not-allowed disabled:bg-orange-100 disabled:text-orange-300`}
                >
                  <span className="text-base font-black">{weight} kg</span>
                  <span className={`mt-1 text-[11px] font-semibold ${selected ? "text-orange-100" : "text-muted"}`}>
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
            className={`mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-[22px] px-5 py-4 text-base font-bold text-white shadow-lg transition ${
              flashAdded ? "animate-soft-bounce bg-success" : "bg-primary hover:bg-primary-dark"
            } disabled:cursor-not-allowed disabled:bg-orange-100 disabled:text-orange-300 disabled:shadow-none`}
          >
            {flashAdded ? <Check size={20} /> : <Plus size={20} />}
            <span>{flashAdded ? cardCopy.addedToBox(selectedWeight) : cardCopy.addToBox(selectedWeight)}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
