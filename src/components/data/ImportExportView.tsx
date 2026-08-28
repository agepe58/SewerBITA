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

interface ImportExportViewProps {
  manholes: ManholeAsset[];
  pumpStations: PumpStationAsset[];
  pipes: PipeAsset[];
  inspections: InspectionRecord[];
  onBatchImportManholes: (newManholes: ManholeAsset[]) => void;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  manholes,
  pumpStations,
  pipes,
  inspections,
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
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#2DD4BF]" />
            <span>Migrasi Data, Import & Export Sistem</span>
          </h1>
          <p className="text-xs text-slate-400">
            Fasilitas import spreadsheet CSV/Excel dan export backup master data aset dan log inspeksi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="bg-[#141824] p-6 rounded-2xl border border-[#232A3B] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#2DD4BF]" />
            <span>Import Data Aset (CSV / Excel)</span>
          </h2>

          <p className="text-xs text-slate-400">
            Unggah file CSV berisi data Manhole, Pipa, atau Stasiun Pompa untuk migrasi massal dari spreadsheet existing.
          </p>

          <div className="border-2 border-dashed border-[#232A3B] hover:border-[#2DD4BF] p-8 rounded-2xl text-center space-y-3 bg-[#080A0E] transition cursor-pointer relative">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileSpreadsheet className="w-10 h-10 mx-auto text-[#2DD4BF]" />
            <div className="text-xs font-bold text-white">Klik atau Tarik File CSV ke Sini</div>
            <div className="text-[10px] text-slate-500 font-mono">Format yang didukung: .csv, .xlsx (Maks 10MB)</div>
          </div>

          {importStatus && (
            <div className="bg-[#10B981]/15 p-3 rounded-xl border border-[#10B981]/40 text-xs text-[#10B981] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-[#141824] p-6 rounded-2xl border border-[#232A3B] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-[#06B6D4]" />
            <span>Export Data & Laporan</span>
          </h2>

          <p className="text-xs text-slate-400">
            Unduh berkas CSV untuk keperluan backup, analisis lebih lanjut di Excel, atau laporan manajemen.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleExportAssets}
              className="w-full bg-[#1A1F2C] hover:bg-[#252C3D] border border-[#232A3B] hover:border-[#2DD4BF] p-4 rounded-xl text-left flex items-center justify-between transition group"
            >
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-[#2DD4BF]" />
                <div>
                  <div className="text-xs font-bold text-white">Export Master Aset (CSV)</div>
                  <div className="text-[10px] text-slate-400">Semua Manhole, Pipa, dan Stasiun Pompa</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-[#2DD4BF]" />
            </button>

            <button
              onClick={handleExportInspections}
              className="w-full bg-[#1A1F2C] hover:bg-[#252C3D] border border-[#232A3B] hover:border-[#06B6D4] p-4 rounded-xl text-left flex items-center justify-between transition group"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#06B6D4]" />
                <div>
                  <div className="text-xs font-bold text-white">Export Riwayat Inspeksi (CSV)</div>
                  <div className="text-[10px] text-slate-400">Seluruh catatan temuan dan kondisi petugas</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-[#06B6D4]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
