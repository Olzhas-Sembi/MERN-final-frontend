"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface ImageViewerProps {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
}

export function ImageViewer({ images, currentIndex: initialIndex, isOpen, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isMounted, setIsMounted] = useState(true)

  useEffect(() => {
    setIsMounted(true)
    setCurrentIndex(initialIndex)
    return () => {
      setIsMounted(false)
    }
  }, [initialIndex, isOpen])

  const handlePrevious = useCallback(() => {
    if (!isMounted) return
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }, [isMounted, images.length])

  const handleNext = useCallback(() => {
    if (!isMounted) return
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }, [isMounted, images.length])

  useEffect(() => {
    if (!isOpen || !isMounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        handlePrevious()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        handleNext()
      } else if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, isMounted, handlePrevious, handleNext, onClose])


  if (!images || images.length === 0) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Previous button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-50 text-white hover:bg-white/20"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {/* Image with swipe support */}
          <div
            className="relative w-full h-full flex items-center justify-center touch-none"
            onTouchStart={(e) => {
              const touch = e.touches[0]
              ;(e.currentTarget as any).touchStartX = touch.clientX
            }}
            onTouchEnd={(e) => {
              const touch = e.changedTouches[0]
              const startX = (e.currentTarget as any).touchStartX
              if (!startX) return

              const diff = startX - touch.clientX
              if (Math.abs(diff) > 50) {
                if (diff > 0) {
                  handleNext()
                } else {
                  handlePrevious()
                }
              }
            }}
          >
            <img
              src={images[currentIndex]}
              alt={`Фото ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-50 text-white hover:bg-white/20"
              onClick={handleNext}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                    idx === currentIndex ? "border-white" : "border-transparent opacity-50 hover:opacity-75"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

