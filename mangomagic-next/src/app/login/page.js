import LoginPage from "@/page-components/LoginPage";
import { en } from "@/localization/en";

const pageCopy = en.pages.login;

export const metadata = {
  title: pageCopy.metaTitle,
  description: pageCopy.metaDescription
};

export default function LoginRoute({ searchParams }) {
  const nextPath = typeof searchParams?.next === "string" ? searchParams.next : "/products";
  return <LoginPage nextPath={nextPath} />;
}
