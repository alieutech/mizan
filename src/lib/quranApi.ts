/**
 * Quran Foundation API Service
 * Handles OAuth2 client credentials flow + content API calls
 * Docs: https://api-docs.quran.foundation
 */

const QF_AUTH_URL =
  process.env.QF_AUTH_URL ?? "https://oauth2.quran.foundation/oauth2/token"
const QF_API_URL =
  process.env.QF_API_URL ?? "https://apis.quran.foundation/content/api/v4"

// Public fallback (no auth needed) - api.quran.com
const PUBLIC_API_URL = "https://api.quran.com/api/v4"

let cachedToken: { token: string; expiresAt: number } | null = null

// ── OAuth2 Token ──
async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.QF_CLIENT_ID
  const clientSecret = process.env.QF_CLIENT_SECRET

  if (!clientId || !clientSecret) return null

  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token
  }

  try {
    const res = await fetch(QF_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials&scope=content",
    })

    if (!res.ok) throw new Error(`Auth failed: ${res.status}`)

    const data = await res.json()
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    }
    return cachedToken.token
  } catch (err) {
    console.error("QF OAuth2 error:", err)
    return null
  }
}

// ── Authenticated QF API request ──
async function qfFetch(path: string) {
  const token = await getAccessToken()
  const clientId = process.env.QF_CLIENT_ID

  if (!token || !clientId) {
    // Fall back to public API
    return publicApiFetch(path)
  }

  const res = await fetch(`${QF_API_URL}${path}`, {
    headers: {
      "x-auth-token": token,
      "x-client-id": clientId,
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  // 401 — stale token, clear and retry once with a fresh one
  if (res.status === 401) {
    cachedToken = null
    return qfFetch(path)
  }

  // 403 — token rejected by this API endpoint (e.g. prelive/prod mismatch)
  // Fall back to public API rather than throwing
  if (res.status === 403) {
    return publicApiFetch(path)
  }

  if (!res.ok) throw new Error(`QF API error: ${res.status}`)
  return res.json()
}

// ── Public API fallback (no credentials needed) ──
async function publicApiFetch(path: string) {
  const res = await fetch(`${PUBLIC_API_URL}${path}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`Public API error: ${res.status}`)
  return res.json()
}

// ── Public API methods ──

export async function getChapters(language = "en") {
  try {
    const data = await qfFetch(`/chapters?language=${language}`)
    return data.chapters || []
  } catch {
    return []
  }
}

export async function getChapter(id: number, language = "en") {
  try {
    const data = await qfFetch(`/chapters/${id}?language=${language}`)
    return data.chapter || null
  } catch {
    return null
  }
}

export async function getVersesByChapter(
  chapterId: number,
  options: { page?: number; perPage?: number; translationId?: number } = {}
) {
  const { page = 1, perPage = 50, translationId = 131 } = options
  try {
    const data = await qfFetch(
      `/verses/by_chapter/${chapterId}?language=en&words=false&translations=${translationId}&fields=text_uthmani&page=${page}&per_page=${perPage}`
    )
    return data.verses || []
  } catch {
    return []
  }
}

export async function getVerseByKey(
  verseKey: string,
  translationId = 131
) {
  try {
    // audio=7 requests Mishary Alafasy recitation URL from QF API
    const data = await qfFetch(
      `/verses/by_key/${verseKey}?language=en&words=false&translations=${translationId}&fields=text_uthmani&audio=7`
    )
    return data.verse || null
  } catch {
    return null
  }
}

export async function getTranslations(language = "en") {
  try {
    const data = await qfFetch(`/resources/translations?language=${language}`)
    return data.translations || []
  } catch {
    return []
  }
}

export async function getTafsirByVerseKey(
  verseKey: string,
  tafsirId = 169 // Ibn Kathir
) {
  try {
    const data = await qfFetch(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`)
    return data.tafsir || null
  } catch {
    return null
  }
}

export async function getAudioRecitations() {
  try {
    const data = await qfFetch("/resources/recitations")
    return data.recitations || []
  } catch {
    return []
  }
}

export async function getAudioByChapter(
  recitationId: number,
  chapterId: number
) {
  try {
    const data = await qfFetch(
      `/recitations/${recitationId}/by_chapter/${chapterId}`
    )
    return data.audio_files || []
  } catch {
    return []
  }
}

export async function searchVerses(query: string, size = 10) {
  try {
    const data = await publicApiFetch(
      `/search?q=${encodeURIComponent(query)}&size=${size}&language=en`
    )
    return data.search?.results || []
  } catch {
    return []
  }
}
