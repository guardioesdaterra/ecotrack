"use client"

import L from 'leaflet'
import { MapContainer, TileLayer, useMap, ZoomControl, Marker, Popup } from "react-leaflet"
import { Activity, Connection } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ParticleEffect } from "@/components/particle-effect"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

function ActivityNode({ activity }: { activity: Activity }) {
  const [showPopup, setShowPopup] = useState(false)

  const icon = L.divIcon({
    html: `
      <div class="activity-marker">
        <span>${activity.title}</span>
      </div>
    `,
    className: "custom-activity-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  })

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

function ConnectionLines({ activities }: { activities: Activity[] }) {
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

function MapController() {
  const map = useMap()
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
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

export function MapClient({ activities, mapRef }: { activities: Activity[], mapRef: React.RefObject<any> }) {
  return (
    <MapContainer
      ref={mapRef}
      center={[20, 0]}
      zoom={2.5}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      attributionControl={false}
      worldCopyJump={true}
      minZoom={1.5}
      maxZoom={7}
      className="dark-map"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <ZoomControl position="bottomright" />
      <MapController />
      <ConnectionLines activities={activities} />
      {activities.map((activity) => (
        <ActivityNode key={activity.id} activity={activity} />
      ))}
      <ParticleEffect activities={activities} />
    </MapContainer>
  )
}
