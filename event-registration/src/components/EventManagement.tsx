'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  ArrowLeft, 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  MapPin, 
  Eye, 
  Download, 
  Link as LinkIcon,
  Check,
  X,
  Clock as ClockIcon,
  ExternalLink,
  Copy
} from 'lucide-react'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import * as Papa from 'papaparse'

interface Registrant {
  id: string
  created_at: string
  name: string
  email: string
  form_data: any
  payment_proof_url: string | null
  payment_status: 'pending' | 'confirmed' | 'rejected'
}

interface Event {
  id: string
  title: string
  description: string
  slug: string
  image_url: string | null
  price: number
  quota: number
  tanggal_event: string
  jam_event: string
  lokasi_event: string
  link_maps: string | null
  form_fields: any[]
  is_active: boolean
}

interface Stats {
  total_registrants: number
  confirmed_registrants: number
  pending_registrants: number
  rejected_registrants: number
  remaining_quota: number
  fill_percentage: number
}

interface EventManagementProps {
  event: Event
  registrants: Registrant[]
  stats: Stats
}

export default function EventManagement({ event, registrants, stats }: EventManagementProps) {
  const [loading, setLoading] = useState('')
  const [selectedRegistrant, setSelectedRegistrant] = useState<Registrant | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all')
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const eventDate = format(parseISO(event.tanggal_event), 'EEEE, dd MMMM yyyy', { locale: id })
  const eventTime = event.jam_event.substring(0, 5)
  const eventUrl = `${window.location.origin}/${event.slug}`

  const filteredRegistrants = registrants.filter(registrant => {
    if (filter === 'all') return true
    return registrant.payment_status === filter
  })

  const updatePaymentStatus = async (registrantId: string, status: 'confirmed' | 'rejected') => {
    setLoading(registrantId)
    
    try {
      const response = await fetch('/api/update-payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrantId, status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update payment status')
      }

      // Refresh the page to get updated data
      router.refresh()
      alert(`Status pembayaran berhasil diupdate ke ${status === 'confirmed' ? 'dikonfirmasi' : 'ditolak'}. Email notifikasi telah dikirim.`)
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Terjadi kesalahan saat mengupdate status pembayaran')
    } finally {
      setLoading('')
    }
  }

  const copyEventLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      alert('Link event berhasil disalin!')
    } catch (error) {
      console.error('Error copying link:', error)
      alert('Gagal menyalin link')
    }
  }

  const exportToCSV = () => {
    const csvData = registrants.map(registrant => {
      const baseData = {
        'Tanggal Daftar': format(parseISO(registrant.created_at), 'dd/MM/yyyy HH:mm'),
        'Nama': registrant.name,
        'Email': registrant.email,
        'Status Pembayaran': registrant.payment_status === 'confirmed' ? 'Dikonfirmasi' : 
                           registrant.payment_status === 'rejected' ? 'Ditolak' : 'Pending',
        'Bukti Pembayaran': registrant.payment_proof_url || 'Tidak ada'
      }

      // Add dynamic form fields
      const formData = registrant.form_data || {}
      event.form_fields.forEach(field => {
        baseData[field.label] = formData[field.id] || ''
      })

      return baseData
    })

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${event.slug}-registrants.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className="w-4 h-4" />
      case 'rejected':
        return <X className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Dikonfirmasi'
      case 'rejected':
        return 'Ditolak'
      default:
        return 'Pending'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link
              href="/admin/dashboard"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <p className="text-gray-600">Kelola peserta event</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyEventLink}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              <Link
                href={`/${event.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Lihat Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Event Info */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              {event.image_url && (
                <div className="w-20 h-25 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{eventDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{eventTime} WIB</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.lokasi_event}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{event.price === 0 ? 'Gratis' : `Rp ${event.price.toLocaleString('id-ID')}`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Statistik</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pendaftar</span>
                  <span className="font-semibold">{stats.total_registrants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dikonfirmasi</span>
                  <span className="font-semibold text-green-600">{stats.confirmed_registrants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{stats.pending_registrants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ditolak</span>
                  <span className="font-semibold text-red-600">{stats.rejected_registrants}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Sisa Kuota</span>
                  <span className="font-semibold">{stats.remaining_quota}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Keterisian</span>
                  <span>{stats.fill_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(stats.fill_percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registrants List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Daftar Peserta</h2>
              <div className="flex items-center gap-4">
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Dikonfirmasi</option>
                  <option value="rejected">Ditolak</option>
                </select>
                
                {/* Export CSV */}
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {filteredRegistrants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'Belum ada peserta' : `Belum ada peserta dengan status ${filter}`}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Peserta akan muncul di sini setelah mendaftar' 
                  : 'Ubah filter untuk melihat peserta lainnya'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peserta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Daftar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bukti Pembayaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRegistrants.map((registrant) => (
                    <tr key={registrant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{registrant.name}</div>
                          <div className="text-sm text-gray-500">{registrant.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(parseISO(registrant.created_at), 'dd MMM yyyy, HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registrant.payment_status)}`}>
                          {getStatusIcon(registrant.payment_status)}
                          {getStatusText(registrant.payment_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {registrant.payment_proof_url ? (
                          <a
                            href={registrant.payment_proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Lihat
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {registrant.payment_status === 'pending' && (
                            <>
                              <button
                                onClick={() => updatePaymentStatus(registrant.id, 'confirmed')}
                                disabled={loading === registrant.id}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                              >
                                <Check className="w-3 h-3" />
                                Konfirmasi
                              </button>
                              <button
                                onClick={() => updatePaymentStatus(registrant.id, 'rejected')}
                                disabled={loading === registrant.id}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                              >
                                <X className="w-3 h-3" />
                                Tolak
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => setSelectedRegistrant(registrant)}
                            className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                          >
                            <Eye className="w-3 h-3" />
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRegistrant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Detail Peserta</h3>
                <button
                  onClick={() => setSelectedRegistrant(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama</label>
                  <p className="text-gray-900">{selectedRegistrant.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedRegistrant.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRegistrant.payment_status)}`}>
                    {getStatusIcon(selectedRegistrant.payment_status)}
                    {getStatusText(selectedRegistrant.payment_status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Daftar</label>
                  <p className="text-gray-900">
                    {format(parseISO(selectedRegistrant.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                  </p>
                </div>
              </div>

              {/* Form Data */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Data Form</h4>
                <div className="space-y-3">
                  {event.form_fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                      <p className="text-gray-900">
                        {selectedRegistrant.form_data?.[field.id] || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Proof */}
              {selectedRegistrant.payment_proof_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bukti Pembayaran</label>
                  <div className="border rounded-lg p-4">
                    <a
                      href={selectedRegistrant.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Bukti Pembayaran
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}