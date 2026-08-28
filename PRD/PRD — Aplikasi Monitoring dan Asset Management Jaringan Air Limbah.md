# Product Requirements Document (PRD)
## Aplikasi Monitoring dan Asset Management Jaringan Air Limbah

**Versi:** 1.0  
**Status:** Draft  
**Target Platform:** Web Application  
**Target Pengguna:** Usia 23–65 tahun

---

# 1. Ringkasan Produk

## 1.1 Nama Sementara

**Wastewater Network Monitoring & Asset Management**

Nama produk dapat disesuaikan dengan nama perusahaan atau proyek.

## 1.2 Latar Belakang

Jaringan air limbah terdiri dari berbagai aset yang saling terhubung, seperti:

- Manhole
- Pipa
- Jalur kolektor
- Stasiun pompa
- Valve atau perangkat pendukung
- Sensor monitoring

Saat ini informasi mengenai jaringan belum terdokumentasi secara terstruktur dan mudah digunakan. Beberapa masalah utama:

1. Lokasi manhole sulit ditemukan.
2. Koordinat aset belum terdokumentasi secara konsisten.
3. Arah aliran air limbah tidak diketahui dengan jelas.
4. Hubungan antara satu manhole dengan manhole lainnya tidak terdokumentasi.
5. Jalur pipa menuju stasiun pompa sulit ditelusuri.
6. Data aset tersebar dalam gambar, dokumen, spreadsheet, atau pengetahuan teknisi.
7. Riwayat inspeksi dan kondisi aset belum terpusat.
8. Ketika terjadi gangguan, teknisi membutuhkan waktu untuk memahami posisi dan hubungan aset.

Akibatnya, proses inspeksi, maintenance, troubleshooting, dan pengembangan jaringan menjadi lambat serta bergantung pada pengalaman individu tertentu.

---

# 2. Visi Produk

Membangun aplikasi berbasis web yang menjadi **single source of truth** untuk lokasi, struktur, hubungan, kondisi, dan riwayat aset jaringan air limbah.

Aplikasi harus memungkinkan pengguna melihat jaringan air limbah secara visual di peta, menelusuri hubungan antar manhole dan pipa, mengetahui arah aliran, serta mengikuti jalur jaringan sampai ke stasiun pompa.

---

# 3. Tujuan Produk

## Tujuan Utama

1. Mendokumentasikan seluruh aset jaringan air limbah.
2. Menampilkan lokasi aset berdasarkan koordinat geografis.
3. Menampilkan hubungan antar manhole.
4. Menampilkan jalur pipa antar aset.
5. Menampilkan arah aliran air limbah.
6. Memungkinkan pengguna menelusuri jalur dari manhole tertentu menuju stasiun pompa.
7. Menyediakan informasi kondisi dan riwayat inspeksi aset.
8. Mempermudah maintenance dan troubleshooting jaringan.

## Indikator Keberhasilan

- Pengguna dapat menemukan aset di peta dalam waktu kurang dari 1 menit.
- Hubungan antar manhole dapat diketahui tanpa membuka gambar jaringan manual.
- Jalur menuju stasiun pompa dapat ditelusuri secara visual.
- Data aset memiliki koordinat dan identitas unik.
- Riwayat inspeksi dapat diakses dari halaman aset.

---

# 4. Target Pengguna

## 4.1 Administrator

Tanggung jawab:

- Mengelola master data.
- Menambah dan mengubah aset.
- Mengelola user.
- Mengelola kategori dan status aset.
- Melakukan koreksi topology jaringan.

## 4.2 Supervisor / Engineer

Tanggung jawab:

- Melihat keseluruhan jaringan.
- Menganalisis hubungan antar aset.
- Melakukan perencanaan maintenance.
- Memantau kondisi aset.

## 4.3 Teknisi Lapangan

Tanggung jawab:

- Mencari lokasi aset.
- Melihat informasi aset.
- Melakukan inspeksi.
- Memperbarui kondisi aset.
- Mengunggah foto dokumentasi.

## 4.4 Management

Kebutuhan:

- Melihat statistik aset.
- Melihat kondisi jaringan secara umum.
- Mengetahui jumlah aset bermasalah.
- Melihat area dengan kebutuhan maintenance tinggi.

---

# 5. Permasalahan yang Diselesaikan

| Masalah | Solusi |
|---|---|
| Lokasi manhole sulit ditemukan | Peta interaktif berbasis koordinat |
| Hubungan manhole tidak diketahui | Network topology |
| Arah aliran tidak jelas | Directional flow pada jalur pipa |
| Jalur menuju pompa sulit diketahui | Trace network / flow tracing |
| Data aset tersebar | Centralized asset database |
| Riwayat kondisi tidak terdokumentasi | Inspection history |
| Sulit mencari aset | Search berdasarkan ID, nama, area |
| Dokumentasi visual terbatas | Foto dan attachment aset |

---

# 6. Ruang Lingkup MVP

Fokus MVP adalah:

> **Asset Registry + GIS Map + Network Topology + Flow Tracing + Inspection Management**

MVP tidak boleh berkembang menjadi sistem SCADA, ERP, CMMS penuh, atau hydraulic simulation pada tahap awal.

---

# 7. Fitur Utama

## 7.1 Dashboard

Dashboard menampilkan ringkasan:

### Statistik Aset

- Total manhole
- Total pipa
- Total stasiun pompa
- Total aset aktif
- Aset membutuhkan inspeksi
- Aset bermasalah
- Aset overdue inspection

### Visualisasi

- Ringkasan kondisi aset.
- Distribusi aset berdasarkan area.
- Aktivitas inspeksi terbaru.
- Daftar aset bermasalah.
- Shortcut menuju peta jaringan.

---

# 8. Interactive Network Map

Peta merupakan fitur utama aplikasi.

## 8.1 Tampilan Peta

Peta harus mampu menampilkan:

- Manhole
- Jalur pipa
- Stasiun pompa
- Aset pendukung

Setiap jenis aset menggunakan icon atau simbol yang berbeda.

## 8.2 Informasi Manhole

Saat marker dipilih, tampilkan:

- ID Manhole
- Nama
- Koordinat
- Elevasi jika tersedia
- Status
- Kondisi
- Kedalaman
- Area
- Manhole upstream
- Manhole downstream
- Foto terakhir
- Riwayat inspeksi terakhir

## 8.3 Jalur Pipa

Pipa ditampilkan sebagai garis yang menghubungkan dua node.

Informasi:

- Pipe ID
- Manhole asal
- Manhole tujuan
- Diameter
- Material
- Panjang
- Tahun instalasi
- Kondisi
- Status

---

# 9. Network Topology

Ini adalah fitur inti sistem.

Sistem harus menyimpan hubungan:

```text
Manhole A
    ↓
  Pipe 001
    ↓
Manhole B
    ↓
  Pipe 002
    ↓
Manhole C
    ↓
Pump Station
```

Setiap pipa memiliki:

- From Asset
- To Asset
- Direction
- Status

Contoh:

| Pipe | From | To | Direction |
|---|---|---|---|
| P-001 | MH-001 | MH-002 | MH-001 → MH-002 |
| P-002 | MH-002 | MH-003 | MH-002 → MH-003 |
| P-003 | MH-003 | PS-001 | MH-003 → PS-001 |

## 9.1 Validasi Topology

Sistem harus membantu mendeteksi:

- Pipa tanpa node asal.
- Pipa tanpa node tujuan.
- Manhole yang tidak terhubung.
- Duplicate connection.
- Aset yang koordinatnya tidak valid.
- Jalur yang tidak memiliki arah aliran.

---

# 10. Flow Direction Visualization

Arah aliran ditampilkan langsung pada peta.

Contoh:

```text
● MH-001
     ↓
════════════
     ↓
● MH-002
     ↓
════════════
     ↓
● MH-003
     ↓
════════════
     ↓
🏭 Pump Station
```

Fitur:

- Arrow pada jalur pipa.
- Highlight arah downstream.
- Filter upstream/downstream.
- Identifikasi jalur menuju stasiun pompa.

---

# 11. Network Trace

Pengguna dapat memilih sebuah manhole kemudian memilih:

### Trace Downstream

Sistem menampilkan:

```text
Manhole Terpilih
        ↓
Manhole Berikutnya
        ↓
Manhole Berikutnya
        ↓
Pump Station
```

### Trace Upstream

Menampilkan seluruh aset yang mengalir menuju manhole tersebut.

### Highlight Route

Jalur yang sedang ditelusuri:

- Ditampilkan lebih jelas.
- Aset terkait di-highlight.
- Aset yang tidak relevan dapat diredupkan.

---

# 12. Asset Management

## 12.1 Jenis Aset MVP

### Manhole

Data:

- Asset ID
- Nama
- Latitude
- Longitude
- Elevasi
- Kedalaman
- Diameter
- Material
- Tahun instalasi
- Status
- Kondisi
- Area
- Foto

### Pipe

Data:

- Asset ID
- From Node
- To Node
- Diameter
- Material
- Panjang
- Tahun instalasi
- Kedalaman jika tersedia
- Status
- Kondisi

### Pump Station

Data:

- Asset ID
- Nama
- Koordinat
- Kapasitas
- Status
- Kondisi
- Area
- Foto

---

# 13. Asset Detail Page

Setiap aset memiliki halaman detail.

Struktur:

## Informasi Dasar

- Asset ID
- Nama
- Jenis
- Lokasi
- Status
- Kondisi

## Lokasi

- Peta
- Latitude
- Longitude

## Connection

Untuk manhole:

- Upstream connection
- Downstream connection

Untuk pipe:

- From node
- To node

## Inspection History

Riwayat:

- Tanggal
- Petugas
- Kondisi
- Catatan
- Foto

## Documents

- Foto
- Drawing
- PDF
- Dokumen pendukung

---

# 14. Asset Search

Pengguna dapat mencari berdasarkan:

- Asset ID
- Nama
- Area
- Jenis aset
- Status
- Kondisi

Contoh:

```text
Search: MH-1024
```

Sistem langsung:

1. Menampilkan aset.
2. Membuka lokasi pada peta.
3. Menampilkan informasi singkat.

---

# 15. Inspection Management

## 15.1 Create Inspection

Teknisi dapat membuat laporan inspeksi.

Field:

- Asset
- Tanggal
- Petugas
- Kondisi
- Kategori masalah
- Catatan
- Foto

## 15.2 Kondisi Aset

Status kondisi:

- Good
- Fair
- Warning
- Critical

## 15.3 Issue Category

Contoh:

- Blockage
- Sedimentation
- Structural Damage
- Cover Damage
- Leakage
- Overflow
- Other

---

# 16. Maintenance Reminder

Fitur sederhana untuk MVP.

Sistem dapat menampilkan:

- Aset belum diinspeksi.
- Inspeksi mendekati jatuh tempo.
- Inspeksi overdue.
- Aset dengan kondisi Critical.

---

# 17. Foto dan Dokumentasi Lapangan

Setiap aset dapat memiliki:

- Foto lokasi.
- Foto kondisi.
- Foto sebelum maintenance.
- Foto setelah maintenance.

Metadata:

- Tanggal upload.
- User.
- Deskripsi.

---

# 18. QR Code Asset

Setiap aset dapat memiliki QR Code unik.

Contoh:

```text
MH-001
QR CODE
```

Saat teknisi melakukan scan:

1. Sistem membuka halaman aset.
2. Menampilkan lokasi.
3. Menampilkan informasi.
4. Menampilkan riwayat.
5. Teknisi dapat membuat inspeksi baru.

Fitur ini sangat berguna karena mengurangi kesalahan identifikasi aset di lapangan.

---

# 19. Map Layer

Pengguna dapat mengaktifkan atau menonaktifkan layer:

- Manhole
- Pipe
- Pump Station
- Critical Asset
- Inspection Due
- Area Boundary

---

# 20. Filter Peta

Filter:

- Area
- Asset Type
- Asset Status
- Condition
- Inspection Status

Contoh:

```text
Area: Zone A
Condition: Critical
Asset Type: Manhole
```

---

# 21. Import Data

MVP mendukung import CSV/Excel.

Data yang dapat diimport:

- Manhole
- Pipe
- Pump Station

Tujuan:

Mempercepat migrasi data dari spreadsheet existing.

## Validasi Import

Sistem memeriksa:

- Duplicate Asset ID.
- Koordinat invalid.
- Asset reference tidak ditemukan.
- Pipe connection invalid.

---

# 22. Export Data

Pengguna dapat export:

- Asset List
- Inspection History
- Asset Condition

Format:

- CSV
- Excel

---

# 23. User Management

Role:

| Role | Hak Akses |
|---|---|
| Admin | Full Access |
| Engineer | Asset + Map + Inspection |
| Technician | View Asset + Create Inspection |
| Management | Dashboard + View |

---

# 24. Non-Functional Requirements

## Performance

- Peta dapat membuka ribuan aset secara bertahap.
- Asset search kurang dari 2 detik pada kondisi normal.
- Map menggunakan clustering untuk jumlah marker besar.

## Security

- Authentication.
- Role Based Access Control.
- Audit log untuk perubahan data penting.
- Validasi input.

## Backup

Data yang wajib dibackup:

- Database aset.
- Network topology.
- Inspection history.
- Foto dan attachment.
- User data dan konfigurasi.

---

# 25. Data Model Tingkat Tinggi

## assets

```text
id
asset_code
name
asset_type
latitude
longitude
elevation
status
condition
area_id
created_at
updated_at
```

## pipes

```text
id
asset_id
from_asset_id
to_asset_id
diameter
material
length
flow_direction
```

## inspections

```text
id
asset_id
inspection_date
inspector_id
condition
issue_category
notes
```

## attachments

```text
id
asset_id
inspection_id
file_name
file_url
uploaded_at
```

---

# 26. Konsep Network Model

Rekomendasi model:

```text
ASSET NODE
    │
    ├── Manhole
    │
    ├── Pump Station
    │
    └── Other Node

EDGE
    │
    └── Pipe
```

Secara konsep:

```text
Node A ───── Pipe ───── Node B
```

Dengan struktur ini aplikasi dapat melakukan:

- Downstream tracing.
- Upstream tracing.
- Path finding.
- Connected asset detection.
- Isolated asset detection.

---

# 27. User Flow Utama

## Menambahkan Manhole

```text
Login
  ↓
Asset Management
  ↓
Add Manhole
  ↓
Pilih lokasi pada Map
  ↓
Input data
  ↓
Save
```

## Menambahkan Pipa

```text
Pilih From Manhole
       ↓
Pilih To Manhole
       ↓
Draw Pipe
       ↓
Tentukan Direction
       ↓
Input spesifikasi
       ↓
Save
```

## Trace Network

```text
Open Map
   ↓
Select Manhole
   ↓
Trace Downstream
   ↓
Highlight Route
   ↓
Show Pump Station
```

---

# 28. Out of Scope MVP

Fitur berikut tidak dibuat pada tahap pertama:

- SCADA.
- Real-time PLC control.
- Hydraulic simulation.
- AI prediction.
- Mobile native application.
- Automatic IoT sensor integration.
- ERP integration.
- Advanced maintenance planning.
- Digital twin 3D.

---

# 29. Future Roadmap

## Phase 2

- IoT sensor integration.
- Real-time water level.
- Pump status.
- Flow monitoring.
- Alarm dan notification.
- Work order maintenance.
- Mobile application.
- Offline field mode.

## Phase 3

- AI anomaly detection.
- Predictive maintenance.
- Hydraulic analysis.
- Automatic blockage detection.
- Failure prediction.
- Integration dengan SCADA.

---

# 30. Prioritas MVP

## Priority 1 — Wajib

- Authentication.
- Asset management.
- Interactive map.
- Manhole management.
- Pipe management.
- Pump station.
- Network topology.
- Flow direction.
- Upstream/downstream tracing.

## Priority 2 — Penting

- Inspection.
- Foto.
- Search.
- Filter.
- Dashboard.
- QR Code.

## Priority 3 — Setelah MVP Stabil

- Import Excel.
- Export Excel.
- Reminder.
- Advanced reporting.
- IoT integration.

---

# 31. Risiko Produk

## Risiko 1 — Data Koordinat Tidak Akurat

Jika data GPS salah, visualisasi jaringan juga salah.

Mitigasi:

- Validasi koordinat.
- Edit posisi langsung pada map.
- Verifikasi lapangan.

## Risiko 2 — Topology Tidak Lengkap

Data pipa mungkin tidak memiliki informasi manhole asal dan tujuan.

Mitigasi:

- Status topology validation.
- Penandaan "Unknown Connection".
- Proses data verification.

## Risiko 3 — Scope Terlalu Besar

Kesalahan umum adalah mencoba membuat:

> GIS + SCADA + CMMS + ERP + IoT + AI sekaligus.

Mitigasi:

Fokus MVP:

> Asset → Map → Connection → Flow → Inspection

---

# 32. Rekomendasi Teknologi

## Frontend

- React
- TypeScript
- Leaflet atau MapLibre
- TanStack Query

## Backend

Pilihan:

- FastAPI
atau
- Node.js / NestJS

## Database

Rekomendasi utama:

- PostgreSQL
- PostGIS untuk data spasial

## Storage

- S3 Compatible Storage
- MinIO untuk self-hosted deployment

## Infrastructure

- Docker
- Coolify atau Docker Compose
- PostgreSQL
- Object Storage

---

# 33. Kesimpulan

Produk ini harus diposisikan sebagai:

> **Sistem informasi aset dan network intelligence untuk jaringan air limbah.**

Nilai utama aplikasi bukan hanya menyimpan koordinat aset.

Nilai sebenarnya adalah kemampuan menjawab pertanyaan operasional:

- Di mana manhole ini?
- Terhubung ke mana?
- Air mengalir ke arah mana?
- Jalur mana yang menuju stasiun pompa?
- Aset mana yang berada di upstream?
- Jika terjadi masalah di titik ini, area mana yang berpotensi terdampak?
- Kapan terakhir aset diperiksa?
- Bagaimana kondisi aset saat ini?

Fokus MVP:

**Locate → Understand Connection → Understand Flow → Inspect → Maintain**