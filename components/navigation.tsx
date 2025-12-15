"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"
import { Heart, MessageSquare, Compass, Home, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuthStore()

  if (!isAuthenticated) return null

  const navItems = [
    { href: "/discover", label: "Поиск", icon: Compass },
    { href: "/matches", label: "Совпадения", icon: Heart },
    { href: "/feed", label: "Лента", icon: Home },
    { href: "/profile", label: "Профиль", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-2",
                    isActive && "text-primary"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            )
          })}
          <Button variant="ghost" size="sm" onClick={logout} className="flex flex-col items-center gap-1 h-auto py-2">
            <LogOut className="w-5 h-5" />
            <span className="text-xs">Выход</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}

