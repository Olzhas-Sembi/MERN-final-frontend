"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MapPin, Calendar, User } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { USER_QUERY, LIKE_PROFILE_MUTATION } from "@/lib/graphql/operations"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ImageViewer } from "@/components/image-viewer"

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const { isAuthenticated, user } = useAuthStore()
  const { toast } = useToast()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const { data, loading } = useQuery(USER_QUERY, {
    variables: { id: userId },
    skip: !isAuthenticated || !userId,
  })

  const [likeProfile] = useMutation(LIKE_PROFILE_MUTATION, {
    onCompleted: (data) => {
      if (data.likeProfile.status === "matched") {
        toast({
          title: "Это совпадение! 🎉",
          description: "Вы понравились друг другу!",
        })
      } else {
        toast({
          title: "Лайк отправлен!",
          description: "Если вы понравитесь, мы сообщим!",
        })
      }
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" })
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  const profileUser = data?.user
  const profile = profileUser?.profile

  if (!profileUser || !profile) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl">Профиль не найден</p>
          <Button onClick={() => router.back()}>Назад</Button>
        </div>
      </div>
    )
  }

  const age = profile.birthDate
    ? new Date().getFullYear() - new Date(profile.birthDate).getFullYear()
    : null

  const isOwnProfile = user?.id === userId

  const handleLike = () => {
    if (!isOwnProfile) {
      likeProfile({ variables: { targetUserId: userId } })
    }
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            ← Назад
          </Button>
        </div>

        {/* Main Photo */}
        {profile.photos && profile.photos.length > 0 && (
          <Card className="overflow-hidden cursor-pointer" onClick={() => handleImageClick(0)}>
            <div className="aspect-[3/4] relative group">
              <img
                src={profile.photos[0]}
                alt={profile.displayName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-sm">Нажмите для просмотра</span>
              </div>
            </div>
          </Card>
        )}

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.photos?.[0]} />
                <AvatarFallback className="text-2xl">{profile.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {profile.displayName}
                  {age && `, ${age}`}
                </CardTitle>
                {profile.location?.city && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location.city}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.bio && (
              <div>
                <h3 className="font-semibold mb-2">О себе</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {profile.birthDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Дата рождения: {format(new Date(profile.birthDate), "d MMMM yyyy")}
                </span>
              </div>
            )}

            {profile.lookingFor && profile.lookingFor.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Ищу</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.lookingFor.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Gallery */}
            {profile.photos && profile.photos.length > 1 && (
              <div>
                <h3 className="font-semibold mb-2">Фотографии</h3>
                <div className="grid grid-cols-3 gap-2">
                  {profile.photos.slice(1).map((photo, idx) => (
                    <div
                      key={idx}
                      className="aspect-square relative rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => handleImageClick(idx + 1)}
                    >
                      <img
                        src={photo}
                        alt={`Фото ${idx + 2}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Viewer */}
            {profile.photos && selectedImageIndex !== null && (
              <ImageViewer
                images={profile.photos}
                currentIndex={selectedImageIndex}
                isOpen={selectedImageIndex !== null}
                onClose={() => setSelectedImageIndex(null)}
              />
            )}

            {/* Like Button */}
            {!isOwnProfile && (
              <Button className="w-full" size="lg" onClick={handleLike}>
                <Heart className="w-5 h-5 mr-2" />
                Лайкнуть
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

