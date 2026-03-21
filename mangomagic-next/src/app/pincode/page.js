import ProtectedRoute from "@/components/ProtectedRoute";
import PincodePage from "@/page-components/PincodePage";
import { en } from "@/localization/en";

const pageCopy = en.pages.pincode;

export const metadata = {
  title: pageCopy.metaTitle,
  description: pageCopy.metaDescription
};

export default function PincodeRoute() {
  return (
    <ProtectedRoute>
      <PincodePage />
    </ProtectedRoute>
  );
}
