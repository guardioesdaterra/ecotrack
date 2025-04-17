import { useEffect, useState } from "react"
import { useMap } from "react-leaflet"
import { supabase } from "@/lib/supabase-client"
import React from "react"
import { ActivityWithVisuals, Connection } from "@/lib/types/supabase"

declare const L: any

export const ConnectionLines: React.FC<{ activities: ActivityWithVisuals[] }> = ({ activities }) => {
  const map = useMap()
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const { data, error } = await supabase
          .from('connections')
          .select('*')
        
        if (error) {
          throw error
        }
        
        setConnections(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar conexões')
        console.error('Supabase error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchConnections()
  }, [])

  useEffect(() => {
    if (!L || !map || isLoading) return

    // Limpar linhas existentes
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
      lines.forEach(line => map && map.removeLayer(line))
    }
  }, [map, activities, connections, isLoading])

  return null
}

// Helper function to get a random color
function getRandomColor() {
  const colors = [
    "#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff0000", "#0000ff"
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
