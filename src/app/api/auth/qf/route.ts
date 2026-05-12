import { NextResponse } from 'next/server'

const QF_AUTH_ENDPOINT =
  process.env.QF_OAUTH_AUTH_URL ?? 'https://prelive-oauth2.quran.foundation/oauth2/auth'

function base64url(buf: ArrayBuffer): string {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifierBytes = crypto.getRandomValues(new Uint8Array(32))
  const verifier = base64url(verifierBytes.buffer)
  const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  const challenge = base64url(hashBuf)
  return { verifier, challenge }
}

export async function GET() {
  const clientId = process.env.QF_OAUTH_CLIENT_ID
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()

  if (!clientId) {
    return NextResponse.json({ error: 'OAuth not configured' }, { status: 503 })
  }

  const state = crypto.randomUUID()
  const nonce = crypto.randomUUID()
  const redirectUri = `${appUrl}/api/auth/qf/callback`
  const { verifier, challenge } = await generatePKCE()

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid offline_access user collection',
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  const authUrl = `${QF_AUTH_ENDPOINT}?${params}`

  // Return an HTML page that sets cookies then navigates via JS.
  // Cookies on 307 redirect responses are unreliable in some browsers
  // (Safari ITP, cross-site navigation) — a 200 response guarantees storage.
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><script>window.location.replace(${JSON.stringify(authUrl)})</script></head><body></body></html>`

  const response = new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 300,
    path: '/',
  }

  response.cookies.set('qf_oauth_state', state, cookieOpts)
  response.cookies.set('qf_pkce_verifier', verifier, cookieOpts)

  return response
}
