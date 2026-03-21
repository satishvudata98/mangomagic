import { createContext, useContext, useMemo, useState } from "react";
import { en } from "../localization/en";

const LocalizationContext = createContext(null);

const LOCALES = {
  en
};

export function LocalizationProvider({ children, defaultLocale = "en" }) {
  const [locale] = useState(defaultLocale);
  const copy = LOCALES[locale] || LOCALES.en;

  const value = useMemo(
    () => ({
      locale,
      copy,
      locales: Object.keys(LOCALES)
    }),
    [copy, locale]
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const value = useContext(LocalizationContext);

  if (!value) {
    throw new Error("useLocalization must be used inside LocalizationProvider.");
  }

  return value;
}
