import { NextResponse } from 'next/server'

const QF_AUTH_ENDPOINT =
  process.env.QF_OAUTH_AUTH_URL ?? 'https://prelive-oauth2.quran.foundation/oauth2/auth'

function base64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf
  return Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifierBytes = crypto.getRandomValues(new Uint8Array(32))
  const verifier = base64url(verifierBytes)
  const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  const challenge = base64url(hashBuf)
  return { verifier, challenge }
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return base64url(sig)
}

export async function GET() {
  const clientId = process.env.QF_OAUTH_CLIENT_ID
  const secret = process.env.QF_OAUTH_CLIENT_SECRET ?? 'fallback-secret'
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()

  if (!clientId) {
    return NextResponse.json({ error: 'OAuth not configured' }, { status: 503 })
  }

  const nonce = crypto.randomUUID()
  const redirectUri = `${appUrl}/api/auth/qf/callback`
  const { verifier, challenge } = await generatePKCE()

  // Encode state + verifier as a signed payload — no cookies needed
  const payload = Buffer.from(JSON.stringify({ n: nonce, v: verifier })).toString('base64url')
  const sig = await hmacSign(payload, secret)
  const state = `${payload}.${sig}`

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

  const response = NextResponse.json(
    { url: `${QF_AUTH_ENDPOINT}?${params}` },
    { headers: { 'Cache-Control': 'no-store' } },
  )
  return response
}
