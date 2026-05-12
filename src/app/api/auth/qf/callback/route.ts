import { NextRequest, NextResponse } from 'next/server'

const QF_TOKEN_URL =
  process.env.QF_OAUTH_TOKEN_URL ?? 'https://prelive-oauth2.quran.foundation/oauth2/token'
const QF_USERINFO_URL = 'https://prelive-oauth2.quran.foundation/userinfo'

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return Buffer.from(sig).toString('base64url')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function decodeState(state: string, secret: string): Promise<{ n: string; v: string } | null> {
  const dot = state.lastIndexOf('.')
  if (dot === -1) return null
  const payload = state.slice(0, dot)
  const sig = state.slice(dot + 1)
  const expectedSig = await hmacSign(payload, secret)
  if (sig !== expectedSig) return null
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()
  const secret = process.env.QF_OAUTH_CLIENT_SECRET ?? 'fallback-secret'

  if (error) {
    return NextResponse.redirect(`${appUrl}/?auth_error=${encodeURIComponent(error)}`)
  }

  if (!state || !code) {
    return NextResponse.redirect(`${appUrl}/?auth_error=missing_params`)
  }

  const stateData = await decodeState(state, secret)
  if (!stateData) {
    return NextResponse.redirect(`${appUrl}/?auth_error=invalid_state`)
  }

  const codeVerifier = stateData.v

  const clientId = process.env.QF_OAUTH_CLIENT_ID!
  const clientSecret = process.env.QF_OAUTH_CLIENT_SECRET!
  const redirectUri = `${appUrl}/api/auth/qf/callback`

  try {
    const tokenRes = await fetch(QF_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }).toString(),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Token exchange failed:', tokenRes.status, errText)
      throw new Error(`Token exchange failed: ${tokenRes.status}`)
    }
    const tokens = await tokenRes.json()

    let userInfo: Record<string, unknown> = {}
    try {
      const userRes = await fetch(QF_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (userRes.ok) userInfo = await userRes.json()
    } catch {}

    const session = Buffer.from(
      JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + (tokens.expires_in ?? 3600) * 1000,
        user: userInfo,
      })
    ).toString('base64')

    const response = NextResponse.redirect(`${appUrl}/?auth=success`)
    response.cookies.set('qf_session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('QF OAuth callback error:', err)
    return NextResponse.redirect(`${appUrl}/?auth_error=callback_failed`)
  }
}
