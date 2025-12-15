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
import { useAuthStore } from "@/lib/store"
import { ME_QUERY, UPDATE_PROFILE_MUTATION } from "@/lib/graphql/operations"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/upload/image-upload"

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { toast } = useToast()
  const { data, loading } = useQuery(ME_QUERY, { skip: !isAuthenticated })
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
    if (!isAuthenticated) {
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
      </div>
    </div>
  )
}
