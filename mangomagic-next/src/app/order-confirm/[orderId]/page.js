import ProtectedRoute from "@/components/ProtectedRoute";
import OrderConfirmPage from "@/page-components/OrderConfirmPage";
import { en } from "@/localization/en";

const pageCopy = en.pages.orderConfirm;

export const metadata = {
  title: pageCopy.metaTitle,
  description: pageCopy.metaDescription
};

export default function OrderConfirmRoute({ params }) {
  return (
    <ProtectedRoute>
      <OrderConfirmPage orderId={params.orderId} />
    </ProtectedRoute>
  );
}
