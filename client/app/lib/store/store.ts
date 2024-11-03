import { create } from "zustand";

type User = {
  id: string;
  name: string;
  // Добавьте другие поля пользователя по необходимости
};

type InvitedUser = {
  id: string;
  name: string;
  tokensEarned: number;
};

type Achievement = {
  id: string;
  title: string;
  completed: boolean;
};

type StoreState = {
  tokens: number;
  tickets: number;
  user: User | null;
  inventory: string[]; // Массив идентификаторов предметов
  achievements: Achievement[];
  invitedUsers: InvitedUser[];
  totalTokensFromInvited: number;
  // Методы для обновления состояния
  setTokens: (tokens: number) => void;
  setTickets: (tickets: number) => void;
  setUser: (user: User | null) => void;
  setInventory: (inventory: string[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setInvitedUsers: (users: InvitedUser[]) => void;
  setTotalTokensFromInvited: (tokens: number) => void;
};

export const useStore = create<StoreState>((set) => ({
  tokens: 0,
  tickets: 0,
  user: null,
  inventory: [],
  achievements: [],
  invitedUsers: [],
  totalTokensFromInvited: 0,
  setTokens: (tokens) => set({ tokens }),
  setTickets: (tickets) => set({ tickets }),
  setUser: (user) => set({ user }),
  setInventory: (inventory) => set({ inventory }),
  setAchievements: (achievements) => set({ achievements }),
  setInvitedUsers: (invitedUsers) => set({ invitedUsers }),
  setTotalTokensFromInvited: (tokens) =>
    set({ totalTokensFromInvited: tokens }),
}));
