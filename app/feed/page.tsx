"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/lib/store"
import { POSTS_QUERY, CREATE_POST_MUTATION, LIKE_POST_MUTATION } from "@/lib/graphql/operations"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ImageUpload } from "@/components/upload/image-upload"
import Link from "next/link"
import { ImageViewer } from "@/components/image-viewer"

export default function FeedPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { toast } = useToast()
  const [postContent, setPostContent] = useState("")
  const [postImages, setPostImages] = useState<string[]>([])
  const [selectedPostImages, setSelectedPostImages] = useState<{ images: string[]; index: number } | null>(null)
  const [createPostOpen, setCreatePostOpen] = useState(false)

  const { data, loading, refetch } = useQuery(POSTS_QUERY, {
    variables: { limit: 20, offset: 0 },
    skip: !isAuthenticated,
  })

  const [createPost, { loading: creating }] = useMutation(CREATE_POST_MUTATION, {
    refetchQueries: [{ query: POSTS_QUERY, variables: { limit: 20, offset: 0 } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setPostContent("")
      setPostImages([])
      setCreatePostOpen(false)
      toast({ title: "Пост создан!", description: "Ваш пост был опубликован." })
    },
    onError: (error) => {
      console.error("Create post error:", error)
      toast({ 
        title: "Ошибка создания поста", 
        description: error.message || "Не удалось создать пост. Проверьте данные и попробуйте снова.", 
        variant: "destructive" 
      })
    },
  })

  const [likePost] = useMutation(LIKE_POST_MUTATION, {
    refetchQueries: [{ query: POSTS_QUERY, variables: { limit: 20, offset: 0 } }],
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" })
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postContent.trim()) return

    await createPost({
      variables: {
        input: {
          content: postContent.trim(),
          images: postImages,
          visibility: "public",
        },
      },
    })
  }

  const handleLike = (postId: string) => {
    likePost({ variables: { postId } })
  }

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/post/${postId}`
    try {
      await navigator.share({
        title: "Посмотрите этот пост",
        url: url,
      })
    } catch (error) {
      // Fallback to copy
      await navigator.clipboard.writeText(url)
      toast({ title: "Ссылка скопирована!", description: "Ссылка на пост скопирована в буфер обмена." })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Загрузка ленты...</p>
        </div>
      </div>
    )
  }

  const posts = data?.posts || []

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Лента</h1>
          <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Создать пост
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать пост</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <Textarea
                  placeholder="О чем вы думаете?"
                  rows={5}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  maxLength={5000}
                />
                <ImageUpload value={postImages} onChange={setPostImages} maxFiles={6} />
                <Button type="submit" className="w-full" disabled={creating || !postContent.trim()}>
                  {creating ? "Публикация..." : "Опубликовать"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Пока нет постов. Станьте первым!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post: any) => (
            <Card key={post.id}>
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
                  <p className="whitespace-pre-wrap cursor-pointer hover:text-primary transition-colors">{post.content}</p>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${post.isLiked ? "text-red-500" : ""}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
                    {post.likesCount}
                  </Button>
                  <Link href={`/post/${post.id}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {post.commentsCount}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="gap-2" onClick={() => handleShare(post.id)}>
                    <Share className="w-4 h-4" />
                    Поделиться
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
