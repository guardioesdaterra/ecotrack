"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthButtons } from "@/components/auth-buttons"

export function TopBar() {
  return (
    <header className="border-b border-cyan-900/50 bg-black/80 backdrop-blur-sm fixed w-full z-10">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
            EarthTrack Global
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/submit">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-black font-bold">
              Add Activity
            </Button>
          </Link>
          <AuthButtons />
        </div>
      </div>
    </header>
  )
}
