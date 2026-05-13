"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { calculateOrderShippingAction, fetchOrderRajaOngkirLocationsAction } from "@/actions/shipping";
import { createMerchandiseOrderCheckoutAction, findCustomerLastShippingAddressAction } from "@/actions/order";

const Select = dynamic(() => import("react-select"), {
  ssr: false,
});

const SELECT_STYLES = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 8,
    borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
    "&:hover": { borderColor: state.isFocused ? "#3b82f6" : "#94a3b8" },
    fontSize: 14,
  }),
  menu: (base) => ({ ...base, zIndex: 30 }),
};

function formatMoney(value, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function toPositiveInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function sortLocationOptions(options) {
  return [...(Array.isArray(options) ? options : [])].sort((left, right) =>
    String(left?.label || "").localeCompare(String(right?.label || ""), "id-ID", {
      sensitivity: "base",
    }),
  );
}

const INITIAL_FORM = {
  customerName: "",
  customerEmail: "",
  customerWhatsapp: "",
  shippingAddress: "",
  shippingPostalCode: "",
};

export default function MerchandiseOrderForm({ product }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [quantity, setQuantity] = useState(product.min_order);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShippingId, setSelectedShippingId] = useState("");
  const [feedback, setFeedback] = useState({ ok: false, message: "" });
  const [addressHint, setAddressHint] = useState("");
  const [shippingHint, setShippingHint] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isReadyToPay, setIsReadyToPay] = useState(false);

  const [isLoadingProvince, startLoadingProvince] = useTransition();
  const [isLoadingCity, startLoadingCity] = useTransition();
  const [isLoadingDistrict, startLoadingDistrict] = useTransition();
  const [isLoadingSubdistrict, startLoadingSubdistrict] = useTransition();
  const [isCalculatingShipping, startCalculatingShipping] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();
  const [isCheckingCustomer, startCheckingCustomer] = useTransition();

  const unitWeightGram = Number(product.weight_gram || 0);
  const weightGram = unitWeightGram * quantity;
  const subtotal = useMemo(() => Number(product.price_amount || 0) * quantity, [product.price_amount, quantity]);
  const selectedShipping = useMemo(
    () => shippingOptions.find((item) => item.id === selectedShippingId) || null,
    [shippingOptions, selectedShippingId],
  );
  const shippingSelectOptions = useMemo(
    () => shippingOptions.map((item) => ({ value: item.id, label: item.label })),
    [shippingOptions],
  );
  const selectedShippingOption = useMemo(
    () => shippingSelectOptions.find((item) => item.value === selectedShippingId) || null,
    [shippingSelectOptions, selectedShippingId],
  );
  const shippingCost = Number(selectedShipping?.cost || 0);
  const grandTotal = subtotal + shippingCost;

  const onChangeForm = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const findOption = (options, targetId, targetLabel) => {
    if (!Array.isArray(options) || options.length === 0) return null;
    if (targetId > 0) {
      const byId = options.find((item) => item.value === targetId);
      if (byId) return byId;
    }
    if (targetLabel) {
      const normalized = targetLabel.trim().toLowerCase();
      const byLabel = options.find((item) => String(item.label || "").trim().toLowerCase() === normalized);
      if (byLabel) return byLabel;
    }
    return null;
  };

  const applyAddressFromHistory = async (history) => {
    const provinceResponse = await fetchOrderRajaOngkirLocationsAction({ level: "province" });
    if (!provinceResponse?.ok) {
      setFeedback({ ok: false, message: provinceResponse?.message || "Gagal memuat provinsi." });
      return false;
    }
    const provinces = sortLocationOptions(provinceResponse.options || []);
    setProvinceOptions(provinces);

    const nextProvince = findOption(provinces, toPositiveInt(history?.provinceId), history?.provinceName);
    if (!nextProvince) {
      setFeedback({ ok: false, message: "Alamat lama ditemukan, tetapi provinsi tidak tersedia." });
      return false;
    }
    setSelectedProvince(nextProvince);

    const cityResponse = await fetchOrderRajaOngkirLocationsAction({
      level: "city",
      parentId: nextProvince.value,
    });
    if (!cityResponse?.ok) {
      setFeedback({ ok: false, message: cityResponse?.message || "Gagal memuat kota/kabupaten." });
      return false;
    }
    const cities = sortLocationOptions(cityResponse.options || []);
    setCityOptions(cities);
    const nextCity = findOption(cities, toPositiveInt(history?.cityId), history?.cityName);
    if (!nextCity) {
      setFeedback({ ok: false, message: "Alamat lama ditemukan, tetapi kota/kabupaten tidak tersedia." });
      return false;
    }
    setSelectedCity(nextCity);

    const districtResponse = await fetchOrderRajaOngkirLocationsAction({
      level: "district",
      parentId: nextCity.value,
    });
    if (!districtResponse?.ok) {
      setFeedback({ ok: false, message: districtResponse?.message || "Gagal memuat kecamatan." });
      return false;
    }
    const districts = sortLocationOptions(districtResponse.options || []);
    setDistrictOptions(districts);
    const nextDistrict = findOption(districts, toPositiveInt(history?.districtId), history?.districtName);
    if (!nextDistrict) {
      setFeedback({ ok: false, message: "Alamat lama ditemukan, tetapi kecamatan tidak tersedia." });
      return false;
    }
    setSelectedDistrict(nextDistrict);

    const subdistrictResponse = await fetchOrderRajaOngkirLocationsAction({
      level: "subdistrict",
      parentId: nextDistrict.value,
    });
    if (!subdistrictResponse?.ok) {
      setFeedback({ ok: false, message: subdistrictResponse?.message || "Gagal memuat kelurahan/desa." });
      return false;
    }
    const subdistricts = sortLocationOptions(subdistrictResponse.options || []);
    setSubdistrictOptions(subdistricts);
    const nextSubdistrict = findOption(
      subdistricts,
      toPositiveInt(history?.subdistrictId),
      history?.subdistrictName,
    );
    setSelectedSubdistrict(nextSubdistrict || null);

    setForm((prev) => ({
      ...prev,
      shippingAddress: String(history?.shippingAddress || ""),
      shippingPostalCode: String(history?.shippingPostalCode || ""),
    }));

    setShippingOptions([]);
    setSelectedShippingId("");
    return true;
  };

  const loadProvinces = () => {
    startLoadingProvince(async () => {
      const response = await fetchOrderRajaOngkirLocationsAction({ level: "province" });
      if (!response?.ok) {
        setFeedback({ ok: false, message: response?.message || "Gagal memuat provinsi." });
        return;
      }
      setProvinceOptions(sortLocationOptions(response.options || []));
    });
  };

  useEffect(() => {
    startLoadingProvince(async () => {
      const response = await fetchOrderRajaOngkirLocationsAction({ level: "province" });
      if (!response?.ok) {
        setFeedback({ ok: false, message: response?.message || "Gagal memuat provinsi." });
        return;
      }
      setProvinceOptions(sortLocationOptions(response.options || []));
    });
  }, [startLoadingProvince]);

  useEffect(() => {
    setSelectedShippingId("");
    setShippingOptions([]);
    setShippingHint("");
  }, [quantity]);

  useEffect(() => {
    if (!selectedSubdistrict?.value) return;
    if (!selectedDistrict?.value) return;
    if (weightGram <= 0) return;
    onCalculateShipping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubdistrict?.value, selectedDistrict?.value, weightGram]);

  const onChangeProvince = (selectedOption) => {
    const selected = selectedOption || null;
    setSelectedProvince(selected);
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedSubdistrict(null);
    setCityOptions([]);
    setDistrictOptions([]);
    setSubdistrictOptions([]);
    setShippingOptions([]);
    setSelectedShippingId("");
    setShippingHint("");

    if (!selected) return;

    startLoadingCity(async () => {
      const response = await fetchOrderRajaOngkirLocationsAction({
        level: "city",
        parentId: selected.value,
      });
      if (!response?.ok) {
        setFeedback({ ok: false, message: response?.message || "Gagal memuat kota/kabupaten." });
        return;
      }
      setCityOptions(sortLocationOptions(response.options || []));
    });
  };

  const onChangeCity = (selectedOption) => {
    const selected = selectedOption || null;
    setSelectedCity(selected);
    setSelectedDistrict(null);
    setSelectedSubdistrict(null);
    setDistrictOptions([]);
    setSubdistrictOptions([]);
    setShippingOptions([]);
    setSelectedShippingId("");
    setShippingHint("");

    if (!selected) return;

    startLoadingDistrict(async () => {
      const response = await fetchOrderRajaOngkirLocationsAction({
        level: "district",
        parentId: selected.value,
      });
      if (!response?.ok) {
        setFeedback({ ok: false, message: response?.message || "Gagal memuat kecamatan." });
        return;
      }
      setDistrictOptions(sortLocationOptions(response.options || []));
    });
  };

  const onChangeDistrict = (selectedOption) => {
    const selected = selectedOption || null;
    setSelectedDistrict(selected);
    setSelectedSubdistrict(null);
    setSubdistrictOptions([]);
    setShippingOptions([]);
    setSelectedShippingId("");
    setShippingHint("");

    if (!selected) return;

    startLoadingSubdistrict(async () => {
      const response = await fetchOrderRajaOngkirLocationsAction({
        level: "subdistrict",
        parentId: selected.value,
      });
      if (!response?.ok) {
        setFeedback({ ok: false, message: response?.message || "Gagal memuat kelurahan/desa." });
        return;
      }
      setSubdistrictOptions(sortLocationOptions(response.options || []));
    });
  };

  const onChangeSubdistrict = (selectedOption) => {
    const selected = selectedOption || null;
    setSelectedSubdistrict(selected);
    setSelectedShippingId("");
    setShippingOptions([]);
    setShippingHint("");
  };

  const onCalculateShipping = () => {
    setFeedback({ ok: false, message: "" });
    setSelectedShippingId("");
    setShippingOptions([]);
    setShippingHint("");

    if (!selectedDistrict?.value) {
      setFeedback({ ok: false, message: "Pilih kecamatan tujuan terlebih dahulu." });
      return;
    }
    if (weightGram <= 0) {
      setFeedback({
        ok: false,
        message: "Bobot produk belum diatur. Silakan isi bobot merchandise di panel admin terlebih dahulu.",
      });
      return;
    }

    startCalculatingShipping(async () => {
      const response = await calculateOrderShippingAction({
        destinationDistrictId: selectedDistrict.value,
        weightGram,
      });

      if (!response?.ok) {
        const errorMessage = response?.message || "Gagal menghitung ongkir.";
        setFeedback({ ok: false, message: errorMessage });
        setShippingHint(errorMessage);
        return;
      }

      const nextOptions = Array.isArray(response.options) ? response.options : [];
      setShippingOptions(nextOptions);
      setSelectedShippingId(nextOptions[0]?.id || "");
      if (nextOptions.length > 0) {
        setFeedback({ ok: true, message: "Ongkir berhasil dihitung. Pilih layanan pengiriman." });
        setShippingHint("");
      } else {
        setFeedback({ ok: false, message: "Layanan pengiriman tidak ditemukan untuk tujuan ini." });
        setShippingHint("Layanan pengiriman tidak ditemukan untuk tujuan ini.");
      }
    });
  };

  const validateCustomerStep = () => {
    const customerName = String(form.customerName || "").trim();
    const customerEmail = String(form.customerEmail || "").trim().toLowerCase();
    const customerWhatsapp = String(form.customerWhatsapp || "").replace(/[^\d]/g, "");

    if (!customerName) {
      setFeedback({ ok: false, message: "Nama wajib diisi." });
      return false;
    }
    if (!customerEmail || !customerEmail.includes("@")) {
      setFeedback({ ok: false, message: "Email tidak valid." });
      return false;
    }
    if (customerWhatsapp.length < 9) {
      setFeedback({ ok: false, message: "Nomor WhatsApp tidak valid." });
      return false;
    }
    return true;
  };

  const validateOrderStep = () => {
    if (quantity < product.min_order) {
      setFeedback({ ok: false, message: `Minimum order adalah ${product.min_order} pcs.` });
      return false;
    }
    if (!selectedProvince || !selectedCity || !selectedDistrict || !selectedSubdistrict) {
      setFeedback({ ok: false, message: "Lengkapi alamat provinsi hingga desa/kelurahan." });
      return false;
    }
    if (!String(form.shippingAddress || "").trim()) {
      setFeedback({ ok: false, message: "Alamat pengiriman wajib diisi." });
      return false;
    }
    if (!selectedShipping) {
      setFeedback({ ok: false, message: "Silakan hitung ongkir dan pilih layanan pengiriman." });
      return false;
    }
    return true;
  };

  const goToStepTwo = () => {
    setFeedback({ ok: false, message: "" });
    if (!validateCustomerStep()) return;
    setAddressHint("");

    const customerEmail = String(form.customerEmail || "").trim().toLowerCase();
    const customerWhatsapp = String(form.customerWhatsapp || "").replace(/[^\d]/g, "");

    startCheckingCustomer(async () => {
      const response = await findCustomerLastShippingAddressAction({
        customerEmail,
        customerWhatsapp,
      });

      if (!response?.ok) {
        setFeedback({ ok: false, message: response?.message || "Gagal cek data pelanggan." });
        return;
      }

      if (response?.found) {
        const applied = await applyAddressFromHistory(response.data);
        if (applied) {
          setAddressHint("Alamat terakhir terpasang otomatis. Anda bisa mengubahnya di Data Pesanan.");
        }
      } else {
        setAddressHint("Alamat sebelumnya tidak ditemukan. Silakan isi alamat baru di Data Pesanan.");
      }

      setCurrentStep(2);
    });
  };

  const goToStepThree = () => {
    setFeedback({ ok: false, message: "" });
    if (!validateOrderStep()) return;
    setCurrentStep(3);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setFeedback({ ok: false, message: "" });

    if (!validateCustomerStep()) {
      return;
    }
    if (!validateOrderStep()) {
      return;
    }
    if (!isReadyToPay) {
      setFeedback({ ok: false, message: "Konfirmasi kesiapan pembayaran terlebih dahulu." });
      return;
    }

    startSubmitting(async () => {
      const response = await createMerchandiseOrderCheckoutAction({
        merchandiseItemId: product.id,
        quantity,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerWhatsapp: form.customerWhatsapp,
        provinceId: selectedProvince.value,
        provinceName: selectedProvince.label,
        cityId: selectedCity.value,
        cityName: selectedCity.label,
        districtId: selectedDistrict.value,
        districtName: selectedDistrict.label,
        subdistrictId: selectedSubdistrict.value,
        subdistrictName: selectedSubdistrict.label,
        shippingAddress: form.shippingAddress,
        shippingPostalCode: form.shippingPostalCode,
        courierCode: selectedShipping.courier_code,
        courierName: selectedShipping.courier_name,
        serviceCode: selectedShipping.service_code,
        serviceName: selectedShipping.service_name,
        shippingEtd: selectedShipping.etd,
        shippingCost: selectedShipping.cost,
        originUrl: window.location.origin,
      });

      if (!response?.ok) {
        setFeedback({ ok: false, message: response?.message || "Gagal membuat pesanan." });
        return;
      }

      const redirectUrl = String(response?.data?.redirect_url || "").trim();
      if (!redirectUrl) {
        setFeedback({ ok: false, message: "URL redirect Midtrans tidak tersedia." });
        return;
      }

      window.location.href = redirectUrl;
    });
  };

  return (
    <form onSubmit={onSubmit} className='space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'>
      <section className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-700 sm:text-sm'>
        Step {currentStep} dari 3:{" "}
        {currentStep === 1 ? "Data Pemesan" : currentStep === 2 ? "Data Pesanan" : "Konfirmasi Pembayaran"}
      </section>

      {currentStep === 1 ? (
        <section className='space-y-3'>
          <h2 className='text-lg font-semibold text-slate-900'>Form Data Pemesan</h2>
          <div className='grid gap-3 sm:grid-cols-2'>
            <label className='space-y-1 text-sm'>
              <span className='font-medium text-slate-700'>Nama</span>
              <input
                name='customerName'
                value={form.customerName}
                onChange={onChangeForm}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring'
                required
              />
            </label>
            <label className='space-y-1 text-sm'>
              <span className='font-medium text-slate-700'>Email</span>
              <input
                type='email'
                name='customerEmail'
                value={form.customerEmail}
                onChange={onChangeForm}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring'
                required
              />
            </label>
            <label className='space-y-1 text-sm sm:col-span-2'>
              <span className='font-medium text-slate-700'>No. WhatsApp</span>
              <input
                name='customerWhatsapp'
                value={form.customerWhatsapp}
                onChange={onChangeForm}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring'
                placeholder='628xxxxxxxxxx'
                required
              />
            </label>
          </div>
          <div className='flex justify-end'>
            <button
              type='button'
              onClick={goToStepTwo}
              disabled={isCheckingCustomer}
              className='rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800'
            >
              {isCheckingCustomer ? "Mengecek data..." : "Lanjut ke Data Pesanan"}
            </button>
          </div>
        </section>
      ) : null}

      {currentStep === 2 ? (
        <section className='space-y-6'>
          {addressHint ? (
            <p className='rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700'>{addressHint}</p>
          ) : null}
          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-slate-900'>Form Data Pesanan</h2>
            <div className='grid gap-3 sm:grid-cols-1'>
              <label className='space-y-1 text-sm'>
                <span className='font-medium text-slate-700'>Jumlah order (pcs)</span>
                <input
                  type='number'
                  min={product.min_order}
                  value={quantity}
                  onChange={(event) => setQuantity(toPositiveInt(event.target.value, product.min_order))}
                  className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring'
                  required
                />
              </label>
            </div>
            <div className='rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700'>
              <p>Bobot per pcs: {unitWeightGram} gram</p>
              <p className='font-medium text-slate-900'>Total bobot kiriman: {weightGram} gram</p>
            </div>
          </section>

          <section className='space-y-3'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <h3 className='text-base font-semibold text-slate-900'>Alamat Pengiriman</h3>
              <button
                type='button'
                onClick={loadProvinces}
                className='rounded-lg border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-50'
              >
                {isLoadingProvince ? "Memuat..." : "Muat Lokasi RajaOngkir"}
              </button>
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              <label className='space-y-1 text-sm'>
                <span className='font-medium text-slate-700'>Provinsi</span>
                <Select
                  options={provinceOptions}
                  value={selectedProvince}
                  onChange={onChangeProvince}
                  isLoading={isLoadingProvince}
                  isDisabled={provinceOptions.length === 0 || isLoadingProvince}
                  styles={SELECT_STYLES}
                  placeholder='Pilih provinsi'
                />
              </label>
              <label className='space-y-1 text-sm'>
                <span className='font-medium text-slate-700'>Kota/Kabupaten</span>
                <Select
                  options={cityOptions}
                  value={selectedCity}
                  onChange={onChangeCity}
                  isLoading={isLoadingCity}
                  isDisabled={!selectedProvince || isLoadingCity}
                  styles={SELECT_STYLES}
                  placeholder='Pilih kota/kabupaten'
                />
              </label>
              <label className='space-y-1 text-sm'>
                <span className='font-medium text-slate-700'>Kecamatan</span>
                <Select
                  options={districtOptions}
                  value={selectedDistrict}
                  onChange={onChangeDistrict}
                  isLoading={isLoadingDistrict}
                  isDisabled={!selectedCity || isLoadingDistrict}
                  styles={SELECT_STYLES}
                  placeholder='Pilih kecamatan'
                />
              </label>
              <label className='space-y-1 text-sm'>
                <span className='font-medium text-slate-700'>Desa/Kelurahan</span>
                <Select
                  options={subdistrictOptions}
                  value={selectedSubdistrict}
                  onChange={onChangeSubdistrict}
                  isLoading={isLoadingSubdistrict}
                  isDisabled={!selectedDistrict || isLoadingSubdistrict}
                  styles={SELECT_STYLES}
                  placeholder='Pilih desa/kelurahan'
                />
              </label>
              <label className='space-y-1 text-sm sm:col-span-2'>
                <span className='font-medium text-slate-700'>Alamat lengkap</span>
                <textarea
                  name='shippingAddress'
                  value={form.shippingAddress}
                  onChange={onChangeForm}
                  rows={3}
                  className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring'
                  required
                />
              </label>
              <label className='space-y-1 text-sm sm:col-span-2'>
                <span className='font-medium text-slate-700'>Kode pos (opsional)</span>
                <input
                  name='shippingPostalCode'
                  value={form.shippingPostalCode}
                  onChange={onChangeForm}
                  className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-blue-200 focus:border-blue-500 focus:ring'
                />
              </label>
            </div>
          </section>

          <section className='space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4'>
            <div className='space-y-2'>
              <p className='text-sm text-slate-700'>
                Ongkir dihitung otomatis setelah memilih desa/kelurahan.
                {isCalculatingShipping ? " Sedang menghitung..." : ""}
              </p>
              {shippingOptions.length > 0 ? (
                <label className='text-sm text-slate-700'>
                  Ekspedisi
                  <div className='mt-1'>
                    <Select
                      options={shippingSelectOptions}
                      value={selectedShippingOption}
                      onChange={(option) => setSelectedShippingId(option?.value || "")}
                      styles={SELECT_STYLES}
                      placeholder='Pilih layanan'
                    />
                  </div>
                </label>
              ) : null}
              {shippingHint ? <p className='text-sm text-rose-700'>{shippingHint}</p> : null}
            </div>
          </section>

          <div className='flex items-center justify-between gap-3'>
            <button
              type='button'
              onClick={() => setCurrentStep(1)}
              className='rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50'
            >
              Kembali
            </button>
            <button
              type='button'
              onClick={goToStepThree}
              className='rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800'
            >
              Lanjut ke Konfirmasi
            </button>
          </div>
        </section>
      ) : null}

      {currentStep === 3 ? (
        <section className='space-y-4'>
          <h2 className='text-lg font-semibold text-slate-900'>Form Konfirmasi Siap Pembayaran</h2>
          <section className='space-y-1 rounded-xl border border-slate-200 bg-white p-4 text-sm'>
            <p className='font-medium text-slate-900'>Ringkasan</p>
            <p className='text-slate-700'>Subtotal produk: {formatMoney(subtotal, product.currency)}</p>
            <p className='text-slate-700'>Ongkir: {formatMoney(shippingCost, product.currency)}</p>
            <p className='text-base font-semibold text-blue-900'>Total: {formatMoney(grandTotal, product.currency)}</p>
          </section>

          <label className='flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800'>
            <input
              type='checkbox'
              checked={isReadyToPay}
              onChange={(event) => setIsReadyToPay(event.target.checked)}
              className='mt-0.5'
            />
            <span>Saya sudah cek data pemesan dan pesanan, dan siap melanjutkan proses pembayaran.</span>
          </label>

          <div className='flex items-center justify-between gap-3'>
            <button
              type='button'
              onClick={() => setCurrentStep(2)}
              className='rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50'
            >
              Kembali
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-70'
            >
              {isSubmitting ? "Mengalihkan ke pembayaran..." : "Lanjut Bayar"}
            </button>
          </div>
        </section>
      ) : null}

      {feedback.message ? (
        <p className={`text-sm ${feedback.ok ? "text-emerald-700" : "text-rose-700"}`}>{feedback.message}</p>
      ) : null}
    </form>
  );
}
