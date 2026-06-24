# Teleprompter & Reading Coach

An AI-powered interactive reading trainer. Choose a difficulty level, genre, and scroll speed — Claude generates a fresh passage, guides you through it paragraph by paragraph at your target WPM, then coaches you on your translation or summary.

## Features

- **3 difficulty levels**: Beginner (A1-A2), Intermediate (B1-B2), Advanced (C1-C2)
- **8 genres**: Random, News, Science, Fiction, Business, Travel, Health, Technology
- **Auto-scroll simulation**: paragraphs unlock after your target reading time elapses
- **Two tasks**: Translate to Thai or summarise in English
- **AI coaching**: score, positives, corrections with explanations, key vocabulary

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **CSS Modules** (dark theme)
- **Anthropic API** (claude-sonnet-4-6)

---

## Quick Start

```bash
# 1. Clone or unzip the project
cd teleprompter-reading-coach

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.local.example .env.local
# Edit .env.local and paste your key from https://console.anthropic.com

# 4. Run locally
npm run dev
# → http://localhost:3000
```

---

## Deploy to Vercel (recommended)

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. In **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your key from [console.anthropic.com](https://console.anthropic.com)
4. Click **Deploy**

That's it — Vercel auto-detects Next.js.

---

## Deploy to Netlify

1. Push this project to a GitHub repo
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. In **Site settings → Environment variables**, add:
   - `ANTHROPIC_API_KEY` = your key
5. Install the [Netlify Next.js plugin](https://docs.netlify.com/integrations/frameworks/next-js/overview/) if not auto-detected
6. Click **Deploy site**

---

## Project Structure

```
teleprompter-reading-coach/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   ← Generates the reading passage
│   │   └── review/route.ts     ← Reviews student's translation/summary
│   ├── globals.css             ← Dark theme CSS variables
│   ├── layout.tsx
│   └── page.tsx                ← Main app state machine
├── components/
│   ├── SetupPanel.tsx          ← Level / Genre / Speed selector
│   ├── ReadingPanel.tsx        ← Auto-scroll teleprompter
│   ├── TaskPanel.tsx           ← Translate or summarise input
│   └── ReviewPanel.tsx         ← AI coaching feedback
└── .env.local.example
```

## Customisation

- **Change the model**: Edit `model: 'claude-sonnet-4-6'` in both API routes
- **Add genres**: Add entries to the `GENRES` array in `SetupPanel.tsx`
- **Add target languages**: Extend the task options in `TaskPanel.tsx` and update the review prompt
- **Adjust passage length**: Edit the word count in the generate prompt in `app/api/generate/route.ts`
