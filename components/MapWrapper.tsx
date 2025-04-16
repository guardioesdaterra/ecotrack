"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

interface MapWrapperProps {
  activities: any[]
  onMapInit?: (map: L.Map) => void
}

export default function MapWrapper({ activities, onMapInit }: MapWrapperProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Inicializa o mapa
    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2.5,
      zoomControl: false
    })

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; OpenStreetMap contributors'
      }
    ).addTo(map)

    mapRef.current = map
    onMapInit?.(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return <div ref={mapContainerRef} className="w-full h-full" />
}