import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { Calendar, Clock, MapPin, Users, DollarSign } from 'lucide-react'
import EventRegistrationForm from '@/components/EventRegistrationForm'

interface EventPageProps {
  params: {
    event: string
  }
}

async function getEvent(slug: string) {
  const supabase = createServerSupabaseClient()
  
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  
  if (error || !event) {
    return null
  }
  
  return event
}

async function getEventStats(eventId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data: stats, error } = await supabase
    .rpc('get_event_stats', { event_uuid: eventId })
  
  if (error) {
    console.error('Error getting event stats:', error)
    return {
      confirmed_registrants: 0,
      remaining_quota: 0,
      fill_percentage: 0
    }
  }
  
  return stats
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEvent(params.event)
  
  if (!event) {
    notFound()
  }
  
  const stats = await getEventStats(event.id)
  const isQuotaFull = stats.remaining_quota <= 0
  
  const eventDate = format(parseISO(event.tanggal_event), 'EEEE, dd MMMM yyyy', { locale: id })
  const eventTime = event.jam_event.substring(0, 5) // Format HH:MM
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Registrasi Event</h1>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Event Information */}
          <div className="space-y-6">
            {/* Event Image */}
            {event.image_url && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="aspect-[4/5]">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-contain bg-gray-100"
                  />
                </div>
              </div>
            )}
            
            {/* Event Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>
              
              <div className="prose prose-gray max-w-none mb-6">
                <p className="text-gray-600 leading-relaxed">
                  {event.description}
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Tanggal</p>
                    <p className="text-sm">{eventDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Waktu</p>
                    <p className="text-sm">{eventTime} WIB</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Lokasi</p>
                    <p className="text-sm">{event.lokasi_event}</p>
                    {event.link_maps && (
                      <a
                        href={event.link_maps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Lihat di Google Maps
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Harga</p>
                    <p className="text-sm">
                      {event.price === 0 ? 'Gratis' : `Rp ${event.price.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quota Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Kuota Peserta</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Terdaftar</span>
                  <span className="font-medium">{stats.confirmed_registrants} dari {event.quota}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(stats.fill_percentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sisa Kuota</span>
                  <span className={`font-medium ${isQuotaFull ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.remaining_quota} tempat
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Registration Form */}
          <div className="lg:sticky lg:top-8">
            {isQuotaFull ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center">
                  <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Kuota Penuh
                  </h3>
                  <p className="text-gray-600">
                    Maaf, kuota untuk event ini sudah penuh. Silakan coba event lainnya.
                  </p>
                </div>
              </div>
            ) : (
              <EventRegistrationForm event={event} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}