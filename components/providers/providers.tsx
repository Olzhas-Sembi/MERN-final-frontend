"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { ApolloProvider } from "@apollo/client"
import { apolloClient } from "@/lib/apollo-client"
import { useAuthStore } from "@/lib/store"

export function Providers({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated)

  useEffect(() => {
    // Проверяем, есть ли данные в localStorage
    if (typeof window !== "undefined") {
      try {
        const authStorage = localStorage.getItem("auth-storage")
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          // Если есть сохраненные данные, устанавливаем флаг гидратации
          if (parsed.state?.token || parsed.state?.user) {
            setHasHydrated(true)
          }
        }
      } catch (e) {
        // Игнорируем ошибки парсинга
      }
    }
    // Устанавливаем флаг гидратации после проверки
    setIsHydrated(true)
    setHasHydrated(true)
  }, [setHasHydrated])

  // Не рендерим детей до завершения гидратации
  if (!isHydrated) {
    return null
  }

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}
