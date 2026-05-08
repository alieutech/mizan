# Mizan · ميزان

**Find the Quran verse that speaks to your moment.**

Mizan is an AI-powered Quran companion that takes a situation, feeling, or question in plain language and surfaces the most semantically relevant verses — complete with Arabic text, translation, a personal connection explanation, Ibn Kathir tafsir, and audio recitation.

Built for the **Quran Foundation Hackathon 2026**.

---

## Features

- **AI Verse Matching** — Describe what you're going through; Claude finds 4–5 verses that speak directly to your situation
- **Verified Quran Data** — Arabic (Uthmani script), Sahih International translation, and tafsir sourced from the Quran Foundation API
- **Audio Recitation** — Listen to each verse recited by Mishary Rashid Alafasy
- **Copy Verse** — One tap copies Arabic + translation + reference to clipboard
- **Save Collection** — Bookmark verses to a personal collection stored in localStorage
- **Graceful Fallbacks** — Works without API keys for testing; falls back to public Quran.com API and hardcoded verses
- **Mobile-First** — Responsive layout with safe-area support, iOS zoom prevention, and 44px touch targets

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Quran Data | Quran Foundation API v4 + api.quran.com fallback |
| Styling | Tailwind CSS + Radix UI |
| Fonts | Amiri (Arabic), Playfair Display, Inter |
| Deployment | Vercel |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Then fill in `.env.local`:

```env
# Required for AI verse matching
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional — falls back to public api.quran.com without these
QF_CLIENT_ID=your_quran_foundation_client_id
QF_CLIENT_SECRET=your_quran_foundation_client_secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)
- **Quran Foundation credentials** — request access at quran.foundation/developers

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Reference

### `POST /api/verses`
Match Quran verses to a situation using Claude AI.

**Request**
```json
{ "situation": "I'm going through a difficult time and feeling lost" }
```

**Response**
```json
{
  "situation_summary": "seeking light in darkness",
  "verses": [
    {
      "verse_key": "94:5",
      "surah_name": "Ash-Sharh",
      "arabic": "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
      "translation": "For indeed, with hardship will be ease.",
      "relevance": 5,
      "connection": "...",
      "tafsir": "..."
    }
  ]
}
```

| Constraint | Value |
|---|---|
| Max situation length | 600 characters |
| Verses returned | 4–5 |
| Tafsir source | Ibn Kathir (ID 169) |
| Translation | Sahih International (ID 131) |

### `GET /api/verse?key=2:286&tafsir=true`
Fetch a single verse with optional tafsir.

### `GET /api/chapters`
List all 114 Quran chapters.

### `GET /api/search?q=query`
Keyword search across verses.

---

## Deployment

### Deploy to Vercel

```bash
npm run build   # verify build passes locally first
```

Then push to GitHub and import the repo in Vercel. Add environment variables under **Settings → Environment Variables**:

| Variable | Required |
|---|---|
| `ANTHROPIC_API_KEY` | Yes (for AI matching) |
| `QF_CLIENT_ID` | No (uses public API fallback) |
| `QF_CLIENT_SECRET` | No (uses public API fallback) |

The app is fully functional without any keys — the fallback experience uses hardcoded verses enriched with live data from the public Quran.com API.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chapters/route.ts   # List all chapters
│   │   ├── search/route.ts     # Keyword search
│   │   ├── verse/route.ts      # Single verse + tafsir
│   │   └── verses/route.ts     # AI verse matching (core)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Main UI
└── lib/
    ├── prompts.ts              # Claude system prompt
    ├── quranApi.ts             # Quran Foundation API client
    ├── types.ts                # TypeScript interfaces
    └── utils.ts                # cn(), getVerseAudioUrl()
```

---

## License

MIT
