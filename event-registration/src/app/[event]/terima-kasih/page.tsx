import Link from 'next/link'
import { CheckCircle, Calendar, Clock, MapPin, Mail } from 'lucide-react'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pendaftaran Berhasil!
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Terima kasih telah mendaftar untuk event ini. Kami telah menerima pendaftaran Anda 
            dan akan memproses pembayaran Anda dalam 1x24 jam.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <p className="font-medium text-blue-900 text-sm">
                  Cek Email Anda
                </p>
                <p className="text-blue-700 text-sm">
                  Kami akan mengirimkan konfirmasi pembayaran melalui email yang Anda daftarkan.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Langkah Selanjutnya:</h3>
            <div className="text-left space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Tunggu konfirmasi pembayaran via email</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Siapkan diri untuk mengikuti event</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Hubungi kami jika ada pertanyaan</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}