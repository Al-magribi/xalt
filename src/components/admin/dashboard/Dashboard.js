import {
  FiActivity,
  FiBox,
  FiClipboard,
  FiPackage,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

const statusClasses = {
  new: "bg-amber-50 text-amber-700 ring-amber-200",
  contacted: "bg-sky-50 text-sky-700 ring-sky-200",
  closed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function Dashboard({ data }) {
  const stats = data?.stats || {};
  const leads = data?.recentLeads || [];

  const statCards = [
    {
      id: "kits",
      title: "Active Kits",
      value: stats.kits ?? 0,
      icon: FiPackage,
      style: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    },
    {
      id: "produk",
      title: "Produk",
      value: stats.merchandise ?? 0,
      icon: FiBox,
      style: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    },
    {
      id: "leads",
      title: "Total Leads",
      value: stats.leads ?? 0,
      icon: FiUsers,
      style: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    {
      id: "sessions",
      title: "Visitor Sessions",
      value: stats.visitorSessions ?? 0,
      icon: FiActivity,
      style: "bg-orange-50 text-orange-700 ring-orange-100",
    },
    {
      id: "events",
      title: "Visit Events",
      value: stats.visitEvents ?? 0,
      icon: FiClipboard,
      style: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
    },
  ];

  return (
    <div className='space-y-5'>
      <section className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5'>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.id}
              className='rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4'
            >
              <div className='mb-4 flex items-center justify-between'>
                <p className='text-sm font-medium text-slate-600'>{card.title}</p>
                <span className={`rounded-lg p-2 ring-1 ${card.style}`}>
                  <Icon className='h-4 w-4' />
                </span>
              </div>
              <p className='text-3xl font-semibold text-slate-900'>{card.value}</p>
            </article>
          );
        })}
      </section>

      <section className='grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]'>
        <article className='rounded-xl border border-slate-200 bg-white p-4'>
          <h2 className='mb-3 text-base font-semibold text-slate-900'>Lead Terbaru</h2>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[640px] text-left text-sm'>
              <thead className='border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500'>
                <tr>
                  <th className='px-2 py-2'>Nama</th>
                  <th className='px-2 py-2'>Kontak</th>
                  <th className='px-2 py-2'>Channel</th>
                  <th className='px-2 py-2'>Status</th>
                  <th className='px-2 py-2'>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='px-2 py-6 text-center text-slate-500'>
                      Belum ada data lead.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className='border-b border-slate-100'>
                      <td className='px-2 py-3 font-medium text-slate-900'>{lead.name}</td>
                      <td className='px-2 py-3 text-slate-600'>{lead.email || "-"}</td>
                      <td className='px-2 py-3 capitalize text-slate-600'>{lead.channel}</td>
                      <td className='px-2 py-3'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ${
                            statusClasses[lead.status] || "bg-slate-50 text-slate-700 ring-slate-200"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className='px-2 py-3 text-slate-600'>{formatDate(lead.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className='rounded-xl border border-slate-200 bg-white p-4'>
          <h2 className='mb-3 text-base font-semibold text-slate-900'>Insight Cepat</h2>
          <div className='space-y-3'>
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
              <p className='text-xs uppercase tracking-wide text-slate-500'>Conversion Signal</p>
              <p className='mt-1 text-sm text-slate-800'>
                {stats.leads && stats.visitorSessions
                  ? `${Math.round((stats.leads / stats.visitorSessions) * 100)}% dari visitor session tercatat menjadi lead.`
                  : "Belum cukup data untuk hitung conversion signal."}
              </p>
            </div>

            <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
              <p className='flex items-center gap-2 text-sm font-medium text-slate-800'>
                <FiTrendingUp className='h-4 w-4 text-emerald-600' />
                Traffic Monitor
              </p>
              <p className='mt-1 text-sm text-slate-600'>
                Total event kunjungan saat ini: <span className='font-semibold'>{stats.visitEvents ?? 0}</span>.
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
