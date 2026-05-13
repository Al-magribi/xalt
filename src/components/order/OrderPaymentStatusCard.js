"use client";

import { useEffect, useMemo, useState } from "react";

function formatMoney(value, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getStatusLabel(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "paid") return "Pembayaran Berhasil";
  if (normalized === "pending") return "Menunggu Pembayaran";
  if (normalized === "failed") return "Pembayaran Gagal";
  if (normalized === "cancelled") return "Pembayaran Dibatalkan";
  if (normalized === "expired") return "Pembayaran Kedaluwarsa";
  return "Menunggu Konfirmasi";
}

function isTerminalStatus(status) {
  return ["paid", "failed", "cancelled", "expired"].includes(String(status || "").toLowerCase());
}

export default function OrderPaymentStatusCard({ orderCode, initialData }) {
  const [data, setData] = useState(initialData || null);
  const [feedback, setFeedback] = useState("");
  const currentStatus = useMemo(
    () => String(data?.orderPaymentStatus || "").toLowerCase(),
    [data],
  );

  const loadStatus = async () => {
    try {
      const response = await fetch(`/api/order-status?order_code=${encodeURIComponent(orderCode)}`, {
        method: "GET",
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        setFeedback(payload?.message || "Gagal memuat status order.");
        return;
      }
      setData(payload.data);
      setFeedback("");
    } catch {
      setFeedback("Gagal memuat status order.");
    }
  };

  useEffect(() => {
    if (!orderCode) return;
    if (isTerminalStatus(currentStatus)) return;

    const timer = setInterval(() => {
      loadStatus();
    }, 5000);

    return () => clearInterval(timer);
  }, [orderCode, currentStatus]);

  if (!data) {
    return (
      <section className='rounded-xl border border-slate-200 bg-white p-5'>
        <p className='text-sm text-slate-700'>Data order tidak ditemukan.</p>
      </section>
    );
  }

  return (
    <section className='space-y-4 rounded-xl border border-slate-200 bg-white p-5'>
      <div className='space-y-1'>
        <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Status Pembayaran</p>
        <h1 className='text-xl font-semibold text-slate-900'>{getStatusLabel(currentStatus)}</h1>
        <p className='text-sm text-slate-600'>Kode order: {data.orderCode}</p>
      </div>

      <div className='space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm'>
        <p className='text-slate-700'>Nama: {data.customerName || "-"}</p>
        <p className='text-slate-700'>Email: {data.customerEmail || "-"}</p>
        <p className='text-slate-700'>Jumlah: {data.quantity || 0} pcs</p>
        <p className='font-semibold text-blue-900'>Total: {formatMoney(data.grandTotalAmount)}</p>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={loadStatus}
          className='rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
        >
          Refresh Status
        </button>
      </div>

      {feedback ? <p className='text-sm text-rose-700'>{feedback}</p> : null}
    </section>
  );
}
