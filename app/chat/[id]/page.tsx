"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useSubscription } from "@apollo/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { MESSAGES_QUERY, SEND_MESSAGE_MUTATION, MESSAGE_ADDED_SUBSCRIPTION, MATCH_QUERY } from "@/lib/graphql/operations"
import { format } from "date-fns"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string
  const { isAuthenticated, user } = useAuthStore()
  const { toast } = useToast()
  const [messageText, setMessageText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get match info to find other user
  const { data: matchData } = useQuery(MATCH_QUERY, {
    variables: { id: matchId },
    skip: !isAuthenticated || !matchId,
  })

  const { data, loading, refetch } = useQuery(MESSAGES_QUERY, {
    variables: { matchId },
    skip: !isAuthenticated || !matchId,
  })

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE_MUTATION, {
    refetchQueries: [{ query: MESSAGES_QUERY, variables: { matchId } }],
    awaitRefetchQueries: true,
    onError: (error) => {
      console.error("Error sending message:", error)
      toast({ 
        title: "Ошибка отправки", 
        description: error.message || "Не удалось отправить сообщение. Проверьте подключение.", 
        variant: "destructive" 
      })
    },
  })

  // Subscribe to new messages
  const { data: subscriptionData } = useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    variables: { matchId },
    skip: !isAuthenticated || !matchId,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  // Get other user from match participants
  const otherUser = useMemo(() => {
    if (!matchData?.match?.participants || !user) return null
    return matchData.match.participants.find((p: any) => p.id !== user.id) || null
  }, [matchData, user])

  // Combine messages and filter duplicates
  const allMessages = useMemo(() => {
    const baseMessages = data?.messages?.messages || []
    const messageMap = new Map<string, any>()

    // Add base messages
    baseMessages.forEach((msg: any) => {
      if (msg?.id) {
        messageMap.set(msg.id, msg)
      }
    })

    // Add subscription message if it's new and matches current matchId
    if (subscriptionData?.messageAdded?.id && subscriptionData.messageAdded.matchId === matchId) {
      const newMessage = subscriptionData.messageAdded
      if (!messageMap.has(newMessage.id)) {
        messageMap.set(newMessage.id, newMessage)
      }
    }

    // Sort by sentAt
    return Array.from(messageMap.values()).sort((a, b) => {
      return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    })
  }, [data?.messages?.messages, subscriptionData?.messageAdded, matchId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allMessages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || sending) return

    const textToSend = messageText.trim()
    setMessageText("") // Clear input immediately

    try {
      await sendMessage({
        variables: {
          matchId,
          text: textToSend,
        },
      })
    } catch (error) {
      // Restore text on error
      setMessageText(textToSend)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Загрузка чата...</p>
        </div>
      </div>
    )
  }

  const displayName = otherUser?.profile?.displayName || otherUser?.username || "Пользователь"

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Chat Header */}
      <div className="border-b p-4 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Link href={`/profile/${otherUser?.id}`}>
            <Avatar className="cursor-pointer hover:ring-2 ring-primary transition-all">
              <AvatarImage src={otherUser?.profile?.photos?.[0] || "/placeholder-user.jpg"} />
              <AvatarFallback>{displayName[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link href={`/profile/${otherUser?.id}`}>
              <h2 className="font-semibold hover:text-primary transition-colors cursor-pointer">{displayName}</h2>
            </Link>
            <p className="text-sm text-muted-foreground">В сети</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
        {allMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Пока нет сообщений. Начните разговор!</p>
          </div>
        ) : (
          allMessages.map((message: any) => {
            const isOwn = message.senderId === user?.id
            const senderName = message.sender?.profile?.displayName || message.sender?.username || "Пользователь"
            return (
              <div key={message.id} className={`flex gap-2 ${isOwn ? "justify-end" : ""}`}>
                {!isOwn && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={message.sender?.profile?.photos?.[0]} />
                    <AvatarFallback>{senderName[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                )}
                <Card className={isOwn ? "bg-primary text-primary-foreground max-w-[70%]" : "max-w-[70%]"}>
                  <CardContent className="p-3">
                    <p className="break-words">{message.text}</p>
                    <span className={`text-xs block mt-1 ${isOwn ? "opacity-80" : "text-muted-foreground"}`}>
                      {format(new Date(message.sentAt), "HH:mm")}
                    </span>
                  </CardContent>
                </Card>
                {isOwn && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={user?.profile?.photos?.[0]} />
                    <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-background sticky bottom-0 z-10">
        <form onSubmit={handleSend} className="flex gap-2 max-w-2xl mx-auto">
          <Input
            placeholder="Введите сообщение..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!messageText.trim() || sending}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
