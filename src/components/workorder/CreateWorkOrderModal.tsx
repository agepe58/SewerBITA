import React, { useState, useEffect } from 'react';
import { X, ClipboardList, Calendar, MapPin, Tag, AlertCircle, User, FileText } from 'lucide-react';
import { WorkOrder, WorkOrderCategory, WorkOrderPriority, WorkOrderStatus } from '../../types/workOrder';
import { UserProfile } from '../../types/rbac';

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workOrder: WorkOrder) => void;
  users: UserProfile[];
  initialData?: WorkOrder | null;
  isDarkMode?: boolean;
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  users,
  initialData,
  isDarkMode = true
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkOrderCategory>('Mekanik');
  const [location, setLocation] = useState('WWTP');
  const [priority, setPriority] = useState<WorkOrderPriority>('Sedang');
  const [status, setStatus] = useState<WorkOrderStatus>('Baru');
  const [picUserId, setPicUserId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category || 'Mekanik');
      setLocation(initialData.location || 'WWTP');
      setPriority(initialData.priority || 'Sedang');
      setStatus(initialData.status || 'Baru');
      setPicUserId(initialData.picUserId || '');
      setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : '');
      setDescription(initialData.description || '');
    } else {
      setTitle('');
      setCategory('Mekanik');
      setLocation('WWTP');
      setPriority('Sedang');
      setStatus('Baru');
      setPicUserId('');
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 3);
      setDueDate(defaultDue.toISOString().slice(0, 16));
      setDescription('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedUser = users.find(u => u.id === picUserId);

    const generatedId = initialData?.id || `WO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 900) + 100)}`;

    const wo: WorkOrder = {
      id: generatedId,
      title: title.trim(),
      category,
      location: location.trim(),
      priority,
      status,
      picUserId: picUserId || undefined,
      picName: selectedUser ? selectedUser.name : 'Belum ada',
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      description: description.trim(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(wo);
    onClose();
  };

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition outline-none ${
    isDarkMode
      ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
  }`;

  const labelClass = 'block text-xs font-bold text-slate-400 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden font-sans ${
        isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold">{initialData ? 'Edit Work Order' : 'Buat Work Order Baru'}</h2>
              <p className="text-[11px] text-slate-400">Pekerjaan maintenance dan penugasan teknisi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Judul */}
          <div>
            <label className={labelClass}>Judul Pekerjaan Maintenance *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Check valve, Kontaktor, Pengecatan pompa"
              className={inputClass}
            />
          </div>

          {/* Kategori & Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkOrderCategory)}
                className={inputClass}
              >
                <option value="Mekanik">Mekanik</option>
                <option value="Elektrik">Elektrik</option>
                <option value="Sipil">Sipil</option>
                <option value="Instrumen">Instrumen</option>
                <option value="Operasional">Operasional</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Lokasi</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Pump Station Sektor A, WWTP, WTP"
                className={inputClass}
              />
            </div>
          </div>

          {/* Prioritas & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}
                className={inputClass}
              >
                <option value="Rendah">Rendah</option>
                <option value="Sedang">Sedang</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Kritis">Kritis</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}
                className={inputClass}
              >
                <option value="Baru">Baru</option>
                <option value="Ditugaskan">Ditugaskan</option>
                <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                <option value="Ditunda">Ditunda</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditutup">Ditutup</option>
              </select>
            </div>
          </div>

          {/* PIC (Petugas) & Batas Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Penanggung Jawab (PIC)</label>
              <select
                value={picUserId}
                onChange={(e) => setPicUserId(e.target.value)}
                className={inputClass}
              >
                <option value="">Belum ada (Unassigned)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Batas Waktu (Due Date)</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className={labelClass}>Deskripsi / Catatan Tambahan</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rincian kerusakan, instruksi maintenance, suku cadang..."
              className={inputClass}
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/30 cursor-pointer"
            >
              {initialData ? 'Simpan Perubahan' : 'Buat Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
