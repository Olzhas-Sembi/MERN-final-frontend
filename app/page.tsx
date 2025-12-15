"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/discover")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
            Приложение для знакомств
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Полнофункциональное приложение для знакомств с чатом в реальном времени, GraphQL API и современным стеком
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-6 max-w-md mx-auto space-y-3">
            <h2 className="font-semibold text-lg">Структура проекта</h2>
            <div className="text-left space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-mono bg-muted px-2 py-1 rounded">backend/</span>
                <span>GraphQL API, MongoDB, WebSocket</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-muted px-2 py-1 rounded">frontend/</span>
                <span>Next.js 16, Apollo Client, Zustand</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Быстрый старт:</strong> Запустите{" "}
              <code className="bg-white dark:bg-black px-2 py-1 rounded">docker-compose up</code> чтобы запустить все сервисы
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Начать
            </Link>
            <a
              href="http://localhost:4000/graphql"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              GraphQL Playground
            </a>
          </div>
        </div>

        <div className="pt-8 space-y-2">
          <p className="text-sm text-muted-foreground">Создано с использованием</p>
          <div className="flex gap-3 justify-center flex-wrap text-xs">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
              MongoDB
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
              GraphQL
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
              Next.js 16
            </span>
            <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 rounded-full">
              Apollo Client
            </span>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full">
              Docker
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
