import { NextRequest, NextResponse } from 'next/server'

const QF_AUTH_ENDPOINT = 'https://oauth2.quran.foundation/oauth2/auth'

// Returns whether the QF OAuth redirect URI is registered and the flow can complete.
// We probe the auth endpoint with our redirect URI — if it redirects to oauth-error
// the URI isn't registered yet.
export async function GET(req: NextRequest) {
  const clientId = process.env.QF_CLIENT_ID
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
    state: 'probe',
  })

  try {
    const res = await fetch(`${QF_AUTH_ENDPOINT}?${params}`, {
      redirect: 'manual',
    })
    const location = res.headers.get('location') ?? ''
    const ready = !location.includes('oauth-error') && !location.includes('invalid_request')
    return NextResponse.json({ ready, redirect_uri: redirectUri })
  } catch {
    return NextResponse.json({ ready: false, reason: 'network_error' })
  }
}
