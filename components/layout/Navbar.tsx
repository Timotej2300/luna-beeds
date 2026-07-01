'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Search, User, Menu, X, Sparkles } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'

const links = [
  { href: '/', label: 'Domov' },
  { href: '/products', label: 'Produkty' },
  { href: '/categories', label: 'Kategórie' },
  { href: '/custom-bracelet', label: '✨ Custom Naramok' },
  { href: '/forum', label: 'Fórum' },
  { href: '/o-nas', label: 'O nás' },
  { href: '/contact', label: 'Kontakt' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const cartCount = useCartStore(s => s.getTotalItems())
  const wishlistCount = useWishlistStore(s => s.items.length)
  const openCart = useCartStore(s => s.openCart)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-soft' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-[#C2185B]">Luna&Beeds</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? 'bg-[#FFF0F7] text-[#C2185B]'
                      : 'text-gray-600 hover:text-[#C2185B] hover:bg-[#FFF0F7]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(s => !s)} className="p-2 rounded-xl hover:bg-[#FFF0F7] text-gray-500 hover:text-[#C2185B] transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <Link href="/account/wishlist" className="relative p-2 rounded-xl hover:bg-[#FFF0F7] text-gray-500 hover:text-[#C2185B] transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C2185B] text-white text-xs rounded-full flex items-center justify-center">{wishlistCount}</span>
                )}
              </Link>
              <button onClick={openCart} className="relative p-2 rounded-xl hover:bg-[#FFF0F7] text-gray-500 hover:text-[#C2185B] transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-[#C2185B] text-white text-xs rounded-full flex items-center justify-center"
                  >{cartCount}</motion.span>
                )}
              </button>
              <Link href="/account" className="p-2 rounded-xl hover:bg-[#FFF0F7] text-gray-500 hover:text-[#C2185B] transition-colors">
                <User className="w-5 h-5" />
              </Link>
              <button className="md:hidden p-2 rounded-xl hover:bg-[#FFF0F7] text-gray-500" onClick={() => setMobileOpen(s => !s)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-3"
              >
                <form action="/search" method="get">
                  <input
                    name="q" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Hľadať produkty..."
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl border border-[#FFB6D9] outline-none focus:border-[#C2185B] focus:ring-2 focus:ring-[#FFB6D9]/30"
                  />
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-white border-t border-pink-100 px-4 py-4 space-y-1"
            >
              {links.map(link => (
                <Link
                  key={link.href} href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                    pathname === link.href ? 'bg-[#FFF0F7] text-[#C2185B]' : 'text-gray-700 hover:bg-[#FFF0F7]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      <div className="h-16" />
    </>
  )
}
