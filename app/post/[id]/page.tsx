"use client"

import { useEffect } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share, ArrowLeft } from "lucide-react"
import { useAuthStore, useIsAuthenticated } from "@/lib/store"
import { POST_QUERY, LIKE_POST_MUTATION } from "@/lib/graphql/operations"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { ImageViewer } from "@/components/image-viewer"
import { useState } from "react"

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const isAuthenticated = useIsAuthenticated()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const { data, loading, refetch } = useQuery(POST_QUERY, {
    variables: { id: postId },
    skip: isAuthenticated !== true || !postId,
  })

  const [likePost] = useMutation(LIKE_POST_MUTATION, {
    refetchQueries: [{ query: POST_QUERY, variables: { id: postId } }],
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" })
    },
  })

  useEffect(() => {
    // Не делаем редирект, если гидратация еще не завершена (isAuthenticated === null)
    if (isAuthenticated === false) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  const handleLike = () => {
    if (postId) {
      likePost({ variables: { postId } })
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.share({
        title: "Посмотрите этот пост",
        url: url,
      })
    } catch (error) {
      await navigator.clipboard.writeText(url)
      toast({ title: "Ссылка скопирована!", description: "Ссылка на пост скопирована в буфер обмена." })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Загрузка поста...</p>
        </div>
      </div>
    )
  }

  const post = data?.post

  if (!post) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl">Пост не найден</p>
          <Button onClick={() => router.back()}>Назад</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Link href={`/profile/${post.author?.id}`}>
                <Avatar className="cursor-pointer hover:ring-2 ring-primary transition-all">
                  <AvatarImage src={post.author?.profile?.photos?.[0] || "/placeholder-user.jpg"} />
                  <AvatarFallback>{post.author?.username?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <Link href={`/profile/${post.author?.id}`}>
                  <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                    {post.author?.profile?.displayName || post.author?.username}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap">{post.content}</p>
            {post.images && post.images.length > 0 && (
              <div className={`grid gap-2 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {post.images.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden group cursor-pointer"
                    onClick={() => setSelectedImageIndex(idx)}
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
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 ${post.isLiked ? "text-red-500" : ""}`}
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
                {post.likesCount}
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                {post.commentsCount}
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
                <Share className="w-4 h-4" />
                Поделиться
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Viewer */}
      {post.images && selectedImageIndex !== null && (
        <ImageViewer
          images={post.images}
          currentIndex={selectedImageIndex}
          isOpen={selectedImageIndex !== null}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </div>
  )
}

