"use client"

import dynamic from "next/dynamic"

// Dynamically import the browser-only map client with SSR disabled
const MapClient = dynamic(() => import("./MapClient"), { ssr: false })

export function MapComponent(props: any) {
  return <MapClient {...props} />
}
