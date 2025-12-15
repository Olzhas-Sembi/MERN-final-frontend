"use client"

import { useEffect } from "react"
import { useQuery } from "@apollo/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore, useIsAuthenticated } from "@/lib/store"
import { ADMIN_STATS_QUERY } from "@/lib/graphql/operations"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()
  const { user } = useAuthStore()
  const { data, loading, error } = useQuery(ADMIN_STATS_QUERY, {
    skip: isAuthenticated !== true,
  })

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/auth")
      return
    }
    if (isAuthenticated === true && user && !user.roles?.includes("admin")) {
      router.push("/")
      return
    }
  }, [isAuthenticated, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Загрузка статистики...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Ошибка загрузки: {error.message}</p>
          <p className="text-sm text-muted-foreground">Убедитесь, что у вас есть права администратора</p>
        </div>
      </div>
    )
  }

  const stats = data?.adminStats

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Панель администратора</h1>
          <p className="text-muted-foreground mt-2">Статистика и управление приложением</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Всего пользователей</CardDescription>
              <CardTitle className="text-3xl">{stats?.totalUsers || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Профилей</CardDescription>
              <CardTitle className="text-3xl">{stats?.totalProfiles || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Постов</CardDescription>
              <CardTitle className="text-3xl">{stats?.totalPosts || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Совпадений</CardDescription>
              <CardTitle className="text-3xl">{stats?.totalMatches || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Сообщений</CardDescription>
              <CardTitle className="text-3xl">{stats?.totalMessages || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Пользователи по ролям</CardTitle>
            <CardDescription>Распределение пользователей по ролям</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {stats?.usersByRole?.map((roleStat: any) => (
                <div key={roleStat.role} className="flex items-center gap-2">
                  <Badge variant={roleStat.role === "admin" ? "default" : "secondary"}>
                    {roleStat.role === "admin" ? "Админ" : "Пользователь"}
                  </Badge>
                  <span className="text-2xl font-bold">{roleStat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика лайков</CardTitle>
            <CardDescription>Кто кого лайкнул</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.likesByUser && stats.likesByUser.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Лайков отправлено</TableHead>
                      <TableHead>Лайков получено</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.likesByUser.map((userStat: any) => (
                      <TableRow key={userStat.userId}>
                        <TableCell className="font-medium">{userStat.username}</TableCell>
                        <TableCell>{userStat.likesGiven}</TableCell>
                        <TableCell>{userStat.likesReceived}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Нет данных о лайках</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика постов</CardTitle>
            <CardDescription>Количество постов и лайков по пользователям</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.postsByUser && stats.postsByUser.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Количество постов</TableHead>
                      <TableHead>Всего лайков</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.postsByUser.map((userStat: any) => (
                      <TableRow key={userStat.userId}>
                        <TableCell className="font-medium">{userStat.username}</TableCell>
                        <TableCell>{userStat.postsCount}</TableCell>
                        <TableCell>{userStat.totalLikes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Нет данных о постах</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

