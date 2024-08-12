import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface Store {
  teamId: string | null
  setTeamId: (teamId: string | null) => void
}

export const usePersistStore = create<Store>()(
  persist(
    (set, get) => ({
      teamId: null,
      setTeamId: (teamId: string | null) => set({ teamId }),
    }),
    {
      name: 'expotes-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
