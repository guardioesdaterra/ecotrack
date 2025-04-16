  "use client"

import { useEffect, useRef, useState } from "react"
import { useMap } from "react-leaflet"
import { supabase } from "@/lib/supabaseClient"
import L from "leaflet"

interface Activity {
  id: number
  lat: number
  lng: number
  type: string
  title: string
  intensity: number
  color: string
}

interface Connection {
  id: number
  from_activity_id: number
  to_activity_id: number
}

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  speed: number
  size: number
  color: string
  alpha: number
  trail: {x: number, y: number}[]
  trailLength: number
}

export function ParticleEffect({ activities }: { activities: Activity[] }) {
  const map = useMap()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])

  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const { data, error } = await supabase
          .from('connections')
          .select('*')

        if (error) throw error
        setConnections(data as Connection[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching connections:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchConnections()
  }, [])

  useEffect(() => {
    if (loading || error || !connections.length) return

    // Create canvas overlay
    const canvas = document.createElement("canvas")
    canvas.style.position = "absolute"
    canvas.style.top = "0"
    canvas.style.left = "0"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "400"
    canvas.width = map.getContainer().clientWidth
    canvas.height = map.getContainer().clientHeight

    map.getContainer().appendChild(canvas)
    canvasRef.current = canvas

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const particles: Particle[] = []
    particlesRef.current = particles

    // Function to create particles
    const createParticles = () => {
      connections.forEach((connection) => {
        const fromActivity = activities.find((a) => a.id === connection.from_activity_id)
        const toActivity = activities.find((a) => a.id === connection.to_activity_id)

        if (fromActivity && toActivity) {
          const fromPoint = map.latLngToContainerPoint([fromActivity.lat, fromActivity.lng])
          const toPoint = map.latLngToContainerPoint([toActivity.lat, toActivity.lng])

          // Create a new particle
          if (Math.random() < 0.03) {
            // Control particle density
            const colorHue = 180 + Math.random() * 60
            particles.push({
              x: fromPoint.x,
              y: fromPoint.y,
              targetX: toPoint.x,
              targetY: toPoint.y,
              speed: 0.8 + Math.random() * 1.8,
              size: 0.5  + Math.random() * 2.5,
              color: fromActivity.color || '#ffffff',
              alpha: 0.2 + Math.random() * 0.6,
              trail: [],
              trailLength: Math.floor(3 + Math.random() * 5),
            })
          }
        }
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update canvas size if map is resized
      if (canvas.width !== map.getContainer().clientWidth || canvas.height !== map.getContainer().clientHeight) {
        canvas.width = map.getContainer().clientWidth
        canvas.height = map.getContainer().clientHeight
      }

      // Create new particles
      createParticles()

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        // Calculate direction vector
        const dx = p.targetX - p.x
        const dy = p.targetY - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Move particle
        if (distance > p.speed) {
          p.x += (dx / distance) * p.speed
          p.y += (dy / distance) * p.speed

          // Add current position to trail
          p.trail.push({ x: p.x, y: p.y })

          // Limit trail length
          if (p.trail.length > p.trailLength) {
            p.trail.shift()
          }

          // Draw particle trail
          if (p.trail.length > 1) {
            ctx.beginPath()
            ctx.moveTo(p.trail[0].x, p.trail[0].y)

            for (let j = 1; j < p.trail.length; j++) {
              ctx.lineTo(p.trail[j].x, p.trail[j].y)
            }

            ctx.strokeStyle = typeof p.color === 'string' ? p.color.replace(")", `, ${p.alpha * 0.5})`) : `rgba(255, 255, 255, ${p.alpha * 0.5})`
            ctx.lineWidth = p.size * 0.5
            ctx.stroke()
          }

          // Draw particle
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = typeof p.color === 'string' ? p.color.replace(")", `, ${p.alpha})`) : `rgba(255, 255, 255, ${p.alpha})`
          ctx.fill()

          // Add glow effect
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5)
          gradient.addColorStop(0, typeof p.color === 'string' ? p.color.replace(")", `, ${p.alpha * 0.7})`) : `rgba(255, 255, 255, ${p.alpha * 0.7})`)
          gradient.addColorStop(1, typeof p.color === 'string' ? p.color.replace(")", `, 0)`) : `rgba(255, 255, 255, 0)`)
          ctx.fillStyle = gradient
          ctx.fill()
        } else {
          // Remove particle if it reached its target
          particles.splice(i, 1)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Update particles when map moves
    const updateParticles = () => {
      particles.length = 0 // Clear particles when map moves
    }

    map.on("move", updateParticles)
    map.on("zoom", updateParticles)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      map.getContainer().removeChild(canvas)
      map.off("move", updateParticles)
      map.off("zoom", updateParticles)
    }
  }, [map, activities, connections])

  return null
}
