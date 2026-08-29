# 🚀 Petunjuk Deployment SewerBITA ke Coolify PaaS (Dockerfile Build Pack)

Panduan ini berisi langkah-langkah lengkap untuk melakukan *deployment* aplikasi **SewerBITA** (Sistem Monitoring dan Asset Management Jaringan Air Limbah PT. Bukit Indah Tirta Alam) ke server self-hosted menggunakan **Coolify PaaS** dengan **Dockerfile multi-stage build** dan **Nginx Web Server**.

---

## 📋 Prasyarat Deployment

1. Server Coolify v4 telah aktif dan dapat diakses (misal: `https://coolify.yourdomain.com`).
2. Repository GitHub resmi terhubung: [`https://github.com/agepe58/SewerBITA.git`](https://github.com/agepe58/SewerBITA.git).
3. Domain / Subdomain tujuan telah di-*pointing* (A/AAAA Record) ke IP Server Coolify (`https://sewer.kbi.web.id`).

---

## 🏗️ Struktur Berkas Docker & Web Server

Aplikasi SewerBITA telah dilengkapi dengan berkas konfigurasi produksi siap pakai:

| Berkas | Fungsi |
| :--- | :--- |
| [`Dockerfile`](file:///c:/AntiGravity%20Project/SewerBITA/Dockerfile) | Multi-stage Docker build (Stage 1: Node 20 Build, Stage 2: Nginx Alpine) |
| [`nginx.conf`](file:///c:/AntiGravity%20Project/SewerBITA/nginx.conf) | Konfigurasi Nginx SPA routing (`try_files`), Gzip, Security Headers & `/health` |
| [`.dockerignore`](file:///c:/AntiGravity%20Project/SewerBITA/.dockerignore) | Menyaring `node_modules`, berkas log, dan artefak dev agar ukuran *image* efisien |

---

## 🗄️ Rekomendasi & Konfigurasi Database di Coolify

Untuk aplikasi sistem GIS dan manajemen jaringan air limbahn seperti **SewerBITA**, database yang **sangat direkomendasikan** di Coolify adalah **`PostgreSQL`** yang dilengkapi dengan ekstensi spasial **`PostGIS`**.

### Mengapa PostgreSQL + PostGIS?
- **Dukungan Geospasial Spasial Air Limbah (GIS)**: PostGIS menyediakan tipe data bawaan `ST_Point` (untuk Manhole & Stasiun Pompa), `ST_LineString` (untuk Segmen Pipa Kolektor), serta `ST_Polygon` (untuk Area/Sektor).
- **Performa Query Spasial**: Memungkinkan pencarian radius titik node terdekat (*KNN indexing*), penelusuran topologi aliran gravitasi (*Flow Tracing*), dan kalkulasi jaringan pipa skala ribuan titik secara *real-time*.
- **1-Click Managed Deployment di Coolify**: Coolify menyediakan dukungan deployment instan 1-klik untuk PostgreSQL lengkap dengan *persistent volume*, backup terjadwal otomatis, dan DNS internal.

---

### 🛠️ Langkah-Langkah Deployment PostgreSQL + PostGIS di Coolify

1. **Buat Resource Database Baru di Coolify**:
   - Di Dashboard Coolify $\to$ Masuk ke **Projects** $\to$ Klik **+ New Resource**.
   - Pilih **Databases** $\to$ Klik **PostgreSQL**.
2. **Atur Parameter Database**:
   - **Database Name**: `sewerbita_db`
   - **Postgres User**: `sewerbita_admin`
   - **Postgres Password**: `<password_kuat_anda>`
   - **Image Tag**: Gunakan `postgis/postgis:16-3.4-alpine` (atau `postgres:16-alpine` standar).
3. **Klik Start / Deploy Database**.
4. **Aktifkan Ekstensi PostGIS**:
   - Setelah database aktif (status 🟢 `Running`), buka **Terminal / Database Client** di Coolify atau hubungkan via DBeaver/psql:
   ```sql
   -- Aktifkan ekstensi geospasial PostGIS
   CREATE EXTENSION IF NOT EXISTS postgis;
   
   -- Verifikasi versi PostGIS yang aktif
   SELECT PostGIS_Full_Version();
   ```
---

## 🔗 Arsitektur & Cara Menghubungkan PostgreSQL dengan Web App

Aplikasi peramban Web App (Frontend React/Vite SPA) **tidak terhubung langsung ke PostgreSQL secara TCP port 5432** demi keamanan kredensial dan sandboxing peramban.

Koneksi menggunakan **Arsitektur 3-Tier Enterprise** standar di Coolify:

```
┌────────────────────────────────────────────────────────┐
│ 🌐 User Browser / Client App (SewerBITA Frontend)      │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP REST / JSON API (Port 443)
                           ▼
┌────────────────────────────────────────────────────────┐
│ 🚀 Backend Service API (Node.js Express / Python / Go) │
└──────────────────────────┬─────────────────────────────┘
                           │ TCP Protocol (Port 5432 Internal Docker Network)
                           ▼
┌────────────────────────────────────────────────────────┐
│ 🗄️ PostgreSQL + PostGIS Database Container             │
└────────────────────────────────────────────────────────┘
```

---

### 🛠️ 4 Langkah Menghubungkan Database dengan Aplikasi di Coolify:

#### 1. Atur Environment Variable di Service Backend API (Coolify Dashboard)
Buka aplikasi Backend API Anda di Coolify $\to$ Masuk ke menu **Environment Variables** $\to$ Tambahkan:

```env
# Koneksi String Database ke Service Name PostgreSQL di Coolify
DATABASE_URL=postgresql://sewerbita_admin:<password_anda>@postgres-sewerbita:5432/sewerbita_db?schema=public

# Konfigurasi Pool Connection
DB_HOST=postgres-sewerbita
DB_PORT=5432
DB_NAME=sewerbita_db
DB_USER=sewerbita_admin
DB_PASSWORD=<password_anda>
```

#### 2. Klien Database pada Kode Backend (Node.js / Express Example)
Di dalam kode Backend API, gunakan driver `pg` (node-postgres) atau ORM seperti `Prisma` / `Drizzle`:

```typescript
// db.ts — Contoh koneksi backend ke PostgreSQL + PostGIS
import { Pool } from 'pg';

export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maksimum koneksi simultan
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Query geospasial PostGIS titik Manhole & Pipa
export const getManholesWithGIS = async () => {
  const result = await dbPool.query(`
    SELECT 
      id, asset_code, name, area, condition,
      ST_X(geom::geometry) AS longitude,
      ST_Y(geom::geometry) AS latitude
    FROM manhole_assets;
  `);
  return result.rows;
};
```

#### 3. Hubungkan Web App Frontend (Vite React SPA) ke Backend API
Buka aplikasi Frontend SewerBITA di Coolify $\to$ Masuk ke **Environment Variables** $\to$ Tambahkan:

```env
# URL REST API Backend di Coolify (sesuai domain server Anda)
VITE_API_BASE_URL=https://api.sewer.kbi.web.id
```

Di dalam kode React Frontend ([`src/services/api.ts`](file:///c:/AntiGravity%20Project/SewerBITA/src/services/api.ts)):

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.sewer.kbi.web.id';

export const fetchAssetsFromDatabase = async () => {
  const response = await fetch(`${API_BASE_URL}/api/assets`);
  if (!response.ok) throw new Error('Gagal mengambil data aset dari database');
  return response.json();
};
```

#### 5. Cara Memeriksa Koneksi Database dan Web App Sudah Terhubung (4 Metode Audit)

##### Metode A: Cek Endpoint Status Health Database di Backend API
Setiap layanan backend enterprise menyediakan endpoint verifikasi koneksi database:
- **Akses Endpoint**: `https://api.sewer.kbi.web.id/api/health` (atau `http://192.168.10.236:3005/api/health`)
- **Respon Sukses Terhubung (JSON)**:
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "postgis_version": "POSTGIS=\"3.4.0\"...",
    "database_name": "sewerbita_db",
    "timestamp": "2026-08-30T00:51:00Z"
  }
  ```

##### Metode B: Inspeksi Tab Network pada Browser DevTools (F12)
1. Buka Web App SewerBITA di peramban (`https://sewer.kbi.web.id` atau `http://192.168.10.236:3005`).
2. Tekan **F12** $\to$ Pilih tab **Network** $\to$ Filter berdasarkan **Fetch/XHR**.
3. Buka modul **Katalog Master Aset**, **Peta GIS**, atau **Riwayat Inspeksi**.
4. Periksa baris HTTP Request (`GET /api/assets` atau `GET /api/inspections`):
   - Status **`200 OK`** dengan payload data aset JSON $\to$ **Database 100% Terhubung & Aktif!**
   - Status **`500 Internal Server Error`** $\to$ Backend gagal menghubungi PostgreSQL (periksa `DATABASE_URL`).

##### Metode C: Cek Log Container Backend di Dashboard Coolify
1. Buka Dashboard Coolify $\to$ Masuk ke resource **Backend API Service**.
2. Pilih tab **Logs**.
3. Cari log inisialisasi koneksi:
   - ✅ `"Database pool initialized successfully. Connected to postgres-sewerbita:5432/sewerbita_db"`
   - ❌ `"Connection refused"` atau `"FATAL: password authentication failed"` $\to$ Ada kesalahan pada kredensial `DATABASE_URL`.

##### Metode D: Uji Query psql via Terminal PostgreSQL Coolify
1. Buka Dashboard Coolify $\to$ Masuk ke resource **PostgreSQL Container** (`postgres-sewerbita`).
2. Pilih tab **Terminal** $\to$ Jalankan query pengujian psql:
   ```sql
   psql -U sewerbita_admin -d sewerbita_db -c "SELECT COUNT(*) FROM manhole_assets;"
   ```
3. Jika jumlah baris aset berhasil ditampilkan $\to$ PostgreSQL aktif dan siap menyimpan data aset jaringan air limbah!

---

## 🛠️ Langkah-Langkah Deployment di Dashboard Coolify

### Langkah 1: Buat Resource Aplikasi Baru
1. Buka dashboard Coolify $\to$ Masuk ke menu **Projects** $\to$ Pilih **Default** / Buat Project Baru.
2. Klik tombol **+ New Resource** $\to$ Pilih **Public Repository** (atau **Private Repository** jika repo privat).
3. Masukkan Repository URL: `https://github.com/agepe58/SewerBITA.git`.
4. Pilih Branch: `main`.
5. Klik **Save & Continue**.

### Langkah 2: Konfigurasi Build Pack & Port
1. Pada menu **General Settings**:
   - **Build Pack**: Pilih **`Dockerfile`**.
   - **Dockerfile Location**: `/Dockerfile` (default).
   - **Port Exposes**: `80` (Port HTTP Nginx).
2. Klik **Save**.

### Langkah 3: Pengaturan Domain & SSL (Traefik Proxy)
1. Pada kolom **Domains / FQDN**:
   - Masukkan URL domain utama aplikasi Anda lengkap dengan HTTPS:
     `https://sewer.kbi.web.id`
2. Coolify via Traefik secara otomatis akan menerbitkan dan memperbarui sertifikat SSL Let's Encrypt secara gratis untuk `https://sewer.kbi.web.id`.

### Langkah 4: Pengaturan Health Check Endpoint
1. Gulir ke bagian **Health Check**:
   - **Health Check Path**: `/health`
   - **Health Check Port**: `80`
   - **Expected Status Code**: `200`
   - **Interval**: `30s`
   - **Timeout**: `5s`
   - **Retries**: `3`
2. Klik **Save**.

### Langkah 5: Jalankan Deployment Perdana
1. Klik tombol **Deploy** di pojok kanan atas dashboard Coolify.
2. Pantau **Build Logs** real-time. Coolify akan melakukan:
   - `git clone` kode sumber dari branch `main`
   - Menjalankan `docker build` (multi-stage Node 20 + Nginx)
   - Memverifikasi endpoint `/health`
   - Menerbitkan sertifikat SSL & menghubungkan routing Traefik.
3. Setelah status berubah menjadi **`Running: Healthy`** 🟢, aplikasi SewerBITA siap diakses di domain tujuan!

---

## ⚡ Otomatisasi CI/CD (Auto-Deploy Webhook)

### Opsi A: Automatic Push Deployment (Coolify Built-in)
1. Pada dashboard aplikasi di Coolify, buka **Advanced** $\to$ **General**.
2. Centang **Auto Deploy**.
3. Setiap kali Anda melakukan `git push origin main`, Coolify akan otomatis mendeteksi commit baru dan memperbarui aplikasi secara *zero-downtime*.

### Opsi B: Webhook Deployment via API / GitHub Actions
Jika Anda ingin memicu deployment via GitHub Actions CI/CD:
1. Salin **Webhook Deployment URL** dari tab **Deployments** di Coolify.
2. Gunakan perintah cURL berikut di pipeline GitHub Actions Anda:

```yaml
name: Coolify Trigger Deployment

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify Webhook
        run: |
          curl -X GET "${{ secrets.COOLIFY_WEBHOOK_URL }}" \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_API_TOKEN }}"
```

---

## 🧪 Verifikasi & Diagnostics Produksi

- **Cek Status Health Endpoint**:
  ```bash
  curl -I https://sewer.kbi.web.id/health
  # Expected Response: HTTP/1.1 200 OK (Content-Type: text/plain)
  ```

- **Uji SPA Client Routing**:
  Membuka URL langsung seperti `https://sewer.kbi.web.id/dashboard` tidak akan menghasilkan `404 Not Found` karena `nginx.conf` telah mengonfigurasi `try_files $uri $uri/ /index.html;`.

- **Audit Backup Storage Admin**:
  Setelah dideploy, fitur **Backup & Restore (NAS SMB / Synology WebDAV & Google Drive)** di halaman khusus Admin dapat langsung dihubungkan ke server NAS lokal kantor atau GCP Cloud Storage.

---

## 🖥️ Pengujian Awal Menggunakan IP Lokal Server (LAN / Local Testing)

Menguji aplikasi menggunakan **IP Server Lokal** terlebih dahulu di jaringan lokal (LAN) adalah **langkah terbaik untuk mengisolasi masalah**, memastikan kontainer Docker, Nginx, dan aplikasi Web App berjalan 100% normal sebelum dihubungkan ke Cloudflare Tunnel atau domain publik.

### 🛠️ 3 Langkah Menguji via IP Server Lokal di Coolify:

#### 1. Petakan Port Host di Dashboard Coolify
1. Buka aplikasi **SewerBITA** di Dashboard Coolify $\to$ masuk ke menu **General Settings**.
2. Cari bagian **Ports Exposes / Ports Mapping**:
   - Isi dengan port lokal yang belum terpakai, contoh: **`8080:80`** *(atau `8000:80`)*.
3. Klik **Save** $\to$ Klik **Redeploy**.

#### 2. Akses Aplikasi via IP Lokal Server di Peramban
Buka peramban di komputer yang terhubung dalam satu jaringan LAN dengan server, lalu ketik:
```
http://<IP_SERVER_LOKAL>:8080
```
*Contoh*: `http://192.168.1.50:8080` atau `http://192.168.10.250:8080`.

#### 3. Uji Endpoint Health Check di IP Lokal
Buka URL health check di peramban:
```
http://<IP_SERVER_LOKAL>:8080/health
```
- **Hasil Sukses**: Menampilkan teks polos `OK` (HTTP Status 200).

---

#### 📌 Setelah Pengujian IP Lokal Berhasil:
Jika `http://<IP_SERVER_LOKAL>:8080` dapat diakses dengan lancar:
1. Berarti aplikasi Docker & Nginx Anda **100% Sehat dan Berfungsi Sempurna**.
2. Anda tinggal mengarahkan **Cloudflare Tunnel Public Hostname** ke target lokal tersebut:
   - **Type**: **`HTTP`**
   - **URL**: **`localhost:8080`** *(atau `<IP_SERVER_LOKAL>:8080`)*.

---

## 📞 Troubleshooting Ringkas

| Gejala Error | Penyebab Utama | Solusi Tuntas |
| :--- | :--- | :--- |
| `HTTP 502 Bad Gateway (Cloudflare Tunnel)` | Mismatch protokol HTTP/HTTPS atau Port Mapping antara Cloudflare Tunnel & Coolify Container | Ikuti solusi lengkap **Solusi Khusus 502 Cloudflare Tunnel** di bawah |
| `Health Check Failed` | Endpoint `/health` tidak merespon | Pastikan Port Exposes diisi `80` dan path diisi `/health` |
| `404 Not Found on Refresh` | Nginx tidak mengalihkan halaman SPA | Pastikan `nginx.conf` menyertakan `try_files $uri $uri/ /index.html;` |
| `SSL Certificate Pending` | DNS A-Record belum mengarah ke IP Coolify | Periksa DNS A-Record di Cloudflare/Provider Domain Anda |

---

### 🌐 Solusi Khusus: Mengatasi HTTP 502 Bad Gateway dengan Cloudflare Tunnel (`cloudflared`)

Error **502 Bad Gateway** saat menggunakan Cloudflare Tunnel biasanya disebabkan oleh 3 hal:
1. Cloudflare Tunnel dikonfigurasi ke **`HTTPS`** bukannya **`HTTP`** ke server asal port 80/Traefik.
2. Cloudflare Tunnel mengarah ke Port Host yang belum di-*mapping* di Coolify.
3. *Host Header* tidak cocok dengan yang diharapkan oleh Traefik / Nginx Coolify.

#### Solusi 1: Pengaturan Public Hostname di Dashboard Cloudflare Zero Trust (Sangat Direkomendasikan)
1. Buka **Cloudflare Zero Trust Dashboard** (`dash.teams.cloudflare.com`) $\to$ **Networks** $\to$ **Tunnels**.
2. Pilih Tunnel Anda $\to$ Klik **Configure** $\to$ Masuk ke tab **Public Hostnames**.
3. Edit Hostname `sewer.kbi.web.id`:
   - **Subdomain**: `sewer`
   - **Domain**: `kbi.web.id`
   - **Type**: **`HTTP`** *(PENTING: Gunakan HTTP, BUKAN HTTPS! Karena SSL di-handle di edge Cloudflare)*
   - **URL**: **`localhost:80`** (atau `127.0.0.1:80` jika Traefik mendengarkan port 80 server).
4. Klik **Additional application settings** $\to$ **HTTP Settings**:
   - **HTTP Host Header**: Masukkan `sewer.kbi.web.id` (atau biarkan kosong).
5. Klik **Save Hostname**.

#### Solusi 2: Hubungkan Cloudflare Tunnel Langsung ke Mapped Port Container (Bypass Traefik Proxy)
Jika Anda ingin Cloudflare Tunnel langsung mengarah ke container Nginx SewerBITA tanpa lewat Traefik:
1. Buka aplikasi SewerBITA di Dashboard Coolify $\to$ **General Settings**.
2. Di bagian **Ports Exposes / Custom Ports Mapping**: Isikan port host, misalnya `8080:80`.
3. Klik **Save & Redeploy**.
4. Di Cloudflare Tunnel Public Hostname:
   - **Type**: `HTTP`
   - **URL**: `localhost:8080` (ganti `8080` sesuai port host yang Anda petakan di Coolify).

#### Solusi 3: Jika Cloudflare Tunnel diarahkan ke HTTPS (Port 443)
Jika Anda memilih Type `HTTPS://localhost:443` di Cloudflare Tunnel:
1. Masuk ke **Public Hostname Settings** $\to$ **TLS Settings**.
2. Aktifkan **`No TLS Verify` = ON (Enabled)**. *(Menghindari kesalahan sertifikat SSL self-signed internal Traefik)*.
3. Klik **Save Hostname**.

---
© 2026 PT. Bukit Indah Tirta Alam • SewerBITA Production Coolify Deployment Guide
