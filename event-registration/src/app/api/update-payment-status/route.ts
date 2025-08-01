import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { sendPaymentStatusEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { registrantId, status } = await request.json()

    if (!registrantId || !['confirmed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Get registrant and event details
    const { data: registrant, error: registrantError } = await supabase
      .from('registrants')
      .select(`
        *,
        events (
          title,
          tanggal_event,
          jam_event,
          lokasi_event,
          link_maps
        )
      `)
      .eq('id', registrantId)
      .single()

    if (registrantError || !registrant) {
      return NextResponse.json(
        { error: 'Registrant not found' },
        { status: 404 }
      )
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('registrants')
      .update({ payment_status: status })
      .eq('id', registrantId)

    if (updateError) {
      throw updateError
    }

    // Send email notification
    try {
      await sendPaymentStatusEmail({
        to: registrant.email,
        eventTitle: registrant.events.title,
        eventDate: registrant.events.tanggal_event,
        eventTime: registrant.events.jam_event,
        eventLocation: registrant.events.lokasi_event,
        eventMapsLink: registrant.events.link_maps,
        status: status as 'confirmed' | 'rejected',
        participantName: registrant.name
      })
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}