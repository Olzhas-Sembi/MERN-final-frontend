"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@apollo/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from "@/lib/store"
import { SIGN_UP_MUTATION, SIGN_IN_MUTATION } from "@/lib/graphql/operations"
import { useToast } from "@/hooks/use-toast"

export default function AuthPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { toast } = useToast()
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })

  const [signUp, { loading: signUpLoading }] = useMutation(SIGN_UP_MUTATION, {
    onCompleted: (data) => {
      setAuth(data.signUp.user, data.signUp.accessToken)
      toast({ title: "Аккаунт создан!", description: "Добро пожаловать в Spark!" })
      router.push("/profile")
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" })
    },
  })

  const [signIn, { loading: signInLoading }] = useMutation(SIGN_IN_MUTATION, {
    onCompleted: (data) => {
      setAuth(data.signIn.user, data.signIn.accessToken)
      toast({ title: "С возвращением!", description: "Вы успешно вошли" })
      router.push("/discover")
    },
    onError: (error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp) {
      await signUp({
        variables: {
          input: {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          },
        },
      })
    } else {
      await signIn({
        variables: {
          input: {
            email: formData.email,
            password: formData.password,
          },
        },
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Добро пожаловать в Spark</CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? "Создайте аккаунт" : "Войдите в свой аккаунт"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(v) => setIsSignUp(v === "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Вход</TabsTrigger>
              <TabsTrigger value="signup">Регистрация</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit}>
              <TabsContent value="signin" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={signInLoading}>
                  {signInLoading ? "Вход..." : "Войти"}
                </Button>
              </TabsContent>
              <TabsContent value="signup" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Имя пользователя</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Пароль</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={signUpLoading}>
                  {signUpLoading ? "Создание аккаунта..." : "Зарегистрироваться"}
                </Button>
              </TabsContent>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
