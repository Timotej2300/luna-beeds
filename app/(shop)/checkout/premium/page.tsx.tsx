'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring } from 'framer-motion'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Lock, ChevronRight, CreditCard, Wallet, Check, X, Sparkles, Shield, Truck } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────────────────────
type PaymentMethod = 'stripe' | 'paypal'
type CheckoutState = 'idle' | 'processing' | 'success' | 'error'

interface CardData {
  number: string
  holder: string
  expiry: string
  cvv: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function getCardType(number: string): 'visa' | 'mastercard' | 'amex' | 'unknown' {
  const n = number.replace(/\s/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^5[1-5]/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  return 'unknown'
}

function maskCardNumber(number: string) {
  const clean = number.replace(/\s/g, '')
  const groups = []
  for (let i = 0; i < 4; i++) {
    const chunk = clean.slice(i * 4, i * 4 + 4)
    if (i < 2 && chunk.length === 4) groups.push(chunk)
    else if (i === 2) groups.push(chunk.padEnd(4, '●'))
    else groups.push('●●●●')
  }
  return groups.join('  ')
}

// ─── Confetti ────────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => i)
  const colors = ['#FFB6D9', '#C2185B', '#880E4F', '#FFD700', '#FF8EC7', '#fff']
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map(i => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, (Math.random() - 0.5) * 300],
            rotate: [0, Math.random() * 720],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            delay: Math.random() * 0.8,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  )
}

// ─── Card Logos ──────────────────────────────────────────────────────────────
function CardLogo({ type }: { type: string }) {
  if (type === 'visa') return (
    <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1">
      <span className="text-white font-black text-lg italic tracking-tight">VISA</span>
    </div>
  )
  if (type === 'mastercard') return (
    <div className="flex">
      <div className="w-7 h-7 bg-red-500 rounded-full opacity-90" />
      <div className="w-7 h-7 bg-yellow-400 rounded-full -ml-3 opacity-90" />
    </div>
  )
  return (
    <div className="w-10 h-6 border border-white/40 rounded flex items-center justify-center">
      <Sparkles className="w-3 h-3 text-white/60" />
    </div>
  )
}

// ─── 3D Payment Card ─────────────────────────────────────────────────────────
function PaymentCard({ card, isFlipped, checkoutState }: { card: CardData; isFlipped: boolean; checkoutState: CheckoutState }) {
  const cardType = getCardType(card.number)
  const gradients: Record<string, string> = {
    visa: 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    mastercard: 'from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]',
    amex: 'from-[#006fcf] via-[#0077b6] to-[#00509e]',
    unknown: 'from-[#2d1b3d] via-[#C2185B] to-[#880E4F]',
  }

  return (
    <div className="relative w-full max-w-[380px] mx-auto" style={{ perspective: '1200px', height: '220px' }}>
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${gradients[cardType]}`} />
          {/* Shine overlay */}
          <div className="absolute inset-0 opacity-30"
            style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative h-full p-6 flex flex-col justify-between">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="text-white/40 text-xs tracking-widest uppercase">Luna&Beeds</div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FFB6D9]" />
                  <span className="text-[#FFB6D9] text-xs font-medium">Premium Card</span>
                </div>
              </div>
              <CardLogo type={cardType} />
            </div>

            {/* Chip */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md relative overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px p-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-yellow-600/40 rounded-sm" />
                  ))}
                </div>
              </div>
              {/* NFC */}
              <div className="relative w-6 h-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="absolute inset-0 border border-white/30 rounded-full"
                    style={{ transform: `scale(${i * 0.4})`, opacity: 1 - i * 0.2 }} />
                ))}
              </div>
            </div>

            {/* Card number */}
            <div className="font-mono text-white tracking-[0.25em] text-lg">
              {card.number
                ? maskCardNumber(card.number)
                : '●●●●  ●●●●  ●●●●  ●●●●'
              }
            </div>

            {/* Bottom row */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Card Holder</div>
                <div className="text-white font-medium tracking-wider text-sm uppercase">
                  {card.holder || 'FULL NAME'}
                </div>
              </div>
              <div>
                <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Expires</div>
                <div className="text-white font-medium tracking-wider text-sm">
                  {card.expiry || 'MM/YY'}
                </div>
              </div>
            </div>
          </div>

          {/* Success overlay */}
          <AnimatePresence>
            {checkoutState === 'success' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.6)]"
                >
                  <motion.svg viewBox="0 0 50 50" className="w-10 h-10">
                    <motion.path
                      d="M14 26 L22 34 L37 17"
                      fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
                    />
                  </motion.svg>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error overlay */}
          <AnimatePresence>
            {checkoutState === 'error' && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-3xl border-2 border-red-500"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Back */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${gradients[cardType]}`} />
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative h-full flex flex-col">
            {/* Magnetic stripe */}
            <div className="w-full h-12 bg-gradient-to-r from-gray-800 to-gray-900 mt-8" />

            {/* Signature strip */}
            <div className="px-6 mt-4">
              <div className="w-full h-10 bg-white rounded flex items-center justify-between px-3 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: 'repeating-linear-gradient(90deg, #ff9 0, #ff9 2px, transparent 2px, transparent 6px)', backgroundSize: '8px' }} />
                <span className="text-gray-700 font-mono text-sm relative z-10">
                  {card.cvv || '●●●'}
                </span>
                <div className="text-gray-400 text-xs relative z-10">CVV</div>
              </div>
            </div>

            <div className="px-6 mt-4 text-white/30 text-xs leading-relaxed">
              This card is property of Luna&Beeds Bank. If found, please return to any branch.
              Use subject to cardholder agreement.
            </div>

            <div className="px-6 mt-auto mb-6 flex justify-end">
              <CardLogo type={cardType} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Animated Input ───────────────────────────────────────────────────────────
function PremiumInput({ label, value, onChange, onFocus, onBlur, placeholder, type = 'text', maxLength, icon, error }: {
  label: string; value: string; onChange: (v: string) => void
  onFocus?: () => void; onBlur?: () => void; placeholder: string
  type?: string; maxLength?: number; icon?: React.ReactNode; error?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      <motion.div
        animate={{ scale: focused ? 1.01 : 1 }}
        className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
          error ? 'ring-2 ring-red-500' : focused ? 'ring-2 ring-[#C2185B] shadow-[0_0_20px_rgba(194,24,91,0.2)]' : 'ring-1 ring-white/10'
        }`}
      >
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => { setFocused(true); onFocus?.() }}
          onBlur={() => { setFocused(false); onBlur?.() }}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`relative z-10 w-full bg-transparent text-white placeholder:text-gray-600 py-4 pr-4 outline-none text-sm font-mono ${icon ? 'pl-11' : 'pl-4'}`}
        />
      </motion.div>
      {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs">{error}</motion.p>}
    </div>
  )
}

// ─── Order Summary ────────────────────────────────────────────────────────────
function OrderSummary({ total, shipping }: { total: number; shipping: number }) {
  const { items } = useCartStore()
  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 text-[#FFB6D9]" /> Súhrn objednávky
      </h3>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#C2185B]/20 rounded-xl flex items-center justify-center shrink-0 text-lg">
              {item.custom_options ? '💎' : '✨'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{item.product.name}</p>
              {item.custom_options && (
                <div className="flex gap-1 mt-0.5">
                  {item.custom_options.beads?.slice(0, 4).map((b: any, i: number) => (
                    <div key={i} className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: b.color }} />
                  ))}
                  {item.custom_options.letters && <span className="text-[#FFB6D9] text-xs ml-1">{item.custom_options.letters}</span>}
                </div>
              )}
              <p className="text-gray-500 text-xs">×{item.quantity}</p>
            </div>
            <p className="text-[#FFB6D9] font-semibold text-sm">
              {formatPrice((item.custom_options?.total_price ?? item.product.price) * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Medzisúčet</span>
          <span className="text-white">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400 flex items-center gap-1"><Truck className="w-3 h-3" /> Doprava</span>
          <span className="text-emerald-400">{shipping === 0 ? 'Zadarmo' : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
          <span className="text-white">Celkom</span>
          <motion.span
            key={total}
            initial={{ scale: 1.1, color: '#FFB6D9' }}
            animate={{ scale: 1, color: '#FFB6D9' }}
            className="text-[#FFB6D9]"
          >{formatPrice(total + shipping)}</motion.span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Checkout ────────────────────────────────────────────────────────────
export default function PremiumCheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [payMethod, setPayMethod] = useState<PaymentMethod>('stripe')
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle')
  const [isFlipped, setIsFlipped] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [card, setCard] = useState<CardData>({ number: '', holder: '', expiry: '', cvv: '' })
  const [billingForm, setBillingForm] = useState({ name: '', email: '', street: '', city: '', zip: '' })

  const total = getTotalPrice()
  const shipping = total >= 50 ? 0 : 3.99

  const setCardField = (field: keyof CardData) => (value: string) => {
    let v = value
    if (field === 'number') v = formatCardNumber(value)
    if (field === 'expiry') {
      v = value.replace(/\D/g, '').slice(0, 4)
      if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2)
    }
    if (field === 'cvv') v = value.replace(/\D/g, '').slice(0, 4)
    setCard(c => ({ ...c, [field]: v }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (card.number.replace(/\s/g, '').length < 16) errs.number = 'Zadajte platné číslo karty'
    if (!card.holder.trim()) errs.holder = 'Zadajte meno držiteľa'
    if (card.expiry.length < 5) errs.expiry = 'Zadajte dátum vypršania'
    if (card.cvv.length < 3) errs.cvv = 'Zadajte CVV'
    if (!billingForm.email) errs.email = 'Zadajte email'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (checkoutState !== 'idle') return
    if (payMethod === 'stripe' && !validate()) return

    setCheckoutState('processing')

    await new Promise(r => setTimeout(r, 2500))

    // Simulate success (in production, call real Stripe API)
    const success = Math.random() > 0.15

    if (success) {
      setCheckoutState('success')
      setShowConfetti(true)
      setTimeout(() => {
        clearCart()
        router.push('/checkout/success')
      }, 4000)
    } else {
      setCheckoutState('error')
      setTimeout(() => setCheckoutState('idle'), 3000)
    }
  }

  if (items.length === 0 && checkoutState === 'idle') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center text-white">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#C2185B]" />
          <p className="text-xl font-semibold mb-4">Košík je prázdny</p>
          <button onClick={() => router.push('/products')} className="bg-[#C2185B] px-6 py-3 rounded-2xl font-semibold hover:bg-[#880E4F] transition-colors">
            Preskúmať produkty
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C2185B]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#880E4F]/10 rounded-full blur-[120px] pointer-events-none" />

      {showConfetti && <Confetti />}

      {/* Processing overlay */}
      <AnimatePresence>
        {checkoutState === 'processing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-2 border-[#FFB6D9] border-t-[#C2185B] rounded-full mx-auto mb-4"
              />
              <p className="text-white font-semibold text-lg">Spracovávam platbu...</p>
              <p className="text-gray-400 text-sm mt-1">Prosím počkajte</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFB6D9] to-[#C2185B] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">Luna&Beeds</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>SSL Secured Checkout</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: 1,
                y: checkoutState === 'processing' ? 0 : 0,
                scale: checkoutState === 'processing' ? 1.05 : 1,
              }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Floating animation */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <PaymentCard card={card} isFlipped={isFlipped} checkoutState={checkoutState} />
              </motion.div>
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
              {checkoutState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1, x: [0, -8, 8, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ x: { duration: 0.5 } }}
                  className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3"
                >
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-semibold text-sm">Platba zlyhala</p>
                    <p className="text-red-300/70 text-xs mt-1">Skontrolujte údaje karty a skúste znova.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success message */}
            <AnimatePresence>
              {checkoutState === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center"
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}
                    className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3"
                  >
                    <Check className="w-6 h-6 text-white" />
                  </motion.div>
                  <p className="text-emerald-400 font-bold text-lg">Platba úspešná!</p>
                  <p className="text-emerald-300/70 text-sm mt-1">Ďakujeme za váš nákup</p>
                  <p className="text-emerald-400/60 text-xs mt-2 font-mono">Order #LB-{Math.floor(Math.random() * 900000 + 100000)}</p>
                  <p className="text-gray-500 text-xs mt-3">Presmerovanie za chvíľu...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Order summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6"
            >
              <OrderSummary total={total} shipping={shipping} />
            </motion.div>
          </div>

          {/* Right column - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment method switcher */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-1 flex gap-1">
                {[
                  { id: 'stripe', label: 'Kartou', icon: <CreditCard className="w-4 h-4" /> },
                  { id: 'paypal', label: 'PayPal', icon: <Wallet className="w-4 h-4" /> },
                ].map(method => (
                  <motion.button
                    key={method.id}
                    type="button"
                    onClick={() => setPayMethod(method.id as PaymentMethod)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      payMethod === method.id ? 'bg-[#C2185B] text-white shadow-lg' : 'text-gray-400 hover:text-white'
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {method.icon} {method.label}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {payMethod === 'stripe' ? (
                  <motion.div key="stripe" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                    {/* Contact */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 space-y-4">
                      <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Kontaktné údaje</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <PremiumInput label="Celé meno" value={billingForm.name}
                          onChange={v => setBillingForm(f => ({ ...f, name: v }))}
                          placeholder="Jana Kováčová" error={errors.name} />
                        <PremiumInput label="Email" value={billingForm.email} type="email"
                          onChange={v => setBillingForm(f => ({ ...f, email: v }))}
                          placeholder="jana@email.sk" error={errors.email} />
                      </div>
                    </div>

                    {/* Card details */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 space-y-4">
                      <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#FFB6D9]" /> Údaje karty
                      </h3>

                      <PremiumInput
                        label="Číslo karty"
                        value={card.number}
                        onChange={setCardField('number')}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        icon={<CreditCard className="w-4 h-4" />}
                        error={errors.number}
                      />

                      <PremiumInput
                        label="Meno na karte"
                        value={card.holder}
                        onChange={v => setCardField('holder')(v.toUpperCase())}
                        placeholder="JANA KOVÁČOVÁ"
                        error={errors.holder}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <PremiumInput
                          label="Platnosť do"
                          value={card.expiry}
                          onChange={setCardField('expiry')}
                          placeholder="MM/YY"
                          maxLength={5}
                          error={errors.expiry}
                        />
                        <PremiumInput
                          label="CVV"
                          value={card.cvv}
                          onChange={setCardField('cvv')}
                          onFocus={() => setIsFlipped(true)}
                          onBlur={() => setIsFlipped(false)}
                          placeholder="•••"
                          maxLength={4}
                          type="password"
                          error={errors.cvv}
                        />
                      </div>
                    </div>

                    {/* Billing */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 space-y-4">
                      <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Fakturačná adresa</h3>
                      <PremiumInput label="Ulica" value={billingForm.street}
                        onChange={v => setBillingForm(f => ({ ...f, street: v }))} placeholder="Hlavná 1" />
                      <div className="grid grid-cols-2 gap-4">
                        <PremiumInput label="PSČ" value={billingForm.zip}
                          onChange={v => setBillingForm(f => ({ ...f, zip: v }))} placeholder="01001" />
                        <PremiumInput label="Mesto" value={billingForm.city}
                          onChange={v => setBillingForm(f => ({ ...f, city: v }))} placeholder="Bratislava" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="paypal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-[#003087]/20 rounded-full flex items-center justify-center mx-auto">
                      <Wallet className="w-10 h-10 text-[#0070ba]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">Platiť cez PayPal</p>
                      <p className="text-gray-400 text-sm mt-1">Budete presmerovaní na PayPal pre dokončenie platby</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <p className="text-[#FFB6D9] font-bold text-2xl">{formatPrice(total + shipping)}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={checkoutState !== 'idle'}
                whileHover={{ scale: checkoutState === 'idle' ? 1.02 : 1 }}
                whileTap={{ scale: checkoutState === 'idle' ? 0.98 : 1 }}
                className="relative w-full py-5 rounded-2xl font-bold text-lg text-white overflow-hidden disabled:cursor-not-allowed group"
                style={{
                  background: checkoutState === 'success'
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : checkoutState === 'error'
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #C2185B, #880E4F)',
                }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                />

                {/* Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                  style={{ boxShadow: '0 0 30px rgba(194,24,91,0.5)' }} />

                <span className="relative flex items-center justify-center gap-3">
                  {checkoutState === 'idle' && (
                    <>
                      <Lock className="w-5 h-5" />
                      Zaplatiť bezpečne {formatPrice(total + shipping)}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                  {checkoutState === 'processing' && (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Spracovávam...
                    </>
                  )}
                  {checkoutState === 'success' && <><Check className="w-5 h-5" /> Platba úspešná!</>}
                  {checkoutState === 'error' && <><X className="w-5 h-5" /> Platba zlyhala</>}
                </span>
              </motion.button>

              {/* Security badges */}
              <div className="flex items-center justify-center gap-6 text-gray-600 text-xs">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-bit SSL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>PCI DSS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>3D Secure</span>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
