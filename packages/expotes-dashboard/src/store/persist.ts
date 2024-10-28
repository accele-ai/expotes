import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Store {
	isLogin: boolean;
	setIsLogin: (isLogin: boolean) => void;

	teamId: string | null;
	setTeamId: (teamId: string | null) => void;
}

export const usePersistStore = create<Store>()(
	persist(
		(set, get) => ({
			isLogin: false,
			setIsLogin: (isLogin: boolean) => set({ isLogin }),

			teamId: null,
			setTeamId: (teamId: string | null) => set({ teamId }),
		}),
		{
			name: "expotes-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
