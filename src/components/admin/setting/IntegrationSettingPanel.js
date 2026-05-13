"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { updateApiIntegrationAction } from "@/actions/setting";
import { fetchRajaOngkirLocationsAction } from "@/actions/shipping";
import {
  FormFeedback,
  formatDateTime,
  INITIAL_STATE,
  Input,
  StatusBadge,
  SubmitButton,
} from "./ui";

const Select = dynamic(() => import("react-select"), {
  ssr: false,
});

function getMidtransEndpoint(environment) {
  return environment === "production"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

const SELECT_STYLES = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderRadius: 10,
    borderColor: state.isFocused ? "#60a5fa" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,0.25)" : "none",
    "&:hover": { borderColor: state.isFocused ? "#60a5fa" : "#cbd5e1" },
    fontSize: 14,
  }),
  menu: (base) => ({ ...base, zIndex: 40 }),
};

function mapDefaultOption(id, name) {
  const parsedId = Number.parseInt(String(id || ""), 10);
  const label = String(name || "").trim();
  if (!Number.isInteger(parsedId) || parsedId <= 0 || !label) return null;
  return { value: parsedId, label };
}

const RAJAONGKIR_COURIERS = [
  { code: "jne", label: "JNE" },
  { code: "sap", label: "SAP Express" },
  { code: "idexpress", label: "ID Express" },
  { code: "sicepat", label: "SiCepat" },
];

function mapDefaultCouriers(additionalConfig) {
  const source = additionalConfig?.couriers;
  const defaultState = {
    jne: true,
    sap: true,
    idexpress: true,
    sicepat: true,
  };

  if (Array.isArray(source)) {
    const normalized = source.map((item) => String(item || "").toLowerCase());
    return {
      jne: normalized.includes("jne"),
      sap: normalized.includes("sap"),
      idexpress: normalized.includes("idexpress") || normalized.includes("ide"),
      sicepat: normalized.includes("sicepat"),
    };
  }

  if (source && typeof source === "object") {
    return {
      jne: Boolean(source.jne),
      sap: Boolean(source.sap),
      idexpress: Boolean(source.idexpress) || Boolean(source.ide),
      sicepat: Boolean(source.sicepat),
    };
  }

  return defaultState;
}

async function fetchRajaOngkirOptions({ level, apiKey, parentId = 0 }) {
  const payload = await fetchRajaOngkirLocationsAction({ level, apiKey, parentId });
  if (!payload?.ok) {
    throw new Error(payload?.message || "Gagal mengambil data lokasi RajaOngkir.");
  }
  return Array.isArray(payload.options) ? payload.options : [];
}

function IntegrationItemForm({ item }) {
  const [state, formAction] = useActionState(updateApiIntegrationAction, INITIAL_STATE);
  const isMetaPixel = item.provider === "meta_pixel";
  const isGoogleAds = item.provider === "google_ads";
  const isMidtrans = item.provider === "midtrans";
  const isRajaOngkir = item.provider === "raja_ongkir";
  const [midtransEnvironment, setMidtransEnvironment] = useState(item.environment || "sandbox");
  const [isActiveChecked, setIsActiveChecked] = useState(Boolean(item.is_active));
  const [apiKeyValue, setApiKeyValue] = useState(item.public_key || "");
  const [isLoadingProvince, setIsLoadingProvince] = useState(false);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [isLoadingDistrict, setIsLoadingDistrict] = useState(false);
  const [isLoadingSubdistrict, setIsLoadingSubdistrict] = useState(false);
  const [locationError, setLocationError] = useState("");

  const storeOrigin = item?.additional_config?.store_origin || {};
  const initialProvince = mapDefaultOption(storeOrigin.province_id, storeOrigin.province_name);
  const initialCity = mapDefaultOption(storeOrigin.city_id, storeOrigin.city_name);
  const initialDistrict = mapDefaultOption(storeOrigin.district_id, storeOrigin.district_name);
  const initialSubdistrict = mapDefaultOption(storeOrigin.subdistrict_id, storeOrigin.subdistrict_name);
  const initialCouriers = mapDefaultCouriers(item?.additional_config);

  const [provinceOptions, setProvinceOptions] = useState(initialProvince ? [initialProvince] : []);
  const [cityOptions, setCityOptions] = useState(initialCity ? [initialCity] : []);
  const [districtOptions, setDistrictOptions] = useState(initialDistrict ? [initialDistrict] : []);
  const [subdistrictOptions, setSubdistrictOptions] = useState(
    initialSubdistrict ? [initialSubdistrict] : [],
  );

  const [provinceOption, setProvinceOption] = useState(initialProvince);
  const [cityOption, setCityOption] = useState(initialCity);
  const [districtOption, setDistrictOption] = useState(initialDistrict);
  const [subdistrictOption, setSubdistrictOption] = useState(initialSubdistrict);
  const [couriers, setCouriers] = useState(initialCouriers);

  const showEnvironment = isMidtrans;
  const showRajaOngkirStoreAddress = isRajaOngkir && isActiveChecked;
  const selectedEnvironment = isMidtrans ? midtransEnvironment : item.environment || "sandbox";
  const midtransEndpointUrl = getMidtransEndpoint(selectedEnvironment);
  const normalizedApiKey = useMemo(() => apiKeyValue.trim(), [apiKeyValue]);

  useEffect(() => {
    if (!showRajaOngkirStoreAddress) return;
    if (!normalizedApiKey) return;

    let mounted = true;
    setIsLoadingProvince(true);
    setLocationError("");

    fetchRajaOngkirOptions({ level: "province", apiKey: normalizedApiKey })
      .then((options) => {
        if (!mounted) return;
        setProvinceOptions(options);
      })
      .catch((error) => {
        if (!mounted) return;
        setLocationError(error?.message || "Gagal memuat provinsi.");
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoadingProvince(false);
      });

    return () => {
      mounted = false;
    };
  }, [showRajaOngkirStoreAddress, normalizedApiKey]);

  useEffect(() => {
    if (!showRajaOngkirStoreAddress) return;
    if (!normalizedApiKey) return;
    if (!provinceOption?.value) return;

    let mounted = true;
    setIsLoadingCity(true);
    setLocationError("");

    fetchRajaOngkirOptions({
      level: "city",
      apiKey: normalizedApiKey,
      parentId: provinceOption.value,
    })
      .then((options) => {
        if (!mounted) return;
        setCityOptions(options);
      })
      .catch((error) => {
        if (!mounted) return;
        setLocationError(error?.message || "Gagal memuat kota/kabupaten.");
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoadingCity(false);
      });

    return () => {
      mounted = false;
    };
  }, [showRajaOngkirStoreAddress, normalizedApiKey, provinceOption?.value]);

  useEffect(() => {
    if (!showRajaOngkirStoreAddress) return;
    if (!normalizedApiKey) return;
    if (!cityOption?.value) return;

    let mounted = true;
    setIsLoadingDistrict(true);
    setLocationError("");

    fetchRajaOngkirOptions({
      level: "district",
      apiKey: normalizedApiKey,
      parentId: cityOption.value,
    })
      .then((options) => {
        if (!mounted) return;
        setDistrictOptions(options);
      })
      .catch((error) => {
        if (!mounted) return;
        setLocationError(error?.message || "Gagal memuat kecamatan.");
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoadingDistrict(false);
      });

    return () => {
      mounted = false;
    };
  }, [showRajaOngkirStoreAddress, normalizedApiKey, cityOption?.value]);

  useEffect(() => {
    if (!showRajaOngkirStoreAddress) return;
    if (!normalizedApiKey) return;
    if (!districtOption?.value) return;

    let mounted = true;
    setIsLoadingSubdistrict(true);
    setLocationError("");

    fetchRajaOngkirOptions({
      level: "subdistrict",
      apiKey: normalizedApiKey,
      parentId: districtOption.value,
    })
      .then((options) => {
        if (!mounted) return;
        setSubdistrictOptions(options);
      })
      .catch((error) => {
        if (!mounted) return;
        setLocationError(error?.message || "Gagal memuat kelurahan.");
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoadingSubdistrict(false);
      });

    return () => {
      mounted = false;
    };
  }, [showRajaOngkirStoreAddress, normalizedApiKey, districtOption?.value]);

  return (
    <form action={formAction} className='space-y-3 rounded-xl border border-slate-200 bg-white p-4'>
      <input type='hidden' name='id' value={item.id} />
      <input type='hidden' name='provider' value={item.provider} />

      <div className='flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3'>
        <div>
          <p className='text-base font-semibold text-slate-900'>{item.provider}</p>
          <p className='text-xs text-slate-500'>Updated: {formatDateTime(item.updated_at)}</p>
        </div>
        <StatusBadge active={item.is_active} />
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <Input label='Display Name' name='display_name' defaultValue={item.display_name} required />
        {showEnvironment ? (
          <label className='block space-y-1'>
            <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Environment</span>
            <select
              name='environment'
              value={selectedEnvironment}
              onChange={(event) => setMidtransEnvironment(event.target.value)}
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 transition focus:border-blue-400 focus:ring'
            >
              <option value='sandbox'>sandbox</option>
              <option value='production'>production</option>
            </select>
          </label>
        ) : (
          <input type='hidden' name='environment' value={item.environment || "sandbox"} />
        )}

        {(isMetaPixel || isGoogleAds || isRajaOngkir || isMidtrans) && (
          <Input
            label={isMetaPixel ? "Pixel ID" : "API Key"}
            name='public_key'
            defaultValue={item.public_key}
            required
            onChange={(event) => setApiKeyValue(event.target.value)}
          />
        )}

        {isMidtrans && (
          <>
            <Input label='Secret Key' name='secret_key' defaultValue={item.secret_key} required />
            <Input label='Merchant ID' name='merchant_id' defaultValue={item.merchant_id} required />
            <input type='hidden' name='endpoint_url' value={midtransEndpointUrl} />
            <div className='rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 lg:col-span-2'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Endpoint URL</p>
              <p className='mt-1 break-all text-sm text-slate-700'>{midtransEndpointUrl}</p>
              <p className='mt-1 text-xs text-slate-500'>Otomatis mengikuti environment Midtrans.</p>
            </div>
          </>
        )}

        {isMetaPixel && (
          <>
            <Input
              label='Access Token (CAPI)'
              name='secret_key'
              defaultValue={item.secret_key}
              placeholder='EAAG...'
            />
            <Input
              label='Test Event Code (Opsional)'
              name='meta_test_event_code'
              defaultValue={item?.additional_config?.test_event_code || ""}
              placeholder='TEST12345'
            />
            <input type='hidden' name='merchant_id' value='' />
            <input type='hidden' name='endpoint_url' value='' />
          </>
        )}
      </div>
      {showRajaOngkirStoreAddress ? (
        <div className='space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3'>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Alamat toko origin</p>
          <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
            <label className='block space-y-1'>
              <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Provinsi</span>
              <Select
                options={provinceOptions}
                value={provinceOption}
                isLoading={isLoadingProvince}
                isDisabled={!normalizedApiKey}
                onChange={(option) => {
                  setProvinceOption(option);
                  setCityOption(null);
                  setDistrictOption(null);
                  setSubdistrictOption(null);
                  setCityOptions([]);
                  setDistrictOptions([]);
                  setSubdistrictOptions([]);
                }}
                styles={SELECT_STYLES}
                placeholder='Pilih provinsi...'
              />
            </label>
            <label className='block space-y-1'>
              <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Kota/Kabupaten</span>
              <Select
                options={cityOptions}
                value={cityOption}
                isLoading={isLoadingCity}
                isDisabled={!provinceOption}
                onChange={(option) => {
                  setCityOption(option);
                  setDistrictOption(null);
                  setSubdistrictOption(null);
                  setDistrictOptions([]);
                  setSubdistrictOptions([]);
                }}
                styles={SELECT_STYLES}
                placeholder='Pilih kota/kabupaten...'
              />
            </label>
            <label className='block space-y-1'>
              <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Kecamatan</span>
              <Select
                options={districtOptions}
                value={districtOption}
                isLoading={isLoadingDistrict}
                isDisabled={!cityOption}
                onChange={(option) => {
                  setDistrictOption(option);
                  setSubdistrictOption(null);
                  setSubdistrictOptions([]);
                }}
                styles={SELECT_STYLES}
                placeholder='Pilih kecamatan...'
              />
            </label>
            <label className='block space-y-1'>
              <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Kelurahan</span>
              <Select
                options={subdistrictOptions}
                value={subdistrictOption}
                isLoading={isLoadingSubdistrict}
                isDisabled={!districtOption}
                onChange={(option) => setSubdistrictOption(option)}
                styles={SELECT_STYLES}
                placeholder='Pilih kelurahan...'
              />
            </label>
          </div>

          {!normalizedApiKey ? (
            <p className='text-xs text-amber-700'>
              Isi API key RajaOngkir terlebih dahulu untuk memuat pilihan lokasi.
            </p>
          ) : null}

          {locationError ? <p className='text-xs text-rose-600'>{locationError}</p> : null}
        </div>
      ) : null}

      {isRajaOngkir ? (
        <div className='space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3'>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Courier aktif</p>
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
            {RAJAONGKIR_COURIERS.map((courier) => (
              <label
                key={courier.code}
                className='inline-flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700'
              >
                <span>{courier.label}</span>
                <input
                  type='checkbox'
                  checked={Boolean(couriers[courier.code])}
                  onChange={(event) =>
                    setCouriers((prev) => ({
                      ...prev,
                      [courier.code]: event.target.checked,
                    }))
                  }
                  className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
                />
              </label>
            ))}
          </div>
          <p className='text-xs text-slate-500'>
            Pilih courier yang diaktifkan untuk RajaOngkir (JNE, SAP, ID Express, SiCepat).
          </p>
        </div>
      ) : null}

      {!isMidtrans && !isMetaPixel && (
        <>
          <input type='hidden' name='secret_key' value='' />
          <input type='hidden' name='merchant_id' value='' />
          <input type='hidden' name='endpoint_url' value='' />
        </>
      )}

      {!isMetaPixel && <input type='hidden' name='meta_test_event_code' value='' />}

      {!isRajaOngkir && (
        <>
          <input type='hidden' name='store_province_id' value='' />
          <input type='hidden' name='store_province_name' value='' />
          <input type='hidden' name='store_city_id' value='' />
          <input type='hidden' name='store_city_name' value='' />
          <input type='hidden' name='store_district_id' value='' />
          <input type='hidden' name='store_district_name' value='' />
          <input type='hidden' name='store_subdistrict_id' value='' />
          <input type='hidden' name='store_subdistrict_name' value='' />
        </>
      )}

      {isRajaOngkir && (
        <>
          <input type='hidden' name='store_province_id' value={provinceOption?.value || ""} />
          <input type='hidden' name='store_province_name' value={provinceOption?.label || ""} />
          <input type='hidden' name='store_city_id' value={cityOption?.value || ""} />
          <input type='hidden' name='store_city_name' value={cityOption?.label || ""} />
          <input type='hidden' name='store_district_id' value={districtOption?.value || ""} />
          <input type='hidden' name='store_district_name' value={districtOption?.label || ""} />
          <input type='hidden' name='store_subdistrict_id' value={subdistrictOption?.value || ""} />
          <input type='hidden' name='store_subdistrict_name' value={subdistrictOption?.label || ""} />
          <input type='hidden' name='courier_jne' value={couriers.jne ? "1" : "0"} />
          <input type='hidden' name='courier_sap' value={couriers.sap ? "1" : "0"} />
          <input type='hidden' name='courier_idexpress' value={couriers.idexpress ? "1" : "0"} />
          <input type='hidden' name='courier_sicepat' value={couriers.sicepat ? "1" : "0"} />
        </>
      )}

      <div className='flex flex-wrap items-center gap-4'>
        <label className='inline-flex items-center gap-2 text-sm font-medium text-slate-700'>
          <input
            type='checkbox'
            name='is_active'
            checked={isActiveChecked}
            onChange={(event) => setIsActiveChecked(event.target.checked)}
            className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
          />
          Aktifkan Integrasi
        </label>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <SubmitButton />
        <FormFeedback state={state} />
      </div>
    </form>
  );
}

export default function IntegrationSettingPanel({ items }) {
  return (
    <section className='space-y-4'>
      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <h3 className='text-base font-semibold text-slate-900'>API Integrations ({items.length})</h3>
        <p className='text-sm text-slate-500'>Edit data `settings.api_integrations` per provider.</p>
      </div>

      {items.length === 0 ? (
        <div className='rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500'>
          Belum ada konfigurasi integrasi API.
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
          {items.map((item) => (
            <IntegrationItemForm key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
