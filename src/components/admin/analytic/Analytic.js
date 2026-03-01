import { deleteAdminLeadAction } from "@/actions/analytics";
import Link from "next/link";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "new") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (normalized === "contacted") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (normalized === "closed") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function toWhatsAppHref(phone) {
  const digits = String(phone || "").replace(/[^\d]/g, "");
  if (!digits) return null;

  if (digits.startsWith("0")) {
    return `https://wa.me/62${digits.slice(1)}`;
  }

  return `https://wa.me/${digits}`;
}

function StatCard({ title, value, helper }) {
  return (
    <article className='rounded-xl border border-slate-200 bg-white p-4'>
      <p className='text-sm font-medium text-slate-600'>{title}</p>
      <p className='mt-2 text-3xl font-semibold text-slate-900'>{value}</p>
      {helper ? <p className='mt-1 text-xs text-slate-500'>{helper}</p> : null}
    </article>
  );
}

export default function Analytic({ data }) {
  const stats = data?.stats || {};
  const leads = Array.isArray(data?.leads) ? data.leads : [];
  const visitEvents = Array.isArray(data?.visitEvents) ? data.visitEvents : [];
  const leadByStatus = Array.isArray(data?.leadByStatus) ? data.leadByStatus : [];
  const topRoutes = Array.isArray(data?.topRoutes) ? data.topRoutes : [];
  const leadPagination = data?.leadPagination || {};

  return (
    <div className='space-y-5'>
      <section className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        <StatCard
          title='Visitor Sessions'
          value={stats.visitorSessionsTotal ?? 0}
          helper={`${stats.visitorSessionsToday ?? 0} hari ini`}
        />
        <StatCard
          title='Visit Events'
          value={stats.visitEventsTotal ?? 0}
          helper={`${stats.visitEventsToday ?? 0} hari ini`}
        />
        <StatCard title='Leads' value={stats.leadsTotal ?? 0} helper={`${stats.leadsToday ?? 0} hari ini`} />
      </section>

      <section className='grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]'>
        <article className='rounded-xl border border-slate-200 bg-white p-4'>
          <h2 className='mb-3 text-base font-semibold text-slate-900'>Traffic Teratas per Route</h2>
          <div className='space-y-2'>
            {topRoutes.length === 0 ? (
              <p className='text-sm text-slate-500'>Belum ada data traffic.</p>
            ) : (
              topRoutes.map((item) => (
                <div
                  key={item.route_path}
                  className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'
                >
                  <p className='truncate pr-4 text-sm font-medium text-slate-800'>{item.route_path}</p>
                  <span className='rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700'>
                    {item.total}
                  </span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className='rounded-xl border border-slate-200 bg-white p-4'>
          <h2 className='mb-3 text-base font-semibold text-slate-900'>Lead by Status</h2>
          <div className='space-y-2'>
            {leadByStatus.length === 0 ? (
              <p className='text-sm text-slate-500'>Belum ada data lead.</p>
            ) : (
              leadByStatus.map((item) => (
                <div
                  key={item.status}
                  className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'
                >
                  <span className='text-sm font-medium capitalize text-slate-800'>{item.status}</span>
                  <span className='rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700'>
                    {item.total}
                  </span>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h2 className='mb-3 text-base font-semibold text-slate-900'>Event Kunjungan Terbanyak (Top 10)</h2>
        <div className='space-y-2'>
          {visitEvents.length === 0 ? (
            <p className='text-sm text-slate-500'>Belum ada event kunjungan.</p>
          ) : (
            visitEvents.map((event, index) => (
              <div
                key={`${event.page_type}-${event.route_path}-${index}`}
                className='rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold text-slate-900'>
                      {index + 1}. {event.route_path || "-"}
                    </p>
                    <p className='text-xs capitalize text-slate-500'>{event.page_type || "-"}</p>
                  </div>
                  <span className='rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700'>
                    {event.total || 0}x
                  </span>
                </div>
                <p className='mt-1 text-xs text-slate-500'>Terakhir: {formatDate(event.last_occurred_at)}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className='rounded-xl border border-slate-200 bg-white p-4'>
        <h2 className='mb-3 text-base font-semibold text-slate-900'>Lead Masuk</h2>
        <div className='space-y-3'>
          {leads.length === 0 ? (
            <p className='text-sm text-slate-500'>Belum ada data lead.</p>
          ) : (
            leads.map((lead) => (
              <article key={lead.id} className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-slate-900'>{lead.name || "-"}</p>
                    <p className='text-xs text-slate-500'>{formatDate(lead.created_at)}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusClass(lead.status)}`}
                  >
                    {lead.status || "-"}
                  </span>
                </div>

                <div className='mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-2'>
                  <p className='break-all'>Email: {lead.email || "-"}</p>
                  <p>
                    Phone:{" "}
                    {toWhatsAppHref(lead.phone) ? (
                      <a
                        href={toWhatsAppHref(lead.phone)}
                        target='_blank'
                        rel='noreferrer'
                        className='font-medium text-emerald-700 underline decoration-emerald-400 underline-offset-2'
                      >
                        {lead.phone}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                  <p className='capitalize'>Channel: {lead.channel || "-"}</p>
                  <p className='break-all'>Source: {lead.source_page || "-"}</p>
                  <p>City: {lead.city_name || "-"}</p>
                  <p>IP: {lead.real_ip || "-"}</p>
                </div>

                <div className='mt-3'>
                  <form action={deleteAdminLeadAction}>
                    <input type='hidden' name='lead_id' value={lead.id} />
                    <button
                      type='submit'
                      className='rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700'
                    >
                      Hapus
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>

        <div className='mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4'>
          <p className='text-xs text-slate-500'>
            Halaman {leadPagination.page || 1} dari {leadPagination.totalPages || 1} | Total {leadPagination.total || 0} lead
          </p>
          <div className='flex items-center gap-2'>
            {leadPagination.hasPrev ? (
              <Link
                href={`/admin/analytic?page=${Math.max((leadPagination.page || 1) - 1, 1)}`}
                className='rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100'
              >
                Sebelumnya
              </Link>
            ) : (
              <span className='rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-400'>
                Sebelumnya
              </span>
            )}
            {leadPagination.hasNext ? (
              <Link
                href={`/admin/analytic?page=${(leadPagination.page || 1) + 1}`}
                className='rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100'
              >
                Berikutnya
              </Link>
            ) : (
              <span className='rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-400'>
                Berikutnya
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
