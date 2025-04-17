"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthButtons } from "@/components/auth-buttons"
import { Globe, Users, Leaf } from "lucide-react"
import { TopBar } from "@/components/ui/TopBar"
import { InitiativesCount } from "@/components/InitiativesCount"
import dynamic from 'next/dynamic'

// Dynamically import MapComponent with no SSR
const MapComponent = dynamic(
  () => import('@/components/map-component').then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="h-16 w-16 rounded-full bg-neon-cyan animate-neon-pulse"></div>
      </div>
    )
  }
)

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <TopBar />

      <div className="flex-1 relative">
        <MapComponent />

        {/* Global Impact Panel - Fixed at bottom */}
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-cyan-900/50 z-[500] shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-3">
            Global Impact
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mb-1">
                <Leaf className="w-5 h-5 text-green-400" />
              </div>
              <InitiativesCount />
              <span className="text-xs text-gray-400 text-center">Active Initiatives</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mb-1">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-xl font-bold text-cyan-400">86</span>
              <span className="text-xs text-gray-400 text-center">Countries</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mb-1">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xl font-bold text-purple-400">12.5K</span>
              <span className="text-xs text-gray-400 text-center">Contributors</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
