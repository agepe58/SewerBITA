import React, { useState } from 'react';
import { FolderKanban, Plus, CheckCircle2, Clock, Calendar, ChevronRight } from 'lucide-react';
import { MaintenanceProject } from '../../types/workOrder';

interface ProjectsViewProps {
  projects: MaintenanceProject[];
  onCreateProject: (project: MaintenanceProject) => void;
  isDarkMode?: boolean;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects = [],
  onCreateProject,
  isDarkMode = true
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'Direncanakan' | 'Dalam Pengerjaan' | 'Selesai'>('Direncanakan');
  const [totalTasks, setTotalTasks] = useState(5);

  const cardBg = isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateProject({
      id: `proj-${Date.now()}`,
      title: title.trim(),
      status,
      totalTasks: Number(totalTasks) || 0,
      completedTasks: 0,
      createdAt: new Date().toISOString()
    });

    setTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className={`p-6 space-y-6 font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold">Daftar Proyek Pemeliharaan & Revitalisasi</h2>
          <p className="text-xs text-slate-400">Monitoring progres proyek terencana dan milestone operasional</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Proyek Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className={`p-8 rounded-2xl border text-center text-xs text-slate-500 col-span-3 ${cardBg}`}>
            Belum ada proyek yang dibuat.
          </div>
        ) : (
          projects.map((proj) => {
            const progress = proj.totalTasks > 0 ? Math.round((proj.completedTasks / proj.totalTasks) * 100) : 0;
            return (
              <div key={proj.id} className={`p-6 rounded-2xl border space-y-4 shadow-sm hover:border-slate-700 transition ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                    {proj.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{proj.id}</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-white">{proj.title}</h3>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Progres Penyelesaian</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium pt-1">
                    {proj.completedTasks} dari {proj.totalTasks} tugas selesai
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Tambah Proyek */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${cardBg}`}>
            <h3 className="text-sm font-extrabold text-white">Buat Proyek Pemeliharaan Baru</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Nama Proyek *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Revitalisasi Balance Tank Zone A"
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Target Total Tugas</label>
                <input
                  type="number"
                  value={totalTasks}
                  onChange={(e) => setTotalTasks(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                >
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
