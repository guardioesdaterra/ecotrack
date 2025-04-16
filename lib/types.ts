export interface Activity {
  id: number
  lat: number
  lng: number
  type: string
  title: string
  intensity: number
  created_at: string
  color?: string
}

export interface Connection {
  id: number
  from_activity_id: number
  to_activity_id: number
}
