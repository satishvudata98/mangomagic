import { Minus, Plus } from "lucide-react";
import { useLocalization } from "../context/LocalizationContext";

function QuantitySelector({ weightKg, onDecrease, onIncrease }) {
  const { copy } = useLocalization();
  const selectorCopy = copy.components.quantitySelector;
  const buttonClass =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-white text-primary-dark transition hover:border-primary hover:bg-orange-50";

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[26px] border border-orange-100 bg-[#fffaf3] p-2">
      <button type="button" className={buttonClass} onClick={onDecrease} aria-label={selectorCopy.decreaseAria}>
        <Minus size={18} />
      </button>
      <div className="min-w-[92px] flex-1 rounded-[20px] bg-white px-4 py-2 text-center shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{selectorCopy.selectedLabel}</p>
        <p className="whitespace-nowrap text-base font-black text-primary-dark">{weightKg} kg</p>
      </div>
      <button type="button" className={buttonClass} onClick={onIncrease} aria-label={selectorCopy.increaseAria}>
        <Plus size={18} />
      </button>
    </div>
  );
}

export default QuantitySelector;
