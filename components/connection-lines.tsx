import { useEffect, useState } from "react"
import { useMap } from "react-leaflet"
import { supabase } from "@/lib/supabaseClient"
import React from "react"

declare const L: any

interface Activity {
  id: number
  lat: number
  lng: number
  type: string
  title: string
  intensity: number
  created_at: string
}

interface Connection {
  id: number
  from_activity_id: number
  to_activity_id: number
}

export const ConnectionLines: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  const map = useMap()
  const [connections, setConnections] = useState<Connection[]>([])

  useEffect(() => {
    const fetchConnections = async () => {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
      if (error) {
        console.error('Supabase error:', error)
        return
      }
      setConnections(data as Connection[])
    }
    fetchConnections()
  }, [])

  useEffect(() => {
    if (!L) return

    map.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline) {
        map.removeLayer(layer)
      }
    })

    const lines: any[] = []

    connections.forEach((connection) => {
      const fromActivity = activities.find(a => a.id === connection.from_activity_id)
      const toActivity = activities.find(a => a.id === connection.to_activity_id)
      if (fromActivity && toActivity) {
        const latlngs: any[] = [
          [fromActivity.lat, fromActivity.lng],
          [toActivity.lat, toActivity.lng],
        ]

        const line = L.polyline(latlngs, {
          color: getRandomColor(),
          weight: 3,
          opacity: 0.7,
        })
        line.addTo(map)
        lines.push(line)
      }
    })

    return () => {
      lines.forEach(line => map.removeLayer(line))
    }
  }, [map, activities, connections])

  return null
}

// Helper function to get a random color
function getRandomColor() {
  const colors = [
    "#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff0000", "#0000ff"
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
