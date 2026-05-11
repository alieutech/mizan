import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('qf_session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ user: null })
  }

  try {
    const session = JSON.parse(Buffer.from(sessionCookie, 'base64').toString())
    return NextResponse.json({ user: session.user ?? null })
  } catch {
    return NextResponse.json({ user: null })
  }
}
