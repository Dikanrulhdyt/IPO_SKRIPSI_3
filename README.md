# IPO Prediction System

Aplikasi berbasis web untuk melakukan prediksi keberhasilan **Initial Public Offering (IPO)** berdasarkan kinerja **underwriter** dengan menerapkan metode **Regresi Logistik**.

Aplikasi terdiri dari beberapa komponen yang saling terhubung, yaitu frontend, backend, machine learning service, dan database MySQL.

---

## 1. Teknologi

| Komponen | Teknologi |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Machine Learning Service | Python, Flask, Scikit-learn |
| Database | MySQL |
| API | REST API |
| Version Control | Git |

---

## 2. Struktur Project

```text
IPO_SKRIPSI_3/
│
├── backend/
│   ├── .env
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── package.json
│   └── ...
│
├── ml-service/
│   ├── app.py
│   ├── model.pkl
│   ├── underwriter_stats.json
│   ├── prob_ir_mapping.json
│   ├── model_metadata.json
│   ├── requirements.txt
│   └── ...
│
├── data/
│   └── ...
│
├── scripts/
│   └── generate_dataset.py
│
├── database/
│   └── ipo_prediction_system2.sql
│
├── .gitignore
└── README.md
```

> Struktur direktori dapat berbeda sesuai dengan isi repository.

---

# 3. Persyaratan Sistem

Sebelum melakukan instalasi, pastikan perangkat telah memiliki:

- Git
- Node.js
- npm
- Python
- MySQL
- Web browser

Versi software dapat diperiksa melalui terminal:

```bash
git --version
node --version
npm --version
python --version
```

Pastikan service **MySQL** dalam keadaan aktif sebelum aplikasi dijalankan.

---

# 4. Mengunduh Source Code

Clone repository menggunakan Git:

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
```

Masuk ke direktori project:

```bash
cd IPO_SKRIPSI_3
```

Seluruh proses instalasi berikutnya dilakukan dari direktori project tersebut.

---

# 5. Konfigurasi Database

Aplikasi menggunakan database MySQL dengan nama:

```text
ipo_prediction_system2
```

## 5.1 Membuat Database

Buat database dengan nama:

```text
ipo_prediction_system2
```

atau jalankan SQL berikut:

```sql
CREATE DATABASE ipo_prediction_system2;
```

---

## 5.2 Import Database

File database tersedia pada direktori:

```text
database/
```

dengan nama:

```text
ipo_prediction_system2.sql
```

Import file tersebut ke database:

```text
ipo_prediction_system2
```

### Menggunakan phpMyAdmin

1. Jalankan MySQL.
2. Buka phpMyAdmin.
3. Buat database `ipo_prediction_system2`.
4. Pilih database tersebut.
5. Pilih menu **Import**.
6. Pilih file `ipo_prediction_system2.sql`.
7. Jalankan proses import.
8. Pastikan seluruh tabel berhasil dibuat.

### Menggunakan MySQL Command Line

```bash
mysql -u root -p ipo_prediction_system2 < database/ipo_prediction_system2.sql
```

Masukkan password MySQL apabila diminta.

---

# 6. Instalasi Backend

Masuk ke direktori backend:

```bash
cd backend
```

Install dependency:

```bash
npm install
```

Setelah proses instalasi selesai, lakukan konfigurasi environment.

## 6.1 Konfigurasi `.env`

File konfigurasi backend berada pada:

```text
backend/.env
```

Contoh konfigurasi:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=ipo_prediction_system2
DB_USERNAME=root
DB_PASSWORD=

ML_SERVICE_URL=http://127.0.0.1:5001
```

Sesuaikan `DB_USERNAME` dan `DB_PASSWORD` dengan konfigurasi MySQL yang digunakan.

> File `.env` tidak disertakan dalam repository apabila mengandung informasi rahasia seperti password database atau API key.

---

# 7. Instalasi Frontend

Kembali ke direktori utama:

```bash
cd ..
```

Masuk ke direktori frontend:

```bash
cd frontend
```

Install dependency:

```bash
npm install
```

Setelah proses selesai, frontend siap dijalankan.

---

# 8. Instalasi Machine Learning Service

Kembali ke direktori utama:

```bash
cd ..
```

Masuk ke direktori machine learning service:

```bash
cd ml-service
```

## 8.1 Membuat Virtual Environment

Windows:

```bash
python -m venv venv
```

Jika perintah `python` tidak tersedia:

```bash
py -m venv venv
```

Linux/macOS:

```bash
python3 -m venv venv
```

---

## 8.2 Mengaktifkan Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

Jika berhasil, terminal akan menampilkan:

```text
(venv)
```

pada awal baris terminal.

---

## 8.3 Install Dependency Python

Jalankan:

```bash
pip install -r requirements.txt
```

Tunggu sampai seluruh dependency selesai di-install.

---

# 9. Menjalankan Aplikasi

Aplikasi terdiri dari beberapa service yang harus berjalan secara bersamaan.

| Service | Port |
|---|---:|
| Frontend | 5173 |
| Backend | 3000 |
| Machine Learning Service | 5001 |
| MySQL | 3306 |

Gunakan **tiga terminal** untuk menjalankan frontend, backend, dan machine learning service.

MySQL harus tetap aktif selama aplikasi digunakan.

---

## 9.1 Menjalankan Machine Learning Service

Pada **Terminal 1**:

```bash
cd IPO_SKRIPSI_3/ml-service
```

Aktifkan virtual environment:

```bash
venv\Scripts\activate
```

Kemudian jalankan:

```bash
python app.py
```

Machine learning service berjalan pada:

```text
http://127.0.0.1:5001
```

Biarkan terminal tetap berjalan.

---

## 9.2 Menjalankan Backend

Pada **Terminal 2**:

```bash
cd IPO_SKRIPSI_3/backend
```

Jalankan:

```bash
npm run dev
```

Backend berjalan pada:

```text
http://localhost:3000
```

Biarkan terminal tetap berjalan.

> Perintah di atas mengikuti script `dev` pada `package.json`. Jika script yang digunakan pada repository berbeda, gunakan script yang tersedia pada `backend/package.json`.

---

## 9.3 Menjalankan Frontend

Pada **Terminal 3**:

```bash
cd IPO_SKRIPSI_3/frontend
```

Jalankan:

```bash
npm run dev
```

Vite akan menampilkan alamat aplikasi pada terminal, umumnya:

```text
http://localhost:5173
```

---

# 10. Mengakses Aplikasi

Setelah frontend, backend, dan machine learning service berjalan, buka browser dan akses:

```text
http://localhost:5173
```

Aplikasi kemudian dapat digunakan melalui browser.

Arsitektur komunikasi sistem:

```text
                    ┌─────────────────┐
                    │     Browser     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Frontend     │
                    │ React / Vite    │
                    │   Port 5173     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Backend     │
                    │ Node / Express  │
                    │   Port 3000     │
                    └──────┬─────┬────┘
                           │     │
                ┌──────────┘     └──────────┐
                ▼                           ▼
        ┌─────────────────┐       ┌─────────────────┐
        │      MySQL      │       │   ML Service    │
        │    Port 3306    │       │ Python / Flask  │
        │                 │       │    Port 5001    │
        └─────────────────┘       └─────────────────┘
```

---

# 11. Urutan Instalasi

Untuk instalasi pada komputer baru, lakukan langkah berikut secara berurutan:

```text
1. Install Git
2. Install Node.js
3. Install Python
4. Install MySQL
5. Jalankan MySQL
6. Clone repository
7. Masuk ke folder IPO_SKRIPSI_3
8. Buat database ipo_prediction_system2
9. Import file database
10. Install dependency backend
11. Konfigurasi backend/.env
12. Install dependency frontend
13. Buat Python virtual environment
14. Install dependency machine learning
15. Jalankan ML Service
16. Jalankan Backend
17. Jalankan Frontend
18. Buka aplikasi melalui browser
```

---

# 12. Menjalankan Kembali Aplikasi

Setelah proses instalasi selesai, dependency tidak perlu di-install kembali.

Pastikan MySQL aktif, kemudian jalankan tiga service berikut.

### Terminal 1 — Machine Learning Service

```bash
cd IPO_SKRIPSI_3/ml-service
venv\Scripts\activate
python app.py
```

### Terminal 2 — Backend

```bash
cd IPO_SKRIPSI_3/backend
npm run dev
```

### Terminal 3 — Frontend

```bash
cd IPO_SKRIPSI_3/frontend
npm run dev
```

Kemudian akses:

```text
http://localhost:5173
```

---

# 13. Menghentikan Aplikasi

Untuk menghentikan service yang sedang berjalan, tekan:

```text
Ctrl + C
```

pada terminal masing-masing.

---

# 14. Troubleshooting

## Database tidak dapat terhubung

Periksa:

- MySQL sedang berjalan.
- Database `ipo_prediction_system2` sudah dibuat.
- Database sudah di-import.
- Username dan password MySQL sesuai.
- Port MySQL sesuai.

Periksa konfigurasi:

```env
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=ipo_prediction_system2
DB_USERNAME=root
DB_PASSWORD=
```

---

## Backend tidak dapat terhubung ke ML Service

Pastikan ML Service sudah dijalankan.

Periksa konfigurasi:

```env
ML_SERVICE_URL=http://127.0.0.1:5001
```

Pastikan ML Service menggunakan port `5001`.

---

## `npm install` gagal

Pastikan Node.js dan npm sudah terpasang:

```bash
node --version
npm --version
```

Kemudian jalankan kembali:

```bash
npm install
```

pada direktori yang sesuai.

---

## `pip install` gagal

Pastikan virtual environment telah aktif:

```bash
venv\Scripts\activate
```

Kemudian:

```bash
pip install -r requirements.txt
```

---

## Python tidak dikenali

Pada Windows, coba:

```bash
py --version
```

Jika tersedia, gunakan:

```bash
py -m venv venv
```

---

## Port sudah digunakan

Pastikan port berikut tidak digunakan oleh aplikasi lain:

```text
3000  → Backend
5001  → Machine Learning Service
5173  → Frontend
3306  → MySQL
```

---

# 15. Informasi Project

**Judul Tugas Akhir**

> Implementasi Regresi Logistik pada Aplikasi Prediksi Keberhasilan Initial Public Offering (IPO) Berdasarkan Kinerja Underwriter Berbasis Web

**Program Studi:** Teknik Informatika  
**Perguruan Tinggi:** STMIK DCI Tasikmalaya

**Pengembang:** Dika Nurul Hidayat
