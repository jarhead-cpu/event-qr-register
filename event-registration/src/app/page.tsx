import Link from 'next/link'
import { Calendar, Users, Settings, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Event Registration System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Platform lengkap untuk membuat dan mengelola registrasi event dengan form dinamis, 
            manajemen pembayaran, dan notifikasi email otomatis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Untuk Peserta Event
            </h3>
            <p className="text-gray-600 mb-4">
              Daftar event dengan mudah melalui form yang disesuaikan, upload bukti pembayaran, 
              dan dapatkan konfirmasi otomatis via email.
            </p>
            <div className="text-sm text-gray-500">
              Akses melalui URL event yang dibagikan oleh penyelenggara
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Untuk Admin Event
            </h3>
            <p className="text-gray-600 mb-4">
              Buat event, atur form registrasi, kelola peserta, konfirmasi pembayaran, 
              dan ekspor data dengan dashboard yang lengkap.
            </p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Masuk ke Admin Panel
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Fitur Lengkap
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Form Builder</h4>
              <p className="text-sm text-gray-600">
                Buat form registrasi dengan field dinamis sesuai kebutuhan event
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Manajemen Peserta</h4>
              <p className="text-sm text-gray-600">
                Kelola peserta, konfirmasi pembayaran, dan ekspor data ke CSV
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Email Otomatis</h4>
              <p className="text-sm text-gray-600">
                Kirim notifikasi email otomatis saat status pembayaran berubah
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">
            Siap untuk membuat event pertama Anda?
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-4"
          >
            Mulai Sekarang
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
