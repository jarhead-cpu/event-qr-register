'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, Save, Loader2, Eye } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import FormBuilder from './FormBuilder'

interface FormField {
  id: string
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox' | 'file' | 'textarea'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

const schema = z.object({
  title: z.string().min(1, 'Judul event harus diisi'),
  description: z.string().min(1, 'Deskripsi event harus diisi'),
  slug: z.string().min(1, 'Slug URL harus diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  quota: z.number().min(1, 'Kuota minimal 1 orang'),
  tanggal_event: z.string().min(1, 'Tanggal event harus diisi'),
  jam_event: z.string().min(1, 'Jam event harus diisi'),
  lokasi_event: z.string().min(1, 'Lokasi event harus diisi'),
  link_maps: z.string().url('URL Google Maps tidak valid').optional().or(z.literal('')),
})

interface CreateEventFormProps {
  adminId: string
}

export default function CreateEventForm({ adminId }: CreateEventFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [eventImage, setEventImage] = useState<File | null>(null)
  const [formFields, setFormFields] = useState<FormField[]>([
    {
      id: 'name',
      type: 'text',
      label: 'Nama Lengkap',
      placeholder: 'Masukkan nama lengkap',
      required: true
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'contoh@email.com',
      required: true
    }
  ])
  const [previewUrl, setPreviewUrl] = useState('')
  
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      price: 0,
      quota: 100,
    }
  })

  const watchTitle = watch('title', '')

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    const slug = generateSlug(title)
    setValue('slug', slug)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEventImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

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
      let imageUrl = null

      // Upload event image if provided
      if (eventImage) {
        imageUrl = await uploadFile(eventImage, 'event-images')
      }

      // Create event
      const { data: event, error: insertError } = await supabase
        .from('events')
        .insert({
          admin_id: adminId,
          title: data.title,
          description: data.description,
          slug: data.slug,
          image_url: imageUrl,
          price: data.price,
          quota: data.quota,
          tanggal_event: data.tanggal_event,
          jam_event: data.jam_event,
          lokasi_event: data.lokasi_event,
          link_maps: data.link_maps || null,
          form_fields: formFields,
          is_active: true
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Redirect to event management page
      router.push(`/admin/events/${event.id}`)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat membuat event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Event Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Informasi Event</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Event <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                onChange={(e) => {
                  register('title').onChange(e)
                  handleTitleChange(e)
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan judul event"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Event <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Deskripsikan event Anda..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('slug')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="event-url-slug"
              />
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
              <p className="text-gray-500 text-sm mt-1">
                URL: {process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}/{watch('slug') || 'event-slug'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga (Rp)
              </label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
              <p className="text-gray-500 text-sm mt-1">Masukkan 0 untuk event gratis</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kuota Peserta <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('quota', { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
                min="1"
              />
              {errors.quota && <p className="text-red-500 text-sm mt-1">{errors.quota.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Event <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('tanggal_event')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.tanggal_event && <p className="text-red-500 text-sm mt-1">{errors.tanggal_event.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jam Event <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                {...register('jam_event')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.jam_event && <p className="text-red-500 text-sm mt-1">{errors.jam_event.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi Event <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('lokasi_event')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Alamat lengkap lokasi event"
              />
              {errors.lokasi_event && <p className="text-red-500 text-sm mt-1">{errors.lokasi_event.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Google Maps
              </label>
              <input
                type="url"
                {...register('link_maps')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://maps.google.com/..."
              />
              {errors.link_maps && <p className="text-red-500 text-sm mt-1">{errors.link_maps.message}</p>}
            </div>

            {/* Event Image Upload */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Event (Portrait 4:5)
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    id="event-image"
                    accept="image/*"
                  />
                  <label
                    htmlFor="event-image"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {eventImage ? eventImage.name : 'Klik untuk upload gambar'}
                  </label>
                  <p className="text-gray-500 text-sm mt-1">
                    Format: JPG, PNG (max 5MB)
                  </p>
                </div>
                
                {previewUrl && (
                  <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Builder */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <FormBuilder fields={formFields} onChange={setFormFields} />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex-1 mr-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {watchTitle && (
              <a
                href={`/${watch('slug') || 'preview'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-5 h-5" />
                Preview
              </a>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Buat Event
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}