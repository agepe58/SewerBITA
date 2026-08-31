import React, { useState, useMemo } from 'react';
import { Map, Plus, Edit2, Trash2, Search, Boxes, AlertTriangle, X, Check, Filter } from 'lucide-react';
import { SewerAsset } from '../../types/asset';
import { UserRole, hasPermission } from '../../types/rbac';

interface AreaManagementViewProps {
  areas: string[];
  allAssets: SewerAsset[];
  currentUserRole?: UserRole;
  onAddArea: (newArea: string) => void;
  onEditArea: (oldArea: string, newArea: string) => void;
  onDeleteArea: (areaToDelete: string) => void;
  isDarkMode?: boolean;
}

export const AreaManagementView: React.FC<AreaManagementViewProps> = ({
  areas,
  allAssets,
  currentUserRole = 'Technician',
  onAddArea,
  onEditArea,
  onDeleteArea,
  isDarkMode = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  
  // Edit Area Modal state
  const [areaToEdit, setAreaToEdit] = useState<string | null>(null);
  const [editedAreaName, setEditedAreaName] = useState('');

  // Delete Area Confirm state
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);

  // Calculate Asset Counts per Area
  const areaStats = useMemo(() => {
    return areas.map(area => {
      const assignedAssets = allAssets.filter(a => a.area === area);
      const manholeCount = assignedAssets.filter(a => a.type === 'manhole').length;
      const pumpStationCount = assignedAssets.filter(a => a.type === 'pump_station').length;
      const pipeCount = assignedAssets.filter(a => a.type === 'pipe').length;

      return {
        name: area,
        totalAssets: assignedAssets.length,
        manholeCount,
        pumpStationCount,
        pipeCount
      };
    });
  }, [areas, allAssets]);

  // Filtered Area Stats
  const filteredAreaStats = useMemo(() => {
    if (!searchQuery.trim()) return areaStats;
    const q = searchQuery.toLowerCase().trim();
    return areaStats.filter(a => a.name.toLowerCase().includes(q));
  }, [areaStats, searchQuery]);

  // Handle Add Area Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAreaName.trim();
    if (!trimmed) return;
    if (areas.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      alert('Nama area/zona tersebut sudah ada dalam daftar.');
      return;
    }
    onAddArea(trimmed);
    setNewAreaName('');
    setIsAddModalOpen(false);
  };

  // Handle Edit Area Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaToEdit) return;
    const trimmed = editedAreaName.trim();
    if (!trimmed) return;
    if (trimmed !== areaToEdit && areas.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      alert('Nama area/zona tersebut sudah ada dalam daftar.');
      return;
    }
    onEditArea(areaToEdit, trimmed);
    setAreaToEdit(null);
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = () => {
    if (!areaToDelete) return;
    onDeleteArea(areaToDelete);
    setAreaToDelete(null);
  };

  const selectedDeleteStat = areaToDelete ? areaStats.find(a => a.name === areaToDelete) : null;

  return (
    <div className={`p-6 space-y-6 min-h-screen ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Manajemen Area & Zona Sektor
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Kelola wilayah operasional jaringan air limbah dan pemetaan aset per zona
            </p>
          </div>
        </div>

        {hasPermission(currentUserRole, 'add_asset') && (
          <button
            onClick={() => {
              setNewAreaName('');
              setIsAddModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Area Baru</span>
          </button>
        )}
      </div>

      {/* SUMMARY STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Total Area / Zona</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{areas.length}</div>
          </div>
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg">
            <Map className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Total Aset Terdaftar</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{allAssets.length}</div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Rata-rata Aset / Area</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {areas.length > 0 ? Math.round(allAssets.length / areas.length) : 0}
            </div>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <Filter className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari nama area atau zona sektor..."
          className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* AREA GRID / TABLE LIST */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Daftar Wilayah Operasional ({filteredAreaStats.length})
          </h2>
        </div>

        {filteredAreaStats.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Map className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-xs font-bold">Tidak ada data area yang ditemukan.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAreaStats.map(stat => (
              <div
                key={stat.name}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0 font-extrabold text-sm">
                    {stat.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {stat.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <span>Manhole: <strong>{stat.manholeCount}</strong></span>
                      <span>•</span>
                      <span>Pompa: <strong>{stat.pumpStationCount}</strong></span>
                      <span>•</span>
                      <span>Pipa: <strong>{stat.pipeCount}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right mr-2 hidden sm:block">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {stat.totalAssets} Aset
                    </span>
                    <div className="text-[10px] text-slate-400 font-bold">Total Terhubung</div>
                  </div>

                  {hasPermission(currentUserRole, 'edit_asset') && (
                    <button
                      onClick={() => {
                        setAreaToEdit(stat.name);
                        setEditedAreaName(stat.name);
                      }}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition cursor-pointer"
                      title="Edit Nama Area"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  {hasPermission(currentUserRole, 'delete_asset') && (
                    <button
                      onClick={() => setAreaToDelete(stat.name)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                      title="Hapus Area"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: TAMBAH AREA BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Tambah Area / Zona Baru</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Area / Zona Sektor *
                </label>
                <input
                  type="text"
                  required
                  value={newAreaName}
                  onChange={e => setNewAreaName(e.target.value)}
                  placeholder="contoh: Zone D - Pluit Industrial"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-black shadow-md transition cursor-pointer"
                >
                  Simpan Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT AREA */}
      {areaToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Edit Nama Area</h3>
              </div>
              <button onClick={() => setAreaToEdit(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Area / Zona Sektor
                </label>
                <input
                  type="text"
                  required
                  value={editedAreaName}
                  onChange={e => setEditedAreaName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAreaToEdit(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-black shadow-md transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS AREA */}
      {areaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-500 border-b border-slate-100 dark:border-slate-800 pb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Konfirmasi Hapus Area</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Apakah Anda yakin ingin menghapus area <strong className="text-slate-900 dark:text-white">{areaToDelete}</strong>?
            </p>

            {selectedDeleteStat && selectedDeleteStat.totalAssets > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                ⚠️ Peringatan: Saat ini terdapat <strong>{selectedDeleteStat.totalAssets} aset</strong> yang terhubung ke area ini. Membuang area ini akan mempengaruhi filter aset.
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAreaToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md transition cursor-pointer"
              >
                Hapus Area
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
