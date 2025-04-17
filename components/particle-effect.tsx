"use client"

import { useEffect, useRef, useState } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import { Activity, Connection } from "@/lib/types/supabase"

// Mapeamento de tipos de atividades para cores específicas (duplicado de MapClient)
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
  const [mapReady, setMapReady] = useState(false)

  // Generate random connections when activities change
  useEffect(() => {
    if (activities.length > 0) {
      // Generate random connections with a moderate density
      // Use a different density than the lines for visual variety
      const randomConnections = generateRandomConnections(activities, 0.4)
      setConnections(randomConnections)
    }
  }, [activities])
  
  // Wait for map to be properly initialized
  useEffect(() => {
    if (map) {
      // Add a small delay to ensure map is ready
      const timer = setTimeout(() => {
        setMapReady(true)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [map])

  useEffect(() => {
    if (!mapReady || !connections.length || !activities.length) return

    try {
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
          try {
            const fromActivity = activities.find((a) => a.id === connection.from_activity_id)
            const toActivity = activities.find((a) => a.id === connection.to_activity_id)

            if (fromActivity && toActivity) {
              // Verificar coordenadas válidas
              if (
                typeof fromActivity.lat !== 'number' || 
                typeof fromActivity.lng !== 'number' ||
                typeof toActivity.lat !== 'number' || 
                typeof toActivity.lng !== 'number'
              ) {
                return; // Pular esta conexão
              }

              // Skip if points are outside visible map
              if (!map.getBounds().contains([fromActivity.lat, fromActivity.lng]) &&
                  !map.getBounds().contains([toActivity.lat, toActivity.lng])) {
                return;
              }

              // Convert map coordinates to screen coordinates
              const fromPoint = map.latLngToContainerPoint([fromActivity.lat, fromActivity.lng])
              const toPoint = map.latLngToContainerPoint([toActivity.lat, toActivity.lng])

              // Create a new particle
              if (Math.random() < 0.03) {
                // Control particle density
                const color = getColorByType(fromActivity.type)
                particles.push({
                  x: fromPoint.x,
                  y: fromPoint.y,
                  targetX: toPoint.x,
                  targetY: toPoint.y,
                  speed: 0.8 + Math.random() * 1.8,
                  size: 0.5  + Math.random() * 2.5,
                  color,
                  alpha: 0.2 + Math.random() * 0.6,
                  trail: [],
                  trailLength: Math.floor(3 + Math.random() * 5),
                })
              }
            }
          } catch (error) {
            console.error("Error creating particle:", error)
          }
        })
      }

      // Animation loop
      const animate = () => {
        try {
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
        } catch (error) {
          console.error("Error in particle animation:", error)
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
          }
        }
      }

      // Start animation
      animate()

      // Update particles when map moves
      const updateParticles = () => {
        particles.length = 0 // Clear particles when map moves
      }

      map.on("move", updateParticles)

      // Cleanup on unmount
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        if (canvasRef.current && map.getContainer().contains(canvasRef.current)) {
          map.getContainer().removeChild(canvasRef.current)
        }
        map.off("move", updateParticles)
      }
    } catch (error) {
      console.error("Error initializing particle effect:", error)
    }
  }, [map, connections, activities, mapReady])

  return null
}
