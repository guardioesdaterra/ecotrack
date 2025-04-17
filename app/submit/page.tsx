"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient-new"
// Tenta ambos os formatos de variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { MapPin, Upload, Check, AlertCircle, X } from "lucide-react"
import Link from "next/link"
import { AuthButtons } from "@/components/auth-buttons"
import Image from "next/image"
import type { ChangeEvent, FormEvent } from "react"

interface FormState {
  title: string;
  type: string;
  description: string;
  location: string;
  latitude: string;
  longitude: string;
  image: File | null;
  imagePreview: string | null;
}

export default function SubmitPage() {
  const [formState, setFormState] = useState<FormState>({
    title: "",
    type: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    image: null,
    imagePreview: null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormState((prev) => ({ ...prev, type: value }))
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (loadEvent) => {
      if (!loadEvent.target || !loadEvent.target.result) return;
      
      const result = loadEvent.target.result;
      if (typeof result !== 'string') return;
      
      setFormState((prev) => ({
        ...prev,
        image: file,
        imagePreview: result,
      }));
    };

    reader.onerror = () => {
      console.error('Error reading file');
    };

    reader.readAsDataURL(file);
  }

  const handleRemoveImage = () => {
    setFormState((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }))
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormState((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
            location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 1. Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // 2. Upload da imagem se existir
      let imageUrl = null
      if (formState.image) {
        const fileExt = formState.image.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('activity-images')
          .upload(fileName, formState.image)

        if (uploadError) throw uploadError

        imageUrl = `${supabaseUrl}/storage/v1/object/public/activity-images/${uploadData.path}`
      }

      // 3. Inserir atividade no banco de dados
      const { error } = await supabase
        .from('activities')
        .insert({
          title: formState.title,
          type: formState.type,
          description: formState.description,
          lat: parseFloat(formState.latitude),
          lng: parseFloat(formState.longitude),
          image_url: imageUrl,
          user_id: user.id
        })

      if (error) throw error

      setIsSuccess(true)
    } catch (error) {
      console.error('Submission error:', error)
      alert('Erro ao enviar atividade. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <header className="border-b border-cyan-900/50 bg-black/80 backdrop-blur-sm w-full">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600"></div>
            <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
              EcoTrack Global
            </h1>
          </Link>
          <AuthButtons />
        </div>
      </header>

      <main className="w-full max-w-2xl py-12 px-4 flex justify-center items-center flex-1">
        {!isLoggedIn ? (
          <Card className="bg-gray-900/50 border-cyan-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-400">Login Required</CardTitle>
              <CardDescription className="text-gray-400">
                Please login to add your environmental initiative
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8 space-y-6">
              <AlertCircle className="h-16 w-16 text-cyan-400" />
              <p className="text-center text-gray-300 max-w-md">
                You need to be logged in with Google or Instagram to submit and track your environmental activities.
              </p>
              <div className="mt-4">
                <AuthButtons />
              </div>
            </CardContent>
          </Card>
        ) : !isSuccess ? (
          <Card className="bg-gray-900/50 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.1)] w-full">
            <CardHeader>
              <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                Add Environmental Activity
              </CardTitle>
              <CardDescription className="text-gray-400">
                Share your environmental initiative with the global community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-cyan-300">
                    Activity Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formState.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Community Forest Restoration"
                    required
                    className="bg-gray-800/50 border-cyan-900/50 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-cyan-300">
                    Activity Type
                  </Label>
                  <Select onValueChange={handleSelectChange} required>
                    <SelectTrigger className="bg-gray-800/50 border-cyan-900/50">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reforestation">Reforestation</SelectItem>
                      <SelectItem value="clean-up">Clean-up</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="conservation">Conservation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-cyan-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formState.description}
                    onChange={handleInputChange}
                    placeholder="Describe your activity and its impact..."
                    required
                    className="bg-gray-800/50 border-cyan-900/50 focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-cyan-300">
                    Location
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="location"
                      name="location"
                      value={formState.location}
                      onChange={handleInputChange}
                      placeholder="City, Country or coordinates"
                      className="bg-gray-800/50 border-cyan-900/50 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-cyan-500 text-cyan-400"
                      onClick={handleGetLocation}
                    >
                      <MapPin className="h-5 w-5 mr-1" />
                      Use My Location
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="latitude"
                      name="latitude"
                      value={formState.latitude}
                      onChange={handleInputChange}
                      placeholder="Latitude"
                      className="bg-gray-800/50 border-cyan-900/50"
                    />
                    <Input
                      id="longitude"
                      name="longitude"
                      value={formState.longitude}
                      onChange={handleInputChange}
                      placeholder="Longitude"
                      className="bg-gray-800/50 border-cyan-900/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-cyan-300">Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="bg-gray-800/50 border-cyan-900/50"
                    />
                    {formState.imagePreview && (
                      <div className="relative">
                        <Image
                          src={formState.imagePreview}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="rounded shadow"
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-black/70 rounded-full p-1"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-2 px-4 rounded shadow"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Activity"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900/50 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.1)] w-full">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-400">Success!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <Check className="h-16 w-16 text-cyan-400" />
                <p className="text-center text-gray-300 max-w-md">
                  Your environmental activity has been submitted and will appear on the global map soon.
                </p>
                <Button asChild variant="outline" className="mt-4 border-cyan-500 text-cyan-400">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
