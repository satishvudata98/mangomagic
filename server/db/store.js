const { getOrSetJson } = require("../lib/cache");
const { normalizeIndianMobileNumber } = require("../lib/validation");
const { buildInFilter, now, supabaseRequest } = require("./supabase");

const MIN_WEIGHT_KG = 1;
const MAX_WEIGHT_KG = 25;

function clampCartWeight(weightKg) {
  return Math.max(MIN_WEIGHT_KG, Math.min(MAX_WEIGHT_KG, Math.round(Number(weightKg) || MIN_WEIGHT_KG)));
}

function getPricePerKg(product) {
  return Math.round(Number(product.price_5kg || 0) / 5);
}

function buildHydratedCartItem(product, weightKg) {
  return {
    itemId: product.id,
    product_id: product.id,
    product_name: product.name,
    variety: product.variety,
    image_url: product.image_url,
    weight_kg: clampCartWeight(weightKg),
    unit_price: getPricePerKg(product)
  };
}

function sanitizeSavedCartItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  const mergedItems = new Map();

  for (const item of items) {
    if (!item || typeof item !== "object" || typeof item.product_id !== "string" || !item.product_id.trim()) {
      continue;
    }

    const productId = item.product_id.trim();
    const weightKg = Number(item.weight_kg);

    if (!Number.isFinite(weightKg)) {
      continue;
    }

    const currentWeight = mergedItems.get(productId) || 0;
    mergedItems.set(productId, clampCartWeight(currentWeight + weightKg));
  }

  return Array.from(mergedItems, ([product_id, weight_kg]) => ({
    product_id,
    weight_kg
  }));
}

async function listAvailableProducts() {
  return getOrSetJson("catalog:products:available", 300, () =>
    supabaseRequest("products", {
      query: {
        select: "*",
        available: "eq.true",
        order: "sort_order.asc"
      }
    })
  );
}

async function listActivePincodes() {
  return getOrSetJson("catalog:pincodes:active", 900, () =>
    supabaseRequest("serviceable_pincodes", {
      query: {
        select: "pincode,area_name,city,is_active",
        is_active: "eq.true",
        order: "pincode.asc"
      }
    })
  );
}

async function getPincode(pin) {
  return getOrSetJson(`catalog:pincode:${pin}`, 900, async () => {
    const rows = await supabaseRequest("serviceable_pincodes", {
      query: {
        select: "pincode,area_name,city,is_active",
        pincode: `eq.${pin}`,
        limit: 1
      }
    });

    return rows[0] || null;
  });
}

async function getProductsByIds(productIds) {
  if (!productIds.length) {
    return new Map();
  }

  const rows = await supabaseRequest("products", {
    query: {
      select: "*",
      id: buildInFilter(productIds)
    }
  });

  return new Map(rows.map((product) => [product.id, product]));
}

async function getProfileById(userId) {
  const rows = await supabaseRequest("profiles", {
    query: {
      select: "*",
      id: `eq.${userId}`,
      limit: 1
    }
  });

  return rows[0] || null;
}

async function patchProfile(userId, payload) {
  const rows = await supabaseRequest("profiles", {
    method: "PATCH",
    query: {
      id: `eq.${userId}`,
      select: "*"
    },
    headers: {
      Prefer: "return=representation"
    },
    body: payload
  });

  return rows[0] || null;
}

async function insertProfile(payload) {
  const rows = await supabaseRequest("profiles", {
    method: "POST",
    query: {
      select: "*"
    },
    headers: {
      Prefer: "return=representation"
    },
    body: payload
  });

  return rows[0] || null;
}

async function getOrCreateProfile(user) {
  const existingProfile = await getProfileById(user.id);

  if (!existingProfile) {
    const timestamp = now();

    return insertProfile({
      id: user.id,
      email: user.email || "",
      phone: user.phone || "",
      auth_provider: user.provider || "google.com",
      avatar_url: user.avatar_url || "",
      full_name: user.name || "",
      delivery_address: "",
      delivery_phone: "",
      pincode: "",
      saved_cart: [],
      created_at: timestamp,
      updated_at: timestamp
    });
  }

  const updates = {
    updated_at: now()
  };

  if (user.email && user.email !== existingProfile.email) {
    updates.email = user.email;
  }

  if (user.phone !== undefined && user.phone !== existingProfile.phone) {
    updates.phone = user.phone || "";
  }

  if (user.avatar_url && user.avatar_url !== existingProfile.avatar_url) {
    updates.avatar_url = user.avatar_url;
  }

  if (user.provider && user.provider !== existingProfile.auth_provider) {
    updates.auth_provider = user.provider;
  }

  if (!existingProfile.full_name && user.name) {
    updates.full_name = user.name;
  }

  if (existingProfile.delivery_phone === undefined) {
    updates.delivery_phone = "";
  }

  if (!Array.isArray(existingProfile.saved_cart)) {
    updates.saved_cart = [];
  }

  if (Object.keys(updates).length === 1) {
    return existingProfile;
  }

  return patchProfile(user.id, updates);
}

async function saveProfile(user, values) {
  const existingProfile = await getOrCreateProfile(user);
  const timestamp = now();
  const normalizedDeliveryPhone =
    values.delivery_phone === undefined
      ? existingProfile?.delivery_phone || ""
      : normalizeIndianMobileNumber(values.delivery_phone);

  const payload = {
    email: user.email || existingProfile?.email || "",
    phone: user.phone || existingProfile?.phone || "",
    auth_provider: user.provider || existingProfile?.auth_provider || "google.com",
    avatar_url: user.avatar_url || existingProfile?.avatar_url || "",
    full_name: values.full_name ?? existingProfile?.full_name ?? user.name ?? "",
    delivery_address: values.delivery_address ?? existingProfile?.delivery_address ?? "",
    delivery_phone: normalizedDeliveryPhone,
    pincode: values.pincode ?? existingProfile?.pincode ?? "",
    saved_cart: Array.isArray(existingProfile?.saved_cart) ? existingProfile.saved_cart : [],
    updated_at: timestamp
  };

  return patchProfile(user.id, payload);
}

async function listSavedCartForUser(userId) {
  const profile = await getProfileById(userId);
  const savedCart = sanitizeSavedCartItems(profile?.saved_cart || []);

  if (!savedCart.length) {
    return [];
  }

  const productMap = await getProductsByIds(savedCart.map((item) => item.product_id));

  return savedCart.flatMap((item) => {
    const product = productMap.get(item.product_id);

    if (!product || !product.available) {
      return [];
    }

    return [buildHydratedCartItem(product, item.weight_kg)];
  });
}

async function saveSavedCart(user, items) {
  const savedCart = sanitizeSavedCartItems(items);
  await getOrCreateProfile(user);
  return patchProfile(user.id, {
    saved_cart: savedCart,
    updated_at: now()
  });
}

async function listOrdersForUser(userId) {
  return supabaseRequest("orders", {
    query: {
      select: "*",
      user_id: `eq.${userId}`,
      order: "created_at.desc"
    }
  });
}

async function getOrderById(orderId) {
  const rows = await supabaseRequest("orders", {
    query: {
      select: "*",
      id: `eq.${orderId}`,
      limit: 1
    }
  });

  return rows[0] || null;
}

async function getOrderByRazorpayOrderId(razorpayOrderId) {
  const rows = await supabaseRequest("orders", {
    query: {
      select: "*",
      razorpay_order_id: `eq.${razorpayOrderId}`,
      limit: 1
    }
  });

  return rows[0] || null;
}

async function createOrder(payload) {
  const timestamp = now();
  const rows = await supabaseRequest("orders", {
    method: "POST",
    query: {
      select: "*"
    },
    headers: {
      Prefer: "return=representation"
    },
    body: {
      ...payload,
      created_at: timestamp,
      updated_at: timestamp
    }
  });

  return rows[0] || null;
}

async function updateOrderByRazorpayOrderId(razorpayOrderId, payload) {
  const rows = await supabaseRequest("orders", {
    method: "PATCH",
    query: {
      razorpay_order_id: `eq.${razorpayOrderId}`,
      select: "*"
    },
    headers: {
      Prefer: "return=representation"
    },
    body: {
      ...payload,
      updated_at: now()
    }
  });

  return rows[0] || null;
}

module.exports = {
  createOrder,
  getOrderById,
  getOrderByRazorpayOrderId,
  getOrCreateProfile,
  getPincode,
  getProductsByIds,
  listActivePincodes,
  listAvailableProducts,
  listOrdersForUser,
  listSavedCartForUser,
  saveProfile,
  saveSavedCart,
  updateOrderByRazorpayOrderId
};
