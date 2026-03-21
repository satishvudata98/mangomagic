# MangoMagic Copy Update Plan

The current copy sounds too technical and developer-centric (e.g., explaining "server-side pricing" or "guest browsing"). The goal of this update is to make the application feel like a **premium, quality-focused e-commerce brand**.

## Proposed Changes

### [d:\mangomagic\client\src\pages\ProductsPage.jsx](file:///d:/mangomagic/client/src/pages/ProductsPage.jsx)
- **[MODIFY]** [ProductsPage.jsx](file:///d:/mangomagic/client/src/pages/ProductsPage.jsx)
  - *Current Title:* "Browse freely, pick the exact kilos you want, and login only when it is time to checkout."
  - *New Title:* "Experience the finest hand-picked mangoes, delivered straight from the orchards to your door."
  - *Current Subtitle:* "Compare varieties, watch your per-kilo pricing live, and build a richer mango box without being forced into signup first."
  - *New Subtitle:* "Build your perfect box of premium mangoes. Only the highest quality fruit makes it to our selection."
  - *Current Tags:* "Guest browsing enabled", "Secure server-side pricing"
  - *New Tags:* "Farm-to-Door Delivery", "100% Organic Promise"
  - *Current "Protected pricing" block:* "Every final total is recalculated on the server before payment, so client-side price edits do not matter."
  - *New "Quality Guarantee" block:* "We stand by the quality of our fruit. Every mango is carefully inspected and packaged to ensure it arrives in pristine condition."
  - *Current "Cart perks" block:* "Premium packaging milestones now react to the weight you add, which makes the flow feel more rewarding."
  - *New "Premium unboxing" block:* "Unlock premium packaging, priority dispatch, and complimentary gift wrapping as you build your perfect box."

### [d:\mangomagic\client\src\pages\LoginPage.jsx](file:///d:/mangomagic/client/src/pages/LoginPage.jsx)
- **[MODIFY]** [LoginPage.jsx](file:///d:/mangomagic/client/src/pages/LoginPage.jsx)
  - *Current Subtitle:* "Clean checkout, fast repeat orders, and a smoother buying journey from sign-in to delivery."
  - *New Subtitle:* "Experience a seamless way to order the finest mangoes. Track your deliveries and manage your premium fruit boxes."
  - *Current Banner text:* "Browse as a guest anytime. Sign in only when you want to place the order, manage delivery details, or see past orders."
  - *New Banner text:* "Sign in to complete your purchase, track your farm-fresh deliveries, and view your exclusive order history."
  - *Current Small Note:* "Secure Google sign-in. No forced login before browsing."
  - *New Small Note:* "Secure, instant sign-in with your Google account."

### [d:\mangomagic\client\src\pages\CheckoutPage.jsx](file:///d:/mangomagic/client/src/pages/CheckoutPage.jsx)
- **[MODIFY]** [CheckoutPage.jsx](file:///d:/mangomagic/client/src/pages/CheckoutPage.jsx)
  - *Current Subtitle:* "The cart stayed open for browsing; this is the only step where we need your saved address and sign-in."
  - *New Subtitle:* "Enter your delivery details and securely complete your purchase to reserve your harvest."

### [d:\mangomagic\client\src\components\Navbar.jsx](file:///d:/mangomagic/client/src/components/Navbar.jsx)
- **[MODIFY]** [Navbar.jsx](file:///d:/mangomagic/client/src/components/Navbar.jsx)
  - *Current Pincode Prompt:* "Browse first, save your pincode here if you want, and sign in only when you are ready to check out."
  - *New Pincode Prompt:* "Check if we deliver our farm-fresh mangoes to your door to guarantee maximum freshness."
  - *Current Link text:* "Login only at checkout"
  - *New Link text:* "Sign in"

### [d:\mangomagic\client\src\components\CartDrawer.jsx](file:///d:/mangomagic/client/src/components/CartDrawer.jsx)
- **[MODIFY]** [CartDrawer.jsx](file:///d:/mangomagic/client/src/components/CartDrawer.jsx)
  - *Current text:* "Saved to your account and synced across signed-in devices."
  - *New text:* "Saved securely to your account."
  - *Current text:* "Your order already qualifies for the premium handling milestones we have set up."
  - *New text:* "Your box has unlocked our highest tier of premium packaging."

## Verification Plan
### Manual Verification
1. Open the application locally and navigate to the Products, Login, Checkout, and Cart Drawer components.
2. Confirm that technical jargon is fully removed and the copy feels completely aligned with a premium e-commerce fruit store.
