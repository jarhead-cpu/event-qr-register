import nodemailer from 'nodemailer'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface EmailParams {
  to: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  eventMapsLink?: string
  status: 'confirmed' | 'rejected'
  participantName: string
}

export async function sendPaymentStatusEmail({
  to,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventMapsLink,
  status,
  participantName
}: EmailParams) {
  const formattedDate = format(parseISO(eventDate), 'EEEE, dd MMMM yyyy', { locale: id })
  const formattedTime = eventTime.substring(0, 5) + ' WIB'
  
  const isConfirmed = status === 'confirmed'
  const subject = isConfirmed 
    ? `✅ Pembayaran Dikonfirmasi - ${eventTitle}`
    : `❌ Pembayaran Ditolak - ${eventTitle}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: ${isConfirmed ? '#10b981' : '#ef4444'};
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: white;
          padding: 30px 20px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .event-details {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .detail-label {
          font-weight: 600;
          color: #374151;
        }
        .maps-link {
          color: #3b82f6;
          text-decoration: none;
        }
        .maps-link:hover {
          text-decoration: underline;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
          font-size: 14px;
          color: #6b7280;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          background: ${isConfirmed ? '#dcfce7' : '#fee2e2'};
          color: ${isConfirmed ? '#166534' : '#991b1b'};
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">
          ${isConfirmed ? '🎉 Pembayaran Dikonfirmasi!' : '❌ Pembayaran Ditolak'}
        </h1>
      </div>
      
      <div class="content">
        <p>Halo <strong>${participantName}</strong>,</p>
        
        ${isConfirmed ? `
          <p>Selamat! Pembayaran Anda untuk event <strong>${eventTitle}</strong> telah dikonfirmasi.</p>
          <p>Anda telah terdaftar sebagai peserta event. Berikut detail event yang akan Anda ikuti:</p>
        ` : `
          <p>Mohon maaf, pembayaran Anda untuk event <strong>${eventTitle}</strong> tidak dapat dikonfirmasi.</p>
          <p>Hal ini bisa terjadi karena kuota event telah penuh atau ada masalah dengan bukti pembayaran yang Anda kirimkan.</p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Kuota event telah penuh. Dana akan segera direfund.</strong></p>
          </div>
          <p>Berikut detail event yang dimaksud:</p>
        `}
        
        <div class="event-details">
          <h3 style="margin-top: 0; color: #1f2937;">${eventTitle}</h3>
          
          <div class="detail-row">
            <span class="detail-label">📅 Tanggal:</span>
            <span>${formattedDate}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">⏰ Waktu:</span>
            <span>${formattedTime}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">📍 Lokasi:</span>
            <span>${eventLocation}</span>
          </div>
          
          ${eventMapsLink ? `
            <div class="detail-row">
              <span class="detail-label">🗺️ Google Maps:</span>
              <span><a href="${eventMapsLink}" class="maps-link" target="_blank">Lihat Lokasi</a></span>
            </div>
          ` : ''}
          
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="status-badge">${isConfirmed ? 'DITERIMA' : 'DITOLAK'}</span>
          </div>
        </div>
        
        ${isConfirmed ? `
          <p><strong>Langkah selanjutnya:</strong></p>
          <ul>
            <li>Simpan email ini sebagai bukti konfirmasi</li>
            <li>Datang tepat waktu sesuai jadwal event</li>
            <li>Bawa identitas diri (KTP/SIM/Kartu Pelajar)</li>
            <li>Hubungi kami jika ada pertanyaan</li>
          </ul>
          
          <p>Terima kasih telah mendaftar dan sampai jumpa di event!</p>
        ` : `
          <p>Jika Anda merasa ada kesalahan atau ingin mengajukan pertanyaan, silakan hubungi kami.</p>
          <p>Terima kasih atas pengertian Anda.</p>
        `}
      </div>
      
      <div class="footer">
        <p style="margin: 0;">
          Email ini dikirim otomatis dari sistem Event Registration.<br>
          Jangan balas email ini. Untuk pertanyaan, silakan hubungi admin event.
        </p>
      </div>
    </body>
    </html>
  `

  const text = `
    ${isConfirmed ? 'Pembayaran Dikonfirmasi!' : 'Pembayaran Ditolak'}
    
    Halo ${participantName},
    
    ${isConfirmed 
      ? `Selamat! Pembayaran Anda untuk event "${eventTitle}" telah dikonfirmasi.`
      : `Mohon maaf, pembayaran Anda untuk event "${eventTitle}" tidak dapat dikonfirmasi.`
    }
    
    Detail Event:
    - Judul: ${eventTitle}
    - Tanggal: ${formattedDate}
    - Waktu: ${formattedTime}
    - Lokasi: ${eventLocation}
    ${eventMapsLink ? `- Google Maps: ${eventMapsLink}` : ''}
    - Status: ${isConfirmed ? 'DITERIMA' : 'DITOLAK'}
    
    ${isConfirmed 
      ? 'Terima kasih telah mendaftar dan sampai jumpa di event!'
      : 'Kuota event telah penuh. Dana akan segera direfund.'
    }
  `

  try {
    await transporter.sendMail({
      from: `"${process.env.APP_NAME || 'Event Registration'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })
    
    console.log(`Email sent to ${to} for event ${eventTitle} with status ${status}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Test email configuration
export async function testEmailConfig() {
  try {
    await transporter.verify()
    console.log('Email configuration is valid')
    return { success: true }
  } catch (error) {
    console.error('Email configuration error:', error)
    return { success: false, error }
  }
}