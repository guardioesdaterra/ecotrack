"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from 'next/dynamic'
import Loading from '@/components/ui/loading'
import { supabase } from "@/lib/supabase-client"
import { Badge } from "@/components/ui/badge"
import { ParticleEffect } from "@/components/particle-effect"
import { useMediaQuery } from "@/hooks/use-media-query"
import { initLeaflet } from "@/lib/leaflet-init"
import { Activity, ActivityWithVisuals, Connection } from "@/lib/types/supabase"

// CSS for Leaflet - can be imported directly in client components
import "leaflet/dist/leaflet.css"

// Initialize Leaflet
let L = typeof window !== 'undefined' ? initLeaflet() : null;

// Type definition for Leaflet
declare global {
  interface Window {
    L: typeof L;
  }
}

// Import useMap directly (not dynamically) as it's a hook that can't be used with dynamic imports
import { useMap as reactLeafletUseMap } from "react-leaflet"

// Dynamically imported react-leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => <Loading />
  }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

const ZoomControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
)

// Componente para renderizar um único marcador de atividade
function ActivityNode({ activity }: { activity: ActivityWithVisuals }) {
  const [showPopup, setShowPopup] = useState(false)

  // Only create icon when L is available
  const icon = L && L.divIcon ? L.divIcon({
    html: `
      <div class="activity-marker">
        <span>${activity.title}</span>
      </div>
    `,
    className: "custom-activity-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }) : null;

  if (!icon) return null;

  return (
    <Marker
      position={[activity.lat, activity.lng]}
      icon={icon}
      eventHandlers={{
        click: () => setShowPopup(true),
      }}
    >
      {showPopup && (
        <Popup>
          <div>
            <h3>{activity.title}</h3>
            <Badge>{activity.type}</Badge>
            <div>Intensity: {activity.intensity}</div>
            <div>Created: {activity.created_at}</div>
          </div>
        </Popup>
      )}
    </Marker>
  )
}

// Use the directly imported useMap hook
const ConnectionLines: React.FC<{ activities: ActivityWithVisuals[] }> = ({ activities }) => {
  // Using the directly imported hook
  const map = reactLeafletUseMap()
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
    if (!L || !map || isLoading) return;
    
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

function getRandomColor() {
  const colors = [
    "#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff0000", "#0000ff"
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Using the directly imported useMap hook
function MapController() {
  // Using the directly imported hook
  const map = reactLeafletUseMap()
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    if (!map) return;
    
    const container = map.getContainer()
    if (document.documentElement.classList.contains('dark')) {
      container.classList.add("dark-map")
    } else {
      container.classList.remove("dark-map")
    }

    map.options.zoomSnap = 0.1
    map.options.zoomDelta = 0.5

    if (isMobile) {
      map.setView([20, 0], 1.8)
    } else {
      map.setView([20, 0], 2.5)
    }

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        map.setView([20, 0], 1.8)
      } else {
        map.setView([20, 0], 2.5)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [map, isMobile])

  return null
}

export default function MapClient() {
  const [activities, setActivities] = useState<ActivityWithVisuals[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        
        // Verificar se o cliente Supabase está inicializado corretamente
        if (!supabase) {
          throw new Error('Cliente Supabase não inicializado')
        }
        
        // Usar o método de count primeiro para verificar se a tabela está acessível
        const countCheck = await supabase
          .from('activities')
          .select('*', { count: 'exact', head: true })
          
        if (countCheck.error) {
          console.error('Erro na verificação preliminar:', countCheck.error)
          throw countCheck.error
        }
        
        // Agora buscar os dados completos
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          
        if (error) {
          console.error('Detalhes do erro Supabase:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          throw error
        }
        
        if (!data) {
          throw new Error('Dados não encontrados')
        }
        
        // Transform activities to include a color property for visualization
        const transformedActivities = data.map(activity => ({
          ...activity,
          color: getRandomColor()
        })) satisfies ActivityWithVisuals[]
        
        setActivities(transformedActivities)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(`Falha ao buscar atividades: ${errorMessage}`)
        console.error("Erro detalhado ao buscar atividades:", {
          error: err,
          timestamp: new Date().toISOString(),
          component: 'MapClient'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchActivities()
  }, [])

  if (isLoading) return <Loading />
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
            Erro ao carregar o mapa
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            Nenhuma atividade encontrada
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Não há atividades para exibir no mapa.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
      <MapContainer 
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <MapController />

        {activities.map(activity => (
          <ActivityNode key={activity.id} activity={activity} />
        ))}

        <ConnectionLines activities={activities} />
        <ParticleEffect activities={activities} />
      </MapContainer>
    </div>
  )
}
