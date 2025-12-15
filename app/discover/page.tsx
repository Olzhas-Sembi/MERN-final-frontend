"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, X, Filter } from "lucide-react"
import { useAuthStore, useIsAuthenticated } from "@/lib/store"
import { SEARCH_PROFILES_QUERY, LIKE_PROFILE_MUTATION, DISLIKE_PROFILE_MUTATION } from "@/lib/graphql/operations"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ImageViewer } from "@/components/image-viewer"

export default function DiscoverPage() {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [filters, setFilters] = useState({
    gender: undefined as "male" | "female" | "other" | undefined,
    minAge: undefined as number | undefined,
    maxAge: undefined as number | undefined,
  })

  const { data, loading, refetch } = useQuery(SEARCH_PROFILES_QUERY, {
    variables: {
      input: {
        limit: 10,
        offset: 0,
        gender: filters.gender,
        minAge: filters.minAge,
        maxAge: filters.maxAge,
      },
    },
    skip: isAuthenticated !== true,
  })

  const [likeProfile] = useMutation(LIKE_PROFILE_MUTATION, {
    onCompleted: (data) => {
      if (data?.likeProfile?.status === "matched") {
        toast({
          title: "Это совпадение! 🎉",
          description: "Вы понравились друг другу!",
        })
      }
      handleSwipe("right")
    },
    onError: (error) => {
      console.error("Like error:", error)
      toast({ 
        title: "Ошибка", 
        description: error.message || "Не удалось отправить лайк", 
        variant: "destructive" 
      })
      handleSwipe("right")
    },
  })

  const [dislikeProfile] = useMutation(DISLIKE_PROFILE_MUTATION, {
    onCompleted: () => {
      handleSwipe("left")
    },
    onError: (error) => {
      console.error("Dislike error:", error)
      toast({ 
        title: "Ошибка", 
        description: error.message || "Не удалось отправить дизлайк", 
        variant: "destructive" 
      })
      handleSwipe("left")
    },
  })

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  const profiles = data?.searchProfiles?.profiles || []
  const currentProfile = profiles[currentIndex]

  const handleSwipe = (dir: "left" | "right") => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection(dir === "right" ? 1 : -1)
    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        refetch()
        setCurrentIndex(0)
      }
      setDirection(0)
      setIsAnimating(false)
    }, 300)
  }

  const handleLike = () => {
    if (currentProfile) {
      likeProfile({ variables: { targetUserId: currentProfile.userId } })
    }
  }

  const handleDislike = () => {
    if (currentProfile) {
      dislikeProfile({ variables: { targetUserId: currentProfile.userId } })
    }
  }

  const handleApplyFilters = () => {
    refetch()
    setCurrentIndex(0)
    setShowFilters(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Загрузка профилей...</p>
        </div>
      </div>
    )
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Поиск</h1>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
            </Button>
          </div>

          {showFilters && (
            <Card className="p-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Фильтры поиска</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={filters.gender === "male" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters({ ...filters, gender: filters.gender === "male" ? undefined : "male" })}
                  >
                    Мужской
                  </Button>
                  <Button
                    variant={filters.gender === "female" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters({ ...filters, gender: filters.gender === "female" ? undefined : "female" })}
                  >
                    Женский
                  </Button>
                  <Button
                    variant={filters.gender === "other" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters({ ...filters, gender: filters.gender === "other" ? undefined : "other" })}
                  >
                    Другой
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAge">Минимальный возраст</Label>
                    <Input
                      id="minAge"
                      type="number"
                      min="18"
                      max="100"
                      placeholder="18"
                      value={filters.minAge || ""}
                      onChange={(e) => setFilters({ ...filters, minAge: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAge">Максимальный возраст</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      min="18"
                      max="100"
                      placeholder="100"
                      value={filters.maxAge || ""}
                      onChange={(e) => setFilters({ ...filters, maxAge: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                </div>
                <Button onClick={handleApplyFilters} className="w-full">
                  Применить фильтры
                </Button>
              </div>
            </Card>
          )}

          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-2">Больше нет профилей</h2>
              <p className="text-muted-foreground mb-4">Попробуйте изменить фильтры или зайдите позже</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Фильтры
                </Button>
                <Button onClick={() => refetch()}>Обновить</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const age = currentProfile.birthDate
    ? new Date().getFullYear() - new Date(currentProfile.birthDate).getFullYear()
    : null

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Поиск</h1>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Фильтры
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Фильтры поиска</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={filters.gender === "male" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, gender: filters.gender === "male" ? undefined : "male" })}
                >
                  Мужской
                </Button>
                <Button
                  variant={filters.gender === "female" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, gender: filters.gender === "female" ? undefined : "female" })}
                >
                  Женский
                </Button>
                <Button
                  variant={filters.gender === "other" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, gender: filters.gender === "other" ? undefined : "other" })}
                >
                  Другой
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAge">Минимальный возраст</Label>
                  <Input
                    id="minAge"
                    type="number"
                    min="18"
                    max="100"
                    placeholder="18"
                    value={filters.minAge || ""}
                    onChange={(e) => setFilters({ ...filters, minAge: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAge">Максимальный возраст</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    min="18"
                    max="100"
                    placeholder="100"
                    value={filters.maxAge || ""}
                    onChange={(e) => setFilters({ ...filters, maxAge: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>
              <Button onClick={handleApplyFilters} className="w-full">
                Применить фильтры
              </Button>
            </div>
          </Card>
        )}

        <div className="relative aspect-[3/4] max-w-sm mx-auto">
          <div
            key={currentIndex}
            className="absolute inset-0 transition-all duration-300"
            style={{
              transform: `translateX(${direction * 20}px)`,
              opacity: direction !== 0 ? 0.7 : 1,
            }}
          >
              <Card className="h-full relative overflow-hidden">
                <CardContent className="p-0 h-full">
                  <div className="h-full bg-gradient-to-br from-pink-100 to-blue-100 flex flex-col group hover:scale-[1.02] transition-transform">
                    {currentProfile.photos && currentProfile.photos.length > 0 ? (
                      <div
                        className="flex-1 relative overflow-hidden cursor-pointer"
                        onClick={() => setSelectedImageIndex(0)}
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
                            if (diff > 0 && currentProfile.photos.length > 1) {
                              setSelectedImageIndex(1)
                            } else if (diff < 0 && currentProfile.photos.length > 1) {
                              setSelectedImageIndex(currentProfile.photos.length - 1)
                            }
                          }
                        }}
                      >
                        <img
                          src={currentProfile.photos[0]}
                          alt={currentProfile.displayName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                          draggable={false}
                        />
                        {currentProfile.photos.length > 1 && (
                          <div className="absolute top-2 left-2 right-2 flex gap-1">
                            {currentProfile.photos.map((_, idx) => (
                              <div
                                key={idx}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                  idx === 0 ? "bg-white" : "bg-white/40"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {currentProfile.photos.length} фото
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <Avatar className="w-32 h-32">
                          <AvatarFallback className="text-4xl">{currentProfile.displayName[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    <Link href={`/profile/${currentProfile.userId}`}>
                      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent text-white cursor-pointer">
                        <h2 className="text-2xl font-bold">
                          {currentProfile.displayName}
                          {age && `, ${age}`}
                        </h2>
                        {currentProfile.location?.city && (
                          <p className="text-sm opacity-90 mt-1">{currentProfile.location.city}</p>
                        )}
                        {currentProfile.bio && (
                          <p className="mt-2 text-sm line-clamp-2">{currentProfile.bio}</p>
                        )}
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-16 h-16 border-2 border-destructive hover:bg-destructive hover:text-white transition-all"
            onClick={handleDislike}
            disabled={isAnimating}
          >
            <X className="w-8 h-8" />
          </Button>
          <Button
            size="lg"
            className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 transition-all shadow-lg"
            onClick={handleLike}
            disabled={isAnimating}
          >
            <Heart className="w-8 h-8" />
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {profiles.length - currentIndex - 1 > 0 && (
            <p>Осталось профилей: {profiles.length - currentIndex - 1}</p>
          )}
        </div>
      </div>

      {/* Image Viewer */}
      {currentProfile?.photos && selectedImageIndex !== null && (
        <ImageViewer
          images={currentProfile.photos}
          currentIndex={selectedImageIndex}
          isOpen={selectedImageIndex !== null}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </div>
  )
}
