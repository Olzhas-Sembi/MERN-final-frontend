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
    if (typeof window !== "undefined") {
      try {
        const authStorage = localStorage.getItem("auth-storage")
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          if (parsed.state?.token || parsed.state?.user) {
            setHasHydrated(true)
          }
        }
      } catch (e) {
      }
    }
    setIsHydrated(true)
    setHasHydrated(true)
  }, [setHasHydrated])

  if (!isHydrated) {
    return null
  }

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}
