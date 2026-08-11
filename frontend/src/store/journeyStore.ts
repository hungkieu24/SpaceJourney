import { create } from 'zustand'

export interface Astronaut {
  id: string
  name: string
  description: string
  cloudinaryUrl: string
  sceneId: string
  order: number
  isVisible: boolean
}

export interface Scene {
  id: string
  componentType: 'globe' | 'particle-sphere' | 'black-hole' | 'tornado' | 'glitter-wrap'
  displayName: string
  title: string
  description: string
  order: number
  isVisible: boolean
}

interface JourneyState {
  scenes: Scene[]
  currentSceneIndex: number
  isTransitioning: boolean
  selectedAstronaut: Astronaut | null
  setScenes: (scenes: Scene[]) => void
  goToNext: () => void
  goToScene: (index: number) => void
  setTransitioning: (v: boolean) => void
  openAstronaut: (astronaut: Astronaut) => void
  closeAstronaut: () => void
}

export const useJourneyStore = create<JourneyState>((set, get) => ({
  scenes: [],
  currentSceneIndex: 0,
  isTransitioning: false,
  selectedAstronaut: null,

  setScenes: (scenes) => set({ scenes }),

  goToNext: () => {
    const { currentSceneIndex, scenes, isTransitioning } = get()
    if (isTransitioning) return
    if (currentSceneIndex < scenes.length - 1) {
      set({ isTransitioning: true })
      // SpaceshipTransition sẽ set isTransitioning = false sau khi hoàn tất
    }
  },

  goToScene: (index) => {
    const { scenes } = get()
    if (index >= 0 && index < scenes.length) {
      set({ currentSceneIndex: index })
    }
  },

  setTransitioning: (v) => set({ isTransitioning: v }),

  openAstronaut: (astronaut) => set({ selectedAstronaut: astronaut }),
  closeAstronaut: () => set({ selectedAstronaut: null }),
}))

// ─── Admin Store ──────────────────────────────────────────────────────────────
interface AdminState {
  isAuthenticated: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  isAuthenticated: !!localStorage.getItem('space_journey_token'),
  token: localStorage.getItem('space_journey_token'),

  login: (token) => {
    localStorage.setItem('space_journey_token', token)
    set({ isAuthenticated: true, token })
  },

  logout: () => {
    localStorage.removeItem('space_journey_token')
    set({ isAuthenticated: false, token: null })
  },
}))
