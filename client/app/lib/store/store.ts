import { create } from "zustand";
import { Achievement, Game, InvitedUser, User } from "./types";

type StoreState = {
  user: User | null;
  game: Game | null;
  inventory: string[];
  achievements: Achievement[];
  invitedUsers: InvitedUser[];
  totalTokensFromInvited: number;
  totalTicketsFromInvited: number;
  navbarVisible: boolean;
  setUser: (user: User | null) => void;
  setInventory: (inventory: string[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setInvitedUsers: (users: InvitedUser[]) => void;
  setTotalTokensFromInvited: (tokens: number) => void;
  setNavbarVisible: (visible: boolean) => void;
};

export const useStore = create<StoreState>((set) => ({
  user: null,
  game: null,
  inventory: [],
  achievements: [],
  invitedUsers: [],
  totalTokensFromInvited: 0,
  totalTicketsFromInvited: 0,
  navbarVisible: true,
  setUser: (user) => set({ user }),
  setInventory: (inventory) => set({ inventory }),
  setAchievements: (achievements) => set({ achievements }),
  setInvitedUsers: (invitedUsers) => set({ invitedUsers }),
  setTotalTokensFromInvited: (tokens) =>
    set({ totalTokensFromInvited: tokens }),
  setNavbarVisible: (visible) => set({ navbarVisible: visible }),
}));
