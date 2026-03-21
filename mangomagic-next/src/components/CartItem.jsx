import { Trash2 } from "lucide-react";
import QuantitySelector from "./QuantitySelector";
import { useLocalization } from "../context/LocalizationContext";
import { formatRupees } from "../lib/api";

function CartItem({ item, onRemove, onDecrease, onIncrease }) {
  const { copy } = useLocalization();
  const itemCopy = copy.components.cartItem;

  return (
    <article className="rounded-[30px] bg-white p-4 shadow-card ring-1 ring-orange-100/70 sm:p-5">
      <div className="flex gap-4">
        <img
          src={item.image_url}
          alt={item.product_name}
          loading="lazy"
          className="h-24 w-24 shrink-0 rounded-[24px] object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{itemCopy.sectionLabel}</p>
              <h3 className="truncate text-lg font-bold text-textPrimary">{item.product_name}</h3>
              {item.variety ? <p className="truncate text-sm text-muted">{item.variety}</p> : null}
              <p className="text-sm text-muted">{itemCopy.pricePerKg(formatRupees(item.unit_price))}</p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.itemId)}
              className="flex min-h-12 min-w-12 items-center justify-center rounded-full border border-red-100 text-error transition hover:bg-red-50"
              aria-label={itemCopy.removeAria(item.product_name)}
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <QuantitySelector weightKg={item.weight_kg} onDecrease={onDecrease} onIncrease={onIncrease} />
            <div className="self-start rounded-[22px] bg-orange-50 px-4 py-3 md:self-auto">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{itemCopy.itemTotal}</p>
              <p className="whitespace-nowrap text-lg font-black text-primary-dark">
                {formatRupees(item.unit_price * item.weight_kg)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CartItem;
