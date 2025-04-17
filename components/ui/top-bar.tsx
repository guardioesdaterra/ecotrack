"use client"
 
 import Link from "next/link"
 import { Button } from "@/components/ui/button"
 import { AuthButtons } from "@/components/auth-buttons"
 import { Menu, X } from "lucide-react"
 import { useState } from "react"
 import { useMediaQuery } from "@/hooks/use-media-query"
 import { cn } from "@/lib/utils"
 
 export function TopBar() {
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
   const isDesktop = useMediaQuery("(min-width: 768px)")
 
   return (
     <header className="border-b border-cyan-900/50 bg-black/80 backdrop-blur-sm fixed w-full z-10">
       <div className="container flex h-16 items-center justify-between px-4">
         <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 animate-pulse" />
           <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
             EcoTrack Global
           </h1>
         </div>
 
         {isDesktop ? (
           <nav className="flex items-center gap-4">
             <Link href="/submit">
               <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-black font-bold">
                 Add Activity
               </Button>
             </Link>
             <Link href="/monitor">
               <Button variant="outline" className="border-cyan-900 text-cyan-400 hover:bg-cyan-950/30">
                 Monitor
               </Button>
             </Link>
             <AuthButtons />
           </nav>
         ) : (
           <>
             <Button 
               variant="ghost" 
               size="icon"
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="text-cyan-400 hover:bg-cyan-950/30"
             >
               {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </Button>
 
             {mobileMenuOpen && (
               <div className="absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-cyan-900/50 p-4 space-y-4">
                 <Link 
                   href="/submit" 
                   className={cn(
                     "block w-full px-4 py-2 text-center rounded-md",
                     "bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold"
                   )}
                   onClick={() => setMobileMenuOpen(false)}
                 >
                   Add Activity
                 </Link>
                 <Link 
                   href="/monitor" 
                   className="block w-full px-4 py-2 text-center rounded-md border border-cyan-900 text-cyan-400 hover:bg-cyan-950/30"
                   onClick={() => setMobileMenuOpen(false)}
                 >
                   Monitor
                 </Link>
                 <div className="pt-2 border-t border-cyan-900/50">
                   <AuthButtons mobile />
                 </div>
               </div>
             )}
           </>
         )}
       </div>
     </header>
   )
 }