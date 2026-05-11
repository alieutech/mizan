import { NextRequest, NextResponse } from 'next/server'

// Update this if QF provides a different URL after OAuth approval
const BOOKMARKS_URL =
  process.env.QF_BOOKMARKS_URL ??
  'https://apis.quran.foundation/bookmark/api/v4/bookmarks'

function getSessionToken(req: NextRequest): string | null {
  const cookie = req.cookies.get('qf_session')?.value
  if (!cookie) return null
  try {
    const session = JSON.parse(Buffer.from(cookie, 'base64').toString())
    return session.access_token ?? null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const token = getSessionToken(req)
  if (!token) return NextResponse.json({ bookmarks: [] })

  try {
    const res = await fetch(BOOKMARKS_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
    if (!res.ok) return NextResponse.json({ bookmarks: [] })
    const data = await res.json()
    // QF may return { bookmarks: [...] } or an array directly
    const raw = Array.isArray(data) ? data : (data.bookmarks ?? data.data ?? [])
    // Normalise to { verse_key, page, chapter_id }
    const bookmarks = raw.map((b: any) => ({
      verse_key: b.verse_key ?? (b.chapter_id && b.verse_number ? `${b.chapter_id}:${b.verse_number}` : null),
      page: b.page ?? null,
      chapter_id: b.chapter_id ?? null,
    })).filter((b: any) => b.verse_key)
    return NextResponse.json({ bookmarks })
  } catch {
    return NextResponse.json({ bookmarks: [] })
  }
}
