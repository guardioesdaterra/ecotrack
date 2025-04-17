"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from 'next/dynamic'
import Loading from '@/components/ui/loading'
import { supabase } from "@/lib/supabaseClient-new"
import { Badge } from "@/components/ui/badge"
import { ParticleEffect } from "@/components/particle-effect"
import { useMediaQuery } from "@/hooks/use-media-query"
import { initLeaflet } from "@/lib/leaflet-init"

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

// Define our Activity type to match the one in particle-effect.tsx
interface Activity {
  id: number
  lat: number
  lng: number
  type: string
  title: string
  intensity: number
  created_at: string
  color: string // Added to match ParticleEffect's Activity type
}

interface Connection {
  id: number
  from_activity_id: number
  to_activity_id: number
}

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
    if (!L || !map) return;
    
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
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          
        if (error) {
          console.error('Supabase error:', error)
          return
        }
        
        // Transform activities to match the Activity type including color
        const transformedActivities = data.map(activity => ({
          ...activity,
          color: getRandomColor()
        })) as Activity[]
        
        setActivities(transformedActivities)
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchActivities()
  }, [])

  if (isLoading) return <Loading />

  // Only render map components if window is defined
  if (typeof window === 'undefined') return null;

  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={[20, 0]}
        zoom={2.5}
        className="w-full h-full bg-gray-900 z-0"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
        />
        <ZoomControl position="bottomright" />
        <MapController />
        <ConnectionLines activities={activities} />
        {activities.map((activity) => (
          <ActivityNode key={activity.id} activity={activity} />
        ))}
      </MapContainer>
      <ParticleEffect activities={activities} />
    </div>
  )
}
