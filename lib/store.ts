import { create } from "zustand"
import { persist } from "zustand/middleware"

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
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
    }),
    { name: "auth-storage" },
  ),
)

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
