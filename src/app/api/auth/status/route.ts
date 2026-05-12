import { NextResponse } from 'next/server'

// OAuth is ready if the pre-live client credentials are configured.
// The redirect URI registration is confirmed — no need to probe each request.
export async function GET() {
  const ready = !!(process.env.QF_OAUTH_CLIENT_ID && process.env.QF_OAUTH_CLIENT_SECRET)
  return NextResponse.json({ ready })
}
