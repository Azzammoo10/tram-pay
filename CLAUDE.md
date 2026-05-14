
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project: Tram-Pay

Build a demo web app for a digital ticketing system for Tramway Rabat-Salé.

Main flow:

- User creates account
- User verifies email
- User logs in
- User receives a QR transport ticket after a simulated payment
- Later, the simulated flow will be linked to backend API, then to Raspberry Pi / NFC reader

## Mandatory stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS v4
- Supabase: Auth + PostgreSQL + Realtime
- qrcode.react
- lucide-react
- react-hook-form + zod
- framer-motion
- date-fns

## Critical framework rules

- Use `src/app/` App Router only
- Do not use Pages Router
- Check current Next.js 16 conventions before coding
- If request interception is needed, use `src/middleware.ts` with a valid exported `middleware` function
- Respect current Supabase SSR patterns
- Do not assume older Next.js 13/14 behavior

## Project structure

- `src/app/page.tsx` → redirect to `/login`
- `src/app/auth/callback/route.ts` → Supabase email callback
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/verify/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/api/tap/route.ts`
- `src/app/api/verify-qr/route.ts`
- `src/app/api/simulate-tap/route.ts`

## Supabase scope

Database tables already planned:

- `profiles`
- `cards`
- `tickets`

Use:

- browser client
- server client
- admin/service-role client only in server code

## Design system — Tramway Rabat-Salé

### Colors

- Brand dark: `#1A0E03`
- Brand purple: `#55356D`
- Primary CTA: `#EA3D8F`
- CTA hover: `#D63378`
- CTA active: `#C11C60`
- Primary text: `#2D2D2D`
- Muted text: `#8A8A8A`
- Faint text: `#706F6F`
- Background: `#FFFFFF`
- Section background: `#F8F8F8`
- Border: `#E1E8ED`
- Error: `#CF2E2E`
- Warning: `#F5AB32`
- Success: `#437A22`

### Typography

- Arial, Helvetica, sans-serif only
- No Google Fonts
- H1: 28px / 700
- H2: 20px / 700
- H3: 18px / 400
- Body: 14px / 400 / line-height 1.4
- Small text: 12px / 400
- CTA text: 15px / 400

### UI rules

- Primary button: magenta `#EA3D8F`, white text, height 45px, radius 3px
- Inputs: border `#E1E8ED`, radius 3px, focus ring magenta
- Cards: white bg, subtle border, subtle shadow
- Badges: primary/warning/error variants
- Use only the defined palette
- No border-radius larger than 3px for standard components
- No random colors
- No Geist font
- No external visual style outside the Tramway theme

## Dashboard behavior

State 1:

- waiting for payment
- show calm placeholder state
- button: simulate payment

State 2:

- QR ticket received
- show QR code
- show validity badge
- show countdown timer

State 3:

- QR expired
- greyed QR state
- expired badge
- CTA to generate another simulated trip

## API behavior

### `POST /api/tap`

Input:

- token
- amount
- machine_id

Behavior:

- validate machine secret
- find card
- create ticket
- generate signed QR payload
- insert ticket
- return success payload

### `POST /api/verify-qr`

Behavior:

- verify HMAC
- verify expiry
- verify single use
- return valid / invalid / expired / already_used

### `GET /api/simulate-tap`

Demo only:

- create a fake paid ticket for current user
- trigger realtime dashboard update

## Coding rules

- Prefer small reusable components
- Strong typing everywhere
- No `any`
- Good loading, error, empty states
- Mobile first
- Clean folder structure
- No dead code
- No fake placeholders left in final code
- Explain important implementation decisions in comments only when useful

## Forbidden

- No Pages Router
- No old Supabase auth helpers
- No Google Fonts
- No localStorage-based auth
- No colors outside the design system
- No Tailwind v3 config assumptions
- No coding before checking actual Next.js 16 behavior when uncertain
