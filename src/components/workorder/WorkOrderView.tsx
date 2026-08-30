import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Trash2,
  Edit2,
  ChevronDown,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { WorkOrder, WorkOrderPriority, WorkOrderStatus } from '../../types/workOrder';
import { UserProfile } from '../../types/rbac';

interface WorkOrderViewProps {
  workOrders: WorkOrder[];
  currentUser: UserProfile;
  onOpenCreateModal: () => void;
  onEditWorkOrder: (workOrder: WorkOrder) => void;
  onDeleteWorkOrder: (id: string) => void;
  isDarkMode?: boolean;
}

export const WorkOrderView: React.FC<WorkOrderViewProps> = ({
  workOrders = [],
  currentUser,
  onOpenCreateModal,
  onEditWorkOrder,
  onDeleteWorkOrder,
  isDarkMode = true
}) => {
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua Status');
  const [selectedPriority, setSelectedPriority] = useState<string>('Semua Prioritas');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Kategori');
  const [selectedLocation, setSelectedLocation] = useState<string>('Semua Lokasi');

  // Filter Tabs: 'all' | 'assigned_to_me' | 'my_reports'
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'assigned_to_me' | 'my_reports'>('all');

  // Unique categories and locations from data
  const categories = useMemo(() => {
    const set = new Set<string>();
    workOrders.forEach(w => { if (w.category) set.add(w.category); });
    return Array.from(set);
  }, [workOrders]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    workOrders.forEach(w => { if (w.location) set.add(w.location); });
    return Array.from(set);
  }, [workOrders]);

  // Filtered work orders
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = wo.title.toLowerCase().includes(q);
        const matchesId = wo.id.toLowerCase().includes(q);
        const matchesPic = (wo.picName || '').toLowerCase().includes(q);
        const matchesLoc = (wo.location || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesPic && !matchesLoc) return false;
      }

      // Status
      if (selectedStatus !== 'Semua Status' && wo.status !== selectedStatus) {
        return false;
      }

      // Priority
      if (selectedPriority !== 'Semua Prioritas' && wo.priority !== selectedPriority) {
        return false;
      }

      // Category
      if (selectedCategory !== 'Semua Kategori' && wo.category !== selectedCategory) {
        return false;
      }

      // Location
      if (selectedLocation !== 'Semua Lokasi' && wo.location !== selectedLocation) {
        return false;
      }

      // Tab filter
      if (activeTabFilter === 'assigned_to_me') {
        if (wo.picUserId !== currentUser.id && wo.picName !== currentUser.name) return false;
      }

      return true;
    });
  }, [workOrders, searchQuery, selectedStatus, selectedPriority, selectedCategory, selectedLocation, activeTabFilter, currentUser]);

  // Format Due Date
  const formatDueDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}.${mins}`;
    } catch {
      return dateStr;
    }
  };

  // Export to CSV / Excel
  const handleExportXlsx = () => {
    const headers = ['Nomor', 'Judul', 'Kategori', 'Lokasi', 'Prioritas', 'Status', 'PIC', 'Batas Waktu', 'Deskripsi'];
    const rows = filteredWorkOrders.map(w => [
      w.id,
      `"${w.title.replace(/"/g, '""')}"`,
      w.category,
      `"${w.location.replace(/"/g, '""')}"`,
      w.priority,
      w.status,
      w.picName || 'Belum ada',
      formatDueDate(w.dueDate),
      `"${(w.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Work_Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardBg = isDarkMode ? 'bg-[#111827] border-slate-800/80' : 'bg-white border-slate-200';
  const filterInputClass = `px-3 py-2 rounded-xl text-xs font-semibold border transition outline-none cursor-pointer ${
    isDarkMode
      ? 'bg-slate-900/90 border-slate-800 text-slate-200 focus:border-blue-500'
      : 'bg-slate-100 border-slate-200 text-slate-700 focus:border-blue-500'
  }`;

  return (
    <div className={`p-6 space-y-6 font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. TOP ACTION BUTTONS (Export & + Buat Work Order) */}
      <div className="flex items-center justify-end gap-3">
        {/* Export .xlsx */}
        <button
          onClick={handleExportXlsx}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export .xlsx</span>
        </button>

        {/* + Buat Work Order */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Work Order</span>
        </button>
      </div>

      {/* 2. FILTER & SEARCH TOOLBAR (matching Screenshot 2) */}
      <div className={`p-4 rounded-2xl border space-y-4 shadow-xs ${cardBg}`}>
        {/* Top Search Bar and 4 Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau nomor WO..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold border transition outline-none ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-800 text-white focus:border-blue-500'
                  : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={filterInputClass}
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Baru">Baru</option>
            <option value="Ditugaskan">Ditugaskan</option>
            <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
            <option value="Ditunda">Ditunda</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditutup">Ditutup</option>
          </select>

          {/* Prioritas Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className={filterInputClass}
          >
            <option value="Semua Prioritas">Semua Prioritas</option>
            <option value="Rendah">Rendah</option>
            <option value="Sedang">Sedang</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Kritis">Kritis</option>
          </select>

          {/* Kategori Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={filterInputClass}
          >
            <option value="Semua Kategori">Semua Kategori</option>
            <option value="Mekanik">Mekanik</option>
            <option value="Elektrik">Elektrik</option>
            <option value="Sipil">Sipil</option>
            <option value="Instrumen">Instrumen</option>
            <option value="Operasional">Operasional</option>
            {categories.filter(c => !['Mekanik', 'Elektrik', 'Sipil', 'Instrumen', 'Operasional'].includes(c)).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Lokasi Dropdown */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className={filterInputClass}
          >
            <option value="Semua Lokasi">Semua Lokasi</option>
            <option value="WWTP">WWTP</option>
            <option value="WTP">WTP</option>
            <option value="Pump Station Sektor A">Pump Station Sektor A</option>
            {locations.filter(l => !['WWTP', 'WTP', 'Pump Station Sektor A'].includes(l)).map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Filter Tabs: [Semua Pekerjaan] [Ditugaskan ke Saya] [Laporan Saya] */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTabFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua Pekerjaan
          </button>
          <button
            onClick={() => setActiveTabFilter('assigned_to_me')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTabFilter === 'assigned_to_me'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Ditugaskan ke Saya
          </button>
          <button
            onClick={() => setActiveTabFilter('my_reports')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTabFilter === 'my_reports'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Laporan Saya
          </button>
        </div>
      </div>

      {/* 3. DATA TABLE (matching Screenshot 2) */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${cardBg}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-slate-800/90 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                <th className="py-3.5 px-4 font-bold">Nomor</th>
                <th className="py-3.5 px-4 font-bold">Judul</th>
                <th className="py-3.5 px-4 font-bold">Kategori</th>
                <th className="py-3.5 px-4 font-bold">Lokasi</th>
                <th className="py-3.5 px-4 font-bold">Prioritas</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">PIC</th>
                <th className="py-3.5 px-4 font-bold">Batas Waktu</th>
                <th className="py-3.5 px-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredWorkOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    Tidak ada work order yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredWorkOrders.map((wo) => {
                  return (
                    <tr
                      key={wo.id}
                      className={`transition-colors ${
                        isDarkMode ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Nomor */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 font-bold whitespace-nowrap">
                        {wo.id}
                      </td>

                      {/* Judul */}
                      <td className="py-3.5 px-4 font-extrabold text-white">
                        {wo.title}
                      </td>

                      {/* Kategori */}
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">
                        {wo.category || 'Mekanik'}
                      </td>

                      {/* Lokasi */}
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">
                        {wo.location || 'WWTP'}
                      </td>

                      {/* Prioritas Badge */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-400 text-[10px] font-bold">
                          {wo.priority}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          wo.status === 'Ditugaskan' || wo.status === 'Sedang Dikerjakan'
                            ? 'bg-sky-600/30 text-sky-400'
                            : wo.status === 'Selesai' || wo.status === 'Ditutup'
                            ? 'bg-emerald-600/30 text-emerald-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {wo.status}
                        </span>
                      </td>

                      {/* PIC */}
                      <td className="py-3.5 px-4 text-slate-400 font-medium">
                        {wo.picName || 'Belum ada'}
                      </td>

                      {/* Batas Waktu */}
                      <td className="py-3.5 px-4 text-slate-300 font-medium whitespace-nowrap">
                        {formatDueDate(wo.dueDate)}
                      </td>

                      {/* Aksi (Edit & Delete) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditWorkOrder(wo)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition cursor-pointer"
                            title="Edit Work Order"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus work order "${wo.title}" (${wo.id})?`)) {
                                onDeleteWorkOrder(wo.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Hapus Work Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. TABLE FOOTER: Pagination & Summary matching Screenshot */}
        <div className="px-6 py-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-semibold">
          <div>
            Total {filteredWorkOrders.length} work order - Halaman 1 dari 1
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-3 py-1.5 rounded-xl border border-slate-800 text-slate-600 cursor-not-allowed text-xs font-bold"
            >
              Sebelumnya
            </button>
            <button
              disabled
              className="px-3 py-1.5 rounded-xl border border-slate-800 text-slate-600 cursor-not-allowed text-xs font-bold"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
