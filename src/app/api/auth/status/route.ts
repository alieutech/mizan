import { NextRequest, NextResponse } from 'next/server'

const QF_AUTH_ENDPOINT =
  process.env.QF_OAUTH_AUTH_URL ?? 'https://prelive-oauth2.quran.foundation/oauth2/auth'

export async function GET(_req: NextRequest) {
  const clientId = process.env.QF_OAUTH_CLIENT_ID
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()

  if (!clientId) {
    return NextResponse.json({ ready: false, reason: 'no_credentials' })
  }

  const redirectUri = `${appUrl}/api/auth/qf/callback`
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid',
    state: 'statuscheck',
  })

  try {
    const res = await fetch(`${QF_AUTH_ENDPOINT}?${params}`, { redirect: 'manual' })
    const location = res.headers.get('location') ?? ''
    const ready = !location.includes('oauth-error') && !location.includes('invalid_request')
    return NextResponse.json({ ready, redirect_uri: redirectUri })
  } catch {
    return NextResponse.json({ ready: false, reason: 'network_error' })
  }
}
