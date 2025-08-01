# Event Registration System

Platform lengkap untuk membuat dan mengelola registrasi event dengan form dinamis, manajemen pembayaran, dan notifikasi email otomatis.

## 🚀 Fitur Utama

### 📋 Registrasi Publik
- Halaman event publik dengan URL dinamis (`/[event]`)
- Gambar event dengan rasio portrait 4:5 (Instagram style)
- Form pendaftaran dengan field dinamis (berbasis JSON)
- Upload bukti pembayaran
- Validasi kuota berdasarkan peserta yang sudah membayar
- Halaman "Terima Kasih" setelah registrasi

### 🔐 Admin Dashboard
- Autentikasi admin via Supabase Auth
- Multi-tenant (admin hanya bisa akses event miliknya)
- Dashboard dengan statistik lengkap
- Manajemen status pembayaran (Pending, Dikonfirmasi, Ditolak)
- Preview bukti pembayaran
- Copy link event dengan satu klik
- Export data ke CSV (termasuk field dinamis)

### 📧 Email Otomatis
- Email otomatis saat status pembayaran berubah
- Template email responsive dengan detail event
- Notifikasi untuk status "DITERIMA" atau "DITOLAK"
- Pesan khusus untuk kuota penuh dengan info refund

### 🧩 Form Builder
- Drag & drop form builder
- Berbagai jenis input: text, email, phone, select, checkbox, file, textarea
- Preview real-time
- Validasi form dinamis dengan Zod

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Email**: Nodemailer dengan SMTP
- **Validasi**: Zod + React Hook Form
- **UI**: Lucide React Icons
- **Export**: PapaParse (CSV)
- **Deploy**: Vercel

## 📦 Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd event-registration
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` ke `.env.local` dan isi dengan konfigurasi Anda:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# App Configuration
APP_NAME="Event Registration"
APP_URL=http://localhost:3000
```

### 4. Setup Supabase Database
1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan SQL schema dari file `supabase-schema.sql`
3. Setup storage bucket `event-files` dengan akses public

### 5. Setup Email SMTP
Untuk Gmail:
1. Aktifkan 2-Factor Authentication
2. Generate App Password
3. Gunakan App Password sebagai `SMTP_PASSWORD`

### 6. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🚀 Deploy ke Vercel

### 1. Push ke GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy ke Vercel
1. Login ke [Vercel](https://vercel.com)
2. Import project dari GitHub
3. Set environment variables di Vercel dashboard
4. Deploy!

### 3. Update Environment Variables
Setelah deploy, update `APP_URL` dengan domain Vercel Anda:
```env
APP_URL=https://your-app.vercel.app
```

## 📖 Cara Penggunaan

### Untuk Admin:
1. Akses `/admin/login` untuk login/register
2. Buat event baru di dashboard
3. Setup form registrasi dengan form builder
4. Share link event ke peserta
5. Kelola peserta dan konfirmasi pembayaran
6. Export data peserta ke CSV

### Untuk Peserta:
1. Akses link event yang dibagikan admin
2. Isi form registrasi
3. Upload bukti pembayaran (jika berbayar)
4. Tunggu konfirmasi via email

## 🔧 Konfigurasi

### Database Schema
- `profiles`: Data admin
- `events`: Data event
- `registrants`: Data peserta
- Row Level Security (RLS) aktif untuk keamanan multi-tenant

### Storage
- Bucket `event-files` untuk gambar event dan bukti pembayaran
- Public access untuk gambar event
- Private access untuk bukti pembayaran

### Email Templates
Template email responsive dengan informasi lengkap:
- Detail event (tanggal, waktu, lokasi, Google Maps)
- Status pembayaran
- Instruksi untuk peserta

## 🐛 Troubleshooting

### Email Tidak Terkirim
- Pastikan SMTP credentials benar
- Cek firewall/network restrictions
- Gunakan App Password untuk Gmail

### Upload File Gagal
- Pastikan Supabase storage bucket sudah dibuat
- Cek storage policies
- Pastikan file size < 5MB

### Error Database
- Pastikan RLS policies sudah disetup
- Cek connection string Supabase
- Pastikan user sudah login untuk operasi admin

## 📝 License

MIT License - silakan gunakan untuk project komersial atau personal.

## 🤝 Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📞 Support

Untuk pertanyaan atau bantuan, silakan buat issue di GitHub repository ini.
