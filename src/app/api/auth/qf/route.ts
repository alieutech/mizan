import { NextResponse } from 'next/server'

const QF_AUTH_ENDPOINT =
  process.env.QF_OAUTH_AUTH_URL ?? 'https://prelive-oauth2.quran.foundation/oauth2/auth'

export async function GET() {
  const clientId = process.env.QF_OAUTH_CLIENT_ID
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()

  if (!clientId) {
    return NextResponse.json({ error: 'OAuth not configured' }, { status: 503 })
  }

  const state = crypto.randomUUID()
  const redirectUri = `${appUrl}/api/auth/qf/callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid offline_access',
    state,
  })

  const response = NextResponse.redirect(`${QF_AUTH_ENDPOINT}?${params}`)
  response.cookies.set('qf_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300,
    path: '/',
  })

  return response
}
