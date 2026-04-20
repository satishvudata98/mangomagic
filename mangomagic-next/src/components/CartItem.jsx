import { Trash2 } from "lucide-react";
import QuantitySelector from "./QuantitySelector";
import { useLocalization } from "../context/LocalizationContext";
import { formatRupees } from "../lib/api";

function CartItem({ item, onRemove, onDecrease, onIncrease }) {
  const { copy } = useLocalization();
  const itemCopy = copy.components.cartItem;

  return (
    <article className="rounded-2xl bg-white p-3 shadow-card ring-1 ring-orange-100/70 sm:rounded-[30px] sm:p-5">
      <div className="flex gap-3 sm:gap-4">
        <img
          src={item.image_url}
          alt={item.product_name}
          loading="lazy"
          className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24 sm:rounded-[24px]"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-4">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">{itemCopy.sectionLabel}</p>
              <h3 className="truncate text-sm font-bold text-textPrimary sm:text-lg">{item.product_name}</h3>
              {item.variety ? <p className="truncate text-xs text-muted sm:text-sm">{item.variety}</p> : null}
              <p className="text-xs text-muted sm:text-sm">{itemCopy.pricePerKg(formatRupees(item.unit_price))}</p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.itemId)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-red-100 text-error transition hover:bg-red-50 sm:min-h-12 sm:min-w-12"
              aria-label={itemCopy.removeAria(item.product_name)}
            >
              <Trash2 size={14} className="sm:hidden" />
              <Trash2 size={18} className="hidden sm:block" />
            </button>
          </div>
          <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
            <QuantitySelector weightKg={item.weight_kg} onDecrease={onDecrease} onIncrease={onIncrease} />
            <div className="self-start rounded-xl bg-orange-50 px-3 py-2 sm:rounded-[22px] sm:px-4 sm:py-3 md:self-auto">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">{itemCopy.itemTotal}</p>
              <p className="whitespace-nowrap text-sm font-black text-primary-dark sm:text-lg">
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
