# Next.js Migration Guide for MangoMagic

Converting your Vite + React application to Next.js (App Router) is highly feasible and will drastically improve your Google SEO rankings. Since your app already uses modern standards (Tailwind CSS, Lucide Icons, React Context), **you can migrate without breaking any UI or functionality.**

Here is the step-by-step master plan to migrate the app safely.

---

## Step 1: Initialize Next.js in a New Folder
Instead of rewriting your existing Vite folder, create a new Next.js project next to it. This allows you to copy files over safely without breaking the current working version.

Run the following command in your terminal:
```bash
npx create-next-app@latest mangomagic-next
# Choose the following options:
# - TypeScript: No (keep it JS for now to match your current codebase)
# - Tailwind CSS: Yes
# - ESLint: Yes
# - `src/` directory: Yes
# - App Router: Yes
# - Import alias: Yes (default @/*)
```

## Step 2: Migrate Dependencies
In your new Next.js app, install the exact same dependencies you used in your Vite project:
```bash
npm install firebase lucide-react react-hot-toast
```
**Note:** Do NOT install `react-router-dom`. Next.js has its own built-in File-System router.

## Step 3: Set up the Global Layout & Providers
In Next.js, [main.jsx](file:///d:/mangomagic/client/src/main.jsx) and [App.jsx](file:///d:/mangomagic/client/src/App.jsx) are replaced by `src/app/layout.jsx`. Because Next.js defaults to Server Components, you must put your Context Providers in a separate "Client Component".

**A. Create `src/components/Providers.jsx`:**
Copy your Context files (`context/AuthContext.jsx`, `context/CartContext.jsx`, etc.) into the new Next.js `src/context/` folder.
```jsx
"use client"; // This is required for React Context in Next.js

import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { DeliveryProvider } from "../context/DeliveryContext";
import { LocalizationProvider } from "../context/LocalizationContext";

export function Providers({ children }) {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <DeliveryProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </DeliveryProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
}
```

**B. Update `src/app/layout.jsx`:**
```jsx
import { Toaster } from "react-hot-toast";
import { Providers } from "../components/Providers";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/CartDrawer";
import "./globals.css"; // Ensure this contains your Tailwind directives

export const metadata = {
  title: "MangoMagic | Premium Mangoes",
  description: "Experience the finest hand-picked mangoes, delivered straight to your door.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fff8ef] text-gray-900">
        <Providers>
          <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
          <Navbar />
          <main className="min-h-screen px-4 pb-32 pt-40 md:px-6 md:pb-10 md:pt-44">
            {children}
          </main>
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
```

## Step 4: Migrate Pages to Next.js App Router
Next.js uses folder-based routing instead of `<Routes>` and `<Route>`. You will map your `src/pages/` to `src/app/[route-name]/page.jsx`.

For every page file, you will:
1. Copy the code into the new component folder.
2. Add `"use client";` to the top of the file (since your app relies heavily on `useState`, `useEffect`, and hooks).
3. Replace `react-router-dom` hooks (`useNavigate`, `useLocation`, `<Link>`) with Next.js hooks:
   - `import { Link, useNavigate } from "react-router-dom"` becomes `import Link from "next/link"` and `import { useRouter } from "next/navigation"`.
   - `navigate("/products")` becomes `router.push("/products")`.

### Route Mapping:
- **Home:** `src/app/page.jsx` (This will redirect or render exactly what [ProductsPage.jsx](file:///d:/mangomagic/client/src/pages/ProductsPage.jsx) had)
- **Login:** `src/app/login/page.jsx`
- **Checkout:** `src/app/checkout/page.jsx`
- **Orders:** `src/app/orders/page.jsx`
- **Contact:** `src/app/contact/page.jsx`
- **Order Confirm:** `src/app/order-confirm/[orderId]/page.jsx` (Note the folder name uses brackets for the dynamic param `useParams().orderId` which becomes accessible via page props).

## Step 5: SEO Optimizations (The whole reason we are doing this)
Right now, you are using a custom `usePageMeta` hook. Next.js handles this automatically.
For static pages (like Login), remove `usePageMeta` and simply export `metadata`:

```jsx
// src/app/login/page.jsx
import LoginForm from "@/components/LoginForm"; // Split your UI into a client component if needed

export const metadata = {
  title: "Sign in | MangoMagic",
  description: "Sign in to complete your purchase, track your farm-fresh deliveries, and view your exclusive order history.",
};

export default function LoginPage() {
  return <LoginForm />;
}
```

### SSR for Products (Crucial for SEO)
To guarantee Google indexes your exact mango varieties, your [ProductsPage](file:///d:/mangomagic/client/src/pages/ProductsPage.jsx#13-196) shouldn't use `useEffect` to fetch products. It should fetch them on the server securely.

```jsx
// src/app/products/page.jsx
import ProductListClient from "./ProductListClient";
import { buildApiUrl } from "@/lib/api";

export const metadata = {
  title: "Premium Mangoes | MangoMagic",
  description: "Browse our farm-fresh selection of premium, organic mangoes.",
};

// This runs on the SERVER, ensuring Google sees the content immediately.
export default async function ProductsRoute() {
  const res = await fetch(buildApiUrl("/api/products"), { next: { revalidate: 60 } });
  const data = await res.json();
  
  return <ProductListClient initialProducts={data.products} />;
}
```

## Step 6: Fix Static Assets & Environment Variables
1. Move everything inside Vite's `/public` folder directly into Next.js's `/public` folder.
2. In your components, images accessed as `src="/banner.jpg"` will continue working perfectly.
3. Rename your environment variables: Next.js uses `NEXT_PUBLIC_` instead of `VITE_`.
   - Before: `import.meta.env.VITE_API_URL`
   - After: `process.env.NEXT_PUBLIC_API_URL`

## Summary Checklist
- [ ] Initialize Next.js project.
- [ ] Install deps (Tailwind, Lucide, Firebase, React Hot Toast).
- [ ] Setup `src/app/layout.jsx` and Client Providers.
- [ ] Migrate `components` / `lib` / `context` folders.
- [ ] Convert `pages/` to `app/` file-system routing.
- [ ] Replace `react-router-dom` imports with `next/navigation`.
- [ ] Replace `import.meta.env` with `process.env`.
- [ ] Replace `usePageMeta` with Next.js `metadata` exports.
- [ ] Move images to Next's `public` folder.
