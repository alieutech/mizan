# Mizan — Hackathon Submission Materials

Deadline: **May 20, 2026** · Form: tally.so · Live: https://mizan-psi.vercel.app · Repo: https://github.com/alieutech/mizan

---

## Project Title

Mizan — AI Quran Verse Matcher

## Team

Alieu Saidy (solo)

---

## Short Description

Mizan (ميزان) is an AI-powered Quran companion that finds the verse written for your moment. Describe a struggle, a feeling, or a question — Mizan uses Claude AI to surface semantically relevant Quran verses with authentic Arabic text, translation, tafsir, and audio recitation. Free, open source, installable as a PWA, and available in English and Arabic.

---

## Detailed Description

The Quran speaks to every human condition — grief, gratitude, doubt, hope, fear, and love. But finding the right verse in the right moment has always required years of study or a scholar nearby. Mizan bridges that gap using AI.

**How it works:**
A user types what they're carrying — a heartbreak, a decision they can't make, a feeling they can't name. Mizan sends that text to Anthropic's Claude AI, which identifies the most semantically and emotionally relevant Quran verses. Each result is then enriched in real time with verified data from the Quran Foundation API: authentic Uthmani Arabic text, an English translation, Ibn Kathir tafsir, and Mishary Alafasy audio recitation. The AI also writes a personalised explanation of why that specific verse speaks to the user's situation.

**Features:**
- AI verse matching — describe any situation and receive 3–5 relevant verses with personalised connection explanations
- Guided onboarding — first-time visitors are welcomed with example prompts to get started instantly
- Verse of the Day — rotates daily from a curated selection, enriched with QF API data
- Browse all 114 Surahs — full chapter grid with verse-by-verse reading and audio
- Quran search — keyword search across all verses via the QF Search API
- Save collection — bookmark verses to a personal offline collection (localStorage)
- Audio recitation — per-verse Alafasy playback via QF API with CDN fallback
- Tafsir — collapsible Ibn Kathir commentary on every verse
- Arabic UI — full RTL layout with Arabic translations of all labels, one tap to switch
- Sign in with Quran.com — full OAuth 2.0 + PKCE integration to sync user bookmarks and reading streak
- PWA — installable on iPhone and Android home screens with offline support
- Fully responsive — designed mobile-first with safe-area insets and iOS zoom prevention

**Why it's different:**
Most Quran apps are reference tools — you know what you're looking for. Mizan is for the moments when you don't. The AI understands natural language, emotion, and context, not just keywords. It meets people where they are and lets the Quran speak to them directly. With Arabic UI support and a PWA that works offline, it's built for Muslims everywhere.

**Tech stack:** Next.js 14, TypeScript, Tailwind CSS, Anthropic Claude API, Quran Foundation API v4 (OAuth2 PKCE + Content + Search + User APIs), Vercel

---

## API Usage Explanation

Mizan integrates the Quran Foundation API at every layer of the experience:

**Authentication — Content API**
Server-side OAuth2 client credentials flow obtains a bearer token from `https://oauth2.quran.foundation/oauth2/token`. Tokens are cached in memory with a 60-second expiry buffer and refreshed automatically. A fallback to the public `api.quran.com` endpoint ensures the app works even during auth disruptions.

**Authentication — User OAuth (live)**
A full OAuth 2.0 Authorization Code flow with PKCE is implemented using the QF pre-live OAuth server (`prelive-oauth2.quran.foundation`). The implementation includes:
- PKCE `code_verifier` / `code_challenge` (SHA-256, base64url) with HMAC-signed state for CSRF protection
- Scopes: `openid offline_access user collection`
- httpOnly session cookie storing access token, refresh token, and OpenID userinfo
- Routes: `/api/auth/qf` (initiate), `/api/auth/qf/callback` (token exchange), `/api/auth/me`, `/api/auth/logout`

**Content APIs used:**
- `GET /verses/by_key/{key}` — fetches Uthmani Arabic text, English translation (Saheeh International, ID 131), and Alafasy audio URL (`audio=7`) for each AI-matched verse
- `GET /tafsirs/169/by_ayah/{key}` — fetches Ibn Kathir tafsir per verse
- `GET /verses/by_chapter/{id}` — powers the full chapter reading view with all verses
- `GET /chapters` — loads the 114-surah grid
- `GET /chapters/{id}` — fetches chapter metadata
- `GET /recitations/{id}/by_chapter/{id}` — loads the full chapter audio map for sequential recitation

**Search API:**
- `GET /search?q={query}` — keyword search across all Quran verses, displayed in the Search view

**User APIs:**
After OAuth sign-in, the Saved view fetches the user's bookmarks and reading streak from the QF pre-live API using `x-auth-token` and `x-client-id` headers, displaying them alongside locally saved verses. The streak is shown as a live 🔥 badge.

**Graceful degradation:**
Every QF API call falls back to the public `api.quran.com` endpoint if the authenticated endpoint returns an error, ensuring the app is always functional.

---

## Demo Video Script (2–3 minutes)

**0:00–0:20 — Hook**
Open the app on mobile (from home screen as PWA). The onboarding modal appears. Say: "The Quran has a verse for every human moment. Mizan helps you find it."

**0:20–0:50 — Core feature**
Click the prompt "I'm feeling overwhelmed and don't know where to turn" from the onboarding modal. Hit Find My Verses. Show results loading, then walk through one verse — Arabic text, translation, the AI connection explanation, tafsir.

**0:50–1:10 — Audio + save**
Play the audio recitation. Bookmark the verse. Switch to Saved view — show it persisted.

**1:10–1:30 — Sign in with Quran.com**
Click Sign in, go through the QF OAuth flow. Show the user avatar appear in the nav. Switch to Saved — show the account panel with the reading streak badge and bookmarks synced from Quran.com.

**1:30–1:50 — Browse + Search + Arabic UI**
Switch to Surahs, open Al-Baqarah, scroll through verses with audio. Switch to Search, type "patience", show results. Then tap **عر** in the nav — the entire UI flips to Arabic RTL instantly.

**1:50–2:10 — PWA**
Show the app installed on the home screen. Open it — full screen, no browser bar. Turn on airplane mode — app still loads (offline support).

**2:10–2:30 — Close**
Return to home. Say: "Mizan is open source, free, works offline, supports Arabic, and is built entirely on the Quran Foundation API. The Quran has a verse for what you're carrying — Mizan finds it."

---

## Checklist Before Submitting

- [ ] ANTHROPIC_API_KEY set in Vercel environment variables
- [x] QF OAuth implemented (PKCE, live on pre-live environment)
- [ ] Demo video recorded and uploaded
- [ ] Tally.so form filled and submitted before May 20
- [ ] Delete `src/app/api/debug/route.ts` before submission
- [ ] Confirm QF_BOOKMARKS_URL and QF_STREAK_URL work with pre-live user API
