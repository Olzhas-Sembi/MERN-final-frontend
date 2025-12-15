"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore, useIsAuthenticated } from "@/lib/store"
import { ME_QUERY, UPDATE_PROFILE_MUTATION, POSTS_QUERY } from "@/lib/graphql/operations"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/upload/image-upload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ImageViewer } from "@/components/image-viewer"

export default function ProfilePage() {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const { data, loading } = useQuery(ME_QUERY, { skip: isAuthenticated !== true })
  const { data: postsData, loading: postsLoading } = useQuery(POSTS_QUERY, {
    variables: { limit: 100, offset: 0 },
    skip: isAuthenticated !== true,
  })
  const [selectedPostImages, setSelectedPostImages] = useState<{ images: string[]; index: number } | null>(null)
  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE_MUTATION, {
    refetchQueries: [ME_QUERY],
    onCompleted: () => {
      toast({ title: "Профиль обновлен!", description: "Ваш профиль был сохранен." })
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" })
    },
  })

  const [formData, setFormData] = useState({
    displayName: "",
    birthDate: "",
    gender: "male" as "male" | "female" | "other",
    bio: "",
    photos: [] as string[],
    lookingFor: [] as string[],
  })

  useEffect(() => {
    // Не делаем редирект, если гидратация еще не завершена (isAuthenticated === null)
    if (isAuthenticated === false) {
      router.push("/auth")
      return
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (data?.me?.profile) {
      const profile = data.me.profile
      setFormData({
        displayName: profile.displayName || "",
        birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split("T")[0] : "",
        gender: profile.gender || "male",
        bio: profile.bio || "",
        photos: profile.photos || [],
        lookingFor: profile.lookingFor || [],
      })
    }
  }, [data?.me?.profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация: нужно хотя бы одно фото
    if (!formData.photos || formData.photos.length === 0) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы одну фотографию",
        variant: "destructive",
      })
      return
    }

    // Валидация: нужна дата рождения
    if (!formData.birthDate) {
      toast({
        title: "Ошибка",
        description: "Укажите дату рождения",
        variant: "destructive",
      })
      return
    }

    // Преобразуем дату в ISO строку для GraphQL
    let birthDateISO: string | undefined
    if (formData.birthDate) {
      // Если дата в формате YYYY-MM-DD, преобразуем в ISO
      const date = new Date(formData.birthDate + 'T00:00:00')
      if (!isNaN(date.getTime())) {
        birthDateISO = date.toISOString()
      }
    }

    await updateProfile({
      variables: {
        input: {
          displayName: formData.displayName,
          birthDate: birthDateISO,
          gender: formData.gender,
          bio: formData.bio || undefined,
          photos: formData.photos,
          lookingFor: formData.lookingFor.length > 0 ? formData.lookingFor : undefined,
        },
      },
    })
  }

  // Фильтруем посты текущего пользователя
  const myPosts = postsData?.posts?.filter((post: any) => post.authorId === user?.id) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Редактировать профиль</CardTitle>
            <CardDescription>Обновите информацию о себе</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Имя</Label>
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Дата рождения</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Пол</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: "male" | "female" | "other") =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите пол" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужской</SelectItem>
                    <SelectItem value="female">Женский</SelectItem>
                    <SelectItem value="other">Другой</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Расскажите о себе..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  maxLength={500}
                />
              </div>
              <div className="space-y-2">
                <Label>Фотографии *</Label>
                <p className="text-xs text-muted-foreground">Добавьте хотя бы одну фотографию</p>
                <ImageUpload
                  value={formData.photos}
                  onChange={(photos) => setFormData({ ...formData, photos })}
                  maxFiles={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={updating}>
                {updating ? "Сохранение..." : "Сохранить профиль"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Мои посты */}
        <Card>
          <CardHeader>
            <CardTitle>Мои посты</CardTitle>
            <CardDescription>Посты, которые вы создали</CardDescription>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">Загрузка постов...</p>
              </div>
            ) : myPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">У вас пока нет постов</p>
                <Link href="/feed">
                  <Button variant="outline" className="mt-4">
                    Создать пост
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myPosts.map((post: any) => (
                  <Card key={post.id} className="border">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={post.author?.profile?.photos?.[0] || "/placeholder-user.jpg"} />
                          <AvatarFallback>{post.author?.username?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {post.author?.profile?.displayName || post.author?.username}
                          </h3>
                          <Link href={`/post/${post.id}`}>
                            <p className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </p>
                          </Link>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Link href={`/post/${post.id}`}>
                        <p className="whitespace-pre-wrap cursor-pointer hover:text-primary transition-colors">
                          {post.content}
                        </p>
                      </Link>
                      {post.images && post.images.length > 0 && (
                        <div className={`grid gap-2 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                          {post.images.map((img: string, idx: number) => (
                            <div
                              key={idx}
                              className="relative rounded-lg overflow-hidden group cursor-pointer"
                              onClick={() => setSelectedPostImages({ images: post.images, index: idx })}
                            >
                              <img
                                src={img}
                                alt={`Post image ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Heart className={`w-4 h-4 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                          <span>{post.likesCount}</span>
                        </div>
                        <Link href={`/post/${post.id}`}>
                          <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.commentsCount}</span>
                          </div>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Viewer */}
      {selectedPostImages && (
        <ImageViewer
          images={selectedPostImages.images}
          currentIndex={selectedPostImages.index}
          isOpen={selectedPostImages !== null}
          onClose={() => setSelectedPostImages(null)}
        />
      )}
    </div>
  )
}
