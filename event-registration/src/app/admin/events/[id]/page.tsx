import { notFound } from 'next/navigation'
import { requireAuthWithProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import EventManagement from '@/components/EventManagement'

interface EventManagementPageProps {
  params: {
    id: string
  }
}

async function getEvent(eventId: string, adminId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('admin_id', adminId)
    .single()
  
  if (error || !event) {
    return null
  }
  
  return event
}

async function getEventRegistrants(eventId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data: registrants, error } = await supabase
    .from('registrants')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching registrants:', error)
    return []
  }
  
  return registrants || []
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

export default async function EventManagementPage({ params }: EventManagementPageProps) {
  const { user } = await requireAuthWithProfile()
  const event = await getEvent(params.id, user.id)
  
  if (!event) {
    notFound()
  }
  
  const [registrants, stats] = await Promise.all([
    getEventRegistrants(event.id),
    getEventStats(event.id)
  ])

  return (
    <EventManagement 
      event={event} 
      registrants={registrants} 
      stats={stats} 
    />
  )
}