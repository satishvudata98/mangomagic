"use client";

import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { DeliveryProvider } from "../context/DeliveryContext";
import { LocalizationProvider } from "../context/LocalizationContext";

export function Providers({ children }) {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <DeliveryProvider>
          <CartProvider>{children}</CartProvider>
        </DeliveryProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
}
