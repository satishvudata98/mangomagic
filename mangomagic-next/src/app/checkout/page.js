import ProtectedRoute from "@/components/ProtectedRoute";
import CheckoutPage from "@/page-components/CheckoutPage";
import { en } from "@/localization/en";

const pageCopy = en.pages.checkout;

export const metadata = {
  title: pageCopy.metaTitle,
  description: pageCopy.metaDescription
};

export default function CheckoutRoute() {
  return (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  );
}
