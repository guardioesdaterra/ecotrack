"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

type UserType = {
  id: string
  name: string
  email: string
  image: string
  provider: string
}

// Mock user data for demonstration
const mockUsers = {
  google: {
    id: "google-123",
    name: "Maria Silva",
    email: "maria@example.com",
    image: "/placeholder.svg?height=40&width=40",
    provider: "google",
  },
  instagram: {
    id: "instagram-456",
    name: "João Santos",
    email: "joao@example.com",
    image: "/placeholder.svg?height=40&width=40",
    provider: "instagram",
  },
}

interface AuthButtonsProps {
  mobile?: boolean
}

export function AuthButtons({ mobile = false }: AuthButtonsProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (provider: 'google' | 'instagram') => {
    setIsLoading(true)

    // Simulate authentication
    setTimeout(() => {
      setUser(mockUsers[provider])
      setIsLoading(false)
    }, 1000)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8 border-2 border-cyan-500">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-900 border border-cyan-900/50" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-sm text-white">{user.name}</p>
              <p className="w-[200px] truncate text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-cyan-900/30" />
          <DropdownMenuItem className="text-white hover:bg-cyan-900/30 cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-white hover:bg-cyan-900/30 cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-cyan-900/30" />
          <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-red-900/30 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className={cn("flex items-center", mobile ? "flex-col w-full gap-2" : "gap-2")}>
      <Button
        onClick={() => handleLogin("google")}
        variant="outline"
        size="sm"
        disabled={isLoading}
        className="border-cyan-900 text-cyan-400 hover:bg-cyan-950/30"
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
        Google
      </Button>
      <Button
        onClick={() => handleLogin("instagram")}
        variant="outline"
        size="sm"
        disabled={isLoading}
        className="border-cyan-900 text-cyan-400 hover:bg-cyan-950/30"
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
          <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFDC80" />
            <stop offset="50%" stopColor="#F77737" />
            <stop offset="100%" stopColor="#C13584" />
          </linearGradient>
          <path
            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
            fill="url(#instagram-gradient)"
          />
        </svg>
        Instagram
      </Button>
    </div>
  )
}
