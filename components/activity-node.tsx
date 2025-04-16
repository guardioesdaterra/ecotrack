import { useState, useRef } from "react"
import { Marker, Popup } from "react-leaflet"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { PhotoGallery } from "./PhotoGallery"

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
  photos?: string[]
}

export function ActivityNode({ activity }: { activity: Activity }) {
  const [showPopup, setShowPopup] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  if (!L) return null

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

  const getButtonPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 }
    const rect = buttonRef.current.getBoundingClientRect()
    return { top: rect.top, left: rect.left }
  }

  return (
    <>
      <Marker
        position={[activity.lat, activity.lng]}
        icon={icon}
        eventHandlers={{
          click: () => setShowPopup(true),
        }}
      >
        {showPopup && (
          <Popup>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4"
            >
              <h3 className="text-lg font-bold">{activity.title}</h3>
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-1">{activity.title}</h4>
                <div className="flex gap-2 items-center">
                  <Badge 
                    className="px-2 py-1 text-xs uppercase"
                    style={{
                      background: `${activity.color}15`,
                      color: activity.color,
                      border: `1px solid ${activity.color}30`,
                    }}
                  >
                    {activity.type}
                  </Badge>
                  
                  <button
                    ref={buttonRef}
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowPhotos(!showPhotos)
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <span className="text-gray-700">Fotos e Updates</span>
                    <ChevronRight 
                      size={14}
                      className="text-gray-500"
                    />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <div>Intensity: {activity.intensity}</div>
                <div>Created: {new Date(activity.created_at).toLocaleDateString()}</div>
              </div>
            </motion.div>
          </Popup>
        )}
      </Marker>

      {activity.photos && (
        <PhotoGallery
          photos={activity.photos}
          isOpen={showPhotos}
          onClose={() => setShowPhotos(false)}
          position={getButtonPosition()}
        />
      )}
    </>
  )
}
