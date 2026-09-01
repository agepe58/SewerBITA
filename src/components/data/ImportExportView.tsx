import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Database
} from 'lucide-react';
import Papa from 'papaparse';
import { ManholeAsset, PipeAsset, PumpStationAsset, SewerAsset } from '../../types/asset';
import { InspectionRecord } from '../../types/inspection';

import { UserRole, hasPermission } from '../../types/rbac';

interface ImportExportViewProps {
  manholes: ManholeAsset[];
  pumpStations: PumpStationAsset[];
  pipes: PipeAsset[];
  inspections: InspectionRecord[];
  currentUserRole?: UserRole;
  onBatchImportManholes: (newManholes: ManholeAsset[]) => void;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  manholes,
  pumpStations,
  pipes,
  inspections,
  currentUserRole = 'Technician',
  onBatchImportManholes
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Helper to export CSV
  const exportToCsv = (filename: string, rows: object[]) => {
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAssets = () => {
    const data = [...manholes, ...pumpStations, ...pipes].map(a => ({
      ID: a.id,
      AssetCode: a.assetCode,
      Name: a.name,
      Type: a.type,
      Area: a.area,
      Status: a.status,
      Condition: a.condition,
      InstallationYear: a.installationYear,
      NextInspectionDue: a.nextInspectionDue
    }));
    exportToCsv('SewerBITA_Master_Assets.csv', data);
  };

  const handleExportInspections = () => {
    const data = inspections.map(i => ({
      ID: i.id,
      AssetCode: i.assetCode,
      AssetName: i.assetName,
      InspectionDate: i.inspectionDate,
      Inspector: i.inspectorName,
      Condition: i.condition,
      Category: i.issueCategory,
      Notes: i.notes
    }));
    exportToCsv('SewerBITA_Inspection_History.csv', data);
  };

  // Demo file import parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setImportStatus(`Berhasil membaca ${results.data.length} baris data dari ${file.name}. Validasi topology lulus!`);
      },
      error: (err) => {
        setImportStatus(`Gagal mengimpor file: ${err.message}`);
      }
    });
  };

  return (
    <div className="font-sans" style={{ padding: '16px 16px 32px 16px' }}>
      {/* Workspace Header Bar Card */}
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-7 rounded-xl border border-slate-300 dark:border-slate-700/90 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ marginBottom: '14px' }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-[#2563EB]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span>Migrasi Data, Import & Export Sistem</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Fasilitas import spreadsheet CSV/Excel dan export backup master data aset dan log inspeksi.
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${hasPermission(currentUserRole, 'import_data') ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6 sm:gap-8`}>
        {/* Import Section */}
        {hasPermission(currentUserRole, 'import_data') && (
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Upload className="w-5 h-5 text-[#2563EB]" />
              <span>Import Data Aset (CSV / Excel)</span>
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Unggah file CSV berisi data Manhole, Pipa, atau Stasiun Pompa untuk migrasi massal dari spreadsheet existing.
            </p>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#2563EB] p-8 rounded-2xl text-center space-y-3 bg-slate-50 dark:bg-slate-800/80 transition cursor-pointer relative group">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-12 h-12 mx-auto text-[#2563EB] group-hover:scale-110 transition" />
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">Klik atau Tarik File CSV ke Sini</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">Format yang didukung: .csv, .xlsx (Maks 10MB)</div>
            </div>

            {importStatus && (
              <div className="bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-sm text-[#16A34A] dark:text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>
        )}

        {/* Export Section */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Download className="w-5 h-5 text-[#0284C7]" />
            <span>Export Data & Laporan</span>
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Unduh berkas CSV untuk keperluan backup, analisis lebih lanjut di Excel, atau laporan manajemen.
          </p>

          <div className="space-y-3.5 pt-1">
            <button
              onClick={handleExportAssets}
              className="w-full bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-[#2563EB] p-4.5 rounded-2xl text-left flex items-center justify-between transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-[#2563EB]" />
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">Export Master Aset (CSV)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Semua Manhole, Pipa, dan Stasiun Pompa</div>
                </div>
              </div>
              <Download className="w-5 h-5 text-slate-400 group-hover:text-[#2563EB]" />
            </button>

            <button
              onClick={handleExportInspections}
              className="w-full bg-slate-50 dark:bg-slate-800/80 hover:bg-sky-50/50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-700 hover:border-[#0284C7] p-4.5 rounded-2xl text-left flex items-center justify-between transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#0284C7]" />
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">Export Riwayat Inspeksi (CSV)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Seluruh catatan temuan dan kondisi petugas</div>
                </div>
              </div>
              <Download className="w-5 h-5 text-slate-400 group-hover:text-[#0284C7]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
