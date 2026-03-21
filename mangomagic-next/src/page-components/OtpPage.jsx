"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocalization } from "../context/LocalizationContext";

function OtpPage() {
  const router = useRouter();
  const { copy } = useLocalization();
  const pageCopy = copy.pages.otp;

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl shadow-orange-100">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{pageCopy.pageEyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold text-primary-dark">{pageCopy.pageTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{pageCopy.pageBody}</p>
      </div>
    </div>
  );
}

export default OtpPage;
