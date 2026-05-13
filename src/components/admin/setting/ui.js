import { useFormStatus } from "react-dom";
import { FiCheckCircle, FiSave, FiXCircle } from "react-icons/fi";

export const INITIAL_STATE = { ok: false, message: "" };

export function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function StatusBadge({ active, trueLabel = "Aktif", falseLabel = "Nonaktif" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
      }`}
    >
      {active ? <FiCheckCircle className='h-3.5 w-3.5' /> : <FiXCircle className='h-3.5 w-3.5' />}
      {active ? trueLabel : falseLabel}
    </span>
  );
}

export function SubmitButton({ label = "Simpan Perubahan" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70'
    >
      <FiSave className='h-4 w-4' />
      {pending ? "Menyimpan..." : label}
    </button>
  );
}

export function FormFeedback({ state }) {
  if (!state?.message) return null;

  if (state.ok) {
    return (
      <p className='inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700'>
        <FiCheckCircle className='h-4 w-4' />
        {state.message}
      </p>
    );
  }

  return (
    <p className='inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700'>
      <FiXCircle className='h-4 w-4' />
      {state.message}
    </p>
  );
}

export function Input({
  label,
  name,
  defaultValue = "",
  required = false,
  type = "text",
  placeholder = "",
  ...inputProps
}) {
  return (
    <label className='block space-y-1'>
      <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        {...inputProps}
        className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 transition focus:border-blue-400 focus:ring'
      />
    </label>
  );
}

export function Textarea({
  label,
  name,
  defaultValue = "",
  required = false,
  rows = 3,
  placeholder = "",
}) {
  return (
    <label className='block space-y-1'>
      <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 transition focus:border-blue-400 focus:ring'
      />
    </label>
  );
}

export function Checkbox({ label, name, defaultChecked = false }) {
  return (
    <label className='inline-flex items-center gap-2 text-sm font-medium text-slate-700'>
      <input
        type='checkbox'
        name={name}
        defaultChecked={defaultChecked}
        className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
      />
      {label}
    </label>
  );
}
