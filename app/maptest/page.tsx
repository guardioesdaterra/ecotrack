"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Loading from '@/components/ui/loading'

const MapClient = dynamic(() => import('@/components/MapClient'), {
  ssr: false,
  loading: () => <Loading />
})

export default function MapTestPage() {
  return (
    <div className="h-screen w-full">
      <Suspense fallback={<Loading />}>
        <MapClient />
      </Suspense>
    </div>
  )
}
