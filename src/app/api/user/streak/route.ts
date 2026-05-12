import { NextRequest, NextResponse } from 'next/server'

const STREAK_URL =
  process.env.QF_STREAK_URL ??
  'https://apis-prelive.quran.foundation/reading-goal/api/v4/reading-goal'

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
  if (!session?.access_token) return NextResponse.json({ streak: null })

  const clientId = process.env.QF_OAUTH_CLIENT_ID ?? ''

  try {
    const res = await fetch(STREAK_URL, {
      headers: {
        'x-auth-token': session.access_token,
        'x-client-id': clientId,
        Accept: 'application/json',
      },
    })
    if (!res.ok) return NextResponse.json({ streak: null })
    const data = await res.json()
    const streak = {
      count: data.current_streak ?? data.streak_count ?? data.streak ?? 0,
      active: data.is_streak_active ?? data.is_active ?? true,
    }
    return NextResponse.json({ streak })
  } catch {
    return NextResponse.json({ streak: null })
  }
}
