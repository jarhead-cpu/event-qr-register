import { requireAuthWithProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Plus, Calendar, Users, DollarSign, Clock, Eye, Edit } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

async function getAdminEvents(adminId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('admin_id', adminId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching events:', error)
    return []
  }
  
  return events || []
}

async function getEventStats(eventId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data: stats, error } = await supabase
    .rpc('get_event_stats', { event_uuid: eventId })
  
  if (error) {
    return {
      total_registrants: 0,
      confirmed_registrants: 0,
      pending_registrants: 0,
      rejected_registrants: 0,
      remaining_quota: 0,
      fill_percentage: 0
    }
  }
  
  return stats
}

export default async function AdminDashboard() {
  const { user, profile } = await requireAuthWithProfile()
  const events = await getAdminEvents(user.id)
  
  // Get stats for all events
  const eventsWithStats = await Promise.all(
    events.map(async (event) => {
      const stats = await getEventStats(event.id)
      return { ...event, stats }
    })
  )
  
  const totalEvents = events.length
  const activeEvents = events.filter(e => e.is_active).length
  const totalRegistrants = eventsWithStats.reduce((sum, e) => sum + e.stats.total_registrants, 0)
  const totalConfirmed = eventsWithStats.reduce((sum, e) => sum + e.stats.confirmed_registrants, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600">Selamat datang, {profile.full_name}</p>
            </div>
            <Link
              href="/admin/events/create"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Buat Event Baru
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Events Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{activeEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pendaftar</p>
                <p className="text-2xl font-bold text-gray-900">{totalRegistrants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Terkonfirmasi</p>
                <p className="text-2xl font-bold text-gray-900">{totalConfirmed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Events Anda</h2>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada event</h3>
              <p className="text-gray-600 mb-6">Mulai dengan membuat event pertama Anda</p>
              <Link
                href="/admin/events/create"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Buat Event Baru
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {eventsWithStats.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {event.image_url && (
                          <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {event.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {format(parseISO(event.tanggal_event), 'dd MMM yyyy', { locale: id })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {event.jam_event.substring(0, 5)} WIB
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {event.price === 0 ? 'Gratis' : `Rp ${event.price.toLocaleString('id-ID')}`}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                event.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {event.is_active ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">Total Daftar</p>
                          <p className="text-lg font-bold text-blue-900">{event.stats.total_registrants}</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Dikonfirmasi</p>
                          <p className="text-lg font-bold text-green-900">{event.stats.confirmed_registrants}</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-600 font-medium">Pending</p>
                          <p className="text-lg font-bold text-yellow-900">{event.stats.pending_registrants}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 font-medium">Sisa Kuota</p>
                          <p className="text-lg font-bold text-gray-900">{event.stats.remaining_quota}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Keterisian Event</span>
                          <span>{event.stats.fill_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(event.stats.fill_percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/${event.slug}`}
                        target="_blank"
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Lihat Event"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Kelola Event"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}