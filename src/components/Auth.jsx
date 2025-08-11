import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth({ user }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (error) alert(error.message)
    else alert('Check your email for the magic link.')
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error(error)
  }

  if (user) {
    return (
      <div className="text-sm">
        <div className="font-medium">{user.email}</div>
        <button onClick={signOut} className="text-xs mt-1 underline">Sign out</button>
      </div>
    )
  }

  return (
    <form onSubmit={signInWithEmail} className="flex gap-2">
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required className="px-2 py-1 rounded border text-sm" />
      <button className="text-sm bg-blue-600 text-white px-2 py-1 rounded" disabled={loading}>{loading ? 'Sending...' : 'Sign in'}</button>
    </form>
  )
}
