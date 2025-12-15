import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// Types
export interface User {
  id: string
  username: string
  email: string
  roles: string[]
  profile?: Profile
}

export interface Profile {
  id: string
  userId: string
  displayName: string
  birthDate: string
  gender: "male" | "female" | "other"
  bio?: string
  photos: string[]
  location?: {
    lat: number
    lng: number
    city: string
  }
  lookingFor: string[]
}

export interface Match {
  id: string
  status: string
  participants: User[]
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  matchId: string
  senderId: string
  text: string
  attachments: { url: string; type: string }[]
  sentAt: string
  sender: {
    id: string
    username: string
    profile?: Profile
  }
}

// Auth Store
interface AuthState {
  user: User | null
  token: string | null
  _hasHydrated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: User) => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Проверяем localStorage при инициализации
      let initialHydrated = false
      if (typeof window !== "undefined") {
        try {
          const authStorage = localStorage.getItem("auth-storage")
          if (authStorage) {
            initialHydrated = true
          }
        } catch {
          // Игнорируем ошибки
        }
      }

      return {
        user: null,
        token: null,
        _hasHydrated: initialHydrated,
        setAuth: (user, token) => set({ user, token }),
        logout: () => set({ user: null, token: null }),
        updateUser: (user) => set({ user }),
        setHasHydrated: (state) => {
          set({
            _hasHydrated: state,
          })
        },
      }
    },
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        // _hasHydrated не сохраняется в localStorage
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

// Selector для isAuthenticated, который учитывает гидратацию
// Возвращает false до завершения гидратации, чтобы избежать редиректов при перезагрузке
export const useIsAuthenticated = () => {
  const { _hasHydrated, token, user } = useAuthStore()
  if (!_hasHydrated) return null // null означает, что гидратация еще не завершена
  return !!(token && user)
}

// Хук для проверки, завершена ли гидратация
export const useHasHydrated = () => {
  return useAuthStore((state) => state._hasHydrated)
}

// UI Store
interface UIState {
  theme: "light" | "dark"
  genderTheme: "female" | "male"
  isSidebarOpen: boolean
  toggleTheme: () => void
  setGenderTheme: (gender: "female" | "male") => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      genderTheme: "female",
      isSidebarOpen: false,
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      setGenderTheme: (genderTheme) => set({ genderTheme }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    { name: "ui-storage" },
  ),
)

// Chat Store
interface ChatState {
  activeMatchId: string | null
  setActiveMatch: (matchId: string | null) => void
}

export const useChatStore = create<ChatState>((set) => ({
  activeMatchId: null,
  setActiveMatch: (matchId) => set({ activeMatchId: matchId }),
}))
