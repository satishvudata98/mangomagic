"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useLocalization } from "../context/LocalizationContext";
import { buildApiUrl } from "../lib/api";

function PincodePage() {
  const router = useRouter();
  const { profile, saveProfile } = useAuth();
  const { copy } = useLocalization();
  const pageCopy = copy.pages.pincode;
  const [pincode, setPincode] = useState(profile?.pincode || "");
  const [allPincodes, setAllPincodes] = useState([]);
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.pincode) {
      router.replace("/products");
    }
  }, [profile, router]);

  useEffect(() => {
    setPincode(profile?.pincode || "");
  }, [profile?.pincode]);

  useEffect(() => {
    let ignore = false;

    fetch(buildApiUrl("/api/pincodes"))
      .then((response) => response.json())
      .then((payload) => {
        if (!ignore) {
          setAllPincodes(payload.pincodes || []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setAllPincodes([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function checkPincode() {
      if (pincode.length !== 6) {
        setCheckResult(null);
        return;
      }

      setChecking(true);

      try {
        const response = await fetch(buildApiUrl(`/api/pincodes/check/${pincode}`));
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || pageCopy.checkError);
        }

        if (!ignore) {
          setCheckResult(payload);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(error.message);
          setCheckResult(null);
        }
      } finally {
        if (!ignore) {
          setChecking(false);
        }
      }
    }

    checkPincode();

    return () => {
      ignore = true;
    };
  }, [pageCopy.checkError, pincode]);

  async function confirmPincode() {
    if (!checkResult?.serviceable) {
      return;
    }

    setSaving(true);

    try {
      await saveProfile({
        full_name: profile?.full_name || "",
        delivery_address: profile?.delivery_address || "",
        delivery_phone: profile?.delivery_phone || "",
        pincode
      });
      toast.success(pageCopy.confirmed);
      router.replace("/products");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-8 md:pt-10">
      <div className="rounded-[32px] bg-white p-6 shadow-card md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{pageCopy.pageEyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold text-primary-dark">{pageCopy.pageTitle}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{pageCopy.pageBody}</p>

        <div className="mt-8 max-w-sm">
          <input
            type="text"
            inputMode="numeric"
            value={pincode}
            onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="560034"
            className="min-h-14 w-full rounded-2xl border border-orange-200 px-5 text-xl font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div className="mt-6">
          {checking ? <p className="text-sm font-semibold text-primary">{pageCopy.checking}</p> : null}

          {checkResult?.serviceable ? (
            <div className="rounded-3xl border border-green-200 bg-green-50 p-5">
              <p className="text-lg font-bold text-success">{pageCopy.successTitle(checkResult.area_name, checkResult.city)}</p>
              <button
                type="button"
                onClick={confirmPincode}
                disabled={saving}
                className="mt-4 min-h-12 rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary-dark disabled:bg-orange-200"
              >
                {saving ? copy.common.saving : pageCopy.successButton}
              </button>
            </div>
          ) : null}

          {checkResult && !checkResult.serviceable ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
              <p className="text-lg font-bold text-error">{pageCopy.unavailableTitle}</p>
              <p className="mt-3 text-sm text-muted">{pageCopy.availablePincodes}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {allPincodes.map((item) => (
                  <span
                    key={item.pincode}
                    className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-primary-dark"
                  >
                    {item.pincode}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default PincodePage;
