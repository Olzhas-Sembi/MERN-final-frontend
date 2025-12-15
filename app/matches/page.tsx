"use client"

import { useEffect } from "react"
import { useQuery } from "@apollo/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/store"
import { MATCHES_QUERY } from "@/lib/graphql/operations"
import { formatDistanceToNow } from "date-fns"

export default function MatchesPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { data, loading } = useQuery(MATCHES_QUERY, {
    skip: !isAuthenticated,
    pollInterval: 5000, // Poll every 5 seconds for new matches
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
          <p>Загрузка совпадений...</p>
        </div>
      </div>
    )
  }

  const matches = data?.matches || []

  // Get the other participant from each match
  const matchesWithOtherUser = matches
    .filter((match: any) => match.status === "matched")
    .map((match: any) => {
      const otherUser = match.participants?.find((p: any) => p.id !== user?.id)
      return {
        ...match,
        otherUser,
      }
    })
    .filter((match: any) => match.otherUser) // Filter out matches without otherUser

  if (matchesWithOtherUser.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Совпадения</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Пока нет совпадений. Начните свайпать, чтобы найти свою пару!</p>
              <Link href="/discover">
                <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                  Перейти к поиску
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Совпадения</h1>
        <div className="space-y-2">
          {matchesWithOtherUser.map((match: any) => {
            const otherUser = match.otherUser
            const profile = otherUser?.profile
            const photo = profile?.photos?.[0] || "/placeholder-user.jpg"
            const displayName = profile?.displayName || otherUser?.username || "Неизвестно"

            return (
              <Link key={match.id} href={`/chat/${match.id}`}>
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-4">
                    <Link href={`/profile/${otherUser?.id}`} onClick={(e) => e.stopPropagation()}>
                      <Avatar className="w-12 h-12 cursor-pointer hover:ring-2 ring-primary transition-all">
                        <AvatarImage src={photo} />
                        <AvatarFallback>{displayName[0]}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <Link href={`/profile/${otherUser?.id}`} onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                          {displayName}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Совпадение {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
