"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useLocalization } from "../context/LocalizationContext";
import { formatRupees } from "../lib/api";

function OrderConfirmPage({ orderId }) {
  const { authorizedRequest } = useAuth();
  const { copy } = useLocalization();
  const pageCopy = copy.pages.orderConfirm;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const response = await authorizedRequest(`/api/orders/${orderId}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || pageCopy.loadError);
        }

        setOrder(payload.order);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [authorizedRequest, orderId, pageCopy.loadError]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label={pageCopy.loading} />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <section className="mx-auto max-w-3xl rounded-[36px] bg-white p-8 text-center shadow-card">
      <div className="mx-auto flex h-24 w-24 animate-pop-in items-center justify-center rounded-full bg-green-100 text-success">
        <CheckCircle2 size={44} />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold text-primary-dark">{pageCopy.title}</h1>
      <p className="mt-3 text-sm text-muted">{pageCopy.orderId(order.id.slice(-8).toUpperCase())}</p>
      <p className="mt-2 text-sm text-muted">{pageCopy.estimatedDelivery}</p>

      <div className="mt-8 space-y-3 text-left">
        {order.order_items.map((item, index) => (
          <div key={`${item.product_id || item.product_name}-${index}`} className="rounded-3xl bg-orange-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-textPrimary">{item.product_name}</p>
                <p className="text-sm text-muted">{pageCopy.itemSummary(item.weight_kg, item.quantity)}</p>
              </div>
              <p className="font-bold text-primary-dark">{formatRupees(item.subtotal)}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-3xl font-extrabold text-primary-dark">{formatRupees(order.total_amount)}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/orders"
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary-dark"
        >
          {pageCopy.viewOrders}
        </Link>
        <Link
          href="/products"
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-orange-200 px-6 py-3 font-bold text-primary-dark transition hover:bg-orange-50"
        >
          {pageCopy.orderMore}
        </Link>
      </div>
    </section>
  );
}

export default OrderConfirmPage;
