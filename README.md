# Mizan · ميزان

**Find the Quran verse that speaks to your moment.**

Mizan is an AI-powered Quran companion that takes a situation, feeling, or question in plain language and surfaces the most semantically relevant verses — complete with Arabic text, translation, a personal connection explanation, Ibn Kathir tafsir, and audio recitation.

Built for the **Quran Foundation Hackathon 2026** · [Live demo](https://mizan-psi.vercel.app)

---

## Features

- **AI Verse Matching** — Describe what you're going through; Claude finds 4–5 verses that speak directly to your situation
- **Sign in with Quran.com** — OAuth 2.0 + PKCE integration to sync bookmarks and reading streak from your Quran.com account
- **Verse of the Day** — Daily verse enriched with QF API data, tafsir, and audio
- **Browse 114 Surahs** — Full chapter grid with verse-by-verse reading and audio
- **Quran Search** — Keyword search across all verses via the QF Search API
- **Save Collection** — Bookmark verses to a personal collection stored in localStorage
- **Audio Recitation** — Per-verse Alafasy playback via QF API
- **Tafsir** — Collapsible Ibn Kathir commentary on every verse
- **Arabic UI** — Full RTL layout with Arabic labels, one tap to switch
- **PWA** — Installable on iPhone and Android with offline support
- **Mobile-First** — Responsive layout with safe-area support and iOS zoom prevention

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Quran Data | Quran Foundation API v4 + api.quran.com fallback |
| Auth | QF OAuth 2.0 + PKCE (Authorization Code flow) |
| Styling | Tailwind CSS |
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

# Quran Foundation — content API
QF_CLIENT_ID=your_qf_client_id
QF_CLIENT_SECRET=your_qf_client_secret
QF_AUTH_URL=https://oauth2.quran.foundation/oauth2/token

# Quran Foundation — OAuth user login
QF_OAUTH_CLIENT_ID=your_qf_oauth_client_id
QF_OAUTH_CLIENT_SECRET=your_qf_oauth_client_secret
QF_OAUTH_AUTH_URL=https://prelive-oauth2.quran.foundation/oauth2/auth
QF_OAUTH_TOKEN_URL=https://prelive-oauth2.quran.foundation/oauth2/token

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)
- **Quran Foundation credentials** — [quran.foundation/developers](https://quran.foundation/developers)

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

### `GET /api/verse-of-day`
Returns the daily verse with Arabic text, translation, tafsir, and audio URL.

### `GET /api/chapters`
List all 114 Quran chapters.

### `GET /api/chapters/[id]`
Fetch all verses for a chapter with audio map.

### `GET /api/search?q=query`
Keyword search across verses.

### `GET /api/auth/qf`
Initiates QF OAuth flow (returns redirect URL + sets PKCE state).

### `GET /api/auth/qf/callback`
Handles OAuth callback, exchanges code for tokens, sets session cookie.

### `GET /api/auth/me`
Returns the signed-in user from session cookie.

### `GET /api/auth/logout`
Clears session cookie and redirects home.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── qf/route.ts          # OAuth initiation (PKCE)
│   │   │   ├── qf/callback/route.ts # Token exchange
│   │   │   ├── me/route.ts          # Session user
│   │   │   ├── logout/route.ts      # Sign out
│   │   │   └── status/route.ts      # OAuth readiness check
│   │   ├── user/
│   │   │   ├── bookmarks/route.ts   # QF user bookmarks
│   │   │   └── streak/route.ts      # QF reading streak
│   │   ├── chapters/route.ts        # All chapters
│   │   ├── chapters/[id]/route.ts   # Chapter verses
│   │   ├── search/route.ts          # Keyword search
│   │   ├── verse-of-day/route.ts    # Daily verse
│   │   └── verses/route.ts          # AI verse matching (core)
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                     # Main UI
├── components/
│   ├── LangToggle.tsx               # EN/AR toggle
│   └── ServiceWorkerRegistration.tsx
└── lib/
    ├── i18n.ts                      # EN + AR translations
    ├── prompts.ts                   # Claude system prompt
    ├── quranApi.ts                  # QF API client
    ├── types.ts                     # TypeScript interfaces
    └── utils.ts                     # Helpers
public/
├── manifest.json                    # PWA manifest
├── sw.js                            # Service worker
└── offline.html                     # Offline fallback
```

---

## License

MIT
