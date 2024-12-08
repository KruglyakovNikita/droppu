import { create } from "zustand";
import {
  Achievement,
  CheckInInfo,
  FirstLoginInfo,
  Game,
  InvitedUser,
  TelegramUser,
  User,
} from "./types";
import { initUser } from "../api/user";

type StoreState = {
  user: User | null;
  game: Game | null;
  telegramUser: TelegramUser | null;
  inventory: string[];
  firstLoginInfo: FirstLoginInfo | null;
  checkInInfo: CheckInInfo | null;
  achievements: Achievement[];
  invitedUsers: InvitedUser[];
  totalTokensFromInvited: number;
  totalTicketsFromInvited: number;
  navbarVisible: boolean;
  initUser: (initData?: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setCheckInInfo: (checkInInfo: CheckInInfo | null) => void;
  setFirstLoginInfo: (firstLoginInfo: FirstLoginInfo | null) => void;
  setTelegramUser: (telegramUser: TelegramUser | null) => void;
  setInventory: (inventory: string[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setInvitedUsers: (users: InvitedUser[]) => void;
  setTotalTokensFromInvited: (tokens: number) => void;
  setNavbarVisible: (visible: boolean) => void;
};

export const useStore = create<StoreState>((set) => ({
  user: null,
  game: null,
  telegramUser: null,
  firstLoginInfo: null,
  checkInInfo: null,
  inventory: [],
  achievements: [],
  invitedUsers: [],
  totalTokensFromInvited: 0,
  totalTicketsFromInvited: 0,
  navbarVisible: true,
  initUser: async (initData?: string) => {
    try {
      const response = await initUser(initData);
      if (response.data) {
        set({ user: response.data.user });
      }
    } catch (error) {
      console.error("Init user error:", error);
    }
  },
  setTelegramUser: (telegramUser) => set({ telegramUser }),
  setUser: (user) => set({ user }),
  setCheckInInfo: (checkInInfo) => set({ checkInInfo }),
  setFirstLoginInfo: (firstLoginInfo) => set({ firstLoginInfo }),
  setInventory: (inventory) => set({ inventory }),
  setAchievements: (achievements) => set({ achievements }),
  setInvitedUsers: (invitedUsers) => set({ invitedUsers }),
  setTotalTokensFromInvited: (tokens) =>
    set({ totalTokensFromInvited: tokens }),
  setNavbarVisible: (visible) => set({ navbarVisible: visible }),
}));
