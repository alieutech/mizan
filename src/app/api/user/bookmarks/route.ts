import { NextRequest, NextResponse } from 'next/server'

const BOOKMARKS_URL =
  process.env.QF_BOOKMARKS_URL ??
  'https://apis-prelive.quran.foundation/bookmark/api/v4/bookmarks'

function getSession(req: NextRequest): { access_token: string } | null {
  const cookie = req.cookies.get('qf_session')?.value
  if (!cookie) return null
  try {
    return JSON.parse(Buffer.from(cookie, 'base64').toString())
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const session = getSession(req)
  if (!session?.access_token) return NextResponse.json({ bookmarks: [] })

  const clientId = process.env.QF_OAUTH_CLIENT_ID ?? ''

  try {
    const res = await fetch(BOOKMARKS_URL, {
      headers: {
        'x-auth-token': session.access_token,
        'x-client-id': clientId,
        Accept: 'application/json',
      },
    })
    if (!res.ok) return NextResponse.json({ bookmarks: [] })
    const data = await res.json()
    const raw = Array.isArray(data) ? data : (data.bookmarks ?? data.data ?? [])
    const bookmarks = raw
      .map((b: any) => ({
        verse_key:
          b.verse_key ??
          (b.chapter_id && b.verse_number ? `${b.chapter_id}:${b.verse_number}` : null),
        page: b.page ?? null,
        chapter_id: b.chapter_id ?? null,
      }))
      .filter((b: any) => b.verse_key)
    return NextResponse.json({ bookmarks })
  } catch {
    return NextResponse.json({ bookmarks: [] })
  }
}
