import { useEffect, useState } from 'react'
import MapView from './components/MapView'
import ReportForm from './components/ReportForm'
import Auth from './components/Auth'
import { supabase } from './supabaseClient'

export default function App() {
  const [latLng, setLatLng] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Fetch initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen flex">
      <aside className="w-80 p-4 bg-slate-50 border-r">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Trichardt Defect Reporter</h1>
          <Auth user={user} />
        </div>

        <p className="mb-4 text-sm">Click on the map to choose a location. You must be signed in to submit a report.</p>

        {user ? (
          <ReportForm latLng={latLng} onSuccess={() => setRefreshKey(k=>k+1)} user={user} />
        ) : (
          <div className="p-2 bg-white rounded shadow-sm">
            <p className="mb-2">Please sign in to submit reports.</p>
          </div>
        )}
      </aside>
      <main className="flex-1">
        <MapView latLng={latLng} setLatLng={setLatLng} refreshKey={refreshKey} />
      </main>
    </div>
  )
}
