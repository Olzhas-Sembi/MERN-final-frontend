"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import type { Profile } from "@/lib/types"
import { calculateAge } from "@/lib/mock-data"
import { MapPin, X, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SwipeCardProps {
  profile: Profile
  onSwipe: (direction: "left" | "right") => void
  isTop: boolean
}

export function SwipeCard({ profile, onSwipe, isTop }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [exitX, setExitX] = useState<number>(0)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(300)
      onSwipe("right")
    } else if (info.offset.x < -100) {
      setExitX(-300)
      onSwipe("left")
    }
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev < profile.photos.length - 1 ? prev + 1 : prev))
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const age = calculateAge(profile.birthDate)

  return (
    <motion.div
      className={cn(
        "absolute w-full max-w-sm aspect-[3/4] cursor-grab active:cursor-grabbing",
        !isTop && "pointer-events-none",
      )}
      style={{ x, rotate, opacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl bg-card">
        {/* Photo */}
        <div className="absolute inset-0">
          <Image
            src={profile.photos[currentPhotoIndex] || "/placeholder.svg"}
            alt={profile.displayName}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Photo indicators */}
        <div className="absolute top-3 left-3 right-3 flex gap-1">
          {profile.photos.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index === currentPhotoIndex ? "bg-white" : "bg-white/40",
              )}
            />
          ))}
        </div>

        {/* Photo navigation */}
        {profile.photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white opacity-0 hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white opacity-0 hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Like/Nope stamps */}
        <motion.div
          className="absolute top-10 left-6 border-4 border-success text-success px-4 py-2 rounded-lg rotate-[-20deg] font-bold text-3xl"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>
        <motion.div
          className="absolute top-10 right-6 border-4 border-destructive text-destructive px-4 py-2 rounded-lg rotate-[20deg] font-bold text-3xl"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </motion.div>

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h2 className="text-2xl font-bold">
            {profile.displayName}, {age}
          </h2>
          <div className="flex items-center gap-1 text-sm text-white/80 mt-1">
            <MapPin className="h-4 w-4" />
            <span>{profile.location.city}</span>
          </div>
          <p className="mt-2 text-sm text-white/90 line-clamp-2">{profile.bio}</p>
        </div>
      </div>
    </motion.div>
  )
}

interface SwipeActionsProps {
  onSwipe: (direction: "left" | "right") => void
}

export function SwipeActions({ onSwipe }: SwipeActionsProps) {
  return (
    <div className="flex justify-center gap-6 mt-6">
      <Button
        size="lg"
        variant="outline"
        className="h-16 w-16 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors bg-transparent"
        onClick={() => onSwipe("left")}
      >
        <X className="h-8 w-8" />
        <span className="sr-only">Pass</span>
      </Button>
      <Button
        size="lg"
        className="h-16 w-16 rounded-full bg-success hover:bg-success/90 text-white"
        onClick={() => onSwipe("right")}
      >
        <Heart className="h-8 w-8" />
        <span className="sr-only">Like</span>
      </Button>
    </div>
  )
}
