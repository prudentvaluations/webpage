# Prudent Valuations — Next.js Website

The Prudent Valuations marketing site, built with **Next.js 14 (App Router)** and React.
Clean, minimal, fast, and mobile-responsive — professional valuation services for property, gold,
vehicles, and movable & immovable assets.

No backend, no database. Contact is **email-only** via `mailto:prudentvaluations@gmail.com`.

## Stack

- **Next.js 14** (App Router, React Server Components)
- `next/font` — self-hosted Inter + Fraunces (no external font requests at runtime)
- `next/image` — optimized logo
- Next **Metadata API** — SEO title/description, Open Graph, Twitter card, favicon
- Plain CSS (`app/globals.css`) with brand colors sampled from the logo

## Structure

```
prudent-valuations-next/
├── app/
│   ├── layout.js        # <html>, fonts, metadata, favicon, skip-link
│   ├── page.js          # composes the sections
│   └── globals.css      # all styles
├── components/
│   ├── Header.js        # "use client" — sticky nav + mobile toggle
│   ├── Hero.js
│   ├── Services.js      # 6 service cards
│   ├── About.js
│   ├── Process.js       # 4-step process
│   ├── Contact.js       # mailto CTA
│   └── Footer.js        # auto current year
├── public/assets/       # logo.png, favicon.png, apple-touch-icon.png, og-image.png, letterhead.pdf
├── next.config.mjs
├── jsconfig.json        # "@/*" path alias
└── package.json
```

## 1. Local setup

Requires [Node.js](https://nodejs.org/) 18.18+.

```bash
cd prudent-valuations-next
npm install
```

## 2. Local preview (development)

```bash
npm run dev
```

Open **http://localhost:3000**.

## 3. Build

```bash
npm run build
```

## 4. Run the production build locally

```bash
npm run start
```

## 5. GitHub upload

```bash
git init
git add .
git commit -m "Prudent Valuations — Next.js site"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## 6. Vercel deployment

1. [vercel.com](https://vercel.com) → **Add New… → Project** → import the GitHub repo.
2. If the repo root is the parent folder, set **Root Directory** to `prudent-valuations-next`.
3. Vercel auto-detects **Next.js** — no build settings needed (Build: `next build`).
4. **Deploy.** Pushes to `main` redeploy automatically.

## Updating content

- Section copy lives in the matching file under `components/`.
- Service cards: edit the `SERVICES` array in `components/Services.js`.
- Process steps: edit the `STEPS` array in `components/Process.js`.
- Swap the logo by replacing `public/assets/logo.png` (re-export `favicon.png` if the mark changes).
- The only contact address anywhere on the site is **prudentvaluations@gmail.com**.
