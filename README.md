# Dimsum Detector

Aplikasi web untuk mendeteksi jenis dimsum dari gambar, menggunakan Vue.js (frontend),
FastAPI (backend), dan model YOLOv11n yang di-fine-tuning dengan dataset dimsum custom.

```
dimsum-detector/
├── backend/       # FastAPI + Ultralytics YOLOv11n
├── frontend/      # Vue 3 + Vite
└── training/      # Pipeline fine-tuning model (data.yaml, train.py)
```

## Arsitektur singkat

```
Browser -> Vue.js frontend -> POST /api/detect -> FastAPI backend -> YOLOv11n -> hasil JSON (bbox + kelas + confidence) -> digambar di canvas
```

---

## 1. Menjalankan backend (lokal)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Letakkan file model hasil fine-tuning (`best.pt`) di `backend/models/best.pt`.
Kalau belum punya model sendiri, lihat bagian **Fine-tuning model** di bawah.

```bash
uvicorn app.main:app --reload --port 8000
```

Cek `http://localhost:8000/docs` untuk Swagger UI, dan `http://localhost:8000/api/health`
untuk memastikan server hidup.

---

## 2. Menjalankan frontend (lokal)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Buka `http://localhost:5173`. Pastikan backend sudah berjalan di `http://localhost:8000`
(atau sesuaikan `VITE_API_BASE_URL` di `.env`).

---

## 3. Fine-tuning model YOLOv11n

Model YOLOv11n pretrained dilatih pada dataset COCO (80 kelas umum), yang tidak punya
kelas dimsum. Karena itu **wajib fine-tuning** dengan dataset dimsum sendiri sebelum dipakai.

### 3.1 Kumpulkan & label gambar

- Kumpulkan foto dimsum dari berbagai jenis, sudut, pencahayaan, dan latar belakang.
  Target awal: minimal ~80-150 gambar per kelas.
- Beri label (bounding box) pakai **[Roboflow](https://roboflow.com)** — paling praktis,
  bisa langsung export ke format YOLO. Alternatif: LabelImg atau CVAT.

### 3.2 Export dataset dari Roboflow

Di halaman project Roboflow: **Download Dataset > format YOLOv11 > Show download code**.
Copy kode Python yang muncul (sudah berisi `api_key`, `workspace`, `project`, `version`
milikmu sendiri) — **jangan ketik ulang manual**, karena nama workspace/project di URL
Roboflow (slug) beda dengan nama tampilan yang kamu lihat di UI.

### 3.3 Training di Google Colab

1. Buka [colab.research.google.com](https://colab.research.google.com), upload notebook
   `dimsum-yolov11n-training.ipynb` yang sudah disediakan.
2. `Runtime > Change runtime type` → pilih **T4 GPU** → Save.
3. Jalankan cell satu per satu dari atas ke bawah (`Shift+Enter` atau klik tombol ▶).
4. Di cell dataset, ganti isinya dengan kode yang di-copy dari Roboflow (langkah 3.2).
5. Jalankan cell training — akan memakan waktu 15 menit sampai beberapa jam tergantung
   jumlah data dan epoch. Biarkan tab tetap terbuka.
6. Cell terakhir otomatis men-download `best.pt` ke laptop kamu.

### 3.4 Pasang model ke backend

```bash
cp best.pt backend/models/best.pt
```

Restart backend (`uvicorn`) supaya model baru ter-load.

### 3.5 Kalau hasil deteksi kurang akurat

- Tambah jumlah data, terutama untuk kelas yang sering salah deteksi
- Cek ulang kualitas label (bounding box terlalu longgar/ketat menurunkan akurasi)
- Tambah variasi kondisi foto (background, pencahayaan, sudut)
- Naikkan `epochs`, atau coba base model `yolo11s.pt` (small) kalau nano kurang akurat

---

## 4. Deployment

### 4.1 Frontend → Vercel

1. Push project ke GitHub (pastikan `frontend/.gitignore` berisi `node_modules`, `dist`,
   `.env` — **jangan sampai `node_modules` ikut ter-commit**, ini penyebab umum error
   `Permission denied` saat build di Vercel).
2. Di Vercel, buat project baru dari repo tersebut.
3. **Root Directory**: set ke `frontend` (karena repo berisi `backend/` dan `frontend/`
   dalam satu folder).
4. Framework Preset otomatis terdeteksi **Vite**. Build command: `npm run build`,
   output directory: `dist`.
5. Di **Settings > Environment Variables**, set `VITE_API_BASE_URL` ke URL backend
   production kamu (lihat opsi backend di bawah).

### 4.2 Backend → pilih salah satu

Vercel dan GitHub Pages **tidak bisa** menjalankan backend Python + model YOLO
(serverless function-nya punya batas ukuran & waktu eksekusi yang terlalu kecil untuk
`ultralytics`/`torch`, dan tidak persist memory antar request). Backend butuh hosting
yang menjalankan proses Python terus-menerus:

| Opsi | Cocok untuk |
|---|---|
| **PC sendiri + ngrok/Cloudflare Tunnel** | Testing/demo sementara |
| **Railway / Render / Fly.io** | Production ringan, ada free tier |
| **Google Cloud Run / VPS** | Production, lebih terkontrol |

Semua opsi hosting berbasis Docker bisa langsung pakai `backend/Dockerfile` yang sudah
disediakan.

### 4.3 Opsi cepat: PC sendiri sebagai server sementara (ngrok)

```bash
# Terminal 1 - jalankan backend seperti biasa
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 - buka tunnel ke internet
ngrok http 8000
```

- Copy URL yang diberikan ngrok (contoh `https://xxxx.ngrok-free.dev`), set sebagai
  `VITE_API_BASE_URL` di Vercel, lalu redeploy.
- **URL ngrok berubah setiap kali di-restart** (kecuali pakai paket static domain) — tiap
  restart, update lagi env var di Vercel dan redeploy.
- PC harus tetap nyala & terkoneksi internet selama aplikasi dipakai.
- ngrok free tier menampilkan halaman warning HTML untuk request yang tidak membawa
  header `ngrok-skip-browser-warning` — header ini sudah ditambahkan di
  `frontend/src/api/detectApi.js` secara default di axios client-nya.

### 4.4 Konfigurasi CORS

`backend/app/main.py` sudah diset dengan `allow_origin_regex` yang otomatis mengizinkan
semua subdomain `*.vercel.app` (baik production maupun preview URL yang berubah tiap
deploy), jadi tidak perlu update manual tiap kali deploy baru:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Kalau deploy frontend di domain lain (bukan `*.vercel.app`), sesuaikan regex atau
tambahkan domain persis ke `allow_origins`.

---

## 5. Troubleshooting

**`sh: .../vite: Permission denied` saat build di Vercel**
`node_modules` ikut ter-commit ke Git dengan permission rusak. Tambahkan `node_modules`
ke `.gitignore`, jalankan `git rm -r --cached node_modules`, commit & push ulang.

**`ERR_NGROK_8012` / connection refused**
Port yang dibuka ngrok tidak sesuai port backend. Pastikan jalankan `ngrok http 8000`
(bukan `ngrok http` tanpa port, yang default ke port 80), dan uvicorn benar jalan di
port 8000.

**CORS error, tapi status 200 OK di Network tab**
Response yang diterima browser bukan JSON dari backend, tapi halaman warning ngrok.
Pastikan axios client di frontend membawa header `ngrok-skip-browser-warning: true`.

**CORS error, request merah/failed tanpa status code**
Backend atau tunnel ngrok sudah tidak jalan / URL sudah berubah. Cek kedua terminal
masih aktif, dan `VITE_API_BASE_URL` di Vercel sudah sesuai URL ngrok/backend terbaru.

**Log backend: `OPTIONS /api/detect ... 400 Bad Request`**
Ini pesan bawaan `CORSMiddleware` FastAPI yang berarti origin request tidak ada di
daftar `allow_origins`/`allow_origin_regex`. Pastikan regex mencakup domain frontend
kamu persis, lalu restart uvicorn (perubahan `main.py` tidak otomatis kepakai tanpa
restart).

**Deteksi menunjukkan kelas COCO (`person`, `bowl`, `food`, dll), bukan nama dimsum**
Model yang di-load bukan hasil fine-tuning. Kemungkinan file di `backend/models/best.pt`
tertukar dengan `yolo11n.pt` (checkpoint pretrained awal). Pastikan yang di-copy adalah
file dari `runs/dimsum-yolov11n/weights/best.pt`, dan restart backend setelah menggantinya.

**Model tidak ditemukan saat backend start**
Pastikan `backend/models/best.pt` ada dan path-nya sesuai `MODEL_PATH` di `.env`.

---

## 6. Struktur API

**POST `/api/detect`**

Request: `multipart/form-data`, field `file` (JPEG/PNG/WebP, maks 10MB)

Response:
```json
{
  "image_width": 1024,
  "image_height": 768,
  "detections": [
    { "class_name": "siomay", "confidence": 0.92, "bbox": [120.5, 80.2, 340.1, 290.7] }
  ]
}
```

**GET `/api/health`** — cek status server (`{"status": "ok"}`)
