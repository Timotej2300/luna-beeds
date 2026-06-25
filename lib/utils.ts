import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: 'Nová',
  processing: 'Spracováva sa',
  paid: 'Zaplatená',
  shipped: 'Odoslaná',
  delivered: 'Doručená',
  returned: 'Vrátená',
  cancelled: 'Zrušená',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  returned: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
}

export const ANNOUNCEMENT_TYPE_LABELS: Record<string, string> = {
  maintenance: 'Údržba',
  news: 'Novinky',
  info: 'Informácie',
  sale: 'Akcie',
  warning: 'Upozornenia',
}
