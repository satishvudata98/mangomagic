"use client";

import { useEffect, useState } from "react";
import { MessageCircleMore, PhoneCall } from "lucide-react";
import { SHOP_CONFIG } from "../lib/shopConfig";
import { useLocalization } from "../context/LocalizationContext";
import { buildApiUrl } from "../lib/api";

function ContactPage() {
  const { copy } = useLocalization();
  const pageCopy = copy.pages.contact;
  const [pincodes, setPincodes] = useState([]);

  useEffect(() => {
    fetch(buildApiUrl("/api/pincodes"))
      .then((response) => response.json())
      .then((payload) => setPincodes(payload.pincodes || []))
      .catch(() => setPincodes([]));
  }, []);

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <div className="rounded-[36px] bg-gradient-to-br from-primary to-accent px-6 py-8 text-white shadow-2xl shadow-orange-200">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-100">{pageCopy.heroEyebrow}</p>
        <h1 className="mt-3 text-4xl font-extrabold">{SHOP_CONFIG.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-orange-50">{pageCopy.heroBody}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6 rounded-[32px] bg-white p-6 shadow-card">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{pageCopy.reachUs}</p>
            <div className="mt-4 space-y-4">
              <a
                href={`tel:${SHOP_CONFIG.phone.replace(/-/g, "")}`}
                className="flex min-h-12 items-center gap-3 rounded-2xl bg-orange-50 px-4 py-4 font-semibold text-primary-dark"
              >
                <PhoneCall size={18} />
                {SHOP_CONFIG.phone}
              </a>
              <a
                href={`https://wa.me/${SHOP_CONFIG.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-12 items-center gap-3 rounded-2xl bg-green-50 px-4 py-4 font-semibold text-green-700"
              >
                <MessageCircleMore size={18} />
                {pageCopy.whatsapp}
              </a>
              <a href={`mailto:${SHOP_CONFIG.email}`} className="block rounded-2xl bg-background px-4 py-4 font-semibold text-textPrimary">
                {SHOP_CONFIG.email}
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-background p-5">
            <p className="font-bold text-primary-dark">{pageCopy.businessHours}</p>
            <p className="mt-2 text-sm text-muted">{SHOP_CONFIG.businessHours}</p>
            <p className="mt-4 font-bold text-primary-dark">{pageCopy.location}</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {SHOP_CONFIG.address}, {SHOP_CONFIG.city}
            </p>
            <p className="mt-4 text-sm leading-6 text-muted">{pageCopy.locationNote}</p>
          </div>
        </div>

        <div className="space-y-6 rounded-[32px] bg-white p-6 shadow-card">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{pageCopy.deliveryArea}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{pageCopy.deliveryNote}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{pageCopy.minimumOrderNote}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {pincodes.map((item) => (
              <span key={item.pincode} className="rounded-full bg-orange-50 px-3 py-2 text-sm font-semibold text-primary-dark">
                {item.pincode}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;
