# 💎 Luna&Beeds – Custom E-shop

Moderný luxusný e-shop pre handmade šperky, postavený na Next.js 16, Supabase, Stripe a PayPal.

## Rýchly štart

```bash
git clone ...
cd luna-beeds
npm install
cp .env.example .env.local
# Vyplňte .env.local
npm run dev
```

## Nastavenie Supabase

1. Vytvorte projekt na supabase.com
2. SQL Editor → skopírujte `supabase/migrations/001_initial.sql` → Run

## Štruktúra

```
app/(shop)/          # Verejný e-shop
app/admin/           # Admin panel
app/auth/            # Prihlásenie
app/api/stripe/      # Stripe webhooks
components/          # UI, shop, admin, layout
lib/supabase/        # Supabase klienti
store/               # Zustand (cart, wishlist)
types/               # TypeScript typy
supabase/migrations/ # SQL migrácie
```

## Funkcie

- Custom Bracelet Builder (live náhľad, koráiky, písmená, prívesky)
- Admin panel s rolami (drag & drop hierarchia)
- Announcement bar (údržba nezatvárateľná)
- Stripe + PayPal platby
- Row Level Security na všetkých tabuľkách
- Framer Motion animácie
- Sitemap + robots.txt

## Deploy (Vercel)

1. Push na GitHub
2. Import na vercel.com
3. Pridajte Environment Variables
4. Deploy!

Stripe webhook: `https://your-domain.vercel.app/api/stripe/webhook`
