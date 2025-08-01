'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, Send, Loader2 } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

interface FormField {
  id: string
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox' | 'file' | 'textarea'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface Event {
  id: string
  title: string
  form_fields: FormField[]
  price: number
}

interface EventRegistrationFormProps {
  event: Event
}

export default function EventRegistrationForm({ event }: EventRegistrationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  // Build dynamic schema based on form fields
  const buildSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {}
    
    event.form_fields.forEach(field => {
      switch (field.type) {
        case 'email':
          schemaFields[field.id] = field.required 
            ? z.string().email('Email tidak valid')
            : z.string().email('Email tidak valid').optional()
          break
        case 'tel':
          schemaFields[field.id] = field.required
            ? z.string().min(10, 'Nomor telepon minimal 10 digit')
            : z.string().min(10, 'Nomor telepon minimal 10 digit').optional()
          break
        case 'select':
          schemaFields[field.id] = field.required
            ? z.string().min(1, `${field.label} harus dipilih`)
            : z.string().optional()
          break
        case 'checkbox':
          schemaFields[field.id] = field.required
            ? z.boolean().refine(val => val === true, `${field.label} harus dicentang`)
            : z.boolean().optional()
          break
        default:
          schemaFields[field.id] = field.required
            ? z.string().min(1, `${field.label} harus diisi`)
            : z.string().optional()
      }
    })

    // Add required fields for name and email extraction
    if (!schemaFields.name && !schemaFields.nama) {
      schemaFields.name = z.string().min(1, 'Nama harus diisi')
    }
    if (!schemaFields.email) {
      schemaFields.email = z.string().email('Email tidak valid')
    }

    return z.object(schemaFields)
  }

  const schema = buildSchema()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { data, error } = await supabase.storage
      .from('event-files')
      .upload(filePath, file)

    if (error) {
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-files')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')

    try {
      let paymentProofUrl = null

      // Upload payment proof if provided
      if (paymentProof) {
        paymentProofUrl = await uploadFile(paymentProof, 'payment-proofs')
      }

      // Extract name and email for the registrants table
      const name = data.name || data.nama || data.full_name || 'Unknown'
      const email = data.email

      if (!email) {
        throw new Error('Email harus diisi')
      }

      // Submit registration
      const { error: insertError } = await supabase
        .from('registrants')
        .insert({
          event_id: event.id,
          name,
          email,
          form_data: data,
          payment_proof_url: paymentProofUrl,
          payment_status: 'pending'
        })

      if (insertError) {
        throw insertError
      }

      // Redirect to thank you page
      router.push(`/${event.title.toLowerCase().replace(/\s+/g, '-')}/terima-kasih`)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mendaftar')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field: FormField) => {
    const fieldError = errors[field.id]?.message as string

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              {...register(field.id)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih {field.label}</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.id}>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register(field.id)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </span>
            </label>
            {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              {...register(field.id)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={field.placeholder}
            />
            {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
          </div>
        )

      case 'file':
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <input
                type="file"
                {...register(field.id)}
                className="hidden"
                id={field.id}
                accept="image/*,.pdf"
              />
              <label
                htmlFor={field.id}
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
              >
                Klik untuk upload file
              </label>
              <p className="text-gray-500 text-sm mt-1">
                Format: JPG, PNG, PDF (max 5MB)
              </p>
            </div>
            {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
          </div>
        )

      default:
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              {...register(field.id)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={field.placeholder}
            />
            {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
          </div>
        )
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Form Pendaftaran
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {event.form_fields.map(renderField)}

        {/* Payment Proof Upload - Only show if event has price */}
        {event.price > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bukti Pembayaran <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <input
                type="file"
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                className="hidden"
                id="payment-proof"
                accept="image/*,.pdf"
                required
              />
              <label
                htmlFor="payment-proof"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
              >
                {paymentProof ? paymentProof.name : 'Klik untuk upload bukti pembayaran'}
              </label>
              <p className="text-gray-500 text-sm mt-1">
                Format: JPG, PNG, PDF (max 5MB)
              </p>
              <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded p-2">
                <p className="font-medium">Harga: Rp {event.price.toLocaleString('id-ID')}</p>
                <p>Silakan transfer ke rekening yang telah disediakan dan upload bukti pembayaran</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Daftar Sekarang
            </>
          )}
        </button>
      </form>
    </div>
  )
}