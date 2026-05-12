import { NextRequest, NextResponse } from 'next/server'

const QF_TOKEN_URL =
  process.env.QF_OAUTH_TOKEN_URL ?? 'https://prelive-oauth2.quran.foundation/oauth2/token'
const QF_USERINFO_URL = 'https://prelive-oauth2.quran.foundation/userinfo'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()

  if (error) {
    return NextResponse.redirect(`${appUrl}/?auth_error=${encodeURIComponent(error)}`)
  }

  const storedState = req.cookies.get('qf_oauth_state')?.value
  if (!state || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/?auth_error=invalid_state`)
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/?auth_error=no_code`)
  }

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
      }).toString(),
    })

    if (!tokenRes.ok) throw new Error(`Token exchange failed: ${tokenRes.status}`)
    const tokens = await tokenRes.json()

    // Fetch OpenID userinfo
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
    response.cookies.delete('qf_oauth_state')
    return response
  } catch (err) {
    console.error('QF OAuth callback error:', err)
    return NextResponse.redirect(`${appUrl}/?auth_error=callback_failed`)
  }
}
