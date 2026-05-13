"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheckCircle, FiClock, FiHash, FiPackage, FiPhone, FiSearch, FiTruck } from "react-icons/fi";
import {
  getPublicOrderStatusByWhatsappAction,
  trackPublicMerchandiseOrderShipmentAction,
} from "@/actions/order";

function formatMoney(value, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusBadge(status) {
  const normalized = String(status || "").toLowerCase();
  if (["paid", "selesai"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }
  if (["pending", "pending_payment", "diproses", "dikirim"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
  if (["failed", "cancelled", "expired"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export default function CheckOrder({ initialOrderCode = "" }) {
  const [form, setForm] = useState({
    orderCode: String(initialOrderCode || "").toUpperCase(),
    customerWhatsapp: "",
  });
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [trackingFeedback, setTrackingFeedback] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);
  const [isSubmitting, startSubmitting] = useTransition();

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "orderCode" ? value.toUpperCase() : value,
    }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setFeedback("");
    setResult(null);
    setTrackingFeedback("");
    setTrackingResult(null);

    startSubmitting(async () => {
      const response = await getPublicOrderStatusByWhatsappAction({
        orderCode: form.orderCode,
        customerWhatsapp: form.customerWhatsapp,
      });

      if (!response?.ok) {
        setFeedback(response?.message || "Gagal memuat status order.");
        return;
      }

      setResult(response.data);
    });
  };

  const onTrackShipment = () => {
    if (!result?.orderCode || !result?.customerWhatsapp) {
      setTrackingFeedback("Data order belum lengkap untuk pelacakan.");
      return;
    }

    setTrackingFeedback("");
    setTrackingResult(null);

    startSubmitting(async () => {
      const response = await trackPublicMerchandiseOrderShipmentAction({
        orderCode: result.orderCode,
        customerWhatsapp: result.customerWhatsapp,
      });

      if (!response?.ok) {
        setTrackingFeedback(response?.message || "Gagal memuat pelacakan pengiriman.");
        return;
      }

      setTrackingResult(response.data || null);
    });
  };

  return (
    <section className='space-y-5'>
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className='space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5'
      >
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-700'>Check Order</p>
          <h1 className='mt-1 text-xl font-semibold text-slate-900 sm:text-2xl'>Cek Status Pesanan Anda</h1>
          <p className='mt-1 text-sm text-slate-600'>
            Masukkan kombinasi kode order dan nomor WhatsApp yang digunakan saat checkout.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <label className='space-y-1 text-sm'>
            <span className='font-medium text-slate-700'>Kode Order</span>
            <div className='flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'>
              <FiHash className='h-4 w-4 text-slate-500' />
              <input
                name='orderCode'
                value={form.orderCode}
                onChange={onChange}
                className='w-full border-none p-0 text-sm text-slate-900 outline-none'
                placeholder='ORD-202602...'
                required
              />
            </div>
          </label>

          <label className='space-y-1 text-sm'>
            <span className='font-medium text-slate-700'>No. WhatsApp</span>
            <div className='flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'>
              <FiPhone className='h-4 w-4 text-slate-500' />
              <input
                name='customerWhatsapp'
                value={form.customerWhatsapp}
                onChange={onChange}
                className='w-full border-none p-0 text-sm text-slate-900 outline-none'
                placeholder='628xxxxxxxxxx'
                required
              />
            </div>
          </label>
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-70'
        >
          <FiSearch className='h-4 w-4' />
          {isSubmitting ? "Mengecek..." : "Cek Status Pesanan"}
        </button>
      </motion.form>

      <AnimatePresence mode='wait'>
        {feedback ? (
          <motion.p
            key='feedback'
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className='rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'
          >
            {feedback}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode='wait'>
        {result ? (
          <motion.article
            key={result.orderCode}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className='space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5'
          >
            <div className='flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3'>
              <div>
                <p className='text-sm font-semibold text-slate-900'>Kode Order: {result.orderCode}</p>
                <p className='text-sm text-slate-600'>{result.customerName}</p>
              </div>
              <div className='flex flex-wrap gap-2 text-xs font-semibold'>
                <span className={`rounded-full px-2.5 py-1 ${statusBadge(result.orderStatus)}`}>
                  order: {result.orderStatus}
                </span>
                <span className={`rounded-full px-2.5 py-1 ${statusBadge(result.paymentStatus)}`}>
                  payment: {result.paymentStatus}
                </span>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3 text-sm md:grid-cols-2'>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2'>
                <p className='mb-2 flex items-center gap-2 font-semibold text-slate-900'>
                  <FiPackage className='h-4 w-4' />
                  Produk Merchandise
                </p>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-start'>
                  {result.merchandiseImageUrl ? (
                    <img
                      src={result.merchandiseImageUrl}
                      alt={result.merchandiseTitle || "Merchandise"}
                      className='h-24 w-24 shrink-0 rounded-lg border border-slate-200 object-cover'
                    />
                  ) : null}
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-slate-900'>{result.merchandiseTitle || "-"}</p>
                    <p className='mt-1 text-sm text-slate-600'>
                      {result.merchandiseDetail || "Detail produk tidak tersedia."}
                    </p>
                    <p className='mt-2 text-sm text-slate-700'>
                      {result.quantity} pcs x {formatMoney(result.unitPrice)} ={" "}
                      <span className='font-semibold text-slate-900'>{formatMoney(result.subtotalAmount)}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                <p className='mb-1 flex items-center gap-2 font-semibold text-slate-900'>
                  <FiCheckCircle className='h-4 w-4' />
                  Ringkasan
                </p>
                <p className='text-slate-700'>Jumlah: {result.quantity} pcs</p>
                <p className='font-semibold text-blue-900'>Total: {formatMoney(result.grandTotalAmount)}</p>
                <p className='text-slate-700'>Dibuat: {formatDateTime(result.createdAt)}</p>
              </div>

              <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                <p className='mb-1 flex items-center gap-2 font-semibold text-slate-900'>
                  <FiTruck className='h-4 w-4' />
                  Pengiriman
                </p>
                <p className='text-slate-700'>
                  Kurir: {result.shippingCourierName || "-"} {result.shippingServiceName ? `- ${result.shippingServiceName}` : ""}
                </p>
                <p className='text-slate-700 break-words [overflow-wrap:anywhere]'>
                  AWB / Resi: {result.shippingTrackingNumber || "-"}
                </p>
                <div className='mt-2'>
                  <button
                    type='button'
                    onClick={onTrackShipment}
                    disabled={isSubmitting || !result.shippingTrackingNumber}
                    className='inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {isSubmitting ? "Memuat pelacakan..." : "Lacak Paket"}
                  </button>
                </div>
                <p className='text-slate-700'>
                  Estimasi: {result.shippingEtd ? `${result.shippingEtd} hari` : "-"}
                </p>
                <p className='text-slate-700'>Update: {formatDateTime(result.updatedAt)}</p>
              </div>
            </div>

            {trackingFeedback ? (
              <p className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700'>
                {trackingFeedback}
              </p>
            ) : null}

            {trackingResult ? (
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm'>
                <p className='mb-2 font-semibold text-slate-900'>Tracking Pengiriman</p>
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  <p className='min-w-0 break-words text-slate-700 [overflow-wrap:anywhere]'>
                    <span className='font-semibold text-slate-900'>Kurir:</span>{" "}
                    {trackingResult.summary?.courierName || trackingResult.courierName || result.shippingCourierName || "-"}
                  </p>
                  <p className='min-w-0 break-words text-slate-700 [overflow-wrap:anywhere]'>
                    <span className='font-semibold text-slate-900'>AWB:</span>{" "}
                    {trackingResult.summary?.waybillNumber || trackingResult.awbNumber || result.shippingTrackingNumber || "-"}
                  </p>
                  <p className='min-w-0 break-words text-slate-700 [overflow-wrap:anywhere]'>
                    <span className='font-semibold text-slate-900'>Status:</span>{" "}
                    {trackingResult.deliveryStatus?.status || trackingResult.summary?.status || "-"}
                  </p>
                  <p className='min-w-0 break-words text-slate-700 [overflow-wrap:anywhere]'>
                    <span className='font-semibold text-slate-900'>Penerima POD:</span>{" "}
                    {trackingResult.deliveryStatus?.podReceiver || "-"}
                  </p>
                </div>

                {Array.isArray(trackingResult.manifest) &&
                trackingResult.manifest.length > 0 ? (
                  <div className='mt-3 space-y-2'>
                    {trackingResult.manifest.map((item, index) => (
                      <div
                        key={`${item.manifestDate}-${item.manifestTime}-${index}`}
                        className='rounded-md border border-slate-200 bg-white p-2'
                      >
                        <p className='text-xs font-semibold text-slate-900'>
                          {item.manifestDate || "-"} {item.manifestTime || ""}
                        </p>
                        <p className='text-sm text-slate-700'>
                          {item.manifestDescription || "-"}
                        </p>
                        {item.cityName ? (
                          <p className='text-xs text-slate-500'>{item.cityName}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='mt-3 text-sm text-slate-600'>
                    Belum ada detail manifest untuk resi ini.
                  </p>
                )}
              </div>
            ) : null}

            <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm'>
              <p className='mb-1 flex items-center gap-2 font-semibold text-slate-900'>
                <FiClock className='h-4 w-4' />
                Pembayaran
              </p>
              <p className='text-slate-700'>Reference: {result.paymentReference || "-"}</p>
              <p className='text-slate-700'>Jatuh tempo: {formatDateTime(result.paymentDueAt)}</p>
            </div>
          </motion.article>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
