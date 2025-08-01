'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, Type, Mail, Phone, List, CheckSquare, Upload, FileText } from 'lucide-react'

interface FormField {
  id: string
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox' | 'file' | 'textarea'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface FormBuilderProps {
  fields: FormField[]
  onChange: (fields: FormField[]) => void
}

const fieldTypes = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'tel', label: 'Telepon', icon: Phone },
  { value: 'textarea', label: 'Text Area', icon: FileText },
  { value: 'select', label: 'Pilihan', icon: List },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'file', label: 'Upload File', icon: Upload },
]

export default function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: getDefaultLabel(type),
      placeholder: getDefaultPlaceholder(type),
      required: false,
      options: type === 'select' ? ['Pilihan 1', 'Pilihan 2'] : undefined
    }
    onChange([...fields, newField])
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updatedFields = fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    )
    onChange(updatedFields)
  }

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index))
  }

  const moveField = (fromIndex: number, toIndex: number) => {
    const updatedFields = [...fields]
    const [movedField] = updatedFields.splice(fromIndex, 1)
    updatedFields.splice(toIndex, 0, movedField)
    onChange(updatedFields)
  }

  const getDefaultLabel = (type: string) => {
    const labels = {
      text: 'Nama Lengkap',
      email: 'Email',
      tel: 'Nomor Telepon',
      textarea: 'Keterangan',
      select: 'Pilihan',
      checkbox: 'Persetujuan',
      file: 'Upload File'
    }
    return labels[type as keyof typeof labels] || 'Field'
  }

  const getDefaultPlaceholder = (type: string) => {
    const placeholders = {
      text: 'Masukkan nama lengkap',
      email: 'contoh@email.com',
      tel: '08123456789',
      textarea: 'Masukkan keterangan...',
      select: '',
      checkbox: '',
      file: ''
    }
    return placeholders[type as keyof typeof placeholders] || ''
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      moveField(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Builder</h3>
        
        {/* Field Types */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {fieldTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => addField(value as FormField['type'])}
              className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm"
            >
              <Icon className="w-4 h-4 text-gray-600" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Type className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada field form. Klik tombol di atas untuk menambah field.</p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white border rounded-lg p-4 ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="cursor-move text-gray-400 mt-2">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                        placeholder="Label field"
                      />
                    </div>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { 
                        type: e.target.value as FormField['type'],
                        options: e.target.value === 'select' ? ['Pilihan 1', 'Pilihan 2'] : undefined
                      })}
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {field.type !== 'checkbox' && field.type !== 'file' && (
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(index, { placeholder: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Placeholder text"
                    />
                  )}

                  {field.type === 'select' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilihan (satu per baris)
                      </label>
                      <textarea
                        value={field.options?.join('\n') || ''}
                        onChange={(e) => updateField(index, { 
                          options: e.target.value.split('\n').filter(opt => opt.trim()) 
                        })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Pilihan 1&#10;Pilihan 2&#10;Pilihan 3"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Wajib diisi</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => removeField(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview */}
      {fields.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Preview Form</h4>
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" disabled>
                    <option>Pilih {field.label}</option>
                    {field.options?.map(option => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" disabled />
                    <span className="text-sm">{field.label}</span>
                  </label>
                ) : field.type === 'textarea' ? (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder={field.placeholder}
                    rows={3}
                    disabled
                  />
                ) : field.type === 'file' ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">Upload file</span>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder={field.placeholder}
                    disabled
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}