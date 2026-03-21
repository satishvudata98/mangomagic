import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const MAX_WEIGHT_KG = 25;
const MIN_WEIGHT_KG = 1;
const STORAGE_KEY = "mangomagic.cart.v1";
const REMOTE_SYNC_DEBOUNCE_MS = 700;

function clampWeight(weightKg) {
  return Math.max(MIN_WEIGHT_KG, Math.min(MAX_WEIGHT_KG, Math.round(Number(weightKg) || MIN_WEIGHT_KG)));
}

function getPricePerKg(product) {
  return Math.round(Number(product.price_5kg || 0) / 5);
}

function readStoredCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function serializeCartForSync(cartItems) {
  return JSON.stringify(
    cartItems
      .map((item) => ({
        product_id: item.product_id,
        weight_kg: clampWeight(item.weight_kg)
      }))
      .sort((firstItem, secondItem) => firstItem.product_id.localeCompare(secondItem.product_id))
  );
}

function mergeCartItems(localItems, remoteItems) {
  const mergedItems = new Map();

  function upsertItem(item) {
    if (!item || typeof item.product_id !== "string" || !item.product_id) {
      return;
    }

    const itemId = item.product_id;
    const existingItem = mergedItems.get(itemId);

    if (existingItem) {
      mergedItems.set(itemId, {
        ...existingItem,
        ...item,
        itemId,
        product_id: itemId,
        weight_kg: clampWeight(Math.max(existingItem.weight_kg, item.weight_kg))
      });
      return;
    }

    mergedItems.set(itemId, {
      ...item,
      itemId,
      product_id: itemId,
      weight_kg: clampWeight(item.weight_kg)
    });
  }

  remoteItems.forEach(upsertItem);
  localItems.forEach(upsertItem);

  return Array.from(mergedItems.values());
}

export function CartProvider({ children }) {
  const { authorizedRequest, loading: authLoading, session } = useAuth();
  const [cartItems, setCartItems] = useState(() => readStoredCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [remoteCartReady, setRemoteCartReady] = useState(false);
  const cartItemsRef = useRef(cartItems);
  const lastSyncedPayloadRef = useRef(serializeCartForSync(cartItems));

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      // Ignore storage errors so cart actions still work in-memory.
    }
  }, [cartItems]);

  useEffect(() => {
    let ignore = false;

    async function hydrateRemoteCart() {
      if (authLoading) {
        return;
      }

      if (!session) {
        lastSyncedPayloadRef.current = serializeCartForSync(cartItemsRef.current);
        setRemoteCartReady(false);
        return;
      }

      try {
        const response = await authorizedRequest("/api/cart");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load your saved cart.");
        }

        const mergedItems = mergeCartItems(cartItemsRef.current, payload.items || []);

        if (!ignore) {
          lastSyncedPayloadRef.current = serializeCartForSync(mergedItems);
          setCartItems(mergedItems);
          setRemoteCartReady(true);
        }
      } catch (error) {
        if (!ignore) {
          lastSyncedPayloadRef.current = serializeCartForSync(cartItemsRef.current);
          setRemoteCartReady(true);
        }
      }
    }

    hydrateRemoteCart();

    return () => {
      ignore = true;
    };
  }, [authLoading, authorizedRequest, session]);

  useEffect(() => {
    if (!session || !remoteCartReady) {
      return undefined;
    }

    const payloadToSync = serializeCartForSync(cartItems);

    if (payloadToSync === lastSyncedPayloadRef.current) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await authorizedRequest("/api/cart", {
          method: "PUT",
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              product_id: item.product_id,
              weight_kg: clampWeight(item.weight_kg)
            }))
          })
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to sync your cart.");
        }

        const hydratedItems = Array.isArray(payload.items) ? payload.items : cartItems;
        lastSyncedPayloadRef.current = serializeCartForSync(hydratedItems);
        setCartItems((currentItems) =>
          serializeCartForSync(currentItems) === payloadToSync ? hydratedItems : currentItems
        );
      } catch (error) {
        // Keep the local cart intact if the sync fails.
      }
    }, REMOTE_SYNC_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [authorizedRequest, cartItems, remoteCartReady, session]);

  function addToCart(product, weightKg) {
    const addedWeight = clampWeight(weightKg);
    const unitPrice = getPricePerKg(product);
    const itemId = product.id;

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.itemId === itemId);

      if (existingItem) {
        return currentItems.map((item) =>
          item.itemId === itemId
            ? { ...item, weight_kg: clampWeight(item.weight_kg + addedWeight) }
            : item
        );
      }

      return [
        ...currentItems,
        {
          itemId,
          product_id: product.id,
          product_name: product.name,
          variety: product.variety,
          image_url: product.image_url,
          weight_kg: addedWeight,
          unit_price: unitPrice
        }
      ];
    });
  }

  function removeFromCart(itemId) {
    setCartItems((currentItems) => currentItems.filter((item) => item.itemId !== itemId));
  }

  function updateWeight(itemId, nextWeightKg) {
    const weightKg = clampWeight(nextWeightKg);
    setCartItems((currentItems) =>
      currentItems.map((item) => (item.itemId === itemId ? { ...item, weight_kg: weightKg } : item))
    );
  }

  const clearCart = useCallback(() => {
    setCartItems((currentItems) => (currentItems.length ? [] : currentItems));
  }, []);
  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);
  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);
  const toggleCart = useCallback(() => {
    setIsCartOpen((current) => !current);
  }, []);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.unit_price * item.weight_kg, 0);
  const totalWeightKg = cartItems.reduce((sum, item) => sum + item.weight_kg, 0);
  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateWeight,
        clearCart,
        cartTotal,
        totalWeightKg,
        cartCount,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        remoteCartReady,
        syncedAcrossDevices: Boolean(session)
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return value;
}
