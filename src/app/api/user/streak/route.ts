import { NextRequest, NextResponse } from 'next/server'

// Update this if QF provides a different URL after OAuth approval
const STREAK_URL =
  process.env.QF_STREAK_URL ??
  'https://apis.quran.foundation/reading-goal/api/v4/reading-goal'

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
  if (!token) return NextResponse.json({ streak: null })

  try {
    const res = await fetch(STREAK_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
    if (!res.ok) return NextResponse.json({ streak: null })
    const data = await res.json()
    // Normalise — QF may return { current_streak, is_active } or nested shape
    const streak = {
      count: data.current_streak ?? data.streak_count ?? data.streak ?? 0,
      active: data.is_streak_active ?? data.is_active ?? true,
    }
    return NextResponse.json({ streak })
  } catch {
    return NextResponse.json({ streak: null })
  }
}
