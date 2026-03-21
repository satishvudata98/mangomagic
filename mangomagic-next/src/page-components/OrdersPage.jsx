"use client";

import { PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useLocalization } from "../context/LocalizationContext";
import { formatRupees } from "../lib/api";

const statusClasses = {
  paid: "bg-green-100 text-green-700",
  dispatched: "bg-blue-100 text-blue-700",
  delivered: "bg-slate-200 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-orange-100 text-orange-700"
};

function OrdersPage() {
  const { authorizedRequest } = useAuth();
  const { copy } = useLocalization();
  const pageCopy = copy.pages.orders;
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await authorizedRequest("/api/orders");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || pageCopy.loadError);
        }

        setOrders(payload.orders || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [authorizedRequest, pageCopy.loadError]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label={pageCopy.loading} />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <section className="mx-auto max-w-3xl rounded-[32px] bg-white px-6 py-16 text-center shadow-card">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-primary">
          <PackageSearch size={34} />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold text-primary-dark">{pageCopy.emptyTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{pageCopy.emptyBody}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{pageCopy.pageEyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold text-primary-dark">{pageCopy.pageTitle}</h1>
      </div>

      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const statusClass = statusClasses[order.status] || statusClasses.pending;

        return (
          <article key={order.id} className="rounded-[32px] bg-white p-6 shadow-card">
            <button
              type="button"
              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
              className="w-full text-left"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-muted">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </p>
                  <p className="mt-1 text-xl font-bold text-primary-dark">
                    {pageCopy.orderLabel(order.id.slice(-8).toUpperCase())}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${statusClass}`}>
                    {copy.status[order.status] || copy.status.pending}
                  </span>
                  <span className="text-lg font-bold text-textPrimary">{formatRupees(order.total_amount)}</span>
                </div>
              </div>
            </button>

            <div className="mt-4 flex flex-wrap gap-2">
              {order.order_items.map((item, index) => (
                <span
                  key={`${item.product_id || item.product_name}-${index}`}
                  className="rounded-full bg-orange-50 px-3 py-2 text-sm font-medium text-primary-dark"
                >
                  {pageCopy.itemSummary(item.product_name, item.weight_kg, item.quantity)}
                </span>
              ))}
            </div>

            {isExpanded ? (
              <div className="mt-5 space-y-3 border-t border-orange-100 pt-5">
                {order.order_items.map((item, index) => (
                  <div
                    key={`${item.product_id || item.product_name}-${index}`}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-background p-4"
                  >
                    <div>
                      <p className="font-bold text-textPrimary">{item.product_name}</p>
                      <p className="text-sm text-muted">{pageCopy.itemWeight(item.weight_kg, item.quantity)}</p>
                    </div>
                    <p className="font-bold text-primary-dark">{formatRupees(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}

export default OrdersPage;
