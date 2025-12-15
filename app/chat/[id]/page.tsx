"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useSubscription } from "@apollo/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { useAuthStore, useIsAuthenticated } from "@/lib/store"
import { MESSAGES_QUERY, SEND_MESSAGE_MUTATION, MESSAGE_ADDED_SUBSCRIPTION, MATCH_QUERY } from "@/lib/graphql/operations"
import { format } from "date-fns"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  matchId: string
  senderId: string
  text: string
  attachments: { url: string; type: string }[]
  sentAt: string
  sender: {
    id: string
    username: string
    profile?: {
      id: string
      userId: string
      displayName: string
      photos: string[]
    }
  }
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string
  const isAuthenticated = useIsAuthenticated()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [messageText, setMessageText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get match info to find other user
  const { data: matchData } = useQuery(MATCH_QUERY, {
    variables: { id: matchId },
    skip: isAuthenticated !== true || !matchId,
  })

  // Загружаем сообщения при монтировании
  const { data, loading, refetch } = useQuery(MESSAGES_QUERY, {
    variables: { matchId },
    skip: isAuthenticated !== true || !matchId,
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      if (data?.messages?.messages) {
        setMessages(data.messages.messages)
      }
    },
  })

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE_MUTATION, {
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
    skip: isAuthenticated !== true || !matchId,
  })

  // Обрабатываем новые сообщения из subscription
  useEffect(() => {
    if (subscriptionData?.messageAdded && subscriptionData.messageAdded.matchId === matchId) {
      const newMessage = subscriptionData.messageAdded
      setMessages((prev) => {
        // Проверяем, нет ли уже этого сообщения
        const exists = prev.some((msg) => msg.id === newMessage.id)
        if (exists) return prev
        return [...prev, newMessage]
      })
    }
  }, [subscriptionData?.messageAdded, matchId])

  useEffect(() => {
    // Не делаем редирект, если гидратация еще не завершена (isAuthenticated === null)
    if (isAuthenticated === false) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  // Get other user from match participants
  const otherUser = useMemo(() => {
    if (!matchData?.match?.participants || !user) return null
    return matchData.match.participants.find((p: any) => p.id !== user.id) || null
  }, [matchData, user])

  // Группируем сообщения для отображения
  const groupedMessages = useMemo(() => {
    // Сортируем по времени
    const sortedMessages = [...messages].sort((a, b) => {
      return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    })

    // Добавляем метаданные для группировки
    return sortedMessages.map((msg, index) => {
      const prevMsg = index > 0 ? sortedMessages[index - 1] : null
      const nextMsg = index < sortedMessages.length - 1 ? sortedMessages[index + 1] : null
      
      const isFirstInGroup = 
        !prevMsg || 
        prevMsg.senderId !== msg.senderId ||
        (new Date(msg.sentAt).getTime() - new Date(prevMsg.sentAt).getTime()) > 5 * 60 * 1000 // 5 minutes
      
      const isLastInGroup =
        !nextMsg ||
        nextMsg.senderId !== msg.senderId ||
        (new Date(nextMsg.sentAt).getTime() - new Date(msg.sentAt).getTime()) > 5 * 60 * 1000 // 5 minutes

      return {
        ...msg,
        isFirstInGroup,
        isLastInGroup,
      }
    })
  }, [messages])

  // Скролл к концу сообщений
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      const container = messagesEndRef.current.parentElement
      if (container) {
        const isNearBottom = 
          container.scrollHeight - container.scrollTop - container.clientHeight < 150
        
        // Скроллим только если пользователь уже был внизу
        if (isNearBottom) {
          requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          })
        }
      }
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || sending) return

    const textToSend = messageText.trim()
    setMessageText("") // Очищаем инпут сразу

    try {
      const result = await sendMessage({
        variables: {
          matchId,
          text: textToSend,
        },
      })

      // Добавляем сообщение в локальное состояние сразу после отправки
      if (result.data?.sendMessage) {
        const newMessage = result.data.sendMessage
        setMessages((prev) => {
          // Проверяем, нет ли уже этого сообщения
          const exists = prev.some((msg) => msg.id === newMessage.id)
          if (exists) return prev
          return [...prev, newMessage]
        })
      }
    } catch (error) {
      // Восстанавливаем текст при ошибке
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="border-b p-4 bg-background/95 backdrop-blur flex-shrink-0 z-10">
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
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full min-h-0">
        {groupedMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Пока нет сообщений. Начните разговор!</p>
          </div>
        ) : (
          groupedMessages.map((message) => {
            const isOwn = message.senderId === user?.id
            const senderName = message.sender?.profile?.displayName || message.sender?.username || "Пользователь"
            const showAvatar = message.isFirstInGroup
            const showTime = message.isLastInGroup || message.isFirstInGroup
            
            return (
              <div 
                key={message.id} 
                className={`flex gap-2 ${isOwn ? "justify-end" : ""} ${message.isFirstInGroup ? "mt-4" : "mt-0.5"}`}
              >
                {!isOwn && (
                  <div className="w-8 flex-shrink-0 flex items-end">
                    {showAvatar ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.sender?.profile?.photos?.[0]} />
                        <AvatarFallback>{senderName[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>
                )}
                <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                  <Card className={isOwn ? "bg-primary text-primary-foreground" : ""}>
                    <CardContent className={`p-3 ${!message.isLastInGroup ? "pb-2" : ""}`}>
                      <p className="break-words">{message.text}</p>
                      {showTime && (
                        <span className={`text-xs block mt-1 ${isOwn ? "opacity-80" : "text-muted-foreground"}`}>
                          {format(new Date(message.sentAt), "HH:mm")}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </div>
                {isOwn && (
                  <div className="w-8 flex-shrink-0 flex items-end">
                    {showAvatar ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.profile?.photos?.[0]} />
                        <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-background flex-shrink-0 z-10 shadow-lg pb-20">
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
