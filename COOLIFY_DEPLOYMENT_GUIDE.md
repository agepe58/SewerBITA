# 🚀 Petunjuk Deployment SewerBITA ke Coolify PaaS (Dockerfile Build Pack)

Panduan ini berisi langkah-langkah lengkap untuk melakukan *deployment* aplikasi **SewerBITA** (Sistem Monitoring dan Asset Management Jaringan Air Limbah PT. Bukit Indah Tirta Alam) ke server self-hosted menggunakan **Coolify PaaS** dengan **Dockerfile multi-stage build** dan **Nginx Web Server**.

---

## 📋 Prasyarat Deployment

1. Server Coolify v4 telah aktif dan dapat diakses (misal: `https://coolify.yourdomain.com`).
2. Repository GitHub resmi terhubung: [`https://github.com/agepe58/SewerBITA.git`](https://github.com/agepe58/SewerBITA.git).
3. Domain / Subdomain tujuan telah di-*pointing* (A/AAAA Record) ke IP Server Coolify (misal: `sewerbita.bita.co.id`).

---

## 🏗️ Struktur Berkas Docker & Web Server

Aplikasi SewerBITA telah dilengkapi dengan berkas konfigurasi produksi siap pakai:

| Berkas | Fungsi |
| :--- | :--- |
| [`Dockerfile`](file:///c:/AntiGravity%20Project/SewerBITA/Dockerfile) | Multi-stage Docker build (Stage 1: Node 20 Build, Stage 2: Nginx Alpine) |
| [`nginx.conf`](file:///c:/AntiGravity%20Project/SewerBITA/nginx.conf) | Konfigurasi Nginx SPA routing (`try_files`), Gzip, Security Headers & `/health` |
| [`.dockerignore`](file:///c:/AntiGravity%20Project/SewerBITA/.dockerignore) | Menyaring `node_modules`, berkas log, dan artefak dev agar ukuran *image* efisien |

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
   - Masukkan URL domain aplikasi Anda lengkap dengan HTTPS, contoh:
     `https://sewerbita.bita.co.id`
2. Coolify via Traefik secara otomatis akan menerbitkan dan memperbarui sertifikat SSL Let's Encrypt secara gratis.

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
  curl -I https://sewerbita.bita.co.id/health
  # Expected Response: HTTP/1.1 200 OK (Content-Type: text/plain)
  ```

- **Uji SPA Client Routing**:
  Membuka URL langsung seperti `https://sewerbita.bita.co.id/dashboard` tidak akan menghasilkan `404 Not Found` karena `nginx.conf` telah mengonfigurasi `try_files $uri $uri/ /index.html;`.

- **Audit Backup Storage Admin**:
  Setelah dideploy, fitur **Backup & Restore (NAS SMB / Synology WebDAV & Google Drive)** di halaman khusus Admin dapat langsung dihubungkan ke server NAS lokal kantor atau GCP Cloud Storage.

---

## 📞 Troubleshooting Ringkas

| Gejala Error | Penyebab Utama | Solusi Tuntas |
| :--- | :--- | :--- |
| `Health Check Failed` | Endpoint `/health` tidak merespon | Pastikan Port Exposes diisi `80` dan path diisi `/health` |
| `404 Not Found on Refresh` | Nginx tidak mengalihkan halaman SPA | Pastikan `nginx.conf` menyertakan `try_files $uri $uri/ /index.html;` |
| `SSL Certificate Pending` | DNS A-Record belum mengarah ke IP Coolify | Periksa DNS A-Record di Cloudflare/Provider Domain Anda |

---
© 2026 PT. Bukit Indah Tirta Alam • SewerBITA Production Coolify Deployment Guide
