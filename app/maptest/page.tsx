"use client"

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from "react"
import { getSupabaseClient } from "@/lib/supabaseClient"

interface Activity {
  id: number
  lat: number
  lng: number
  type: string
  title: string
  intensity: number
  created_at: string
}

export default function MapTestPage() {
  const mapRef = useRef<any>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const client = getSupabaseClient()
        if (!client) {
          throw new Error('Supabase client not initialized')
        }

        const { data, error: supabaseError } = await client
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })

        if (supabaseError) throw supabaseError
        setActivities(data as Activity[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="h-16 w-16 rounded-full bg-neon-cyan animate-neon-pulse shadow-lg shadow-neon-cyan/50"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  const MapWithNoSSR = dynamic(
    () => import('@/components/MapClient').then((mod) => mod.MapClient),
    {
      ssr: false,
      loading: () => (
        <div className="w-full h-screen bg-black flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-neon-cyan animate-neon-pulse"></div>
        </div>
      )
    }
  )

  return (
    <div className="w-full h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/10 to-neon-cyan/10 pointer-events-none z-[399]"></div>

      <MapWithNoSSR 
        activities={activities}
        mapRef={mapRef}
      />

      <div className="absolute inset-0 pointer-events-none z-[399] bg-[url('/grid-overlay.png')] opacity-20 mix-blend-overlay"></div>
      <div className="absolute inset-0 pointer-events-none z-[399] bg-[url('/scanline.png')] opacity-10 mix-blend-lighten" style={{ backgroundBlendMode: 'screen' }}></div>
    </div>
  )
}
