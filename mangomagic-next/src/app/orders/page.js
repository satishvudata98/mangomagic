import ProtectedRoute from "@/components/ProtectedRoute";
import OrdersPage from "@/page-components/OrdersPage";
import { en } from "@/localization/en";

const pageCopy = en.pages.orders;

export const metadata = {
  title: pageCopy.metaTitle,
  description: pageCopy.metaDescription
};

export default function OrdersRoute() {
  return (
    <ProtectedRoute>
      <OrdersPage />
    </ProtectedRoute>
  );
}
