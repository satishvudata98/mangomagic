import ContactPage from "@/page-components/ContactPage";
import { en } from "@/localization/en";

const pageCopy = en.pages.contact;

export const metadata = {
  title: pageCopy.metaTitle,
  description: pageCopy.metaDescription
};

export default function ContactRoute() {
  return <ContactPage />;
}
