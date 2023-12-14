import { create } from 'zustand';

type State = {
  isSubscriptionModalOpen: boolean;
};

type Action = {
  setSubscriptionModalOpen: () => void;
};

export const useUiStore = create<State & Action>()((set, get) => ({
  isSubscriptionModalOpen: !false,

  setSubscriptionModalOpen: () => {
    set({ isSubscriptionModalOpen: true });
  },
}));
