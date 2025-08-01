import { requireAuthWithProfile } from '@/lib/auth'
import CreateEventForm from '@/components/CreateEventForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function CreateEventPage() {
  const { user, profile } = await requireAuthWithProfile()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link
              href="/admin/dashboard"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Buat Event Baru</h1>
              <p className="text-gray-600">Buat event dan form registrasi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreateEventForm adminId={user.id} />
      </div>
    </div>
  )
}