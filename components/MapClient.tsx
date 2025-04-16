"use client"

import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, useMap, ZoomControl, Marker, Popup } from "react-leaflet"
import { supabase } from "@/lib/supabaseClient"
import { Badge } from "@/components/ui/badge"
import { ParticleEffect } from "@/components/particle-effect"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Zap, Leaf, Droplets, BookOpen, Shield } from "lucide-react"
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
  color: string
}

function getActivityColor(type: string) {
  switch (type) {
    case "reforestation":
      return "#00fff7"
    case "clean-up":
      return "#ff00ea"
    case "education":
      return "#ffe600"
    case "conservation":
      return "#00ff85"
    default:
      return "#ff007a"
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case "reforestation":
      return <Leaf className="h-4 w-4" />
    case "clean-up":
      return <Droplets className="h-4 w-4" />
    case "education":
      return <BookOpen className="h-4 w-4" />
    case "conservation":
      return <Shield className="h-4 w-4" />
    default:
      return <Zap className="h-4 w-4" />
  }
}

function ActivityNode({ activity }: { activity: Activity }) {
  const [showPopup, setShowPopup] = useState(false)
  const color = getActivityColor(activity.type)
  const icon = getActivityIcon(activity.type)

  if (!L) return null

  const divIcon = L.divIcon({
    html: `
      <div class="activity-marker-container">
        <div class="activity-marker" style="
          width: 32px; height: 32px; border-radius: 50%; 
          background: radial-gradient(circle at 30% 30%, ${color}99 30%, ${color}33 70%, transparent 100%);
          box-shadow: 0 0 15px 5px ${color}66, 0 0 30px 8px ${color}33;
          border: 2px solid ${color};
          display: flex; align-items: center; justify-content: center;
          transform-origin: center;
          animation: pulse 2s infinite ease-in-out;
        "></div>
        <div class="activity-marker-ring" style="
          position: absolute;
          top: -4px; left: -4px;
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 1px solid ${color}66;
          animation: ring-pulse 3s infinite ease-out;
        "></div>
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  })

  return (
    <Marker
      position={[activity.lat, activity.lng]}
      icon={divIcon}
      eventHandlers={{
        click: () => setShowPopup(true),
      }}
    >
      {showPopup && (
        <Popup 
          closeButton={false}
          className="futuristic-popup"
          eventHandlers={{
            popupclose: () => setShowPopup(false),
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="popup-content"
            style={{
              background: "rgba(0,0,0,0)",
              borderRadius: "18px",
              boxShadow: `0 0 24px 6px ${color}66, 0 0 64px 12px ${color}33`,
              padding: "1.2rem 1.5rem",
              minWidth: 220,
              backdropFilter: "blur(12px)",
              border: `2px solid ${color}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div 
              className="absolute inset-0 z-0 opacity-10" 
              style={{ 
                backgroundImage: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)`,
                mixBlendMode: "screen"
              }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="p-1.5 rounded-full" 
                  style={{ 
                    backgroundColor: `${color}22`,
                    border: `1px solid ${color}66`
                  }}
                >
                  {icon}
                </div>
                <h3 
                  className="text-lg font-bold tracking-wide"
                  style={{
                    color,
                    textShadow: `0 0 8px ${color}66`
                  }}
                >
                  {activity.title}
                </h3>
              </div>
              
              <Badge 
                className="mb-3 px-3 py-1 font-semibold text-xs uppercase tracking-wider" 
                style={{
                  background: `${color}22`,
                  color: color,
                  border: `1px solid ${color}66`,
                  boxShadow: `0 0 8px 2px ${color}33`,
                }}
              >
                {activity.type}
              </Badge>
              
              <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs">Intensity</span>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" style={{ color }} />
                    <span style={{ color }}>{activity.intensity}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs">Date</span>
                  <span className="text-gray-300">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div 
                className="w-full h-1 mt-2 rounded-full overflow-hidden"
                style={{ backgroundColor: `${color}22` }}
              >
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${activity.intensity * 10}%`, 
                    backgroundColor: color,
                    boxShadow: `0 0 8px 2px ${color}66`
                  }}
                />
              </div>
            </div>
          </motion.div>
        </Popup>
      )}
    </Marker>
  )
}

function MapController() {
  const map = useMap()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const container = map.getContainer()
    
    if (resolvedTheme === 'dark') {
      container.classList.add("dark-map")
      container.classList.remove("light-map")
    } else {
      container.classList.add("light-map")
      container.classList.remove("dark-map")
    }

    map.options.zoomSnap = 0.1
    map.options.zoomDelta = 0.5
    map.options.wheelDebounceTime = 100

    if (isMobile) {
      map.setView([20, 0], 1.8, { animate: true, duration: 1 })
    } else {
      map.setView([20, 0], 2.5, { animate: true, duration: 1 })
    }

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        map.setView([20, 0], 1.8, { animate: true, duration: 0.5 })
      } else {
        map.setView([20, 0], 2.5, { animate: true, duration: 0.5 })
      }
    }

    const handleDrag = () => {
      const center = map.getCenter()
      if (center.lat > 85) {
        map.setView([-85, center.lng], map.getZoom(), { animate: false })
      } else if (center.lat < -85) {
        map.setView([85, center.lng], map.getZoom(), { animate: false })
      }
    }

    window.addEventListener("resize", handleResize)
    map.on('drag', handleDrag)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      map.off('drag', handleDrag)
    }
  }, [map, isMobile, resolvedTheme])

  return null
}

function MapOverlays() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-[399] bg-[url('/grid-overlay.png')] opacity-20 mix-blend-overlay" />
      <div className="absolute inset-0 pointer-events-none z-[399] bg-[url('/scanline.png')] opacity-10 mix-blend-lighten" style={{ backgroundBlendMode: 'screen' }} />
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-[399] bg-gradient-to-b from-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[399] bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute top-0 bottom-0 left-0 w-32 pointer-events-none z-[399] bg-gradient-to-r from-black/40 to-transparent" />
      <div className="absolute top-0 bottom-0 right-0 w-32 pointer-events-none z-[399] bg-gradient-to-l from-black/40 to-transparent" />
      {/* Adicionando bordas verticais mais fortes */}
      <div className="absolute top-0 left-0 right-0 h-8 pointer-events-none z-[399] bg-gradient-to-b from-black/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none z-[399] bg-gradient-to-t from-black/80 to-transparent" />
    </>
  )
}

function LoadingScreen() {
  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-gray-800 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full animate-ping bg-cyan-500/20"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-cyan-500 animate-pulse shadow-lg shadow-cyan-500/50"></div>
        </div>
      </div>
      <p className="mt-6 text-cyan-500 animate-pulse font-mono">Loading Map Data...</p>
    </div>
  )
}

function ErrorScreen({ error }: { error: string }) {
  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="p-6 bg-gray-800 rounded-lg border border-red-500/50 shadow-lg shadow-red-500/20 max-w-md">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Map</h2>
        <p className="text-gray-300">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

interface SearchFilters {
  query: string;
  types: string[];
  minIntensity: number;
  expanded: boolean;
}

export default function MapClient() {
  const mapRef = useRef<any>(null)
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { resolvedTheme } = useTheme()
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    types: [],
    minIntensity: 0,
    expanded: false
  });

  useEffect(() => {
    if (typeof window !== "undefined" && L) {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
    }
  }, [])

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const { data, error: supabaseError } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })

        if (supabaseError) throw supabaseError
        const activitiesData = (data as Activity[]).map(activity => ({
          ...activity,
          color: getActivityColor(activity.type)
        }));
        setActivities(activitiesData);
        setFilteredActivities(activitiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return <ErrorScreen error={error} />
  }

  const tileLayerUrl = resolvedTheme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"

  const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'


  return (
    <div className="w-screen h-screen fixed top-0 left-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-cyan-500/5 to-blue-500/5 pointer-events-none z-[399]"></div>

      <MapContainer
        ref={mapRef}
        center={[20, 0]}
        zoom={2.5}
        style={{ height: "100vh", width: "100vw" }}
        zoomControl={false}
        attributionControl={false}
        worldCopyJump={true}
        minZoom={1.5}
        maxZoom={16}
        className={resolvedTheme === "dark" ? "dark-map" : "light-map"}
      >
        <TileLayer
          url={tileLayerUrl}
          attribution={tileAttribution}
        />
        <div className={`fixed ${isMobile ? 'bottom-4 left-2' : 'bottom-4 left-4'} z-[1000]`}>
          <div className={`${resolvedTheme === 'dark' ?
            'bg-black/90 backdrop-blur-md p-1 rounded-lg' : ''}`}>
            <ZoomControl
              position={isMobile ? "topright" : "bottomleft"}
              zoomInText="+"
              zoomOutText="-"
              zoomInTitle="Zoom in"
              zoomOutTitle="Zoom out"
            />
          </div>
        </div>
        <MapController />
        
        <AnimatePresence>
          {filteredActivities.map((activity) => (
            <ActivityNode key={activity.id} activity={activity} />
          ))}
        </AnimatePresence>
        
        <ParticleEffect activities={filteredActivities} />
      </MapContainer>

      <MapOverlays />

      <div className={`absolute ${isMobile ? 'top-4 inset-x-0' : 'top-14 left-0'} h-16 bg-black/90 backdrop-blur-sm z-[1000]`}>
        <motion.div
          className={`absolute ${isMobile ? 'top-16 right-4 left-4' : 'top-4 left-4'} z-[1001] bg-black/80 backdrop-blur-md rounded-lg border border-cyan-500/50 shadow-lg shadow-cyan-500/20 overflow-hidden`}
          initial={false}
          animate={{
            width: searchFilters.expanded ? (isMobile ? 'calc(100% - 9rem)' : 240) : 40,
            height: searchFilters.expanded ? (isMobile ? 'calc(70vh - 6rem)' : 500) : 40
          }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`${isMobile ? 'w-10 h-10' : 'w-10 h-10'} flex items-center justify-center cursor-pointer touch-target`}
            onClick={() => setSearchFilters({...searchFilters, expanded: !searchFilters.expanded})}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-cyan-400"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16" />
            </svg>
          </div>

          {searchFilters.expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-4 space-y-3"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search country or city..."
                  className="w-full bg-gray-800/90 border border-cyan-500/30 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={searchFilters.query}
                  onChange={(e) => {
                    const newFilters = {...searchFilters, query: e.target.value};
                    setSearchFilters(newFilters);
                    filterActivities(newFilters);
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-cyan-400">Filter by type:</h4>
                <div className="flex flex-wrap gap-2">
                  {['reforestation', 'clean-up', 'education', 'conservation', 'renewable', 'other'].map((type) => (
                    <button
                      key={type}
                      className={`text-xs px-2 py-1 rounded-full border ${
                        searchFilters.types.includes(type)
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                          : 'bg-gray-800/50 border-gray-600 text-gray-300'  
                      }`}
                      onClick={() => {
                        const newTypes = searchFilters.types.includes(type)
                          ? searchFilters.types.filter(t => t !== type)
                          : [...searchFilters.types, type];
                        const newFilters = {...searchFilters, types: newTypes};
                        setSearchFilters(newFilters);
                        filterActivities(newFilters);
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-cyan-400">Min. intensity: {searchFilters.minIntensity}</h4>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={searchFilters.minIntensity}
                  onChange={(e) => {
                    const newFilters = {...searchFilters, minIntensity: parseFloat(e.target.value)};
                    setSearchFilters(newFilters);
                    filterActivities(newFilters);
                  }}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="max-h-40 overflow-y-auto">
                {filteredActivities.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredActivities.map(activity => (
                      <li
                        key={activity.id}
                        className="p-2 hover:bg-gray-800/50 rounded-md cursor-pointer"
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.flyTo([activity.lat, activity.lng], 5);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: getActivityColor(activity.type)}} />
                          <span className="text-sm font-medium">{activity.title}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {activity.type} • Intensity: {activity.intensity}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No activities match your filters</p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
  function filterActivities(filters: SearchFilters) {
    let results = [...activities];
    
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(activity =>
        activity.title.toLowerCase().includes(query) ||
        activity.type.toLowerCase().includes(query)
      );
    }

    if (filters.types.length > 0) {
      results = results.filter(activity =>
        filters.types.includes(activity.type)
      );
    }

    if (filters.minIntensity > 0) {
      results = results.filter(activity =>
        activity.intensity >= filters.minIntensity
      );
    }

    setFilteredActivities(results);
  }
}
