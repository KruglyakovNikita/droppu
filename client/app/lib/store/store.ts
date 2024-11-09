import { create } from "zustand";
import { Achievement, InvitedUser, User } from "./types";

type StoreState = {
  user: User | null;
  inventory: string[];
  achievements: Achievement[];
  invitedUsers: InvitedUser[];
  totalTokensFromInvited: number;
  totalTicketsFromInvited: number;
  setUser: (user: User | null) => void;
  setInventory: (inventory: string[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setInvitedUsers: (users: InvitedUser[]) => void;
  setTotalTokensFromInvited: (tokens: number) => void;
};

export const useStore = create<StoreState>((set) => ({
  user: null,
  inventory: [],
  achievements: [],
  invitedUsers: [],
  totalTokensFromInvited: 0,
  totalTicketsFromInvited: 0,
  setUser: (user) => set({ user }),
  setInventory: (inventory) => set({ inventory }),
  setAchievements: (achievements) => set({ achievements }),
  setInvitedUsers: (invitedUsers) => set({ invitedUsers }),
  setTotalTokensFromInvited: (tokens) =>
    set({ totalTokensFromInvited: tokens }),
}));
