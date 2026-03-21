"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useLocalization } from "../context/LocalizationContext";

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.805 10.023h-9.78v3.955h5.615c-.242 1.274-.968 2.354-2.063 3.08v2.56h3.338c1.953-1.8 3.082-4.452 3.082-7.618 0-.667-.06-1.307-.192-1.977Z"
        fill="#4285F4"
      />
      <path
        d="M12.025 22c2.79 0 5.128-.923 6.838-2.502l-3.338-2.56c-.923.622-2.106.994-3.5.994-2.686 0-4.965-1.813-5.777-4.246H2.803v2.64A10.326 10.326 0 0 0 12.025 22Z"
        fill="#34A853"
      />
      <path
        d="M6.248 13.686a6.185 6.185 0 0 1-.322-1.954c0-.677.113-1.332.322-1.953v-2.64H2.803A10.326 10.326 0 0 0 1.7 11.732c0 1.66.396 3.236 1.103 4.593l3.445-2.639Z"
        fill="#FBBC05"
      />
      <path
        d="M12.025 5.533c1.52 0 2.882.522 3.955 1.545l2.96-2.96C17.148 2.458 14.81 1.5 12.025 1.5 8.01 1.5 4.519 3.79 2.803 7.14l3.445 2.64c.812-2.434 3.091-4.247 5.777-4.247Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginPage({ nextPath: requestedNextPath = "/products" }) {
  const router = useRouter();
  const { loginWithGoogle, session } = useAuth();
  const { copy } = useLocalization();
  const pageCopy = copy.pages.login;
  const [submitting, setSubmitting] = useState(false);
  const nextPath = useMemo(
    () => (requestedNextPath && requestedNextPath.startsWith("/") ? requestedNextPath : "/products"),
    [requestedNextPath]
  );

  useEffect(() => {
    if (session) {
      router.replace(nextPath);
    }
  }, [nextPath, router, session]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const result = await loginWithGoogle();

      if (result.redirecting) {
        toast.success(pageCopy.signInRedirecting);
      } else {
        toast.success(pageCopy.signInSuccess);
      }
    } catch (error) {
      toast.error(error.message || pageCopy.signInError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff8ef] px-4 py-6 sm:px-6 sm:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,129,26,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(227,163,52,0.18),_transparent_24%)]" />
      <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/70 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-amber-200/60 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center lg:grid lg:grid-cols-[1fr,0.95fr] lg:gap-8">
        <section className="hidden rounded-[38px] bg-gradient-to-br from-[#b75515] via-[#d86c1f] to-[#f09d28] p-10 text-white shadow-[0_30px_90px_rgba(184,101,27,0.26)] lg:block">
          <div className="flex h-full flex-col justify-between gap-10">
            <div>
              <div className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold tracking-[0.18em] ring-1 ring-white/20">
                {pageCopy.heroEyebrow}
              </div>
              <h1 className="mt-6 max-w-md text-5xl font-black leading-[1.05]">{pageCopy.heroTitle}</h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-orange-50/90">{pageCopy.heroSubtitle}</p>
            </div>

            <div className="grid gap-4 text-sm text-orange-50/90">
              {pageCopy.heroFeatures.map((feature) => (
                <div key={feature} className="rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/15">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full max-w-md rounded-[34px] bg-white/94 p-6 shadow-[0_25px_70px_rgba(216,109,30,0.14)] ring-1 ring-orange-100 backdrop-blur sm:p-8">
          <div className="mx-auto w-full">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{pageCopy.cardEyebrow}</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-primary-dark sm:text-[2rem]">{pageCopy.cardTitle}</h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-black text-white shadow-lg shadow-orange-200">
                MG
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-muted">{pageCopy.cardBanner}</p>

            <form className="mt-8" onSubmit={handleSubmit}>
              <button
                type="submit"
                disabled={submitting}
                className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#1f1f1f] px-5 py-4 text-base font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <LoadingSpinner label={pageCopy.signingIn} />
                ) : (
                  <>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                      <GoogleMark />
                    </span>
                    <span>{pageCopy.continueWithGoogle}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-[#fff7ed] px-4 py-4 text-sm leading-6 text-muted ring-1 ring-orange-100">
              {pageCopy.secureNote}
            </div>

            <Link href="/products" className="mt-4 inline-flex text-sm font-semibold text-primary transition hover:text-primary-dark">
              {pageCopy.browseGuest}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
