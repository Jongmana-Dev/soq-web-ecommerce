import { create } from 'zustand'
type Item = { id: string; qty: number }
type State = { items: Item[] }
type Actions = { add: (i: Item) => void; clear: () => void }
export const useCart = create<State & Actions>((set) => ({
  items: [],
  add: (i) => set((s) => ({ items: [...s.items, i] })),
  clear: () => set({ items: [] }),
}))
