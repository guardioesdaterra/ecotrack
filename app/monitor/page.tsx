"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Camera, Edit, Eye, FileText, Trash, ArrowLeft, Calendar, MapPin, Upload } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AuthButtons } from "@/components/auth-buttons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// TypeScript interfaces for activity data structures
interface ActivityUpdate {
  date: string;
  note: string;
  image: string;
  beforeImage?: string;
  afterImage?: string;
}

interface Activity {
  id: string;
  title: string;
  type: string;
  description: string;
  location: string;
  coordinates: [number, number];
  created: string;
  updated: string;
  updates: ActivityUpdate[];
}

// Sample data for demonstration
const mockActivities: Activity[] = [
  {
    id: "act-1",
    title: "Community Forest Restoration",
    type: "reforestation",
    description:
      "Planting native tree species to restore the local forest ecosystem that was damaged by wildfires last year. This initiative aims to reestablish the natural habitat for local wildlife and improve air quality in the region.",
    location: "Boulder, Colorado",
    coordinates: [40.015, -105.2705],
    created: "2023-11-15",
    updated: "2024-04-02",
    updates: [
      {
        date: "2024-04-02",
        note: "Completed the eastern section planting. 350 new saplings added. The community turnout was amazing with over 50 volunteers helping with the planting effort.",
        image: "/placeholder.svg?height=400&width=600",
        beforeImage: "/placeholder.svg?height=400&width=600&text=Before",
        afterImage: "/placeholder.svg?height=400&width=600&text=After",
      },
      {
        date: "2024-02-18",
        note: "Winter assessment shows 92% survival rate of planted trees. This is higher than expected given the harsh winter conditions. The protective measures we implemented seem to be working well.",
        image: "/placeholder.svg?height=400&width=600",
      },
      {
        date: "2023-12-05",
        note: "Initial planting phase completed with 900 trees. Species include Douglas fir, Ponderosa pine, and Blue spruce, all native to the Colorado region.",
        image: "/placeholder.svg?height=400&width=600",
      },
    ],
  },
  {
    id: "act-2",
    title: "Beach Cleanup Initiative",
    type: "cleanup",
    description:
      "Regular cleanup of coastal areas to remove plastic waste and other debris that threatens marine life. This ongoing project involves local schools and community organizations to raise awareness about ocean pollution.",
    location: "Santa Monica, California",
    coordinates: [34.0195, -118.4912],
    created: "2024-01-10",
    updated: "2024-03-28",
    updates: [
      {
        date: "2024-03-28",
        note: "Collected over 200kg of plastic waste during the weekend cleanup. Most common items were single-use plastic bottles, straws, and food wrappers.",
        image: "/placeholder.svg?height=400&width=600",
        beforeImage: "/placeholder.svg?height=400&width=600&text=Before",
        afterImage: "/placeholder.svg?height=400&width=600&text=After",
      },
      {
        date: "2024-02-15",
        note: "Partnered with local schools for educational program. Over 150 students participated in learning about marine ecosystems and the impact of plastic pollution.",
        image: "/placeholder.svg?height=400&width=600",
      },
    ],
  },
]

interface User {
  name: string;
}

// Define SVG props interface
interface SVGProps extends React.SVGAttributes<SVGElement> {
  className?: string;
}

export default function MonitorPage() {
  const [user, setUser] = useState<User | null>({ name: "Maria Silva" }) // For demo purposes, assume logged in
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [selectedUpdate, setSelectedUpdate] = useState<ActivityUpdate | null>(null)
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity)
    setSelectedUpdate(null)
    setShowBeforeAfter(false)
  }

  const handleBackToList = () => {
    setSelectedActivity(null)
    setSelectedUpdate(null)
    setShowBeforeAfter(false)
  }

  const handleViewUpdate = (update: ActivityUpdate) => {
    setSelectedUpdate(update)
    setShowBeforeAfter(false)
  }

  const toggleBeforeAfter = () => {
    setShowBeforeAfter(!showBeforeAfter)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-cyan-900/50 bg-black/80 backdrop-blur-sm">
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

      <main className="flex-1 container max-w-3xl py-12 px-4">
        {!user ? (
          <Card className="bg-gray-900/50 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <CardHeader>
              <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                Monitor Your Activities
              </CardTitle>
              <CardDescription className="text-gray-400">
                Login to view and manage your environmental initiatives
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="rounded-full bg-gray-800/50 p-4 mb-2">
                <User className="h-10 w-10 text-cyan-400" />
              </div>
              <p className="text-center text-gray-300 max-w-md">
                Please login with your Google or Instagram account to access your activities
              </p>
              <div className="mt-4">
                <AuthButtons />
              </div>
            </CardContent>
          </Card>
        ) : selectedActivity ? (
          <div className="space-y-6">
            <Button
              onClick={handleBackToList}
              variant="ghost"
              className="text-cyan-400 hover:bg-cyan-950/30 -ml-2 mb-2 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to activities
            </Button>

            <Card className="bg-gray-900/50 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                      {selectedActivity.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600">
                        {selectedActivity.type.charAt(0).toUpperCase() + selectedActivity.type.slice(1)}
                      </Badge>
                      <span className="text-xs text-gray-400">ID: {selectedActivity.id}</span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-cyan-900 text-cyan-400 hover:bg-cyan-950/30"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-cyan-900/50">
                      <DialogHeader>
                        <DialogTitle className="text-cyan-400">Edit Activity</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Make changes to your environmental activity
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-cyan-300">Title</label>
                          <input
                            className="w-full p-2 rounded-md bg-gray-800/50 border border-cyan-900/50 focus:border-cyan-500 text-white"
                            defaultValue={selectedActivity.title}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-cyan-300">Description</label>
                          <Textarea
                            className="w-full p-2 rounded-md bg-gray-800/50 border border-cyan-900/50 focus:border-cyan-500 text-white min-h-[100px]"
                            defaultValue={selectedActivity.description}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-cyan-300">Location</label>
                          <input
                            className="w-full p-2 rounded-md bg-gray-800/50 border border-cyan-900/50 focus:border-cyan-500 text-white"
                            defaultValue={selectedActivity.location}
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" className="border-cyan-900 text-cyan-400 hover:bg-cyan-950/30">
                            Cancel
                          </Button>
                          <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-black font-bold">
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-cyan-300">Description</h3>
                  <p className="text-sm text-gray-300">{selectedActivity.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-cyan-300">Location</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      {selectedActivity.location}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-cyan-300">Dates</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                        <span className="text-xs text-gray-400">Created:</span> {selectedActivity.created}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                        <span className="text-xs text-gray-400">Updated:</span> {selectedActivity.updated}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedUpdate ? (
              <Card className="bg-gray-900/50 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={() => setSelectedUpdate(null)}
                      variant="ghost"
                      size="sm"
                      className="text-cyan-400 hover:bg-cyan-950/30 -ml-2 group"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                      Back to updates
                    </Button>
                    <Badge className="bg-gray-800 text-cyan-400">{selectedUpdate.date}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">{selectedUpdate.note}</p>

                  {selectedUpdate.beforeImage && selectedUpdate.afterImage ? (
                    <div className="space-y-4">
                      {showBeforeAfter ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Badge className="bg-gray-800">Before</Badge>
                            <div className="relative h-48 md:h-64 rounded-lg overflow-hidden border border-cyan-900/30">
                              <Image
                                src={selectedUpdate.beforeImage || "/placeholder.svg"}
                                alt="Before image"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Badge className="bg-gray-800">After</Badge>
                            <div className="relative h-48 md:h-64 rounded-lg overflow-hidden border border-cyan-900/30">
                              <Image
                                src={selectedUpdate.afterImage || "/placeholder.svg"}
                                alt="After image"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden border border-cyan-900/30">
                          <Image
                            src={selectedUpdate.image || "/placeholder.svg"}
                            alt="Update image"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <Button
                        onClick={toggleBeforeAfter}
                        variant="outline"
                        className="w-full border-cyan-900 text-cyan-400 hover:bg-cyan-950/30"
                      >
                        {showBeforeAfter ? "Show Combined Image" : "Show Before & After"}
                      </Button>
                    </div>
                  ) : (
                    <div className="relative h-64 md:h-80 rounded-lg overflow-hidden border border-cyan-900/30">
                      <Image
                        src={selectedUpdate.image || "/placeholder.svg"}
                        alt="Update image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="updates" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-cyan-900/50">
                  <TabsTrigger
                    value="updates"
                    className="data-[state=active]:bg-cyan-950/50 data-[state=active]:text-cyan-400"
                  >
                    Updates
                  </TabsTrigger>
                  <TabsTrigger
                    value="actions"
                    className="data-[state=active]:bg-cyan-950/50 data-[state=active]:text-cyan-400"
                  >
                    Actions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="updates" className="mt-4 space-y-4">
                  {selectedActivity.updates.map((update, index) => (
                    <Card
                      key={index}
                      className="bg-gray-900/50 border-cyan-900/50 backdrop-blur-sm overflow-hidden hover:border-cyan-700/50 transition-colors cursor-pointer"
                      onClick={() => handleViewUpdate(update)}
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative h-48 md:h-full">
                          <Image
                            src={update.image || "/placeholder.svg"}
                            alt="Update image"
                            fill
                            className="object-cover"
                          />
                          {update.beforeImage && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-cyan-500/80 text-black">Before & After Available</Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-cyan-400">{update.date}</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-3">{update.note}</p>
                          <Button
                            variant="link"
                            className="text-xs text-cyan-400 p-0 h-auto mt-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewUpdate(update)
                            }}
                          >
                            Read more
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="actions" className="mt-4">
                  <Card className="bg-gray-900/50 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                    <CardHeader>
                      <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                        Activity Actions
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Update or manage your environmental initiative
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-between bg-gray-800 hover:bg-gray-700 text-white">
                            <div className="flex items-center">
                              <Camera className="mr-2 h-4 w-4" />
                              Add Photo Update
                            </div>
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-cyan-900/50">
                          <DialogHeader>
                            <DialogTitle className="text-cyan-400">Add Photo Update</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Upload photos to show progress on your activity
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-cyan-300">Before (Optional)</label>
                                <div className="flex items-center justify-center w-full">
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-cyan-900/50 bg-gray-800/30 hover:bg-gray-800/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Upload className="w-6 h-6 mb-2 text-cyan-400" />
                                      <p className="text-xs text-gray-400">Upload before image</p>
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" />
                                  </label>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-cyan-300">After</label>
                                <div className="flex items-center justify-center w-full">
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-cyan-900/50 bg-gray-800/30 hover:bg-gray-800/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Upload className="w-6 h-6 mb-2 text-cyan-400" />
                                      <p className="text-xs text-gray-400">Upload after image</p>
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" />
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-cyan-300">Update Note</label>
                              <Textarea
                                className="w-full p-2 rounded-md bg-gray-800/50 border border-cyan-900/50 focus:border-cyan-500 text-white min-h-[100px]"
                                placeholder="Describe the progress or changes shown in your photos..."
                              />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                              <Button variant="outline" className="border-cyan-900 text-cyan-400 hover:bg-cyan-950/30">
                                Cancel
                              </Button>
                              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-black font-bold">
                                Add Update
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-between bg-gray-800 hover:bg-gray-700 text-white">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4" />
                              Add Update Note
                            </div>
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-cyan-900/50">
                          <DialogHeader>
                            <DialogTitle className="text-cyan-400">Add Update Note</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Share progress on your environmental activity
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-cyan-300">Update Note</label>
                              <Textarea
                                className="w-full p-2 rounded-md bg-gray-800/50 border border-cyan-900/50 focus:border-cyan-500 text-white min-h-[150px]"
                                placeholder="Describe the progress or changes in your environmental activity..."
                              />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                              <Button variant="outline" className="border-cyan-900 text-cyan-400 hover:bg-cyan-950/30">
                                Cancel
                              </Button>
                              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-black font-bold">
                                Add Update
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-between bg-gray-800 hover:bg-gray-700 text-white">
                            <div className="flex items-center">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </div>
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-cyan-900/50">
                          <DialogHeader>
                            <DialogTitle className="text-cyan-400">Edit Activity</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Make changes to your environmental activity
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-cyan-300">Title</label>
                              <input
                                className="w-full p-2 rounded-md bg-gray-800/50 border border-cyan-900/50 focus:border-cyan-500 text-white"
                                defaultValue={selectedActivity.title}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-cyan-300">Description</label>
                              <Textarea
                                className="w-full p-2 rounded-md bg-gray-800/50 border border-cyan-900/50 focus:border-cyan-500 text-white min-h-[100px]"
                                defaultValue={selectedActivity.description}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-cyan-300">Location</label>
                              <input
                                className="w-full p-2 rounded-md bg-gray-800/50 border border-cyan-900/50 focus:border-cyan-500 text-white"
                                defaultValue={selectedActivity.location}
                              />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                              <Button variant="outline" className="border-cyan-900 text-cyan-400 hover:bg-cyan-950/30">
                                Cancel
                              </Button>
                              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-black font-bold">
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="w-full justify-between">
                            <div className="flex items-center">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Activity
                            </div>
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-red-900/50">
                          <DialogHeader>
                            <DialogTitle className="text-red-400">Delete Activity</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Are you sure you want to delete this activity? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <p className="text-gray-300">
                              This will permanently delete "{selectedActivity.title}" and all its updates.
                            </p>
                            <div className="flex justify-end gap-2 mt-4">
                              <Button variant="outline" className="border-cyan-900 text-cyan-400 hover:bg-cyan-950/30">
                                Cancel
                              </Button>
                              <Button variant="destructive">Delete Permanently</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <CardHeader>
                <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                  Your Activities
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage and update your environmental initiatives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-cyan-900/30 hover:bg-gray-800/50 hover:border-cyan-700/50 cursor-pointer transition-colors"
                      onClick={() => handleSelectActivity(activity)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-purple-600">
                          {activity.type === "reforestation" && <TreeIcon className="h-5 w-5 text-white" />}
                          {activity.type === "cleanup" && <WaterIcon className="h-5 w-5 text-white" />}
                          {activity.type === "renewable" && <SunIcon className="h-5 w-5 text-white" />}
                          {activity.type === "conservation" && <LeafIcon className="h-5 w-5 text-white" />}
                          {activity.type === "education" && <BookIcon className="h-5 w-5 text-white" />}
                          {!["reforestation", "cleanup", "renewable", "conservation", "education"].includes(
                            activity.type,
                          ) && <GlobeIcon className="h-5 w-5 text-white" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{activity.title}</h3>
                          <p className="text-xs text-gray-400">{activity.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-700 text-gray-300">
                          {activity.updates.length} update{activity.updates.length !== 1 ? "s" : ""}
                        </Badge>
                        <ArrowUpRight className="h-4 w-4 text-cyan-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => (window.location.href = "/submit")}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-black font-bold"
                >
                  Add New Activity
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

// Custom icons for activity types
function TreeIcon(props: SVGProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22v-7l-2-2" />
      <path d="M17 8v.8A6 6 0 0 1 13.8 20v0H10v0A6.5 6.5 0 0 1 7 8h0a5 5 0 0 1 10 0Z" />
    </svg>
  )
}

function WaterIcon(props: SVGProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22a8 8 0 0 1-8-8c0-4.314 7-12 8-12s8 7.686 8 12a8 8 0 0 1-8 8Z" />
    </svg>
  )
}

function SunIcon(props: SVGProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function LeafIcon(props: SVGProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  )
}

function BookIcon(props: SVGProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}

function GlobeIcon(props: SVGProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function User(props: SVGProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
