"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMail,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiRefreshCw,
  FiTrash2,
  FiTruck,
} from "react-icons/fi";
import {
  deleteAdminMerchandiseOrderAction,
  trackAdminMerchandiseOrderShipmentAction,
  updateAdminMerchandiseOrderTrackingNumberAction,
  updateAdminMerchandiseOrderStatusAction,
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

function statusBadgeClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (["selesai", "paid"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }
  if (
    ["dikirim", "diproses", "pending_payment", "pending"].includes(normalized)
  ) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
  if (["cancelled", "expired", "failed"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function statusLabel(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "pending_payment") return "pending_payment";
  return normalized || "-";
}

function parseNotesLines(rawNotes) {
  const source = String(rawNotes || "").trim();
  if (!source) return [];

  const lines = source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line) => {
    try {
      const parsed = JSON.parse(line);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { type: "json", value: parsed };
      }
    } catch {
      // fallback to plain text
    }
    return { type: "text", value: line };
  });
}

export default function AdminOrderComponent({ orders = [] }) {
  const [items, setItems] = useState(Array.isArray(orders) ? orders : []);
  const [selectedId, setSelectedId] = useState(orders?.[0]?.id || null);
  const [feedback, setFeedback] = useState({ ok: false, message: "" });
  const [trackingInput, setTrackingInput] = useState(
    String(orders?.[0]?.shipping_tracking_number || ""),
  );
  const [trackingFeedback, setTrackingFeedback] = useState("");
  const [trackingResult, setTrackingResult] = useState(null);
  const [isSubmitting, startSubmitting] = useTransition();

  const selectedOrder = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId],
  );

  useEffect(() => {
    setTrackingInput(String(selectedOrder?.shipping_tracking_number || ""));
    setTrackingFeedback("");
    setTrackingResult(null);
  }, [selectedOrder?.id, selectedOrder?.shipping_tracking_number]);

  const selectOrder = (order) => {
    setSelectedId(order.id);
    setTrackingInput(String(order.shipping_tracking_number || ""));
  };

  const applyStatus = (orderId, nextStatus) => {
    setFeedback({ ok: false, message: "" });
    startSubmitting(async () => {
      const response = await updateAdminMerchandiseOrderStatusAction({
        orderId,
        status: nextStatus,
      });

      if (!response?.ok) {
        setFeedback({
          ok: false,
          message: response?.message || "Gagal memperbarui status order.",
        });
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === orderId
            ? {
                ...item,
                order_status: nextStatus,
              }
            : item,
        ),
      );
      setFeedback({
        ok: true,
        message: response?.message || "Status order diperbarui.",
      });
    });
  };

  const deleteOrder = (orderId) => {
    const confirmed = window.confirm(
      "Hapus pesanan ini? Tindakan ini tidak bisa dibatalkan.",
    );
    if (!confirmed) return;

    setFeedback({ ok: false, message: "" });
    startSubmitting(async () => {
      const response = await deleteAdminMerchandiseOrderAction({ orderId });
      if (!response?.ok) {
        setFeedback({
          ok: false,
          message: response?.message || "Gagal menghapus order.",
        });
        return;
      }

      setItems((prev) => {
        const nextItems = prev.filter((item) => item.id !== orderId);
        setSelectedId((prevSelected) => {
          if (prevSelected !== orderId) return prevSelected;
          return nextItems[0]?.id || null;
        });
        return nextItems;
      });
      setFeedback({ ok: true, message: response?.message || "Order dihapus." });
    });
  };

  const saveTrackingNumber = (orderId) => {
    const sanitizedTracking = String(trackingInput || "").trim().toUpperCase();
    if (!sanitizedTracking) {
      setFeedback({ ok: false, message: "Nomor resi wajib diisi." });
      return;
    }

    setFeedback({ ok: false, message: "" });
    startSubmitting(async () => {
      const response = await updateAdminMerchandiseOrderTrackingNumberAction({
        orderId,
        trackingNumber: sanitizedTracking,
      });

      if (!response?.ok) {
        setFeedback({
          ok: false,
          message: response?.message || "Gagal menyimpan nomor resi.",
        });
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === orderId
            ? {
                ...item,
                shipping_tracking_number:
                  response?.data?.shipping_tracking_number || sanitizedTracking,
              }
            : item,
        ),
      );
      setTrackingInput(response?.data?.shipping_tracking_number || sanitizedTracking);
      setFeedback({
        ok: true,
        message: response?.message || "Nomor resi berhasil disimpan.",
      });
    });
  };

  const trackShipment = (orderId) => {
    setTrackingFeedback("");
    setTrackingResult(null);

    startSubmitting(async () => {
      const response = await trackAdminMerchandiseOrderShipmentAction({
        orderId,
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
      <div className='rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 p-4 sm:p-5'>
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-700'>
          Order Admin
        </p>
        <h2 className='mt-1 text-2xl font-semibold text-slate-900'>
          Detail Pesanan
        </h2>
        <p className='mt-2 text-sm text-slate-600'>
          Lihat detail pesanan, update status produksi/pengiriman, dan kelola
          order customer.
        </p>
      </div>

      {feedback.message ? (
        <p
          className={`text-sm ${feedback.ok ? "text-emerald-700" : "text-rose-700"}`}
        >
          {feedback.message}
        </p>
      ) : null}

      <div className='grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]'>
        <article className='rounded-xl border border-slate-200 bg-white'>
          <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3'>
            <p className='text-sm font-semibold text-slate-900'>
              Daftar Order ({items.length})
            </p>
            <FiRefreshCw
              className={`h-4 w-4 text-slate-500 cursor-pointer ${isSubmitting ? "animate-spin" : ""}`}
            />
          </div>

          <div className='max-h-[70vh] space-y-2 overflow-y-auto p-3'>
            {items.length === 0 ? (
              <p className='rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500'>
                Belum ada order.
              </p>
            ) : (
              items.map((item) => {
                const active = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => selectOrder(item)}
                    className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                      active
                        ? "border-blue-200 bg-blue-50 ring-1 ring-blue-100"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className='text-sm font-semibold text-slate-900'>
                      {item.order_code}
                    </p>
                    <p className='mt-1 line-clamp-1 text-xs text-slate-600'>
                      {item.merchandise_title || "-"}
                    </p>
                    <div className='mt-2 flex flex-wrap items-center gap-2 text-xs'>
                      <span
                        className={`rounded-full px-2 py-1 font-semibold ${statusBadgeClass(item.order_status)}`}
                      >
                        {statusLabel(item.order_status)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 font-semibold ${statusBadgeClass(item.payment_status)}`}
                      >
                        payment: {statusLabel(item.payment_status)}
                      </span>
                    </div>
                    <p className='mt-2 text-xs text-slate-500'>
                      {formatDateTime(item.created_at)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </article>

        <article className='rounded-xl border border-slate-200 bg-white p-4 sm:p-5'>
          {!selectedOrder ? (
            <p className='text-sm text-slate-500'>
              Pilih order dari panel kiri untuk melihat detail.
            </p>
          ) : (
            <div className='space-y-5'>
              <div className='flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Kode Order
                  </p>
                  <h3 className='mt-1 text-lg font-semibold text-slate-900'>
                    {selectedOrder.order_code}
                  </h3>
                  <p className='mt-1 text-sm text-slate-600'>
                    {selectedOrder.merchandise_title || "-"}
                  </p>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(selectedOrder.order_status)}`}
                  >
                    order: {statusLabel(selectedOrder.order_status)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(selectedOrder.payment_status)}`}
                  >
                    payment: {statusLabel(selectedOrder.payment_status)}
                  </span>
                </div>
              </div>

              <section className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm'>
                  <p className='mb-2 flex items-center gap-2 font-semibold text-slate-900'>
                    <FiPackage className='h-4 w-4' />
                    Detail Pesanan
                  </p>
                  <p className='text-slate-700'>
                    Qty: {selectedOrder.quantity} pcs
                  </p>
                  <p className='text-slate-700'>
                    Unit price: {formatMoney(selectedOrder.unit_price)}
                  </p>
                  <p className='text-slate-700'>
                    Subtotal: {formatMoney(selectedOrder.subtotal_amount)}
                  </p>
                  <p className='text-slate-700'>
                    Ongkir: {formatMoney(selectedOrder.shipping_cost_amount)}
                  </p>
                  <p className='mt-1 font-semibold text-blue-900'>
                    Grand total: {formatMoney(selectedOrder.grand_total_amount)}
                  </p>
                </div>

                <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm'>
                  <p className='mb-2 flex items-center gap-2 font-semibold text-slate-900'>
                    <FiCreditCard className='h-4 w-4' />
                    Pembayaran
                  </p>
                  <p className='text-slate-700'>
                    Status: {statusLabel(selectedOrder.payment_status)}
                  </p>
                  <p className='text-slate-700'>
                    Reference: {selectedOrder.payment_reference || "-"}
                  </p>
                  <p className='text-slate-700'>
                    Due: {formatDateTime(selectedOrder.payment_due_at)}
                  </p>
                  <p className='text-slate-700'>
                    Created: {formatDateTime(selectedOrder.created_at)}
                  </p>
                  <p className='text-slate-700'>
                    Updated: {formatDateTime(selectedOrder.updated_at)}
                  </p>
                </div>
              </section>

              <section className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm'>
                <p className='mb-2 flex items-center gap-2 font-semibold text-slate-900'>
                  <FiMail className='h-4 w-4' />
                  Data Pemesan
                </p>
                <p className='text-slate-700'>{selectedOrder.customer_name}</p>
                <p className='text-slate-700'>{selectedOrder.customer_email}</p>
                <p className='flex items-center gap-2 text-slate-700'>
                  <FiPhone className='h-4 w-4' />
                  {selectedOrder.customer_whatsapp || "-"}
                </p>
              </section>

              <section className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm'>
                <p className='mb-2 flex items-center gap-2 font-semibold text-slate-900'>
                  <FiMapPin className='h-4 w-4' />
                  Alamat Pengiriman
                </p>
                <p className='text-slate-700'>
                  {selectedOrder.shipping_address || "-"},{" "}
                  {selectedOrder.shipping_subdistrict_name || "-"},{" "}
                  {selectedOrder.shipping_district_name || "-"},{" "}
                  {selectedOrder.shipping_city_name || "-"},{" "}
                  {selectedOrder.shipping_province_name || "-"}{" "}
                  {selectedOrder.shipping_postal_code || ""}
                </p>
                <p className='mt-1 text-slate-700'>
                  Kurir:{" "}
                  {selectedOrder.shipping_courier_name ||
                    selectedOrder.shipping_courier_code ||
                    "-"}{" "}
                  -{" "}
                  {selectedOrder.shipping_service_name ||
                    selectedOrder.shipping_service_code ||
                    "-"}
                  {selectedOrder.shipping_etd
                    ? ` (ETD ${selectedOrder.shipping_etd})`
                    : ""}
                </p>
                <p className='mt-1 text-slate-700'>
                  Resi: {selectedOrder.shipping_tracking_number || "-"}
                </p>
              </section>

              <section className='rounded-lg border border-slate-200 bg-white p-3'>
                <p className='mb-3 text-sm font-semibold text-slate-900'>
                  Aksi Admin
                </p>
                <div className='mb-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]'>
                  <input
                    type='text'
                    value={trackingInput}
                    onChange={(event) => setTrackingInput(event.target.value)}
                    placeholder='Input nomor AWB / resi'
                    className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-400'
                  />
                  <button
                    type='button'
                    onClick={() => saveTrackingNumber(selectedOrder.id)}
                    disabled={isSubmitting}
                    className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100 disabled:opacity-70'
                  >
                    Simpan Resi
                  </button>
                </div>
                <div className='mb-3'>
                  <button
                    type='button'
                    onClick={() => trackShipment(selectedOrder.id)}
                    disabled={isSubmitting || !selectedOrder.shipping_tracking_number}
                    className='inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {isSubmitting ? "Memuat pelacakan..." : "Lacak Resi"}
                  </button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <button
                    type='button'
                    onClick={() => applyStatus(selectedOrder.id, "diproses")}
                    disabled={isSubmitting}
                    className='inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-70'
                  >
                    <FiClock className='h-4 w-4' />
                    Diproses
                  </button>
                  <button
                    type='button'
                    onClick={() => applyStatus(selectedOrder.id, "dikirim")}
                    disabled={isSubmitting}
                    className='inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-70'
                  >
                    <FiTruck className='h-4 w-4' />
                    Dikirim
                  </button>
                  <button
                    type='button'
                    onClick={() => applyStatus(selectedOrder.id, "selesai")}
                    disabled={isSubmitting}
                    className='inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-70'
                  >
                    <FiCheckCircle className='h-4 w-4' />
                    Selesai
                  </button>
                  <button
                    type='button'
                    onClick={() => deleteOrder(selectedOrder.id)}
                    disabled={isSubmitting}
                    className='ml-auto inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-70'
                  >
                    <FiTrash2 className='h-4 w-4' />
                    Hapus Pesanan
                  </button>
                </div>
              </section>

              {trackingFeedback ? (
                <section className='rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700'>
                  {trackingFeedback}
                </section>
              ) : null}

              {trackingResult ? (
                <section className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm'>
                  <p className='mb-2 font-semibold text-slate-900'>Tracking Pengiriman</p>
                  <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                    <p className='min-w-0 break-words text-slate-700 [overflow-wrap:anywhere]'>
                      <span className='font-semibold text-slate-900'>Kurir:</span>{" "}
                      {trackingResult.summary?.courierName ||
                        trackingResult.courierName ||
                        selectedOrder.shipping_courier_name ||
                        "-"}
                    </p>
                    <p className='min-w-0 break-words text-slate-700 [overflow-wrap:anywhere]'>
                      <span className='font-semibold text-slate-900'>AWB:</span>{" "}
                      {trackingResult.summary?.waybillNumber ||
                        trackingResult.awbNumber ||
                        selectedOrder.shipping_tracking_number ||
                        "-"}
                    </p>
                    <p className='min-w-0 break-words text-slate-700 [overflow-wrap:anywhere]'>
                      <span className='font-semibold text-slate-900'>Status:</span>{" "}
                      {trackingResult.deliveryStatus?.status ||
                        trackingResult.summary?.status ||
                        "-"}
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
                </section>
              ) : null}

              {selectedOrder.notes ? (
                <section className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm'>
                  <p className='mb-1 font-semibold text-slate-900'>Notes</p>
                  <div className='space-y-2'>
                    {parseNotesLines(selectedOrder.notes).map(
                      (entry, index) => {
                        if (entry.type === "json") {
                          const value = entry.value;
                          return (
                            <div
                              key={`${index}-json`}
                              className='rounded-md border border-slate-200 bg-white p-2'
                            >
                              <div className='grid grid-cols-1 gap-1 text-xs sm:grid-cols-2'>
                                {Object.entries(value).map(
                                  ([key, itemValue]) => (
                                    <p
                                      key={`${index}-${key}`}
                                      className='min-w-0 break-words [overflow-wrap:anywhere] text-slate-700'
                                    >
                                      <span className='font-semibold text-slate-900'>
                                        {key}:
                                      </span>{" "}
                                      <span className='break-words [overflow-wrap:anywhere]'>
                                        {String(itemValue ?? "-")}
                                      </span>
                                    </p>
                                  ),
                                )}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <p
                            key={`${index}-text`}
                            className='whitespace-pre-wrap text-slate-700'
                          >
                            {entry.value}
                          </p>
                        );
                      },
                    )}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
