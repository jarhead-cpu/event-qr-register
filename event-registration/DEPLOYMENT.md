# Panduan Deployment

Panduan lengkap untuk deploy aplikasi Event Registration System ke production.

## 🚀 Deployment ke Vercel

### Persiapan

1. **Push Code ke GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Login ke Vercel**
   - Kunjungi [vercel.com](https://vercel.com)
   - Login dengan GitHub account

### Setup Project di Vercel

1. **Import Project**
   - Klik "New Project"
   - Import repository dari GitHub
   - Pilih repository `event-registration`

2. **Configure Build Settings**
   - Framework Preset: `Next.js`
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Environment Variables**
   Tambahkan semua environment variables berikut di Vercel Dashboard:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Email Configuration (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password

   # Next.js Configuration
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_nextauth_secret_here

   # App Configuration
   APP_NAME=Event Registration
   APP_URL=https://your-app.vercel.app
   ```

4. **Deploy**
   - Klik "Deploy"
   - Tunggu proses build selesai

## 🗄️ Setup Supabase Production

### 1. Database Setup

1. **Buat Project Supabase**
   - Login ke [supabase.com](https://supabase.com)
   - Klik "New Project"
   - Pilih Organization dan isi detail project

2. **Jalankan SQL Schema**
   - Buka SQL Editor di Supabase Dashboard
   - Copy paste isi file `supabase-schema.sql`
   - Jalankan query

3. **Setup Storage**
   - Buka Storage di Supabase Dashboard
   - Bucket `event-files` akan otomatis dibuat oleh SQL schema
   - Pastikan bucket bersifat public

### 2. Authentication Setup

1. **Email Provider**
   - Buka Authentication > Settings
   - Pastikan Email provider diaktifkan
   - Set Site URL ke domain Vercel Anda

2. **Redirect URLs**
   - Tambahkan URL callback:
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/admin/dashboard`

## 📧 Setup Email SMTP

### Gmail Setup

1. **Enable 2FA**
   - Login ke Google Account
   - Security > 2-Step Verification
   - Aktifkan 2FA

2. **Generate App Password**
   - Google Account > Security
   - App passwords
   - Generate password untuk "Mail"
   - Gunakan password ini sebagai `SMTP_PASSWORD`

### Alternative SMTP Providers

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASSWORD=your_mailgun_password
```

## 🔧 Environment Variables Detail

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password | `your-app-password` |
| `NEXTAUTH_SECRET` | NextAuth secret key | `random-secret-string` |
| `APP_NAME` | Application name | `Event Registration` |
| `APP_URL` | Application URL | `https://your-app.vercel.app` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXTAUTH_URL` | NextAuth URL | Auto-detected in Vercel |

## 🧪 Testing Deployment

### 1. Basic Functionality Test

1. **Homepage**
   - Akses `https://your-app.vercel.app`
   - Pastikan homepage load dengan benar

2. **Admin Login**
   - Akses `/admin/login`
   - Coba register admin baru
   - Coba login dengan admin

3. **Create Event**
   - Login sebagai admin
   - Buat event baru
   - Test form builder

4. **Public Registration**
   - Akses URL event yang dibuat
   - Test form registrasi
   - Test upload file

5. **Email Notification**
   - Update status pembayaran peserta
   - Cek apakah email terkirim

### 2. Performance Test

1. **Lighthouse Score**
   - Buka Chrome DevTools
   - Tab Lighthouse
   - Run audit untuk Performance, SEO, Accessibility

2. **Load Time**
   - Test kecepatan loading halaman
   - Pastikan < 3 detik untuk First Contentful Paint

## 🔒 Security Checklist

### Supabase Security

- ✅ Row Level Security (RLS) aktif
- ✅ Service role key tidak di-expose ke client
- ✅ Storage policies configured
- ✅ Auth redirect URLs configured

### Application Security

- ✅ Environment variables tidak di-commit ke git
- ✅ HTTPS enabled (otomatis di Vercel)
- ✅ CSRF protection (built-in Next.js)
- ✅ Input validation dengan Zod

## 🚨 Troubleshooting

### Build Errors

1. **TypeScript Errors**
   ```bash
   npm run type-check
   ```

2. **Missing Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   - Pastikan semua env vars sudah diset di Vercel
   - Redeploy setelah update env vars

### Runtime Errors

1. **Database Connection**
   - Cek Supabase project status
   - Verify connection strings

2. **Email Not Sending**
   - Test SMTP credentials
   - Cek spam folder
   - Verify email provider settings

3. **File Upload Issues**
   - Cek Supabase storage bucket
   - Verify storage policies
   - Check file size limits

### Performance Issues

1. **Slow Loading**
   - Enable Vercel Analytics
   - Optimize images
   - Check database queries

2. **High Memory Usage**
   - Monitor Vercel function logs
   - Optimize heavy operations

## 🔄 Update Deployment

### Automatic Deployment

Vercel akan otomatis deploy setiap push ke branch `main`:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deployment

1. Login ke Vercel Dashboard
2. Pilih project
3. Klik "Redeploy" pada deployment terakhir

## 📊 Monitoring

### Vercel Analytics

1. Enable di Project Settings
2. Monitor performance metrics
3. Track user engagement

### Error Monitoring

1. Setup Sentry (optional)
2. Monitor Vercel function logs
3. Setup alerts untuk errors

## 🎯 Production Checklist

Sebelum go-live, pastikan:

- ✅ Semua fitur tested di production
- ✅ Email notifications working
- ✅ File uploads working
- ✅ Database backup strategy
- ✅ Domain configured (jika custom domain)
- ✅ SSL certificate active
- ✅ Analytics setup
- ✅ Error monitoring active
- ✅ Performance optimized
- ✅ Security measures implemented

## 🌐 Custom Domain (Optional)

1. **Beli Domain**
   - Namecheap, GoDaddy, dll.

2. **Setup di Vercel**
   - Project Settings > Domains
   - Add custom domain
   - Follow DNS configuration

3. **Update Environment Variables**
   ```env
   APP_URL=https://your-custom-domain.com
   NEXTAUTH_URL=https://your-custom-domain.com
   ```

4. **Update Supabase**
   - Update Site URL di Supabase Auth settings
   - Update redirect URLs

Selamat! Aplikasi Event Registration System Anda sudah live di production! 🎉