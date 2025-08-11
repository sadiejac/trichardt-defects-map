import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ReportForm({ latLng, onSuccess, user }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  async function uploadFile(file) {
    const bucket = import.meta.env.VITE_STORAGE_BUCKET || 'defect-photos'
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file)
    if (error) throw error

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return urlData.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!latLng) return alert('Choose a location on the map first.')
    setLoading(true)

    let photo_url = null
    try {
      if (file) {
        photo_url = await uploadFile(file)
      }

      const payload = {
        user_id: user.id,
        title,
        description,
        category,
        lat: latLng.lat,
        lng: latLng.lng,
        photo_url
      }

      const { error } = await supabase.from('reports').insert(payload)
      setLoading(false)

      if (error) {
        console.error(error)
        alert('Error creating report')
      } else {
        setTitle('')
        setDescription('')
        setCategory('')
        setFile(null)
        onSuccess && onSuccess()
        alert('Report submitted — thank you!')
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
      alert('Upload failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input className="w-full p-2 border rounded" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
      <textarea className="w-full p-2 border rounded" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />

      <select className="w-full p-2 border rounded" value={category} onChange={e=>setCategory(e.target.value)} required>
        <option value="">Select category</option>
        <option value="Pothole">Pothole</option>
        <option value="Streetlight">Streetlight</option>
        <option value="Water">Water</option>
        <option value="Waste">Waste</option>
        <option value="Other">Other</option>
      </select>

      <div>
        <label className="block text-xs mb-1">Attach photo (optional)</label>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
      </div>

      <div className="text-sm text-slate-600">Location: {latLng ? `${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}` : 'Not set'}</div>

      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  )
}
