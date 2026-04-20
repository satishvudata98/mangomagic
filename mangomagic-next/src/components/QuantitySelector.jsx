import { Minus, Plus } from "lucide-react";
import { useLocalization } from "../context/LocalizationContext";

function QuantitySelector({ weightKg, onDecrease, onIncrease }) {
  const { copy } = useLocalization();
  const selectorCopy = copy.components.quantitySelector;
  const buttonClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-white text-primary-dark transition hover:border-primary hover:bg-orange-50 sm:h-11 sm:w-11 sm:rounded-2xl";

  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-2xl border border-orange-100 bg-[#fffaf3] p-1.5 sm:gap-2 sm:rounded-[26px] sm:p-2">
      <button type="button" className={buttonClass} onClick={onDecrease} aria-label={selectorCopy.decreaseAria}>
        <Minus size={16} />
      </button>
      <div className="min-w-[72px] flex-1 rounded-xl bg-white px-3 py-1.5 text-center shadow-sm sm:min-w-[92px] sm:rounded-[20px] sm:px-4 sm:py-2">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">{selectorCopy.selectedLabel}</p>
        <p className="whitespace-nowrap text-sm font-black text-primary-dark sm:text-base">{weightKg} kg</p>
      </div>
      <button type="button" className={buttonClass} onClick={onIncrease} aria-label={selectorCopy.increaseAria}>
        <Plus size={16} />
      </button>
    </div>
  );
}

export default QuantitySelector;
