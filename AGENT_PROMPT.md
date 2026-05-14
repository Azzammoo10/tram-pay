# 🚋 Tram Pay — Agent Prompt (Vibe Coding)

## Contexte du projet

Tu codes une **Web App Next.js 14** pour le projet de billettique numérique du Tramway Rabat-Salé.
C'est une démo : le voyageur crée son compte, vérifie son email, et voit son QR Code de transport s'afficher automatiquement après un paiement simulé.
Backend : Supabase (Auth + PostgreSQL + Realtime). Déploiement : Vercel.

---

## Stack technique OBLIGATOIRE

- **Framework :** Next.js 14 (App Router)
- **Auth + DB + Realtime :** Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Styles :** Tailwind CSS v3
- **QR Code :** `qrcode.react`
- **Icons :** `lucide-react`
- **Formulaires :** `react-hook-form` + `zod`
- **Animations :** `framer-motion`
- **Typo :** Arial, sans-serif (système, pas de Google Fonts)

---

## Design System — Tramway Rabat-Salé

### Couleurs (UTILISE UNIQUEMENT CES VALEURS)

```css
/* Primaires */
--color-brand-dark:    #1A0E03;   /* fond sombre, texte titre */
--color-brand-purple:  #55356D;   /* accent secondaire */

/* CTA */
--color-cta:           #EA3D8F;   /* bouton principal — TOUJOURS cette couleur */
--color-cta-hover:     #D63378;   /* hover bouton */
--color-cta-active:    #C11C60;   /* active bouton */

/* Textes */
--color-text-primary:  #2D2D2D;   /* corps de texte */
--color-text-muted:    #8A8A8A;   /* placeholder, désactivé */
--color-text-faint:    #706F6F;   /* tertiaire */

/* Surfaces */
--color-bg:            #FFFFFF;
--color-bg-section:    #F8F8F8;
--color-bg-cloud:      #F5F4F4;
--color-border:        #E1E8ED;

/* Sémantique */
--color-error:         #CF2E2E;
--color-warning:       #F5AB32;
--color-success:       #437A22;
```

### Typographie

```
Font unique : Arial, Helvetica, sans-serif
- Display (H1) : 28px, weight 700, line-height 1.2
- H2            : 20px, weight 700, line-height 1.0
- H3            : 18px, weight 400, line-height 1.0
- Body          : 14px, weight 400, line-height 1.4
- Body small    : 12px, weight 400, line-height 1.4
- Bouton CTA    : 15px, weight 400
```

### Composants clés

**Bouton Primary (TOUJOURS comme ça) :**

```
bg: #EA3D8F | text: white | height: 45px | width: 100%
border-radius: 3px | font-size: 15px | padding: 13px 0px
hover: #D63378 | active: #C11C60
focus: outline 3px solid rgba(234,61,143,0.3)
```

**Input Text :**

```
border: 1px solid #E1E8ED | border-radius: 3px
padding: 12px 16px | font-size: 14px | text: #2D2D2D
focus: border 2px #EA3D8F + box-shadow 0 0 0 3px rgba(234,61,143,0.1)
error: border #CF2E2E
```

**Card :**

```
bg: white | border: 1px solid #E1E8ED | border-radius: 3px
padding: 24px | shadow: 0 2px 4px rgba(0,0,0,0.08)
hover-shadow: 0 4px 12px rgba(0,0,0,0.12)
```

**Card avec accent :**

```
border-top: 4px solid #EA3D8F + les specs card de base
```

**Badge :**

```
Primary : bg #EA3D8F, text white, 12px bold, padding 4px 12px, radius 12px
Warning : bg #F5AB32
Error   : bg #CF2E2E
```

---

## Structure des pages à coder

```
app/
├── (auth)/
│   ├── login/page.tsx          ← formulaire email + password
│   ├── register/page.tsx       ← formulaire register + email sent
│   └── verify/page.tsx         ← page "vérifiez votre email"
├── (dashboard)/
│   ├── layout.tsx              ← sidebar + header
│   └── dashboard/page.tsx      ← QR Code + statut + historique
├── layout.tsx                  ← root layout
└── page.tsx                    ← redirect vers /login
```

---

## Base de données Supabase — Tables

```sql
-- Exécuter dans Supabase SQL Editor

CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  phone      TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE cards (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_token TEXT UNIQUE NOT NULL,
  label      TEXT DEFAULT 'Ma carte MIFARE',
  status     TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE tickets (
  id             SERIAL PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id),
  card_id        INTEGER REFERENCES cards(id),
  transaction_id TEXT UNIQUE NOT NULL,
  qr_payload     TEXT NOT NULL,
  amount         NUMERIC DEFAULT 7.00,
  status         TEXT DEFAULT 'PENDING',
  generated_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at     TIMESTAMP WITH TIME ZONE,
  used_at        TIMESTAMP WITH TIME ZONE
);

-- Activer Realtime sur tickets
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own profile"  ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users see own cards"    ON cards    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own tickets"  ON tickets  FOR ALL USING (auth.uid() = user_id);
```

---

## Variables d'environnement (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
HMAC_SECRET=your_hmac_secret_key_here
RPi_MACHINE_SECRET=your_rpi_machine_secret_here
```

---

## Routes API à créer

```
POST /api/tap
  → Body: { token: string, amount: number, machine_id: string }
  → Header: Authorization: Bearer RPi_MACHINE_SECRET
  → Action: cherche card par token → génère ticket → push Supabase Realtime
  → Return: { success, ticket_id, expires_at }

POST /api/verify-qr
  → Body: { qr_payload: string }
  → Action: vérifie HMAC + expiry + unicité → marque USED si valide
  → Return: { valid: bool, reason?: string }

GET /api/simulate-tap?user_id=xxx
  → DÉMO SEULEMENT : simule un tap carte pour tester sans RPi
```

---

## Page Dashboard — Comportement

**État 1 — En attente (aucun ticket actif) :**

```
- Icône tramway animée (pulse)
- Texte : "En attente de paiement..."
- Sous-texte : "Passez votre carte sur la borne du tramway"
- Bouton magenta : "Simuler un paiement" (mode démo)
```

**État 2 — QR Code reçu (ticket PENDING) :**

```
- QR Code affiché (taille 240x240px minimum)
- Badge vert : "Titre valide"
- Texte : "Valable 60 minutes"
- Timer dégressif affiché (ex: "58:43 restantes")
- Animation : QR apparaît avec fade-in + scale
```

**État 3 — QR expiré :**

```
- QR grisé avec overlay
- Badge rouge : "Titre expiré"
- Bouton : "Payer un nouveau trajet"
```

---

## Comportement temps réel (Supabase Realtime)

```typescript
// Dans dashboard/page.tsx
const channel = supabase
  .channel('tickets')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'tickets',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    setCurrentTicket(payload.new)  // QR s'affiche automatiquement
  })
  .subscribe()
```

---

## Règles de code

1. **TypeScript strict** — pas de `any`
2. **Composants Server / Client** — marquer `'use client'` uniquement si nécessaire
3. **Tailwind uniquement** — pas de CSS inline sauf pour les variables CSS
4. **Formulaires** — react-hook-form + validation zod
5. **Erreurs** — toujours afficher en rouge #CF2E2E sous le champ concerné
6. **Loading states** — spinner ou skeleton sur tous les fetch
7. **Mobile first** — tout doit fonctionner sur 375px

---

## Ce que tu NE dois PAS faire

- ❌ Pas de couleurs hors palette (pas de bleu, vert, orange random)
- ❌ Pas de Google Fonts (Arial uniquement)
- ❌ Pas de border-radius > 3px sur boutons/inputs/cards (sauf badges: 12px)
- ❌ Pas de localStorage (Supabase SSR gère la session)
- ❌ Pas de `pages/` router (App Router uniquement)
- ❌ Pas de CSS modules, pas de styled-components
