import {
  getAdminCatalogFiles,
  getAdminCatalogKits,
  getAdminMerchandiseItems,
} from "@/actions/catalog";
import Kit from "@/components/admin/catalog/kit/Kit";
import Merchandise from "@/components/admin/catalog/merchandise/Merchandise";
import CatalogFileUpload from "@/components/admin/catalog/upload/CatalogFileUpload";

function resolveTab(rawTab) {
  if (rawTab === "merchandise") return "merchandise";
  if (rawTab === "upload") return "upload";
  return "kit";
}

function resolveMode(rawMode) {
  if (rawMode === "create") return "create";
  if (rawMode === "edit") return "edit";
  return "list";
}

export default async function AdminCatalogPage({ searchParams }) {
  const params = await searchParams;
  const activeTab = resolveTab(params?.tab);
  const mode = resolveMode(params?.mode);
  const editId = Number.parseInt(String(params?.id || ""), 10);
  const kits = activeTab === "kit" ? await getAdminCatalogKits() : [];
  const merchandiseItems = activeTab === "merchandise" ? await getAdminMerchandiseItems() : [];
  const catalogFiles = activeTab === "upload" ? await getAdminCatalogFiles() : [];

  return (
    <section className='space-y-5'>
      <div className='rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 p-4 sm:p-5'>
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-700'>Catalog Admin</p>
        <h2 className='mt-1 font-display text-2xl font-semibold text-slate-900'>
          Kelola Kit, Merchandise, dan File Katalog
        </h2>
        <p className='mt-2 text-sm text-slate-600'>
          Gunakan menu di bawah untuk mengelola data katalog website.
        </p>
      </div>

      <div className='rounded-xl border border-slate-200 bg-white p-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex flex-wrap gap-2'>
            <a
              href='/admin/catalog?tab=kit'
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "kit"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Kit
            </a>
            <a
              href='/admin/catalog?tab=merchandise'
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "merchandise"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Merchandise
            </a>
            <a
              href='/admin/catalog?tab=upload'
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "upload"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Upload File
            </a>
          </div>
        </div>
      </div>

      {activeTab === "kit" ? (
        <Kit kits={kits} />
      ) : activeTab === "merchandise" ? (
        <Merchandise
          items={merchandiseItems}
          mode={mode}
          editId={Number.isInteger(editId) && editId > 0 ? editId : null}
        />
      ) : (
        <CatalogFileUpload files={catalogFiles} />
      )}
    </section>
  );
}
