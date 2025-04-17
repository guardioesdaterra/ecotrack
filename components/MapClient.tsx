"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from 'next/dynamic'
import Loading from '@/components/ui/loading'
import { supabase, isSupabaseInitialized } from "@/lib/supabase-client"
import { Badge } from "@/components/ui/badge"
import { ParticleEffect } from "@/components/particle-effect"
import { useMediaQuery } from "@/hooks/use-media-query"
import { initLeaflet } from "@/lib/leaflet-init"
import { Activity, Connection } from "@/lib/types/supabase"
import { logError, getUserFriendlyErrorMessage } from "@/lib/error-handler"

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

// Mapeamento de tipos de atividades para cores específicas
const TYPE_COLOR_MAP: Record<string, string> = {
  'reforestation': '#00FF00', // Verde para reflorestamento
  'cleanup': '#0000FF',       // Azul para limpeza
  'renewable': '#FF00FF',     // Magenta para energia renovável
  'conservation': '#FFFF00',  // Amarelo para conservação
  // Adicione outros tipos conforme necessário
};

// Função para obter a cor com base no tipo de atividade
function getColorByType(type: string): string {
  return TYPE_COLOR_MAP[type] || "#FF0000"; // Vermelho como cor padrão
}

// Helper function to generate random connections between activities
function generateRandomConnections(activities: Activity[], connectionDensity = 0.3): Connection[] {
  if (!activities.length) return []
  
  const connections: Connection[] = []
  const numActivities = activities.length
  
  // Determine number of connections based on density (0-1)
  // Higher density means more connections
  const maxPossibleConnections = (numActivities * (numActivities - 1)) / 2
  const targetNumConnections = Math.max(
    1,
    Math.floor(maxPossibleConnections * connectionDensity)
  )
  
  // Create a set to track which connections we've already created
  const connectionSet = new Set<string>()
  
  while (connections.length < targetNumConnections && connectionSet.size < maxPossibleConnections) {
    // Pick two random activities
    const fromIndex = Math.floor(Math.random() * numActivities)
    let toIndex = Math.floor(Math.random() * numActivities)
    
    // Make sure we're not connecting an activity to itself
    while (toIndex === fromIndex) {
      toIndex = Math.floor(Math.random() * numActivities)
    }
    
    const fromActivity = activities[fromIndex]
    const toActivity = activities[toIndex]
    
    // Create a unique identifier for this connection (ordered to prevent duplicates)
    const connectionKey = [fromActivity.id, toActivity.id].sort().join('-')
    
    // If we haven't created this connection yet, add it
    if (!connectionSet.has(connectionKey)) {
      connectionSet.add(connectionKey)
      connections.push({
        id: connectionKey,
        from_activity_id: fromActivity.id,
        to_activity_id: toActivity.id,
        strength: Math.random() * 0.8 + 0.2 // Random strength between 0.2 and 1.0
      })
    }
  }
  
  return connections
}

// Function to generate random mock activities
function generateMockActivities(count = 20): Activity[] {
  const activityTypes = ['reforestation', 'cleanup', 'renewable', 'conservation']
  const activities: Activity[] = []
  
  for (let i = 1; i <= count; i++) {
    // Generate a random location
    // Latitude range: -60 to 70 (avoiding extreme poles)
    // Longitude range: -180 to 180
    const lat = (Math.random() * 130 - 60) + (Math.random() * 10 - 5)
    const lng = (Math.random() * 360 - 180) + (Math.random() * 20 - 10)
    
    // Random type from the available types
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]
    
    // Random intensity between 1 and 10
    const intensity = Math.floor(Math.random() * 10) + 1
    
    // Random date within the last year
    const createdDate = new Date()
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365))
    
    activities.push({
      id: i,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Project ${i}`,
      type,
      description: `A mock ${type} activity for demonstration purposes.`,
      lat,
      lng,
      intensity,
      created_at: createdDate.toISOString(),
      user_id: `user-${Math.floor(Math.random() * 10) + 1}`
    })
  }
  
  return activities
}

// Componente para renderizar um único marcador de atividade
function ActivityNode({ activity }: { activity: Activity }) {
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
const ConnectionLines: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  // Using the directly imported hook
  const map = reactLeafletUseMap()
  const [connections, setConnections] = useState<Connection[]>([])
  const [mapReady, setMapReady] = useState(false)

  // Wait for map to be properly initialized
  useEffect(() => {
    if (map) {
      // Add a small delay to ensure map bounds are properly initialized
      const timer = setTimeout(() => {
        setMapReady(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [map])

  // Generate random connections when activities change
  useEffect(() => {
    if (activities.length > 0) {
      // Generate random connections with a moderate density
      const randomConnections = generateRandomConnections(activities, 0.35)
      setConnections(randomConnections)
    }
  }, [activities])

  useEffect(() => {
    if (!L || !map || !mapReady || !connections.length) return;
    
    // Limpar linhas existentes
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline) {
        map.removeLayer(layer)
      }
    })

    const lines: any[] = []

    connections.forEach((connection) => {
      try {
        const fromActivity = activities.find(a => a.id === connection.from_activity_id)
        const toActivity = activities.find(a => a.id === connection.to_activity_id)
        
        if (fromActivity && toActivity) {
          const latlngs: any[] = [
            [fromActivity.lat, fromActivity.lng],
            [toActivity.lat, toActivity.lng],
          ]

          const line = L.polyline(latlngs, {
            color: getColorByType(fromActivity.type),
            weight: 2 + (connection.strength || 0.5) * 2,
            opacity: 0.5 + (connection.strength || 0.5) * 0.3,
            dashArray: connection.strength && connection.strength < 0.5 ? "5, 5" : null
          })
          
          line.addTo(map)
          lines.push(line)
        }
      } catch (error) {
        console.error("Error creating connection line:", error);
      }
    })

    return () => {
      lines.forEach(line => {
        try {
          if (map && line) map.removeLayer(line)
        } catch (error) {
          console.error("Error removing line:", error);
        }
      })
    }
  }, [map, activities, connections, mapReady])

  return null
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
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Use setTimeout to simulate network delay
    const timer = setTimeout(() => {
      try {
        // Generate mock activities instead of fetching from Supabase
        const mockActivities = generateMockActivities(25)
        setActivities(mockActivities)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(`Falha ao gerar atividades: ${errorMessage}`);
        
        console.error('Error generating mock activities:', err);
      } finally {
        setIsLoading(false)
      }
    }, 800); // Short delay to simulate network request
    
    return () => clearTimeout(timer);
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
