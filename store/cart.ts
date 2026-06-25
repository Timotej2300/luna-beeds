import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, CustomBraceletOptions } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, quantity?: number, customOptions?: CustomBraceletOptions) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, customOptions) => {
        const items = get().items
        const existingId = `${product.id}${customOptions ? '-custom' : ''}`
        const existing = items.find(i => i.id === existingId)

        if (existing && !customOptions) {
          set({
            items: items.map(i =>
              i.id === existingId ? { ...i, quantity: i.quantity + quantity } : i
            ),
          })
        } else {
          set({
            items: [...items, {
              id: customOptions ? `${product.id}-custom-${Date.now()}` : existingId,
              product,
              quantity,
              custom_options: customOptions,
            }],
          })
        }
        get().openCart()
      },

      removeItem: (id) =>
        set({ items: get().items.filter(i => i.id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) { get().removeItem(id); return }
        set({ items: get().items.map(i => i.id === id ? { ...i, quantity } : i) })
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((acc, i) => {
        const price = i.custom_options ? i.custom_options.total_price : i.product.price
        return acc + price * i.quantity
      }, 0),
    }),
    { name: 'luna-beeds-cart' }
  )
)
