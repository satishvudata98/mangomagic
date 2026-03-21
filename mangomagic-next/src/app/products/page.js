import ProductsPage from "@/page-components/ProductsPage";
import { buildApiUrl } from "@/lib/api";
import { en } from "@/localization/en";

const pageCopy = en.pages.products;

export const metadata = {
  title: pageCopy.metaTitle,
  description: pageCopy.metaDescription
};

export const dynamic = "force-dynamic";

async function loadProducts() {
  try {
    const response = await fetch(buildApiUrl("/api/products"), {
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    return payload.products || [];
  } catch (error) {
    return [];
  }
}

export default async function ProductsRoute() {
  const products = await loadProducts();
  return <ProductsPage initialProducts={products} />;
}
