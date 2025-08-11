import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../supabaseClient'

// Fix leaflet icons for Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function LocationPicker({ setLatLng }) {
  useMapEvents({
    click(e) {
      setLatLng(e.latlng)
    }
  })
  return null
}

export default function MapView({ latLng, setLatLng, refreshKey }) {
  const [reports, setReports] = useState([])

  useEffect(() => {
    fetchReports()
  }, [refreshKey])

  async function fetchReports() {
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching reports', error)
    } else {
      setReports(data || [])
    }
  }

  return (
    <MapContainer center={[-26.5453, 29.2318]} zoom={15} className="leaflet-container">
      <TileLayer
        attribution="&copy; MapTiler &copy; OpenStreetMap contributors"
        url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_KEY}`}
      />

      {reports.map(r => (
        <Marker key={r.id} position={[r.lat, r.lng]}>
          <Popup>
            <div className="max-w-xs">
              <strong>{r.title}</strong>
              <p className="text-sm">{r.description}</p>
              <p className="text-xs mt-1">Category: {r.category} — {new Date(r.created_at).toLocaleString()}</p>
              {r.photo_url && <img src={r.photo_url} alt="photo" className="mt-2 w-full rounded" />}
              <p className="text-xs mt-1">Reported: {new Date(r.created_at).toLocaleString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {latLng && (
        <Marker position={[latLng.lat, latLng.lng]}>
          <Popup>Selected location</Popup>
        </Marker>
      )}

      <LocationPicker setLatLng={setLatLng} />
    </MapContainer>
  )
}
